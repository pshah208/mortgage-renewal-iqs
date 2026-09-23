#!/usr/bin/env bash
# Build the prompts-only release zip: dist/doc-audit-<VERSION>-prompts.zip
# Usage: ./scripts/build-release-bundle.sh v0.1.0
set -euo pipefail

TAG="${1:?expected tag arg, e.g. v0.1.0}"
VERSION="${TAG#v}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
NAME="doc-audit-${VERSION}-prompts"
STAGING="$DIST/$NAME"

rm -rf "$STAGING"
mkdir -p "$STAGING"

# Ship only what an agent needs to run an audit (NOT scripts/ or tests/).
cp -R "$ROOT/prompts"   "$STAGING/prompts"
cp -R "$ROOT/commands"  "$STAGING/commands"
cp -R "$ROOT/agents"    "$STAGING/agents"
cp -R "$ROOT/audits"    "$STAGING/audits"
cp "$ROOT/doc-audit-config.yml" "$STAGING/doc-audit-config.yml"

cp "$ROOT/README.md"   "$STAGING/README.md"
mkdir -p "$STAGING/docs"
cp "$ROOT/docs/"*.md   "$STAGING/docs/" 2>/dev/null || true

cat > "$STAGING/README.txt" <<EOF
doc-audit ${VERSION} — prompts-only bundle

Audit a repository's documentation quality, fully offline, from any agent CLI.
No install, no internet (beyond your agent's own LLM call).

── Run (Claude Code) ──────────────────────────────────────────────────
  cd /path/to/your-repo
  claude "Read /path/to/${NAME}/prompts/entrypoint.md and follow it" \\
    --add-dir /path/to/${NAME}

── Or use the slash command ───────────────────────────────────────────
  mkdir -p /path/to/your-repo/.claude/commands
  cp commands/doc-audit.md /path/to/your-repo/.claude/commands/
  # then, in Claude Code inside your repo:  /doc-audit

── Or any other agent (Cursor / Cline / ChatGPT desktop) ──────────────
  Open prompts/entrypoint.md and tell the agent to follow it on the current repo.

Output lands in <your-repo>/doc-audit/<TODAY>/ — never inside this bundle.

Contents:
  prompts/entrypoint.md       The entrypoint — point your agent here
  commands/doc-audit.md       The /doc-audit slash command
  agents/*.agent.md           Auditor + reviewer specs
  audits/documentation/*.md   Five dimension templates + the overview scaffold
  doc-audit-config.yml        Optional config (weights, exclude paths)
  docs/                       Offline copy of the documentation
  checksums.txt               SHA-256 — verify: shasum -a 256 -c checksums.txt
                              (Linux: sha256sum -c checksums.txt)

Online: https://github.com/Volaris-AI/doc-audit
EOF

# Checksum every shipped file so `shasum -a 256 -c checksums.txt` verifies the
# whole bundle, not just a sample.
( cd "$STAGING" && find . -type f ! -name checksums.txt | sort | xargs shasum -a 256 > checksums.txt )

cd "$DIST"
rm -f "${NAME}.zip"
zip -qr "${NAME}.zip" "$NAME"
rm -rf "$STAGING"

echo "── Built: $DIST/${NAME}.zip ──"
unzip -l "$DIST/${NAME}.zip"
