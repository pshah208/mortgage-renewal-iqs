# Agent Instructions Template

The file your AI assistant reads at the start of every session. It is the one piece
of context the agent gets for free, on every task, without being asked for it.

**Copy this file to the name your assistant reads, then fill it in.**

| Assistant | File to create |
|---|---|
| Claude Code | `CLAUDE.md` in the repo root |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | a rule file under `.cursor/rules/` |
| Codex, and others following the convention | `AGENTS.md` in the repo root |

**On a mixed team, use `CLAUDE.md`.** Copilot reads `CLAUDE.md` as well as its own
file, while Claude Code reads only `CLAUDE.md` and ignores `AGENTS.md`. One file,
both tools.

## How to fill it in

Point your assistant at this template and at your repo, and have it draft the
sections below from what it can see. Then correct it. It can work out the layout
and the commands; it cannot know which of them are still true in production, what
is load-bearing, or what bit the last person who touched this. That part is yours.

Three rules. The first two are the vendors' own guidance, not ours:

- **Keep it short** — under about 200 lines. It is loaded on every request, and a
  long file gets followed less closely than a short one.
- **Keep it general.** Facts that hold for the whole repo. Anything that matters
  only in one folder, or only during one kind of task, belongs in a path-scoped
  rule — see the end of this file.
- **Point, don't copy.** Link to your documentation rather than restating it. Two
  copies of the same fact disagree within a month.

Write things that can be checked. *"Run `make test` before committing"* beats
*"test your changes."* *"Handlers live in `src/api/handlers/`"* beats *"keep files
organized."*

**Delete everything above the line once the file is filled in.**

---

# [Repo name]

## What this is

[One or two sentences. What the system does and who uses it — the thing a new
engineer needs to hear first, not the elevator pitch.]

## Read these first

[Point at your documentation rather than repeating it. If you have been through
the living documentation session, this is the top-level file and the area notes
under it.]

- `[docs/README.md]` — [what it covers]
- `[docs/architecture/]` — [what it covers]

## Build, test and run

[The actual commands, copied from a shell where they worked. Include the ones that
are so obvious to your team that nobody writes them down.]

```
[build]
[test]
[run locally]
```

[Anything that has to be true first: a database running, a VPN, an environment
variable, a licence file, a service you have to start by hand.]

## Layout

[Only what is not obvious from looking. Where the entry points are. Which
directories are generated and must never be hand-edited. Which one looks important
and isn't.]

## Conventions

[The ones that differ from what the language or framework would lead someone to
assume: naming, error handling, logging, how configuration is read, how tests are
laid out.]

## Land mines

[The things that are obvious to your team and invisible in the source.]

- [What looks dead but is called from somewhere unexpected.]
- [What breaks silently when changed.]
- [What must never be edited directly — generated files, vendored code, anything a
  downstream system parses.]
- [Where the tests lie: suites that pass without proving anything.]

## Don't

[Add a line here the second time your assistant does something you have to undo.
That repeat is the signal this file is missing something.]

---

## When this file gets too long

Both major assistants can scope instructions to particular files, so they load only
when they are relevant. Move anything narrow out of this file and into one of
these rather than letting it grow:

| Assistant | Where | How it targets files |
|---|---|---|
| Claude Code | `.claude/rules/*.md` | `paths:` in frontmatter |
| GitHub Copilot | `.github/instructions/*.instructions.md` | `applyTo:` in frontmatter |
