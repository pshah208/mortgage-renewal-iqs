code-audit 0.4.1 — prompts-only bundle

The minimum payload needed to run an audit from any agent CLI.
No Python, no wheel, no installer. ~290 KB.

──────────────────────────────────────────────────────────────────────
Run (Claude Code)
──────────────────────────────────────────────────────────────────────

  cd /path/to/your-repo
  claude "Read /path/to/code-audit-0.4.1-prompts/prompts/entrypoint.md and follow it" \
    --add-dir /path/to/code-audit-0.4.1-prompts

──────────────────────────────────────────────────────────────────────
Run (Cursor / Cline / ChatGPT desktop / Aider)
──────────────────────────────────────────────────────────────────────

Open prompts/entrypoint.md in your agent and tell it to follow the
instructions on the current repo. The entrypoint locates the audit
templates from this extracted directory automatically.

──────────────────────────────────────────────────────────────────────
One-keystroke runs in Claude Code
──────────────────────────────────────────────────────────────────────

  mkdir -p /path/to/your-repo/.claude/commands
  cp commands/code-audit.md /path/to/your-repo/.claude/commands/
  git -C /path/to/your-repo add .claude && git -C /path/to/your-repo commit -m "add code-audit slash command"

Then in Claude Code, inside your repo:  /code-audit

──────────────────────────────────────────────────────────────────────
Contents
──────────────────────────────────────────────────────────────────────
  prompts/entrypoint.md      The entrypoint prompt — point your agent here
  commands/code-audit.md     The /code-audit Claude Code slash command
  agents/*.agent.md          4 agent specs: security, infrastructure, reviewer, exploitation-analyst
  audits/<genre>/*.md        security + infrastructure audit templates (filled by the agent into your repo)
  docs/                      Full documentation (offline copy)
  checksums.txt              SHA-256 — run shasum -a 256 -c checksums.txt

Outputs land in <your-repo>/audits/<TODAY>/, never inside this bundle.
They include attack-scenarios.md — the exploitation report explaining how
an attacker could exploit the findings (on by default; disable with
report.exploitation.enabled: false).

Documentation in this bundle (no internet needed):
  docs/INSTALL.md            Per-option install + run guide
  docs/PROMPT_ENTRYPOINTS.md Prompt-driven deep dive (most relevant for this bundle)
  docs/CONFIG_REFERENCE.md   code-audit-config.yml schema
  docs/README.md             Overview

Online: https://github.com/Volaris-AI/code-audit
