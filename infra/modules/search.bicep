// Azure AI Search - the Foundry IQ knowledge store (renewal policy corpus).
//
// Semantic ranking MUST be enabled: the agent's lookup_renewal_policy tool issues
// a semantic query, and if the ranker is off the query fails at run time and the
// tool silently falls back to the local JSON corpus.
//
// The *index* and its documents are data-plane objects and cannot be expressed in
// Bicep - create them with data/foundry-iq/index_renewal_policies.py.

@description('Name of the search service.')
param name string

@description('Azure region.')
param location string

@description('Resource tags.')
param tags object

@description('Search SKU. The live Foundry IQ service runs Standard; Basic is sufficient for a 10-document corpus in a greenfield rebuild.')
@allowed([ 'free', 'basic', 'standard', 'standard2', 'standard3' ])
param sku string = 'basic'

@description('Semantic ranker tier. "free" allows 1,000 queries/month at no cost.')
@allowed([ 'disabled', 'free', 'standard' ])
param semanticSearch string = 'free'

@description('Allow Entra auth alongside API keys. The live service is apiKeyOnly (enableAadAuth = false).')
param enableAadAuth bool = true

@description('Replica count.')
param replicaCount int = 1

@description('Partition count.')
param partitionCount int = 1

resource search 'Microsoft.Search/searchServices@2024-06-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: { name: sku }
  identity: { type: 'SystemAssigned' }
  properties: {
    replicaCount: replicaCount
    partitionCount: partitionCount
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    semanticSearch: semanticSearch
    disableLocalAuth: false
    authOptions: enableAadAuth ? { aadOrApiKey: { aadAuthFailureMode: 'http401WithBearerChallenge' } } : { apiKeyOnly: {} }
  }
}

output name string = search.name
output id string = search.id
output endpoint string = 'https://${search.name}.search.windows.net'
output principalId string = search.identity.principalId
