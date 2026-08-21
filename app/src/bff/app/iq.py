"""Map an agent's tool calls onto the four Microsoft IQ layers.

The old mortgage-iq-app emitted `iq_active` events from its *own* Python function
tools, so it always knew which layer was running. With native Foundry connections
the agent executes server-side and we never see the tool bodies - so instead we
poll run steps and infer the layer from each tool call's type and payload.

Same SSE contract as before; different producer.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from typing import Any, Literal

IQId = Literal["work", "fabric", "foundry", "web"]


@dataclass
class IQMeta:
    id: IQId
    name: str
    source: str
    blurb: str


IQS: dict[str, IQMeta] = {
    "work": IQMeta(
        "work", "Work IQ", "Microsoft 365 · Graph",
        "How the team works — email, Teams and documents in context.",
    ),
    "fabric": IQMeta(
        "fabric", "Fabric IQ", "Microsoft Fabric · OneLake",
        "Governed business data — the renewal book and its measures.",
    ),
    "foundry": IQMeta(
        "foundry", "Foundry IQ", "Azure AI Foundry · AI Search",
        "Reasoning grounded on policy, pricing and regulation.",
    ),
    "web": IQMeta(
        "web", "Web IQ", "Grounding with Bing",
        "Live market rates and external market signal.",
    ),
}

# Matched against the tool name / connection id, in order. First hit wins.
#
# Connection labels observed on the live agent:
#   smmortgagerenewals          -> Fabric semantic model
#   kb-knowledgebase472-k9oor   -> Azure AI Search knowledge base
#   WorkIQMail / WorkIQTeams / WorkIQUser / WorkIQOneDrive
#   sharepoint_grounding_preview
#   web_search
_PATTERNS: list[tuple[re.Pattern[str], IQId]] = [
    # Fabric first: "smmortgagerenewals" also contains "renewals", and the mail
    # patterns below are broad, so the most specific match has to win.
    (re.compile(r"smmortgagerenewals|sm_mortgage|fabric|onelake|lakehouse|semantic|dax|powerbi|warehouse|renewal_analytics", re.I), "fabric"),
    (re.compile(r"workiq|graph|outlook|mail|teams|chat|sharepoint|onedrive|drive|m365|calendar", re.I), "work"),
    (re.compile(r"knowledgebase|azure_ai_search|ai_search|file_search|policy|retrieval|\bkb-", re.I), "foundry"),
    (re.compile(r"bing|web_search|grounding_web", re.I), "web"),
]

# Item types that are not evidence a layer was used.
#
# `mcp_list_tools` in particular is *discovery* - the service enumerates every
# connected MCP server at the start of a run whether or not it ends up being
# called. Lighting a card on that would make all four IQs glow on every single
# question, which destroys the whole point of the panel.
_IGNORED = re.compile(
    r"^(message|reasoning|mcp_list_tools|function_call_output|"
    r"response\.(created|in_progress|completed|content_part|output_text))",
    re.I,
)


def is_invocation(item_type: str) -> bool:
    """True only for events that mean a tool actually ran."""
    return not _IGNORED.match(item_type.strip())

# Human-readable activity per layer, so the card says something meaningful.
_DETAIL = {
    "work": "Searching email, Teams and meeting records",
    "fabric": "Querying the governed renewal analytics",
    "foundry": "Retrieving pricing and policy guidance",
    "web": "Checking live market signal",
}


def classify(tool_name: str, payload: str = "") -> IQId | None:
    """Best-effort mapping of a tool call to an IQ layer."""
    blob = f"{tool_name} {payload}"
    for pattern, iq in _PATTERNS:
        if pattern.search(blob):
            return iq
    return None


def summarise_call(tool_name: str, payload: str) -> str:
    """A short, human phrase describing what the agent asked for."""
    q = ""
    if payload:
        try:
            data = json.loads(payload)
            if isinstance(data, dict):
                for k in ("query", "queryString", "question", "search", "input", "q"):
                    if data.get(k):
                        q = str(data[k])
                        break
                if not q:
                    q = json.dumps(data)[:160]
        except Exception:  # noqa: BLE001
            q = payload[:160]
    q = re.sub(r"\s+", " ", q).strip()
    return f'"{q[:120]}"' if q else tool_name


# --------------------------------------------------------------------------- #
# SSE frames
# --------------------------------------------------------------------------- #
def sse(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def iq_event(iq: IQId, status: str, detail: str = "") -> str:
    meta = IQS[iq]
    return sse("iq_active", {
        "iq": iq,
        "status": status,
        "detail": detail or _DETAIL.get(iq, ""),
        "source": meta.source,
        "name": meta.name,
    })


def token_event(text: str) -> str:
    return sse("token", {"text": text})


def message_event(text: str, citations: list[dict] | None = None) -> str:
    return sse("message", {"text": text, "citations": citations or []})


def status_event(text: str) -> str:
    return sse("status", {"text": text})


def error_event(text: str, detail: str = "") -> str:
    return sse("error", {"text": text, "detail": detail})


def done_event(**extra: Any) -> str:
    return sse("done", extra or {"ok": True})


def iq_catalogue() -> list[dict]:
    return [asdict(m) for m in IQS.values()]
