# infrastructure

### Resource / system

Azure and Fabric estate for the demo:

- Foundry account/project/model, storage, Key Vault, App Insights.
- AI Search service and index.
- Fabric F8 capacity, workspace, lakehouse, notebooks, semantic model.
- Container Apps environment, web/BFF apps, ACR, Log Analytics.

The documented live estate spans `rg-scotia-iqs`, `rg-mortgage-iq`, and `rg-Fabric` across eastus/eastus2/canadacentral/centralus. See `infra/README.md:47-64`.

### Defined in

- Azure control plane: `infra/main.bicep` and `infra/modules/`.
- App infrastructure: `app/infra/`.
- Fabric data plane: `data/fabric-iq/deploy_fabric.py`.
- Search data plane: `data/foundry-iq/index_renewal_policies.py`.
- Microsoft 365 seeding: `data/work-iq/`.

### Environments

- Live estate parameters: `infra/main.parameters.json`, all `create* = false`.
- Greenfield rebuild: `infra/main.parameters.greenfield.json`, all `create* = true`.
- **Unknown:** no separate dev/staging/prod environment matrix was found.

### Capacity & cost

- Fabric is documented as F8 and bills while active.
- AI Search is Standard with free semantic tier.
- Foundry models are pay-per-token.
- Container Apps are documented as consumption plan.

Verified in `infra/README.md:178-191`.

### Risks

- Cross-resource-group and cross-region deployment scope is easy to drift.
- Some data-plane objects are not ARM-managed.
- Resource names retain `scotia` despite the CFC rebrand.
- Fabric must be suspended between demos to control cost.

### Open questions

- **Unknown:** current capacity utilization and budget owner.
- **Unknown:** whether production network isolation, private endpoints, and managed identities are required.
