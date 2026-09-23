# deployment

### Scope

End-to-end demo deployment from Azure control plane through data planes, agent, and app.

### Environments

- Live/reference estate: existing resources, `main.parameters.json`.
- Greenfield: single-resource-group rebuild, `main.parameters.greenfield.json`.
- **Unknown:** no formal dev/staging/prod environments.

### Pipeline

`deploy.ps1` runs Bicep, Fabric, Foundry IQ, Work IQ, and agent stages in order. App deployment is separately documented under `app/deploy.ps1`.

### Promotion

- Preview Bicep with `-WhatIf`.
- Run the full script or `-Only <stage>`.
- **Inferred:** there is no CI/CD promotion pipeline; promotion is operator-driven.

### Rollback

- Bicep rollback is not documented beyond re-running reference parameters.
- Work IQ supports `--restore-users`; seeding supports purge/idempotent reruns.
- Fabric workspace/index/agent deletion is partly manual.
- **Unknown:** expected rollback duration and tested recovery point.

### On-call considerations

- Check `GET /api/diag`.
- Check Foundry, Fabric capacity, Search, Graph consent, and user access.
- Suspend Fabric after demos.

### Open questions

- **Unknown:** release approval, change window, and rollback owner.
