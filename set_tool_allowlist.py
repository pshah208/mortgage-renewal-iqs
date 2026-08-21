"""Restrict each MCP connection to the tools this demo actually needs.

TWO PROBLEMS, ONE FIX
---------------------
1. **Latency.** Foundry injects the full JSON schema of every tool on every
   connected MCP server into *every* request, before the question is read. With
   all five Work IQ servers attached that is 136 tools and roughly 49,000 input
   tokens per turn - about 45,000 of it Work IQ, and most of that write tools
   this agent never calls.

2. **Safety.** The unfiltered surface includes `DeleteMessage`,
   `deleteFileOrFolder`, `deleteList`, `SendMessageToChannel`, `CancelEvent`
   and `setSensitivityLabelOnFile`. This demo runs in a tenant that also hosts
   the BMO capital-markets demo, on accounts that demo depends on. A read-only
   agent has no business holding a delete tool, and an allowlist is a far
   stronger control than an instruction asking it not to.

WHAT THIS AGENT ACTUALLY DOES
-----------------------------
Its own instructions describe the Work IQ layer as "the renewal campaign's email
threads, Teams channel discussions, and meeting records". So: search mail, search
Teams, read documents. Nothing is created, sent, moved or deleted.

The instructions also say to "search narrowly, several times - never once
broadly", because an oversized tool response fails outright. That makes the
deterministic `...QueryParameters` search tools the important ones: they filter
server-side rather than relying on relevance ranking, which is both faster and
much less likely to blow the response size cap.

    python set_tool_allowlist.py            # dry run - show the saving
    python set_tool_allowlist.py --apply
    python set_tool_allowlist.py --clear    # remove filters, restore everything
"""

from __future__ import annotations

import argparse
import subprocess
import sys

import requests

ENDPOINT = ("https://mortgage-iqs.services.ai.azure.com"
            "/api/projects/proj-conceirge")
AGENT = "mortgage-renewal-concierge"
API = "2025-05-15-preview"

# Read-only. Every entry is a search, list or read.
ALLOWLIST: dict[str, list[str]] = {
    "WorkIQMail": [
        # The deterministic form first - the agent's own instructions demand
        # narrow, repeated searches, and this one filters server-side.
        #
        # GetMessage is deliberately EXCLUDED. It rejects any Graph message id
        # containing "/" ("Message ID cannot contain forward slashes"), and
        # Graph ids are base64, so they routinely contain one. Leaving it in
        # gives the model a tool that looks useful and fails at run time.
        "SearchMessagesQueryParameters",
        "SearchMessages",
    ],
    "WorkIQTeams": [
        "SearchTeamMessagesQueryParameters",
        "SearchTeamsMessages",
        "ListChannels",
        "ListChannelMessages",
        "ListChats",
        "ListChatMessages",
    ],
    "WorkIQSharePoint": [
        # The meeting records - Renewal Council minutes, branch leader sync,
        # Pricing Committee review, executive steering - live here.
        "findSite",
        "findFileOrFolder",
        "getFileOrFolderMetadata",
        "listDocumentLibrariesInSite",
        "readSmallTextFile",
    ],
    "WorkIQOneDrive": [
        "findFileOrFolderInMyDrive",
        "readSmallTextFileFromMyOnedrive",
    ],
    "WorkIQCalendar": [
        # The narrative is about what people *said*, not about scheduling, so
        # this server is close to unused. Kept at read-only minimum rather than
        # detached outright, because a demo question like "when is the next
        # Renewal Council?" is plausible and the cost is now trivial.
        "ListEvents",
        "ListCalendarView",
    ],
    # smmortgagerenewals (Fabric data agent) and the AI Search knowledge base
    # expose a handful of tools each and are all read paths, so they are left
    # whole.
}


def token() -> str:
    out = subprocess.run(
        ["az", "account", "get-access-token", "--resource",
         "https://ai.azure.com", "--query", "accessToken", "-o", "tsv"],
        capture_output=True, text=True, shell=True)
    if out.returncode != 0:
        sys.exit(f"az token failed: {out.stderr[:300]}")
    return out.stdout.strip()


def label(tool: dict) -> str:
    return (tool.get("server_label")
            or (tool.get("project_connection_id") or "").split("/")[-1]
            or tool.get("type", "?"))


def current_allowed(tool: dict) -> list[str] | None:
    """Tool names currently allowed, normalised.

    The service does not echo back what you send. `allowed_tools` goes up as a
    flat list and comes back as `{"tool_names": [...]}`, so a naive comparison
    never matches: every dry run reports work to do and every --apply cuts a
    pointless new agent version. Both shapes are accepted here.
    """
    raw = tool.get("allowed_tools")
    if raw is None:
        return None
    if isinstance(raw, dict):
        names = raw.get("tool_names")
        return list(names) if names is not None else None
    if isinstance(raw, list):
        return list(raw)
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--clear", action="store_true",
                    help="remove every allowed_tools filter")
    args = ap.parse_args()

    h = {"Authorization": "Bearer " + token(), "Content-Type": "application/json"}

    r = requests.get(f"{ENDPOINT}/agents/{AGENT}?api-version={API}",
                     headers=h, timeout=60)
    r.raise_for_status()
    latest = r.json()["versions"]["latest"]
    definition = latest["definition"]
    print(f"current version : {latest['version']}")

    tools = [dict(t) for t in definition.get("tools", [])]
    changed: list[str] = []

    for t in tools:
        name = label(t)
        if args.clear:
            if "allowed_tools" in t:
                t.pop("allowed_tools")
                changed.append(name)
            continue
        wanted = ALLOWLIST.get(name)
        if wanted is None:
            continue
        if current_allowed(t) != wanted:
            t["allowed_tools"] = wanted
            changed.append(name)

    for t in tools:
        name = label(t)
        allowed = current_allowed(t)
        shown = f"{len(allowed)} allowed" if allowed else "all tools"
        mark = "  <-- changed" if name in changed else ""
        print(f"  {name:<28} {shown}{mark}")

    if not changed:
        print("\nNothing to change.")
        return 0

    if not args.clear:
        kept = sum(len(v) for v in ALLOWLIST.values())
        print(f"\nWork IQ surface: 129 tools -> {kept}. "
              f"Roughly 44k input tokens per turn removed, and every write "
              f"tool (delete, send, upload, cancel, relabel) is dropped.")

    print(f"\n{len(changed)} connection(s) would change: {', '.join(changed)}")
    if not args.apply:
        print("Dry run. Re-run with --apply.")
        return 0

    new_def = dict(definition)
    new_def["tools"] = tools
    r = requests.post(f"{ENDPOINT}/agents/{AGENT}/versions?api-version={API}",
                      headers=h, json={"definition": new_def}, timeout=120)
    if r.status_code >= 400:
        print(f"\nFAILED {r.status_code}: {r.text[:800]}")
        return 1
    made = r.json()
    print(f"\ncreated version {made.get('version')} "
          f"({len(made['definition'].get('tools', []))} tools)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
