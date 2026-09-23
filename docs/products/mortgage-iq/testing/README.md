# testing

### Scope

Agent smoke tests, data-generation checks, BFF behavior, and frontend build validation.

### Test types in place

- Agent local smoke path: `python agent/create_agent.py --local-smoke`.
- Prompt/test question sets: `agent/demo-questions.md`, `agent/test-questions-fabric-iq.md`, `agent/test-questions-cross-layer.md`.
- Frontend build: `npm run build` in `app/src/web`.
- **Verified:** no `tests/` directory or Python test suite was found in the product repo.

### Coverage

- Documented coverage focuses on three demo questions and local fallback behavior.
- BFF auth, OBO, SSE parsing, endpoint errors, and diagnostics have no committed automated tests.
- React user flows and accessibility have no committed automated tests.
- Infrastructure and Fabric deployment scripts have no committed automated tests.

### Fixtures / test data

- Synthetic CSVs under `data/fabric-iq/`.
- Synthetic Work IQ JSON under `data/work-iq/`.
- Synthetic policy corpus under `data/foundry-iq/`.
- Fabric generation is deterministic with seed `20260803`.

### Pain points

- No regression suite protects the cross-layer agent contract.
- Live tests depend on Azure, Fabric, Graph indexing, consent, and tenant state.
- **Unknown:** expected test environment and CI execution.

### Open questions

- **Unknown:** required unit, integration, contract, and end-to-end coverage.
- **Unknown:** whether local smoke output is compared against golden results.
- **Unknown:** who owns test data refresh when the synthetic scenario changes.
