"""Mortgage Renewal Concierge — BFF.

Endpoints
    GET  /health          liveness + configuration summary
    GET  /api/config      what the SPA needs to bootstrap (no secrets)
    GET  /api/me          the signed-in user, as the BFF sees them
    GET  /api/iqs         the IQ catalogue
    GET  /api/story       the guided demo chapters
    POST /api/chat        SSE: iq_active / status / message / error / done
    GET  /api/diag        auth + OBO + agent reachability, for troubleshooting
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .agent_client import run_agent
from .auth import User, current_user, exchange_obo
from .config import settings
from .iq import iq_catalogue
from .offers import catalogue as offer_catalogue

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("bff")

app = FastAPI(title="Mortgage Renewal Concierge BFF", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORY_FILE = Path(__file__).with_name("story.json")


class ChatRequest(BaseModel):
    question: str
    threadId: str | None = None


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "mockMode": settings.mock_mode,
        "authConfigured": settings.configured(),
        "agentConfigured": bool(settings.project_endpoint),
        "agent": settings.agent_name,
    }


@app.get("/api/config")
async def config() -> dict:
    """Bootstrap values for the SPA. Deliberately contains no secrets."""
    return {
        "tenantId": settings.tenant_id,
        "apiScope": settings.api_scope,
        "agentName": settings.agent_name,
        "mockMode": settings.mock_mode,
        "bank": "CFC Bank",
        "disclaimer": (
            "SYNTHETIC DEMO DATA. CFC Bank is used as a branding label only. "
            "No customer, balance, rate or policy shown here reflects real "
            "CFC Bank information."
        ),
    }


@app.get("/api/me")
async def me(user: User = Depends(current_user)) -> dict:
    """The signed-in user, enriched from Microsoft Graph.

    The token carries name and roles but not jobTitle or department, so those are
    fetched from Graph on the user's behalf. The 14 demo personas already have
    those fields set in Entra, which is what lets the persona card show the real
    person rather than a hardcoded one.
    """
    roles = user.claims.get("roles") or []
    if isinstance(roles, str):
        roles = [roles]

    profile = {
        "name": user.name,
        "upn": user.upn,
        "oid": user.oid,
        "roles": roles,
        "role": roles[0] if roles else "",
        "jobTitle": "",
        "department": "",
    }

    if settings.mock_mode:
        profile.update({"jobTitle": "VP, Real Estate Secured Lending",
                        "department": "Real Estate Secured Lending"})
        return profile

    # Graph enrichment is best-effort: a failure here must not block the app.
    try:
        import httpx

        token = await exchange_obo(user, "https://graph.microsoft.com/.default")
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                "https://graph.microsoft.com/v1.0/me"
                "?$select=displayName,jobTitle,department,mail",
                headers={"Authorization": f"Bearer {token}"},
            )
        if r.status_code == 200:
            g = r.json()
            profile["jobTitle"] = g.get("jobTitle") or ""
            profile["department"] = g.get("department") or ""
            if g.get("displayName"):
                profile["name"] = g["displayName"]
        else:
            logger.info("graph /me returned %s", r.status_code)
    except Exception as exc:  # noqa: BLE001
        logger.info("graph enrichment skipped: %s", str(exc)[:200])

    return profile


@app.get("/api/iqs")
async def iqs() -> list[dict]:
    return iq_catalogue()


@app.get("/api/offers")
async def offers() -> list[dict]:
    """The RP-003 approved offer catalogue.

    Served so the client can refuse to render a flyer that breaches policy. The
    check has to be deterministic, so it is done against this list rather than by
    asking the model whether its own offer was allowed.
    """
    return offer_catalogue()


@app.get("/api/story")
async def story() -> dict:
    if not STORY_FILE.exists():
        return {"chapters": []}
    return json.loads(STORY_FILE.read_text(encoding="utf-8"))


@app.post("/api/chat")
async def chat(req: ChatRequest, user: User = Depends(current_user)) -> StreamingResponse:
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question must not be empty.")
    logger.info("chat from %s: %s", user.upn, req.question[:120])
    return StreamingResponse(
        run_agent(user, req.question, req.threadId),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # stop nginx buffering the stream
        },
    )


@app.get("/api/diag")
async def diag(user: User = Depends(current_user)) -> dict:
    """Walk the chain end to end and report exactly where it breaks.

    Ordered so the first failure is the actionable one: token -> OBO -> agent.
    """
    out: dict = {
        "user": {"name": user.name, "upn": user.upn},
        "settings": {
            "tenantConfigured": bool(settings.tenant_id),
            "secretConfigured": bool(settings.client_secret),
            "projectEndpoint": settings.project_endpoint or "(unset)",
            "agentName": settings.agent_name,
            "mockMode": settings.mock_mode,
        },
        "checks": [],
    }

    def add(name: str, ok: bool, detail: str = "") -> None:
        out["checks"].append({"check": name, "ok": ok, "detail": detail})

    add("token validated", True, f"scopes: {user.claims.get('scp', '')}")

    if settings.mock_mode:
        add("mock mode", True, "Azure calls are bypassed.")
        return out

    try:
        token = await exchange_obo(user)
        add("on-behalf-of exchange", True, f"scope {settings.foundry_scope}")
    except Exception as exc:  # noqa: BLE001
        add("on-behalf-of exchange", False, str(getattr(exc, "detail", exc))[:500])
        return out

    # Confirm the agent exists on the v2 (prompt agent) surface. The older
    # assistants API does not list portal-created agents at all.
    try:
        import httpx

        base = settings.project_endpoint.rstrip("/")
        async with httpx.AsyncClient(timeout=45) as client:
            r = await client.get(
                f"{base}/agents/{settings.agent_name}?api-version=v1",
                headers={"Authorization": f"Bearer {token}"},
            )
        if r.status_code == 200:
            body = r.json()
            ver = body.get("versions", {}).get("latest", {})
            tools = [t.get("type") for t in ver.get("definition", {}).get("tools", [])]
            add("agent found", True,
                f"version {ver.get('version', '?')} · model "
                f"{ver.get('definition', {}).get('model', '?')} · tools: "
                f"{', '.join(t for t in tools if t) or 'none listed'}")
        else:
            add("agent found", False, f"{r.status_code}: {r.text[:400]}")
    except Exception as exc:  # noqa: BLE001
        add("agent found", False, str(exc)[:400])

    return out


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):  # noqa: ANN201
    logger.exception("unhandled error on %s", request.url.path)
    from fastapi.responses import JSONResponse

    return JSONResponse(status_code=500, content={"detail": str(exc)[:500]})
