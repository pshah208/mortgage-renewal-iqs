// Foundry role assignment the agent operator needs.
//
// Scoped to the Foundry account rather than the resource group, so the principal
// gets only what it needs (least privilege).
//
// The two AI Search grants live in rbac-search.bicep: the live Search service is
// in a different resource group, and a role assignment must be authored in the
// same deployment scope as the resource it targets.

@description('Entra object ID of the principal running the agent (user or managed identity).')
param principalId string

@description('Principal type. Use ServicePrincipal for managed identities.')
@allowed([ 'User', 'Group', 'ServicePrincipal' ])
param principalType string = 'User'

@description('Foundry (AIServices) account name to grant data-plane access on.')
param foundryAccountName string

// Azure AI User - create threads, run agents, call tools on a Foundry project.
var azureAiUserRoleId = '53ca6127-db72-4b80-b1b0-d745d6d5456d'

resource foundryAccount 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' existing = {
  name: foundryAccountName
}

resource foundryRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: foundryAccount
  name: guid(foundryAccount.id, principalId, azureAiUserRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', azureAiUserRoleId)
    principalId: principalId
    principalType: principalType
  }
}
