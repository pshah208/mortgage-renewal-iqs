# Prompt entrypoints — deep dive

This doc covers the prompt-driven options in detail: how the
entrypoint locates templates, the `code-audit prompt` CLI helpers,
agent CLI compatibility, and bundle layouts.

For install commands and quickstart, see [`INSTALL.md`](../INSTALL.md)
options 4 (prompts-only zip) and 5 (slash command).

## How the entrypoint finds templates

The `prompts/entrypoint.md` file is **self-contained**. When an agent
loads it, step 0 of the prompt searches for `audits/` and `agents/`
directories in this order, stopping at the first hit:

1. **Co-located with the prompt file** — e.g. `<bundle>/audits/`.
   This is how the bundle zips ship and how `code-audit init` seeds a
   consumer repo.
2. **In the audited repo** — `<cwd>/audits/` and `<cwd>/agents/`.
3. **Site-packages** — if `code-audit` is pip-installed.
4. **GitHub clone** — last resort, only if internet is available.

Hits 1–3 require no network access. Outputs always land in
`<cwd>/audits/<TODAY>/` regardless of where templates were sourced —
the bundle / scratch clone is read-only.

## Agent CLI compatibility

| Agent | How to invoke | Notes |
|---|---|---|
| Claude Code | `claude "Read <path>/prompts/entrypoint.md and follow it"` | Or use the `/code-audit` slash command |
| Cursor | Open `prompts/entrypoint.md`, paste into chat, ask the agent to follow it | Cursor needs the file open to read it |
| Cline | Same as Cursor — file open + "follow this prompt" | |
| ChatGPT desktop | Same as Cursor | |
| Aider | `aider --message-file prompts/entrypoint.md` | Aider treats the file as the initial message |

All agents need read/write access to the audited repo and to the
bundle dir. Most CLIs ask once and remember the approval.

## `code-audit prompt` CLI helpers

Available when `code-audit` is pip-installed (options 1 and 3 in
INSTALL.md). Three modes:

```bash
code-audit prompt              # print the entrypoint to stdout (with config inlined)
code-audit prompt --slash      # print the /code-audit slash command body
code-audit prompt --save       # write prompts/entrypoint.md + .claude/commands/code-audit.md into the repo
code-audit prompt --save --force   # overwrite existing files
```

Common uses:

- `code-audit prompt | pbcopy` — paste into a chat agent on macOS.
- `code-audit prompt --save` — give teammates the slash command + a
  paste-able entrypoint without making them install anything.
- `code-audit prompt --slash > .claude/commands/code-audit.md` —
  manually place the slash command somewhere non-default.

You don't need this CLI to run any of the prompt-driven options —
both the prompts-only zip and `code-audit init` already drop the same
files in the right places.

## Bundle layouts

### Full bundle (`-bundle.zip`, ~870 KB)

```
code-audit-<VERSION>-bundle/
├── README.txt
├── install.sh / install.bat
├── code_audit-<VERSION>-py3-none-any.whl
├── code_audit-<VERSION>.tar.gz
├── checksums.txt
├── prompts/entrypoint.md
├── commands/code-audit.md
├── agents/*.agent.md
└── audits/<genre>/*.md
```

Adds the wheel + installers to the prompts-only payload. Use when you
might want both the CLI **and** the prompt-only path.

### Prompts-only bundle (`-prompts.zip`, ~290 KB)

```
code-audit-<VERSION>-prompts/
├── README.txt
├── checksums.txt
├── prompts/entrypoint.md
├── commands/code-audit.md
├── agents/*.agent.md
└── audits/<genre>/*.md
```

Strictly the files an agent needs. No Python, no installers. ~66%
smaller. Use when you only need the prompt path — typical for
air-gapped portfolio companies.

## Air-gap considerations

The prompt path is fully offline-capable:

- Templates ship inside the zip (or pip install / `init` seed).
- The entrypoint instructs the agent **not** to fetch from GitHub
  unless explicitly told the user has internet.
- Outputs are local files. No telemetry, no API calls beyond the LLM
  adapter the agent itself uses.

The only network call is the agent's own LLM API request (Anthropic /
OpenAI / Claude Code OAuth). If that's also blocked, run the audit on
a connected host and ferry the `audits/<TODAY>/` directory back.

## Picking between the two prompt options

| You want… | Pick |
|---|---|
| One-keystroke runs in Claude Code, daily | Slash command (option 5) |
| Cursor, Aider, ChatGPT, or any non-Claude-Code agent | Prompts-only zip (option 4) |
| To hand-share a single zip with a partner | Prompts-only zip (option 4) |
| Both | Use both — they coexist; the slash command wraps the same entrypoint |
