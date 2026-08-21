// =============================================================================
// Mortgage Renewal Concierge - Azure control-plane infrastructure
// =============================================================================
// SYNTHETIC DEMO DATA. CFC Bank is used only as a branding label; nothing in
// this solution reflects real CFC Bank customers, pricing or policy.
//
// SCOPE OF THIS TEMPLATE
// Bicep can only express ARM control-plane resources. This template deploys:
//
//   * Azure AI Search service         (Foundry IQ store)       -- may be cross-RG
//   * Azure AI Foundry account        (agent host)
//   * Foundry project                 (agent container)
//   * Model deployments               (reasoning + embedding)
//   * Foundry platform resources      (storage, key vault, app insights)
//   * Microsoft Fabric capacity       (Fabric IQ compute)      -- may be cross-RG
//   * Role assignments                (least-privilege access)
//
// THE LIVE ESTATE SPANS THREE RESOURCE GROUPS AND THREE REGIONS
//
//   rg-scotia-iqs   (eastus)         Foundry account `mortgage-iqs` + project,
//                                    storage `bnsiqs`, key vault, app insights;
//                                    plus the app tier in eastus2 (app/infra)
//   rg-mortgage-iq  (canadacentral)  AI Search `aisearchrgmortgageiqa7d3b8`
//   rg-Fabric       (centralus)      Fabric capacity `fabcap26` (F8)
//
// The `*ResourceGroupName` params below exist for exactly that reason: the
// referenced resources are looked up cross-RG rather than assumed local.
//
// The following are DATA-PLANE or Microsoft Graph objects with no ARM provider,
// and are created by the scripts in ../data and ../agent instead:
//
//   * Fabric workspace, lakehouse, notebooks, Delta tables, semantic model
//                                     -> data/fabric-iq/deploy_fabric.py
//   * AI Search index + policy documents
//                                     -> data/foundry-iq/index_renewal_policies.py
//   * Entra app registration + Graph permission grants
//                                     -> data/work-iq/provision_seeder_app.py
//   * M365 mail, Teams messages, SharePoint/OneDrive files, persona renames
//                                     -> data/work-iq/seed_work_iq.py
//   * The Foundry agent and its three function tools
//                                     -> agent/create_agent.py
//   * The 15 Foundry project connections (Work IQ MCP servers, Fabric semantic
//     model, AI Search knowledge base, SharePoint grounding) -- portal/data plane
//
// Also present in the live RG but NOT declared here: the Event Grid system topic
// `bnsiqs-<guid>`, created implicitly by the Foundry-to-storage integration. Its
// name carries a platform-generated GUID, so it is left under platform ownership.
//
// Every `create*` flag below can be set false to REFERENCE an existing resource
// instead of creating one, so the template can be pointed at an environment that
// was stood up by hand without trying to recreate it.
// =============================================================================

targetScope = 'resourceGroup'

// ---------------------------------------------------------------- naming ----
@description('Workload name used in CAF-style resource names.')
param workload string = 'mtgrenewal'

@description('Environment: dev | test | prod.')
@allowed([ 'dev', 'test', 'prod' ])
param environmentName string = 'dev'

@description('Azure region for resources created in THIS resource group.')
param location string = resourceGroup().location

@description('Additional tags merged onto every resource.')
param extraTags object = {}

// ------------------------------------------------------------ AI Search ----
@description('Create a new Azure AI Search service. False = reference an existing one.')
param createSearch bool = true

@description('Search service name. Required when createSearch = false.')
param searchServiceName string = ''

@description('Resource group holding the Search service. Blank = this resource group. The live service is in rg-mortgage-iq.')
param searchResourceGroupName string = ''

@description('Region for a newly created Search service. Blank = same as location. The live service is in canadacentral.')
param searchLocation string = ''

@description('Search SKU.')
@allowed([ 'free', 'basic', 'standard', 'standard2', 'standard3' ])
param searchSku string = 'basic'

@description('Semantic ranker tier. MUST NOT be "disabled" - the agent issues semantic queries.')
@allowed([ 'free', 'standard' ])
param searchSemanticTier string = 'free'

@description('Allow Entra auth alongside API keys on a newly created Search service. The live service is apiKeyOnly.')
param searchEnableAadAuth bool = true

// --------------------------------------------------------------- Foundry ----
@description('Create a new Foundry (AIServices) account. False = reference an existing one.')
param createFoundry bool = true

@description('Foundry account name. Required when createFoundry = false.')
param foundryAccountName string = ''

@description('Foundry project name.')
param foundryProjectName string = 'proj-conceirge'

@description('Disable API-key auth on the Foundry account, forcing Entra tokens. Live estate has this ON.')
param foundryDisableLocalAuth bool = true

@description('Deploy the reasoning model. False if it already exists or quota is short.')
param deployModel bool = true

@description('Model deployment name the agent calls.')
param modelDeploymentName string = 'gpt-5.4'

@description('Model name.')
param modelName string = 'gpt-5.4'

@description('Model version. Blank = platform default.')
param modelVersion string = ''

@description('Model capacity in thousands of tokens per minute.')
param modelCapacity int = 100

@description('Deploy the embedding model used to vectorise the Foundry IQ policy corpus.')
param deployEmbeddingModel bool = true

@description('Embedding deployment name.')
param embeddingDeploymentName string = 'text-embedding-3-small'

@description('Embedding model name.')
param embeddingModelName string = 'text-embedding-3-small'

@description('Embedding model version. Blank = platform default.')
param embeddingModelVersion string = ''

@description('Embedding deployment SKU. The live deployment is regional Standard, not GlobalStandard.')
@allowed([ 'GlobalStandard', 'DataZoneStandard', 'Standard' ])
param embeddingSku string = 'GlobalStandard'

@description('Embedding capacity in thousands of tokens per minute.')
param embeddingCapacity int = 120

@description('Responsible AI policy applied to the model deployment.')
param raiPolicyName string = 'Microsoft.DefaultV2'

@description('Version upgrade behaviour for the model deployment.')
@allowed([ 'OnceNewDefaultVersionAvailable', 'OnceCurrentVersionExpired', 'NoAutoUpgrade' ])
param versionUpgradeOption string = 'OnceNewDefaultVersionAvailable'

// ---------------------------------------------- Foundry platform resources ----
// Created by the Foundry portal wizard in the live estate.
// See modules/foundry-platform.bicep.

@description('Manage the storage / key vault / app insights trio that backs the Foundry account.')
param manageFoundryPlatform bool = true

@description('Create the Foundry storage account. False = reference an existing one.')
param createFoundryStorage bool = true

@description('Storage account name backing the Foundry account (user-owned storage).')
param foundryStorageAccountName string = ''

@description('Create the Foundry key vault. False = reference an existing one.')
param createFoundryKeyVault bool = true

@description('Key vault name backing the Foundry account.')
param foundryKeyVaultName string = ''

@description('Create the Foundry Application Insights component. False = reference an existing one.')
param createFoundryAppInsights bool = true

@description('Application Insights component name backing the Foundry account.')
param foundryAppInsightsName string = ''

@description('Attach the storage account to the Foundry account as user-owned storage. Live estate has this ON.')
param attachUserOwnedStorage bool = true

// ---------------------------------------------------------------- Fabric ----
@description('Create a Microsoft Fabric capacity. False = use an existing capacity.')
param createFabricCapacity bool = false

@description('Fabric capacity name. Required when createFabricCapacity = true.')
param fabricCapacityName string = ''

@description('Resource group holding the Fabric capacity. Blank = this resource group. The live capacity is in rg-Fabric.')
param fabricResourceGroupName string = ''

@description('Region for a newly created Fabric capacity. Blank = same as location. The live capacity is in centralus.')
param fabricLocation string = ''

@description('Fabric SKU.')
@allowed([ 'F2', 'F4', 'F8', 'F16', 'F32', 'F64' ])
param fabricSkuName string = 'F2'

@description('Entra object IDs or UPNs set as Fabric capacity admins. Required when createFabricCapacity = true.')
param fabricAdminMembers array = []

// ------------------------------------------------------------------ RBAC ----
@description('Entra object ID of the principal that will run the agent. Blank = skip role assignments.')
param agentPrincipalId string = ''

@description('Principal type for the role assignments.')
@allowed([ 'User', 'Group', 'ServicePrincipal' ])
param agentPrincipalType string = 'User'

// ============================================================== variables ====
var tags = union({
  workload: workload
  environment: environmentName
  solution: 'mortgage-renewal-concierge'
  dataClassification: 'synthetic-demo-data'
  managedBy: 'bicep'
}, extraTags)

var suffix = uniqueString(resourceGroup().id)
var resolvedSearchName = createSearch ? toLower('srch-${workload}-${environmentName}-${suffix}') : searchServiceName
var resolvedFoundryName = createFoundry ? toLower('ai-${workload}-${environmentName}-${suffix}') : foundryAccountName

var resolvedSearchRg = empty(searchResourceGroupName) ? resourceGroup().name : searchResourceGroupName
var resolvedSearchLocation = empty(searchLocation) ? location : searchLocation
var resolvedFabricRg = empty(fabricResourceGroupName) ? resourceGroup().name : fabricResourceGroupName
var resolvedFabricLocation = empty(fabricLocation) ? location : fabricLocation

var searchIsLocal = resolvedSearchRg == resourceGroup().name
var fabricIsLocal = resolvedFabricRg == resourceGroup().name

var resolvedStorageName = empty(foundryStorageAccountName)
  ? toLower('st${workload}${environmentName}${suffix}')
  : foundryStorageAccountName
var resolvedKeyVaultName = empty(foundryKeyVaultName)
  ? toLower('kv-${workload}-${environmentName}-${suffix}')
  : foundryKeyVaultName
var resolvedAppInsightsName = empty(foundryAppInsightsName)
  ? toLower('appi-${workload}-${environmentName}-${suffix}')
  : foundryAppInsightsName

var foundryStorageId = resourceId('Microsoft.Storage/storageAccounts', resolvedStorageName)
var userOwnedStorageIds = (manageFoundryPlatform && attachUserOwnedStorage) ? [ foundryStorageId ] : []

// ============================================================== resources ====

module platform 'modules/foundry-platform.bicep' = if (manageFoundryPlatform) {
  name: 'foundry-platform'
  params: {
    createStorage: createFoundryStorage
    storageAccountName: resolvedStorageName
    createKeyVault: createFoundryKeyVault
    keyVaultName: resolvedKeyVaultName
    createAppInsights: createFoundryAppInsights
    appInsightsName: resolvedAppInsightsName
    location: location
    tags: tags
  }
}

// Search created in THIS resource group.
module search 'modules/search.bicep' = if (createSearch && searchIsLocal) {
  name: 'search'
  params: {
    name: resolvedSearchName
    location: resolvedSearchLocation
    tags: tags
    sku: searchSku
    semanticSearch: searchSemanticTier
    enableAadAuth: searchEnableAadAuth
  }
}

// Search created in a DIFFERENT resource group.
module searchRemote 'modules/search.bicep' = if (createSearch && !searchIsLocal) {
  name: 'search-remote'
  scope: resourceGroup(resolvedSearchRg)
  params: {
    name: resolvedSearchName
    location: resolvedSearchLocation
    tags: tags
    sku: searchSku
    semanticSearch: searchSemanticTier
    enableAadAuth: searchEnableAadAuth
  }
}

module foundry 'modules/foundry.bicep' = if (createFoundry) {
  name: 'foundry'
  params: {
    accountName: resolvedFoundryName
    projectName: foundryProjectName
    location: location
    tags: tags
    disableLocalAuth: foundryDisableLocalAuth
    userOwnedStorageAccountIds: userOwnedStorageIds
    deployModel: deployModel
    modelDeploymentName: modelDeploymentName
    modelName: modelName
    modelVersion: modelVersion
    modelCapacity: modelCapacity
    deployEmbeddingModel: deployEmbeddingModel
    embeddingDeploymentName: embeddingDeploymentName
    embeddingModelName: embeddingModelName
    embeddingModelVersion: embeddingModelVersion
    embeddingSku: embeddingSku
    embeddingCapacity: embeddingCapacity
    raiPolicyName: raiPolicyName
    versionUpgradeOption: versionUpgradeOption
  }
  dependsOn: [ platform ]
}

// Model deployments onto an existing (not template-created) Foundry account.
resource existingFoundry 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' existing = if (!createFoundry) {
  name: foundryAccountName
}

resource existingAccountModel 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = if (!createFoundry && deployModel) {
  parent: existingFoundry
  name: modelDeploymentName
  sku: { name: 'GlobalStandard', capacity: modelCapacity }
  properties: {
    model: union(
      { format: 'OpenAI', name: modelName },
      empty(modelVersion) ? {} : { version: modelVersion }
    )
    raiPolicyName: raiPolicyName
    versionUpgradeOption: versionUpgradeOption
  }
}

// Serialised behind the reasoning model: ARM rejects concurrent writes to two
// deployments on the same Cognitive Services account.
resource existingAccountEmbedding 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = if (!createFoundry && deployEmbeddingModel) {
  parent: existingFoundry
  name: embeddingDeploymentName
  sku: { name: embeddingSku, capacity: embeddingCapacity }
  properties: {
    model: union(
      { format: 'OpenAI', name: embeddingModelName },
      empty(embeddingModelVersion) ? {} : { version: embeddingModelVersion }
    )
    raiPolicyName: raiPolicyName
    versionUpgradeOption: versionUpgradeOption
  }
  dependsOn: [ existingAccountModel ]
}

// Fabric capacity created in THIS resource group.
module fabricCapacity 'modules/fabric-capacity.bicep' = if (createFabricCapacity && fabricIsLocal) {
  name: 'fabric-capacity'
  params: {
    name: fabricCapacityName
    location: resolvedFabricLocation
    tags: tags
    skuName: fabricSkuName
    adminMembers: fabricAdminMembers
  }
}

// Fabric capacity created in a DIFFERENT resource group.
module fabricCapacityRemote 'modules/fabric-capacity.bicep' = if (createFabricCapacity && !fabricIsLocal) {
  name: 'fabric-capacity-remote'
  scope: resourceGroup(resolvedFabricRg)
  params: {
    name: fabricCapacityName
    location: resolvedFabricLocation
    tags: tags
    skuName: fabricSkuName
    adminMembers: fabricAdminMembers
  }
}

module rbac 'modules/rbac.bicep' = if (!empty(agentPrincipalId)) {
  name: 'rbac'
  params: {
    principalId: agentPrincipalId
    principalType: agentPrincipalType
    foundryAccountName: resolvedFoundryName
  }
  dependsOn: [ foundry ]
}

// Search grants are deployed into the Search service's own resource group: a
// role assignment must be authored in the same scope as the resource it targets.
module rbacSearch 'modules/rbac-search.bicep' = if (!empty(agentPrincipalId) && !empty(resolvedSearchName)) {
  name: 'rbac-search'
  scope: resourceGroup(resolvedSearchRg)
  params: {
    principalId: agentPrincipalId
    principalType: agentPrincipalType
    searchServiceName: resolvedSearchName
  }
  dependsOn: [ search, searchRemote ]
}

// ================================================================ outputs ====
// These feed the environment variables the data-plane scripts and the agent read.

@description('Set as SEARCH_ENDPOINT.')
output searchEndpoint string = 'https://${resolvedSearchName}.search.windows.net'

output searchServiceName string = resolvedSearchName

output searchResourceGroupName string = resolvedSearchRg

@description('Set as SEARCH_INDEX. Created by index_renewal_policies.py, not by Bicep.')
output searchIndexName string = 'renewal-policies'

@description('Set as FOUNDRY_PROJECT_ENDPOINT.')
output foundryProjectEndpoint string = createFoundry
  ? foundry!.outputs.projectEndpoint
  : 'https://${foundryAccountName}.services.ai.azure.com/api/projects/${foundryProjectName}'

output foundryAccountName string = resolvedFoundryName

@description('Set as FOUNDRY_MODEL.')
output modelDeploymentName string = modelDeploymentName

@description('Embedding deployment used to vectorise the policy corpus.')
output embeddingDeploymentName string = embeddingDeploymentName

output foundryStorageAccountName string = manageFoundryPlatform ? resolvedStorageName : 'not-managed'
output foundryKeyVaultName string = manageFoundryPlatform ? resolvedKeyVaultName : 'not-managed'
output foundryAppInsightsName string = manageFoundryPlatform ? resolvedAppInsightsName : 'not-managed'

output fabricCapacityName string = createFabricCapacity
  ? (fabricIsLocal ? fabricCapacity!.outputs.name : fabricCapacityRemote!.outputs.name)
  : fabricCapacityName

output fabricResourceGroupName string = resolvedFabricRg

@description('Fabric workspace/lakehouse/semantic model are data plane - run deploy_fabric.py next.')
output nextSteps array = [
  'python data/fabric-iq/deploy_fabric.py --capacity <capacity-name>'
  'python data/foundry-iq/index_renewal_policies.py'
  'python data/work-iq/provision_seeder_app.py'
  'python data/work-iq/seed_work_iq.py --auth cli --map-users'
  'python data/work-iq/seed_work_iq.py --only mail --purge'
  'python data/work-iq/seed_work_iq.py --only teams'
  'python data/work-iq/seed_work_iq.py --only teams --messages-only --auth device'
  'python data/work-iq/seed_work_iq.py --only files'
  'python agent/create_agent.py --create'
]
