#!/usr/bin/env python3
"""Structural validator for doc-audit assets. Python stdlib only.

Dev-time tool — NOT shipped in the prompts-only zip.

Usage:
  validate.py <template.md>   # validate one template file
  validate.py --all           # cross-file invariants
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL_DIR = ROOT / "audits" / "documentation"

DIMENSION_HEADERS = [
    "## Maturity Rubric",
    "## Assessment Checklist",
    "## Evidence",
    "## Strengths",
    "## Gaps",
    "## Recommendations",
    "### Quick wins",
    "## Dimension Score",
]
SUMMARY_HEADERS = [
    "## Documentation Health Score",
    "## Dimension Heatmap",
    "## Dimension Summaries",
    "## Coverage Snapshot",
]
EXPECTED_WEIGHTS = {
    "in-code": 27,
    "readme-onboarding": 22,
    "api-reference": 22,
    "architecture-design": 16,
    "user-developer-guides": 13,
}


def split_frontmatter(text: str):
    """Return (frontmatter_text, body) or (None, text) if no frontmatter."""
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end < 0:
        return None, text
    return text[3:end].strip("\n"), text[end + 4:]


def fm_has(fm: str, key: str) -> bool:
    return re.search(rf"(?m)^{re.escape(key)}\s*:", fm) is not None


def fm_value(fm: str, key: str):
    m = re.search(rf"(?m)^{re.escape(key)}\s*:\s*(.+)$", fm)
    return m.group(1).strip() if m else None


def validate_template(path: Path) -> list[str]:
    errs: list[str] = []
    text = path.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)
    if fm is None:
        return [f"{path.name}: missing YAML frontmatter (--- ... ---)"]

    kind = fm_value(fm, "kind")
    if kind not in ("dimension", "summary"):
        errs.append(f"{path.name}: kind must be 'dimension' or 'summary' (got {kind!r})")

    if kind == "dimension":
        for key in ("genre", "kind", "dimension", "title", "weight", "relevance", "rubric"):
            if not fm_has(fm, key):
                errs.append(f"{path.name}: frontmatter missing key '{key}'")
        # Templates must use double-quoted YAML rubric keys: "1": ..., "3": ..., "5": ...
        for lvl in ('"1"', '"3"', '"5"'):
            if f"{lvl}:" not in fm:
                errs.append(f'{path.name}: rubric missing level {lvl} (use double-quoted keys, e.g. "1":)')
        w = fm_value(fm, "weight")
        if w is not None and not w.split("#")[0].strip().isdigit():
            errs.append(f"{path.name}: weight must be an integer (got {w!r})")
        for h in DIMENSION_HEADERS:
            if h not in body:
                errs.append(f"{path.name}: body missing header '{h}'")

    if kind == "summary":
        for h in SUMMARY_HEADERS:
            if h not in body:
                errs.append(f"{path.name}: summary body missing header '{h}'")

    return errs


def validate_all() -> list[str]:
    errs: list[str] = []
    if not TPL_DIR.is_dir():
        return [f"missing templates dir: {TPL_DIR}"]

    dims: dict[str, int] = {}
    summaries = 0
    for p in sorted(TPL_DIR.glob("*.md")):
        errs += validate_template(p)
        fm, _ = split_frontmatter(p.read_text(encoding="utf-8"))
        if not fm:
            continue
        kind = fm_value(fm, "kind")
        if kind == "dimension":
            slug = fm_value(fm, "dimension")
            w = fm_value(fm, "weight")
            if slug and w and w.isdigit():
                dims[slug] = int(w)
        elif kind == "summary":
            summaries += 1

    # exactly the six expected dimensions, weights match, sum == 100
    if set(dims) != set(EXPECTED_WEIGHTS):
        errs.append(f"dimensions present {sorted(dims)} != expected {sorted(EXPECTED_WEIGHTS)}")
    for slug, exp in EXPECTED_WEIGHTS.items():
        if dims.get(slug) not in (None, exp):
            errs.append(f"{slug}: weight {dims[slug]} != expected {exp}")
    if sum(dims.values()) != 100:
        errs.append(f"dimension weights sum to {sum(dims.values())}, expected 100")
    if summaries != 1:
        errs.append(f"expected exactly 1 summary template, found {summaries}")

    # wiring: agents + entrypoint + slash + config exist and reference dimensions
    for rel in ("agents/doc-auditor.agent.md", "agents/doc-reviewer.agent.md",
                "prompts/entrypoint.md", "commands/doc-audit.md", "doc-audit-config.yml"):
        if not (ROOT / rel).is_file():
            errs.append(f"missing wiring file: {rel}")

    ep = ROOT / "prompts" / "entrypoint.md"
    if ep.is_file():
        ep_text = ep.read_text(encoding="utf-8")
        for slug in EXPECTED_WEIGHTS:
            if f"{slug}.md" not in ep_text and slug not in ep_text:
                errs.append(f"entrypoint.md does not reference dimension '{slug}'")

    cfg = ROOT / "doc-audit-config.yml"
    if cfg.is_file():
        cfg_text = cfg.read_text(encoding="utf-8")
        for slug, exp in EXPECTED_WEIGHTS.items():
            if slug not in cfg_text:
                errs.append(f"config missing dimension '{slug}'")
    return errs


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: validate.py <template.md> | --all", file=sys.stderr)
        return 2
    if argv[0] == "--all":
        errs = validate_all()
    else:
        errs = validate_template(Path(argv[0]))
    if errs:
        print("VALIDATION FAILED:", file=sys.stderr)
        for e in errs:
            print(f"  - {e}", file=sys.stderr)
        return 1
    print("validate: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
