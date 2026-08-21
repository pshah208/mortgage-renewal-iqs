# Mortgage Renewal Concierge — delivery app

A branded web front end for the Foundry agent. Split-screen: a guided narrative on
the left, the live agent on the right, with the four Microsoft IQ layers lighting
up from the agent's **actual tool calls**.

> **SYNTHETIC DEMO DATA.** CFC Bank is a branding label only. Nothing here
> reflects real CFC Bank customers, pricing or policy.

---

## Why this exists (beyond looking better than the playground)

**1. Work IQ only works if the *user* is signed in.**
Work IQ is a delegated data source — it grounds on what the signed-in user can see.
If the app called the agent with its own managed identity, Work IQ would resolve
against an identity that is in no mailbox and no Teams channel, and return nothing.
So the browser signs the user in with MSAL, and the BFF performs an **On-Behalf-Of**
exchange before calling the agent. SSO here is a functional requirement, not
decoration.

**2. It fixes the citation corruption.**
The Foundry playground splices citation markers into the answer by character
offset, which mangles digits inside numbers and identifiers — `180 days` renders as
`[14]80 days`, `BR-202` as `BR-[12]0[12]`. This app keeps the answer text and its
citations strictly separate: text renders as-is, sources are listed underneath.
Numbers cannot be corrupted because nothing is ever substituted into the string.

**3. The IQ panel is evidence, not animation.**
The BFF polls the agent's run steps and classifies each tool call onto a layer, so
a card lighting up means that layer genuinely ran.

---

## Architecture

```
Browser (React + MSAL)
  │  access token for api://<bff>/access_as_user
  ▼
ca-mrc-web   nginx + SPA        EXTERNAL ingress
  │  /api proxied inside the Container Apps environment
  ▼
ca-mrc-bff   FastAPI            INTERNAL ingress only
  │  On-Behalf-Of exchange -> token for Foundry, as the user
  ▼
Foundry agent (proj-conceirge)
  ├─ Work IQ     Microsoft 365      as the user
  ├─ Fabric IQ   semantic model     as the user
  └─ Foundry IQ  AI Search index
```

The BFF is never exposed publicly. That keeps its client secret off the internet
and removes CORS from the picture.

---

## Layout

```
app/
├── deploy.ps1                      build → push → deploy
├── infra/
│   ├── provision_app_registrations.py   SPA + BFF Entra apps (run first)
│   ├── main.bicep · main.json
│   └── modules/  registry · observability · container-apps
└── src/
    ├── bff/          FastAPI
    │   └── app/  main.py · auth.py (OBO) · agent_client.py · iq.py · story.json
    └── web/          React + Vite + MSAL
        └── src/  App.tsx · api.ts · auth.ts
                   components/  StoryPanel · ChatPanel · IQPanel · Markdown
```

---

## Setup

### 1. Entra app registrations

Two apps are required for OBO — a public SPA client and a confidential BFF that
holds the secret and performs the exchange.

```powershell
cd app
pip install azure-identity requests
az login          # as an Application Administrator

python infra\provision_app_registrations.py --spa-redirect http://localhost:5173
```

It prints the BFF secret **once**. The script also pre-consents the delegated
scopes, so users are not prompted.

### 2. Run locally

```powershell
# BFF
cd src\bff
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

$env:AAD_TENANT_ID   = "<tenant>"
$env:AAD_CLIENT_ID   = "<bff-client-id>"
$env:AAD_CLIENT_SECRET = "<secret>"
$env:AAD_API_SCOPE   = "api://<bff-client-id>/access_as_user"
$env:FOUNDRY_PROJECT_ENDPOINT = "https://mortgage-iqs.services.ai.azure.com/api/projects/proj-conceirge"
uvicorn app.main:app --reload --port 8000
```

```powershell
# SPA (second terminal)
cd src\web
npm install
"VITE_AAD_TENANT_ID=<tenant>`nVITE_AAD_CLIENT_ID=<spa-client-id>`nVITE_API_SCOPE=api://<bff-client-id>/access_as_user" | Set-Content .env
npm run dev
```

Open <http://localhost:5173> and sign in as **`MarioR@M365CPI65678641.OnMicrosoft.com`**
(Raj Balakrishnan) — the persona whose mailbox, Teams membership and Fabric access
the demo data was seeded against.

**UI work without Azure:** set `MOCK_MODE=true` on the BFF and omit the `VITE_*`
values. Auth is bypassed and canned answers are returned.

### 3. Deploy to Azure

```powershell
cd app
.\deploy.ps1 -ResourceGroup rg-scotia-iqs `
             -AadClientId <bff-client-id> `
             -AadClientSecret <secret> `
             -AadApiScope api://<bff-client-id>/access_as_user
```

Then register the deployed URL as a redirect URI:

```powershell
python infra\provision_app_registrations.py --add-redirect https://<web-fqdn>
```

Code-only redeploy afterwards: `.\deploy.ps1 -Only images`

---

## Who can sign in

Any user in the tenant can authenticate; what they *see* is governed by the
downstream sources under their own identity. Raj is the intended demo driver
because he holds the required access:

| Access | Why |
|---|---|
| Azure AI User on `mortgage-iqs` | invoke the agent |
| Member on `ws-mortgage-renewals-demo` | Fabric semantic model |
| Recipient on all 18 campaign emails | Work IQ mail grounding |
| Member of the Teams team | Work IQ Teams grounding |

Anyone without these gets a thinner answer rather than an error — which is correct
behaviour, and worth demonstrating deliberately if the audience asks about
security trimming.

To restrict sign-in further, add **app roles** to the SPA registration and set the
enterprise app to *User assignment required*.

---

## Guided mode

Six chapters in `src/bff/app/story.json`, editable without touching code:

| # | Chapter | Shows |
|---|---|---|
| 01 | Meet Raj | the persona and the pressure |
| 02 | Unify data where it lives | systems of record → OneLake → the four IQs |
| 03 | Pick up the signal | **Work IQ** — what the business has already said |
| 04 | Check it against the numbers | **Fabric IQ** — the governed renewal book |
| 05 | Know what we're allowed to do | **Foundry IQ** — pricing, policy, OSFI |
| 06 | Turn signal into decision | all layers on one cross-cutting question |

Each IQ chapter carries a **Ask the concierge →** button that sends its prompt to
the live agent, plus a *what a good answer contains* checklist so the audience knows
what to look for.

The left panel is deterministic and the right is live — so if the agent has an off
moment, the story still lands.

---

## Troubleshooting

Sign in, switch to **Explore**, open **Connection diagnostics → Run checks**. It
walks token → OBO → agent and reports the first failure, which is the actionable
one. Or call `GET /api/diag` directly.

| Symptom | Likely cause |
|---|---|
| `AADSTS65001` on the OBO exchange | admin consent missing on the BFF app. Re-run the provisioning script, or consent once interactively. |
| *"The agent ran but returned no answer"* naming a failed tool | that MCP connection failed for this user. The detail line carries the server label and the service's own error. |
| *"The agent ran but returned no answer"* with no tool error | every grounding tool returned zero rows for this identity. Check mailbox provisioning, Teams membership and Fabric workspace access for the signed-in user. |
| Work IQ returns nothing, other layers fine | signed in as the wrong user. Only Raj is on the seeded mail and Teams content. |
| Work IQ fails right after a UPN or primary-SMTP change | the substrate and Microsoft Search index are keyed on the user's address. Sign in once to Outlook on the web **and** Teams, then allow the re-crawl to finish. |
| Fabric IQ empty | capacity `fabcap26` is paused, or the user lacks workspace access. Querying `sm_mortgage_renewals` needs **Member** (Viewer does not grant Build). |
| IQ cards never light up | SSE is being buffered. Confirm `proxy_buffering off` in `default.conf.template`. |
| Sign-in loops | the current origin is not a registered redirect URI. `--add-redirect <url>`. |
| `Agent not found` | `FOUNDRY_AGENT_NAME` does not match the agent in the project. |

An empty answer is never rendered as silence: if the agent produces no text the BFF
emits an `error` frame explaining why, and `done` carries a `toolErrors` array.

---

## Teardown

```powershell
python infra\provision_app_registrations.py --delete
az deployment group delete -g rg-scotia-iqs -n mrc-app
```

Container Apps scale to a minimum of one replica each, so the environment bills a
small amount continuously. Delete the resource group's container apps when the demo
is finished.
