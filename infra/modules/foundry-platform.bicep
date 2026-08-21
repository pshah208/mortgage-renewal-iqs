// Platform resources that the Azure AI Foundry portal wizard provisions alongside
// the AIServices account. They were created by the portal on 2026-08-03
// (deployment `AIFoundryCreate-20260803161911`), not by this template, so every
// resource here is create-or-reference and the values below mirror the live
// estate exactly rather than expressing a preference.
//
// NOT DECLARED HERE, deliberately: the Event Grid system topic
// `bnsiqs-<guid>` (topicType microsoft.storage.storageaccounts, source = the
// storage account below). It is created implicitly by the Foundry-to-storage
// integration and its name carries a platform-generated GUID; declaring it would
// put the template in a fight with the platform for ownership.

@description('Create the storage account. False = reference an existing one.')
param createStorage bool = false

@description('Storage account name.')
param storageAccountName string

@description('Create the key vault. False = reference an existing one.')
param createKeyVault bool = false

@description('Key vault name.')
param keyVaultName string

@description('Create the Application Insights component. False = reference an existing one.')
param createAppInsights bool = false

@description('Application Insights component name.')
param appInsightsName string

@description('Azure region.')
param location string

@description('Resource tags.')
param tags object

@description('Entra tenant ID for the key vault.')
param tenantId string = subscription().tenantId

@description('Key vault soft-delete retention in days.')
@minValue(7)
@maxValue(90)
param keyVaultRetentionDays int = 7

// ------------------------------------------------------------------ create ----

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = if (createStorage) {
  name: storageAccountName
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowSharedKeyAccess: false
    allowBlobPublicAccess: false
    publicNetworkAccess: 'Disabled'
    networkAcls: { bypass: 'AzureServices', defaultAction: 'Deny' }
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = if (createKeyVault) {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: keyVaultRetentionDays
    enablePurgeProtection: true
    publicNetworkAccess: 'Disabled'
    networkAcls: { bypass: 'AzureServices', defaultAction: 'Deny' }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = if (createAppInsights) {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    IngestionMode: 'LogAnalytics'
  }
}

// --------------------------------------------------------------- reference ----

resource existingStorage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = if (!createStorage) {
  name: storageAccountName
}

resource existingKeyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = if (!createKeyVault) {
  name: keyVaultName
}

resource existingAppInsights 'Microsoft.Insights/components@2020-02-02' existing = if (!createAppInsights) {
  name: appInsightsName
}

// ----------------------------------------------------------------- outputs ----

output storageAccountName string = storageAccountName
output storageAccountId string = createStorage ? storage.id : existingStorage.id
output keyVaultName string = keyVaultName
output keyVaultId string = createKeyVault ? keyVault.id : existingKeyVault.id
output appInsightsName string = appInsightsName
output appInsightsId string = createAppInsights ? appInsights.id : existingAppInsights.id
