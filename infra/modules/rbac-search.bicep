// Search role assignments, split out of rbac.bicep because the live AI Search
// service lives in a DIFFERENT resource group (rg-mortgage-iq) to the Foundry
// account (rg-scotia-iqs). A role assignment must be authored in the same
// deployment scope as its target, so main.bicep deploys this module with
// `scope: resourceGroup(searchResourceGroupName)`.

@description('Entra object ID of the principal running the agent (user or managed identity).')
param principalId string

@description('Principal type. Use ServicePrincipal for managed identities.')
@allowed([ 'User', 'Group', 'ServicePrincipal' ])
param principalType string = 'User'

@description('Search service name in this resource group.')
param searchServiceName string

// Search Index Data Reader - query an index with Entra auth instead of a key.
var searchIndexDataReaderRoleId = '1407120a-92aa-4202-b7e9-c0e197c71c8f'
// Search Service Contributor - create/update indexes with Entra auth.
var searchServiceContributorRoleId = '7ca78c08-252a-4471-8644-bb5ff32d4ba0'

resource search 'Microsoft.Search/searchServices@2024-06-01-preview' existing = {
  name: searchServiceName
}

resource searchReaderRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: search
  name: guid(search.id, principalId, searchIndexDataReaderRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', searchIndexDataReaderRoleId)
    principalId: principalId
    principalType: principalType
  }
}

resource searchContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: search
  name: guid(search.id, principalId, searchServiceContributorRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', searchServiceContributorRoleId)
    principalId: principalId
    principalType: principalType
  }
}
