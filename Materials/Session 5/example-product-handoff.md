# Example — a Product handoff spec

> **This is an exhibit, not your input.** It's here so you know what lands on your
> desk after lunch — the shape of it, the length of it, and how much of it is
> context rather than instruction. **Read it once, and don't build from it.** It
> happens to describe an expense-approval feature; if that's close to what you
> picked, your spec is still yours to write.
>
> **Everything in it is invented** — the product person, the evidence, the numbers,
> the quotes. Don't quote any of it anywhere. What's real is the format.

*In the voice of the product person who built the prototype.*

**What this is.** The document the development team plans against. The prototype is
disposable; this is not.

**What this is not.** A full PRD. The dev team writes the technical spec, the plan
and the ADRs.

**Owner:** A. Vance, Product · **Date:** 11 August 2026 · **Status:** Draft for build handoff
**Disruption lane:** Disrupt your customer

---

## 1. The one-sentence pitch

Expense approvers get the twenty obvious requests decided for them, with a written
reason they can check, so the four that actually need judgment get it.

**The one thing the PoC must prove:** that showing the reasoning turns the approver
from someone making a decision into someone checking one.

## 2. The problem

**Problem statement.** Approvers need a way to clear routine expense requests
without reading each one, because a team lead handles ~40 a month and most are
plainly fine, which currently results in a queue nobody can explain afterwards.

**Where it ranked** — 1st of 6 on the customer stack rank.

| Claim | Source | Confidence |
|---|---|---|
| ~40 requests per approver per month | 12 months of approval data | `[CONFIRMED]` |
| Most are routine and uncontested | same data — 83% approved unchanged | `[CONFIRMED]` |
| Approvers want the obvious ones gone, not the decision taken away | 2 interviews | `[DIRECTIONAL]` |
| Filers can't find out why something was rejected | 1 support thread | `[DIRECTIONAL]` |

**The underlying job.** When a routine expense lands, the approver wants to clear it
without re-deriving the policy, so they can spend their attention on the ones that
are actually unusual.

## 3. Who this is for

**Primary user: the approver.** A team lead, not a finance specialist. They apply
the policy from memory, inconsistently, and they know it. They are the bottleneck.

- **What they're trying to accomplish:** get the queue to zero without being careless.
- **What they do today instead:** skim, approve in batches, and occasionally
  regret one.
- **What would make them ignore this:** anything that makes them read *more* than
  they do now, or that decides something they'd have decided differently and
  doesn't say why.

**Secondary user: the person filing.** Wants to stop thinking about it. Currently
waits about a week `[DIRECTIONAL]` and often can't get a reason.

**Buyer, if different:** Finance director — holds the policy and the budget.

## 4. The agentic workflow

**Rung on the ladder:** AI Directed. It decides, within a written policy, and a
person owns anything it isn't sure about.

**The chain, in one line:** from submitted request to a decision someone can audit.

| # | Step | Who or what | Notes |
|---|---|---|---|
| 1 | A request is submitted | Agent | free text, an amount, a category |
| 2 | Read it against the written policy | Agent | the policy is a document a person wrote |
| 3 | Decide | Agent | one of a fixed set of outcomes, and nothing outside it — whether denial is in that set is OQ-2 |
| 4 | Write the reason | Agent | one sentence a person can check |
| 5 | 🛑 **HUMAN IN THE LOOP** | Approver | resolves anything escalated; sees the request, the reason, and the policy |
| 6 | Record what happened | Agent | who decided, on what basis, when |

**The turn-it-off test:** switch it off and work piles up — the approver is back to
forty requests a month, read one at a time.

**What the agent must show its work on:** every decision, including the approvals.
An approver who can't see *why* is back to re-deriving it, which is the thing we're
removing.

**Integrations this needs**

| System | What we need | Have access? | Moat? |
|---|---|---|---|
| The written expense policy | the document itself | yes — it's a page of text | no |
| Finance system of record | eventually, to post decisions | not for this build | no |

## 5. The prototype

**Where it lives:** a clickable prototype, not in the product.

**What it proves:** that a reason rendered next to the verdict changes the
approver's behavior from deciding to checking.

**What is faked — all of this is mocked, not built:**

- The decision is hard-coded. Nothing reads the request and nothing reads the policy.
- The policy is a picture of a policy. It's on screen; nothing consults it.
- "Escalated" goes nowhere. The approver queue is drawn, not wired.
- The confidence figure is invented. I liked how it looked.

**What building it exposed:** that a confidence number nobody can explain is worse
than no number. It made the demo feel precise and I couldn't answer a single
question about where it came from.

## 6. Acceptance criteria

- **AC-1.** A filer submits a request and gets an answer back with a reason they can
  read, without waiting for a person.
- **AC-2.** When a request falls outside the written policy, the filer can see which
  part of the policy it fell foul of.
- **AC-3.** Before an escalated request is finally decided, an approver signs it off
  and can see [the reasoning].
- **AC-4.** When the agent is uncertain, it escalates rather than guessing.
  Uncertain means [ ].

**Explicitly out of scope for this build:**

- Anything touching the finance system of record. This ends at a decision.
- Reversing or appealing a decision after the fact.

## 7. The commercial case

**Who pays:** the Finance director, whose approval-chasing line shrinks.
`[DIRECTIONAL]`

**What it displaces:** approver time — roughly 3 hours a month per team lead, across
about 40 leads. `[DIRECTIONAL — one timed sample]`

**Price that survives a CFO:** subscription uplift on the existing finance module.
Number: unknown — moved to §9.

**Evidence they'd pay:** two renewal conversations named approval turnaround
unprompted. `[DIRECTIONAL]`

**What the pre-mortem said:** six months out this failed because it escalated
everything. Nobody trusted it enough to loosen the threshold, so it became a slower
version of what they had.

## 8. Responsible AI watch-outs

| Lens | Watch-out | What it means for the build |
|---|---|---|
| Explainability | An approver has to be able to say why, to the person who filed | The reason must reference the policy, not just assert a verdict |
| Transparency | Filers should know a machine decided | Say so on the decision, not in a footer |
| Safety | A wrong approval is money out of the door | The threshold must fail toward escalation, never toward approval |

**The design assumption that needs checking:** that approvers will accept machine
approvals at all, rather than only machine *triage*.

## 9. Open questions and risks

| # | Question or risk | Impact | Who can answer | Blocks the build? |
|---|---|---|---|---|
| OQ-1 | What does "not confident" mean, checkably? | high | dev + finance | **yes** |
| OQ-2 | May it deny on its own, or only approve and escalate? | high | Finance director | **yes** |
| OQ-3 | In policy but plainly not a business expense — what then? | med | Finance director | no |
| OQ-4 | One policy, or one per department? | med | Finance director | no |
| R-1 | Escalates everything, delivers nothing | high | — | no |
| R-2 | No approver has used it yet — the two who liked it don't approve expenses | med | customer validation | no |

## 10. What we're not building

| Use case | Why not now | Where it sits |
|---|---|---|
| Receipt capture from photos | Different problem, bigger build | Invest & Explore |
| Spend forecasting | Analytics, not agentic — fails the turn-it-off test | Deprioritize |
| Policy authoring assistant | Real, but it serves Finance not approvers | Park it |
