// Azure AI Foundry account + project + model deployment.
//
// The account uses the AIServices kind of Cognitive Services, which is what backs
// Azure AI Foundry. `allowProjectManagement: true` enables the project experience.
//
// The *agent* and its three function tools are data-plane objects created at run
// time by agent/create_agent.py - they cannot be expressed in Bicep.

@description('Foundry (AIServices) account name.')
param accountName string

@description('Project name under the account.')
param projectName string

@description('Azure region.')
param location string

@description('Resource tags.')
param tags object

@description('Project display name shown in the Foundry portal.')
param projectDisplayName string = 'Mortgage Renewal Concierge'

@description('Project description.')
param projectDescription string = 'SYNTHETIC DEMO DATA. Agent grounding across Work IQ, Fabric IQ and Foundry IQ for the 180-day mortgage renewal campaign.'

@description('Model deployment name the agent calls.')
param modelDeploymentName string = 'gpt-5.4'

@description('Model name.')
param modelName string = 'gpt-5.4'

@description('Model version. Leave blank to let the platform pick the default.')
param modelVersion string = ''

@description('Deployment SKU.')
@allowed([ 'GlobalStandard', 'DataZoneStandard', 'Standard' ])
param modelSku string = 'GlobalStandard'

@description('Capacity in thousands of tokens per minute.')
param modelCapacity int = 100

@description('Responsible AI policy applied to the deployment.')
param raiPolicyName string = 'Microsoft.DefaultV2'

@description('Version upgrade behaviour.')
@allowed([ 'OnceNewDefaultVersionAvailable', 'OnceCurrentVersionExpired', 'NoAutoUpgrade' ])
param versionUpgradeOption string = 'OnceNewDefaultVersionAvailable'

@description('Deploy the model. Set false if the deployment already exists or quota is unavailable.')
param deployModel bool = true

@description('Deploy the embedding model used to vectorise the Foundry IQ policy corpus.')
param deployEmbeddingModel bool = true

@description('Embedding deployment name.')
param embeddingDeploymentName string = 'text-embedding-3-small'

@description('Embedding model name.')
param embeddingModelName string = 'text-embedding-3-small'

@description('Embedding model version. Leave blank to let the platform pick the default.')
param embeddingModelVersion string = ''

@description('Embedding deployment SKU.')
@allowed([ 'GlobalStandard', 'DataZoneStandard', 'Standard' ])
param embeddingSku string = 'GlobalStandard'

@description('Embedding capacity in thousands of tokens per minute.')
param embeddingCapacity int = 120

@description('Disable API-key (local) auth on the account, forcing Entra tokens. Live estate has this ON.')
param disableLocalAuth bool = true

@description('Resource IDs of storage accounts attached to the account as user-owned storage. Blank = none.')
param userOwnedStorageAccountIds array = []

var userOwnedStorage = map(userOwnedStorageAccountIds, id => { resourceId: id })

resource account 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' = {
  name: accountName
  location: location
  tags: tags
  kind: 'AIServices'
  sku: { name: 'S0' }
  identity: { type: 'SystemAssigned' }
  properties: union(
    {
      allowProjectManagement: true
      customSubDomainName: accountName
      publicNetworkAccess: 'Enabled'
      disableLocalAuth: disableLocalAuth
    },
    empty(userOwnedStorageAccountIds) ? {} : {
      userOwnedStorage: userOwnedStorage
    }
  )
}

resource project 'Microsoft.CognitiveServices/accounts/projects@2025-04-01-preview' = {
  parent: account
  name: projectName
  location: location
  tags: tags
  identity: { type: 'SystemAssigned' }
  properties: {
    displayName: projectDisplayName
    description: projectDescription
  }
}

resource modelDeployment 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = if (deployModel) {
  parent: account
  name: modelDeploymentName
  sku: { name: modelSku, capacity: modelCapacity }
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
resource embeddingDeployment 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = if (deployEmbeddingModel) {
  parent: account
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
  dependsOn: [ modelDeployment ]
}

output accountName string = account.name
output accountId string = account.id
output accountEndpoint string = account.properties.endpoint
output projectName string = project.name
output projectEndpoint string = 'https://${account.name}.services.ai.azure.com/api/projects/${project.name}'
output modelDeploymentName string = deployModel ? modelDeployment.name : modelDeploymentName
output embeddingDeploymentName string = deployEmbeddingModel ? embeddingDeployment.name : embeddingDeploymentName
output accountPrincipalId string = account.identity.principalId
