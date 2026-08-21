"""Provision the two Entra ID app registrations the web app needs.

WHY TWO APPS
------------
Work IQ is a *delegated* data source: it grounds on what the signed-in user can
see. If the web app called the Foundry agent using its own managed identity, Work
IQ would resolve against an identity that sits in no mailbox and no Teams channel,
and would return nothing. So the browser must sign the user in, and the backend
must exchange that user token for a downstream token **on behalf of** the user.

That requires the standard OBO pair:

  1. SPA (public client)  - signs the user in, requests a token for the BFF's own
                            API scope. No secret; PKCE only.
  2. BFF (confidential)   - exposes api://<app-id>/access_as_user, holds a client
                            secret, and performs the OBO exchange for downstream
                            tokens (Foundry, and Graph if needed).

    Browser --login--> Entra
       | token for api://<bff>/access_as_user
       v
    BFF --OBO exchange--> Entra --> token for Foundry, AS THE USER
       v
    Foundry agent -> Work IQ / Fabric / AI Search, all under the user's identity

USAGE
-----
    pip install azure-identity requests
    az login                      # as an Application Administrator

    python provision_app_registrations.py --spa-redirect http://localhost:5173
    python provision_app_registrations.py --show
    python provision_app_registrations.py --add-redirect https://<fqdn>
    python provision_app_registrations.py --delete

The BFF client secret is printed once and is never written to disk by this script.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from typing import Any

import requests

GRAPH = "https://graph.microsoft.com/v1.0"
GRAPH_APP_ID = "00000003-0000-0000-c000-000000000000"

SPA_NAME = "mortgage-renewal-concierge-spa"
BFF_NAME = "mortgage-renewal-concierge-bff"
SCOPE_NAME = "access_as_user"

# Delegated Graph scopes the BFF may need downstream. Foundry's own scope is
# requested at run time (https://ai.azure.com/.default) and does not need to be
# pre-registered here.
BFF_GRAPH_SCOPES = ["User.Read", "offline_access", "openid", "profile"]


def token() -> str:
    out = subprocess.run(
        ["az", "account", "get-access-token", "--resource",
         "https://graph.microsoft.com", "--query", "accessToken", "-o", "tsv"],
        capture_output=True, text=True, shell=True,
    )
    if out.returncode != 0:
        sys.exit(f"az token failed - run `az login`: {out.stderr}")
    return out.stdout.strip()


class G:
    def __init__(self) -> None:
        self.h = {"Authorization": f"Bearer {token()}",
                  "Content-Type": "application/json"}

    def call(self, method: str, path: str, body: Any = None,
             ok: tuple[int, ...] = (200, 201, 204)) -> Any:
        r = requests.request(method, f"{GRAPH}{path}", headers=self.h,
                             json=body, timeout=90)
        if r.status_code not in ok:
            raise RuntimeError(f"{method} {path} -> {r.status_code}: {r.text[:700]}")
        if r.content and "json" in r.headers.get("Content-Type", ""):
            return r.json()
        return None


def find_app(g: G, name: str) -> dict | None:
    r = g.call("GET", f"/applications?$filter=displayName eq '{name}'")
    return (r.get("value") or [None])[0]


def find_sp(g: G, app_id: str) -> dict | None:
    r = g.call("GET", f"/servicePrincipals?$filter=appId eq '{app_id}'")
    return (r.get("value") or [None])[0]


def ensure_sp(g: G, app_id: str) -> dict:
    sp = find_sp(g, app_id)
    if sp:
        return sp
    sp = g.call("POST", "/servicePrincipals", {"appId": app_id})
    time.sleep(5)
    return sp


# --------------------------------------------------------------------------- #
def ensure_bff(g: G) -> dict:
    """Confidential client that exposes the API scope and performs OBO."""
    app = find_app(g, BFF_NAME)
    if app:
        print(f"= {BFF_NAME} ({app['appId']})")
    else:
        app = g.call("POST", "/applications", {
            "displayName": BFF_NAME,
            "description": "Mortgage Renewal Concierge BFF. Exchanges the signed-in "
                           "user's token for downstream tokens (On-Behalf-Of) so the "
                           "Foundry agent grounds Work IQ under the user's identity.",
            "signInAudience": "AzureADMyOrg",
            "requiredResourceAccess": [],
        })
        print(f"+ {BFF_NAME} ({app['appId']})")
        time.sleep(10)

    app_id = app["appId"]
    obj_id = app["id"]

    # Identifier URI + the access_as_user delegated scope.
    current = g.call("GET", f"/applications/{obj_id}")
    scopes = current.get("api", {}).get("oauth2PermissionScopes", [])
    have = next((s for s in scopes if s["value"] == SCOPE_NAME), None)

    if not have:
        import uuid

        scopes.append({
            "id": str(uuid.uuid4()),
            "value": SCOPE_NAME,
            "type": "User",
            "isEnabled": True,
            "adminConsentDisplayName": "Access the Mortgage Renewal Concierge as you",
            "adminConsentDescription": "Allows the app to call the Foundry agent and "
                                       "its grounded data sources on behalf of the "
                                       "signed-in user.",
            "userConsentDisplayName": "Access the Mortgage Renewal Concierge as you",
            "userConsentDescription": "Allows the app to retrieve your renewal "
                                      "campaign email, Teams and document context.",
        })
        g.call("PATCH", f"/applications/{obj_id}", {
            "identifierUris": [f"api://{app_id}"],
            "api": {
                "oauth2PermissionScopes": scopes,
                "requestedAccessTokenVersion": 2,
            },
        }, ok=(204,))
        print(f"  + exposed api://{app_id}/{SCOPE_NAME}")
    else:
        print(f"  = api://{app_id}/{SCOPE_NAME} already exposed")

    # Delegated Graph permissions for the OBO leg.
    gsp = g.call("GET", f"/servicePrincipals?$filter=appId eq '{GRAPH_APP_ID}'"
                        "&$select=id,oauth2PermissionScopes")["value"][0]
    ids = {s["value"]: s["id"] for s in gsp["oauth2PermissionScopes"]}
    access = [{"id": ids[s], "type": "Scope"} for s in BFF_GRAPH_SCOPES if s in ids]
    g.call("PATCH", f"/applications/{obj_id}", {
        "requiredResourceAccess": [
            {"resourceAppId": GRAPH_APP_ID, "resourceAccess": access}
        ],
        "web": {"implicitGrantSettings": {"enableIdTokenIssuance": False,
                                          "enableAccessTokenIssuance": False}},
    }, ok=(204,))

    sp = ensure_sp(g, app_id)

    # Pre-consent the delegated Graph scopes so users are not prompted.
    grants = g.call("GET", f"/oauth2PermissionGrants?$filter=clientId eq '{sp['id']}'")
    grant = next((x for x in grants["value"] if x["resourceId"] == gsp["id"]), None)
    want = " ".join(BFF_GRAPH_SCOPES)
    if grant:
        merged = " ".join(sorted(set(grant["scope"].split()) | set(BFF_GRAPH_SCOPES)))
        g.call("PATCH", f"/oauth2PermissionGrants/{grant['id']}", {"scope": merged},
               ok=(204,))
    else:
        g.call("POST", "/oauth2PermissionGrants", {
            "clientId": sp["id"], "consentType": "AllPrincipals",
            "resourceId": gsp["id"], "scope": want,
        })
    print(f"  + delegated Graph scopes consented: {want}")
    return {"appId": app_id, "objectId": obj_id, "spId": sp["id"]}


def ensure_spa(g: G, bff: dict, redirects: list[str]) -> dict:
    """Public client the browser uses. PKCE, no secret."""
    app = find_app(g, SPA_NAME)
    if app:
        print(f"= {SPA_NAME} ({app['appId']})")
        existing = g.call("GET", f"/applications/{app['id']}")
        uris = sorted(set(existing.get("spa", {}).get("redirectUris", []) + redirects))
    else:
        app = g.call("POST", "/applications", {
            "displayName": SPA_NAME,
            "description": "Mortgage Renewal Concierge single-page app. Signs the "
                           "user in and calls the BFF.",
            "signInAudience": "AzureADMyOrg",
        })
        print(f"+ {SPA_NAME} ({app['appId']})")
        time.sleep(10)
        uris = redirects

    scope_id = next(
        s["id"] for s in
        g.call("GET", f"/applications/{bff['objectId']}")["api"]["oauth2PermissionScopes"]
        if s["value"] == SCOPE_NAME
    )

    g.call("PATCH", f"/applications/{app['id']}", {
        "spa": {"redirectUris": uris},
        "requiredResourceAccess": [
            {"resourceAppId": bff["appId"],
             "resourceAccess": [{"id": scope_id, "type": "Scope"}]}
        ],
    }, ok=(204,))
    print(f"  + redirect URIs: {', '.join(uris)}")

    sp = ensure_sp(g, app["appId"])

    # Pre-consent the SPA -> BFF scope so the user sees no prompt.
    grants = g.call("GET", f"/oauth2PermissionGrants?$filter=clientId eq '{sp['id']}'")
    if not any(x["resourceId"] == bff["spId"] for x in grants["value"]):
        g.call("POST", "/oauth2PermissionGrants", {
            "clientId": sp["id"], "consentType": "AllPrincipals",
            "resourceId": bff["spId"], "scope": SCOPE_NAME,
        })
    print(f"  + consented {SPA_NAME} -> api://{bff['appId']}/{SCOPE_NAME}")

    # Let the BFF accept tokens from the SPA without a second consent prompt.
    cur = g.call("GET", f"/applications/{bff['objectId']}")
    pre = cur.get("api", {}).get("preAuthorizedApplications", [])
    if not any(p["appId"] == app["appId"] for p in pre):
        pre.append({"appId": app["appId"], "delegatedPermissionIds": [scope_id]})
        api = dict(cur["api"])
        api["preAuthorizedApplications"] = pre
        g.call("PATCH", f"/applications/{bff['objectId']}", {"api": api}, ok=(204,))
        print("  + SPA pre-authorized on the BFF API")

    return {"appId": app["appId"], "objectId": app["id"]}


# --------------------------------------------------------------------------- #
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--spa-redirect", action="append", default=[],
                    help="SPA redirect URI; repeatable")
    ap.add_argument("--add-redirect", action="append", default=[],
                    help="add a redirect URI to the existing SPA (e.g. the deployed FQDN)")
    ap.add_argument("--show", action="store_true")
    ap.add_argument("--delete", action="store_true")
    ap.add_argument("--no-secret", action="store_true")
    args = ap.parse_args()

    g = G()

    if args.delete:
        for n in (SPA_NAME, BFF_NAME):
            a = find_app(g, n)
            if a:
                g.call("DELETE", f"/applications/{a['id']}", ok=(204,))
                print(f"deleted {n}")
        return

    tenant = g.call("GET", "/organization?$select=id")["value"][0]["id"]

    if args.show:
        for n in (SPA_NAME, BFF_NAME):
            a = find_app(g, n)
            print(f"{n}: {a['appId'] if a else 'NOT CREATED'}")
            if a and n == SPA_NAME:
                cur = g.call("GET", f"/applications/{a['id']}")
                print(f"   redirects: {cur.get('spa', {}).get('redirectUris', [])}")
        return

    redirects = args.spa_redirect or args.add_redirect or ["http://localhost:5173"]

    print("== BFF (confidential client, performs OBO) ==")
    bff = ensure_bff(g)
    print("\n== SPA (public client, PKCE) ==")
    spa = ensure_spa(g, bff, redirects)

    secret = None
    if not args.no_secret and not args.add_redirect:
        cred = g.call("POST", f"/applications/{bff['objectId']}/addPassword", {
            "passwordCredential": {"displayName": f"bff-{int(time.time())}"}
        })
        secret = cred["secretText"]

    print("\n" + "=" * 74)
    print("Configuration. The BFF secret is shown ONCE.")
    print("=" * 74)
    print("# --- BFF (Container App env vars / .env) ---")
    print(f'AAD_TENANT_ID   = "{tenant}"')
    print(f'AAD_CLIENT_ID   = "{bff["appId"]}"')
    if secret:
        print(f'AAD_CLIENT_SECRET = "{secret}"')
    print(f'AAD_API_SCOPE   = "api://{bff["appId"]}/{SCOPE_NAME}"')
    print()
    print("# --- SPA (src/web/.env) ---")
    print(f'VITE_AAD_TENANT_ID = "{tenant}"')
    print(f'VITE_AAD_CLIENT_ID = "{spa["appId"]}"')
    print(f'VITE_API_SCOPE     = "api://{bff["appId"]}/{SCOPE_NAME}"')
    print()
    print("After deploying, add the Container App FQDN as a redirect URI:")
    print("    python provision_app_registrations.py --add-redirect https://<web-fqdn>")
    print("\nTear down when the demo is over:")
    print("    python provision_app_registrations.py --delete")


if __name__ == "__main__":
    main()
