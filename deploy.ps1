<#
.SYNOPSIS
    End-to-end deployment for the Mortgage Renewal Concierge demo.

.DESCRIPTION
    Runs the full stack in dependency order:

      1. Bicep      Azure control plane - AI Search, Foundry account/project/model,
                    optional Fabric capacity, role assignments.
      2. Fabric IQ  workspace, lakehouse, OneLake upload, Delta tables, Direct Lake
                    semantic model (Fabric data plane - no ARM provider).
      3. Foundry IQ AI Search index + the 10 renewal policy documents.
      4. Work IQ    Entra app registration, persona mapping, then mail, Teams and
                    files into Microsoft 365 (Graph - no ARM provider).
      5. Agent      the Foundry agent and its three function tools.

    Every stage is idempotent and can be run on its own with -Only.

.PARAMETER ResourceGroup
    Resource group for the Bicep deployment.

.PARAMETER FabricCapacity
    Name of the Fabric capacity hosting the workspace.

.PARAMETER Only
    Run a single stage: bicep | fabric | foundry-iq | work-iq | agent.

.PARAMETER SkipWorkIq
    Skip the Microsoft 365 seeding. Use when the tenant content already exists -
    re-seeding is safe but slow, and the Teams step needs interactive auth.

.PARAMETER WhatIf
    For the bicep stage, run what-if instead of deploying.

.EXAMPLE
    .\deploy.ps1 -ResourceGroup rg-scotia-iqs -FabricCapacity fabcap26 -WhatIf
    .\deploy.ps1 -ResourceGroup rg-scotia-iqs -FabricCapacity fabcap26
    .\deploy.ps1 -Only agent

.NOTES
    SYNTHETIC DEMO DATA. CFC Bank is a branding label only.
    Requires: az CLI (logged in), Python 3.10+, and the packages in requirements.txt.
#>

[CmdletBinding()]
param(
    [string]$ResourceGroup = 'rg-scotia-iqs',
    [string]$ParametersFile = 'infra/main.parameters.json',
    [string]$FabricCapacity = 'fabcap26',
    [ValidateSet('bicep', 'fabric', 'foundry-iq', 'work-iq', 'agent')]
    [string]$Only,
    [switch]$SkipWorkIq,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

function Write-Stage($n, $text) {
    Write-Host ''
    Write-Host ('=' * 72) -ForegroundColor Cyan
    Write-Host " $n. $text" -ForegroundColor Cyan
    Write-Host ('=' * 72) -ForegroundColor Cyan
}

function Invoke-Step($label, [scriptblock]$block) {
    Write-Host "-> $label" -ForegroundColor Yellow
    & $block
    if ($LASTEXITCODE -ne 0) { throw "$label failed (exit $LASTEXITCODE)" }
}

$run = { param($stage) (-not $Only) -or ($Only -eq $stage) }

try {
    # ------------------------------------------------------------------ 0 ----
    $account = az account show --query "{sub:name,id:id,user:user.name}" -o json | ConvertFrom-Json
    if (-not $account) { throw 'Not logged in. Run: az login' }
    Write-Host "subscription : $($account.sub)"
    Write-Host "identity     : $($account.user)"
    Write-Host "resource grp : $ResourceGroup"

    # ------------------------------------------------------------ 1 bicep ----
    if (& $run 'bicep') {
        Write-Stage 1 'Azure control plane (Bicep)'
        $verb = $WhatIf ? 'what-if' : 'create'
        Invoke-Step "az deployment group $verb" {
            az deployment group $verb `
                -g $ResourceGroup `
                --template-file infra/main.bicep `
                --parameters $ParametersFile `
                -o table
        }
        if ($WhatIf) {
            Write-Host "`nwhat-if only - stopping here." -ForegroundColor Yellow
            return
        }

        $out = az deployment group show -g $ResourceGroup -n main `
            --query properties.outputs -o json | ConvertFrom-Json
        if ($out) {
            $env:SEARCH_ENDPOINT          = $out.searchEndpoint.value
            $env:SEARCH_INDEX             = $out.searchIndexName.value
            $env:FOUNDRY_PROJECT_ENDPOINT = $out.foundryProjectEndpoint.value
            $env:FOUNDRY_MODEL            = $out.modelDeploymentName.value
            Write-Host "`nresolved from deployment outputs:"
            Write-Host "  SEARCH_ENDPOINT          = $env:SEARCH_ENDPOINT"
            Write-Host "  FOUNDRY_PROJECT_ENDPOINT = $env:FOUNDRY_PROJECT_ENDPOINT"
            Write-Host "  FOUNDRY_MODEL            = $env:FOUNDRY_MODEL"
        }
    }

    # ----------------------------------------------------------- 2 fabric ----
    if (& $run 'fabric') {
        Write-Stage 2 'Fabric IQ - workspace, lakehouse, tables, semantic model'

        $capState = az resource list --resource-type Microsoft.Fabric/capacities `
            --query "[?name=='$FabricCapacity'] | [0].id" -o tsv
        if ($capState) {
            $state = az resource show --ids $capState --query properties.state -o tsv
            if ($state -ne 'Active') {
                Invoke-Step "resume capacity $FabricCapacity" {
                    az rest --method post --url "https://management.azure.com$capState/resume?api-version=2023-11-01"
                }
                Write-Host '   waiting 30s for the capacity to come up...'
                Start-Sleep -Seconds 30
            } else {
                Write-Host "   capacity $FabricCapacity already Active"
            }
        }

        Invoke-Step 'deploy_fabric.py' {
            python data/fabric-iq/deploy_fabric.py --capacity $FabricCapacity
        }

        $ws = python data/fabric-iq/deploy_fabric.py --status 2>$null |
            Select-String -Pattern '^workspace\s+\S+\s+(\S+)' |
            ForEach-Object { $_.Matches[0].Groups[1].Value }
        if ($ws) {
            $env:FABRIC_WORKSPACE_ID = $ws
            $env:FABRIC_SEMANTIC_MODEL = 'sm_mortgage_renewals'
            Write-Host "  FABRIC_WORKSPACE_ID = $ws"
        }
    }

    # ------------------------------------------------------- 3 foundry-iq ----
    if (& $run 'foundry-iq') {
        Write-Stage 3 'Foundry IQ - AI Search index + policy corpus'

        if (-not $env:SEARCH_ENDPOINT) {
            throw 'SEARCH_ENDPOINT not set. Run the bicep stage first, or set it manually.'
        }
        if (-not $env:SEARCH_ADMIN_KEY) {
            $svcName = ([uri]$env:SEARCH_ENDPOINT).Host.Split('.')[0]
            $svcRg = az resource list --resource-type Microsoft.Search/searchServices `
                --query "[?name=='$svcName'] | [0].resourceGroup" -o tsv
            if ($svcRg) {
                $env:SEARCH_ADMIN_KEY = az search admin-key show -g $svcRg `
                    --service-name $svcName --query primaryKey -o tsv
                Write-Host "   resolved admin key for $svcName"
            }
        }
        Invoke-Step 'index_renewal_policies.py' {
            python data/foundry-iq/index_renewal_policies.py
        }
    }

    # ---------------------------------------------------------- 4 work-iq ----
    if ((& $run 'work-iq') -and -not $SkipWorkIq) {
        Write-Stage 4 'Work IQ - Microsoft 365 seeding'
        Write-Host 'This writes into user mailboxes and creates a Team.' -ForegroundColor Yellow
        Write-Host 'DEMO TENANTS ONLY.' -ForegroundColor Yellow

        if (-not ($env:WORKIQ_CLIENT_ID -and $env:WORKIQ_CLIENT_SECRET)) {
            Write-Host @'

  The seeder app registration is not configured. Run:

      python data/work-iq/provision_seeder_app.py

  then set the three WORKIQ_* variables it prints and re-run with -Only work-iq.
  (The secret is shown once and is deliberately not persisted by this script.)
'@ -ForegroundColor Yellow
            return
        }

        Invoke-Step 'map personas onto licensed accounts' {
            python data/work-iq/seed_work_iq.py --auth cli --map-users
        }
        Invoke-Step 'seed mail'  { python data/work-iq/seed_work_iq.py --only mail --purge }
        Invoke-Step 'seed team'  { python data/work-iq/seed_work_iq.py --only teams }
        Invoke-Step 'seed files' { python data/work-iq/seed_work_iq.py --only files }

        Write-Host @'

  Channel messages need DELEGATED auth - ChannelMessage.Send does not exist as an
  application permission. Run this last step interactively:

      python data/work-iq/seed_work_iq.py --only teams --messages-only --auth device
'@ -ForegroundColor Yellow
    }
    elseif ($SkipWorkIq) {
        Write-Stage 4 'Work IQ - SKIPPED (-SkipWorkIq)'
    }

    # ------------------------------------------------------------ 5 agent ----
    if (& $run 'agent') {
        Write-Stage 5 'Foundry agent + three IQ tools'
        if (-not $env:FOUNDRY_PROJECT_ENDPOINT) {
            throw 'FOUNDRY_PROJECT_ENDPOINT not set. Run the bicep stage first.'
        }
        Invoke-Step 'create_agent.py --create' { python agent/create_agent.py --create }

        Write-Host "`nTest it:" -ForegroundColor Green
        Write-Host '    python agent/create_agent.py --demo'
    }

    Write-Host ''
    Write-Host ('=' * 72) -ForegroundColor Green
    Write-Host ' DONE' -ForegroundColor Green
    Write-Host ('=' * 72) -ForegroundColor Green
    Write-Host @"

Remember to pause the Fabric capacity when finished - it bills while Active:
    az rest --method post --url "https://management.azure.com<capacity-id>/suspend?api-version=2023-11-01"

And delete the seeder app registration when the demo is over - it holds
Mail.ReadWrite and User.ReadWrite.All tenant-wide:
    python data/work-iq/provision_seeder_app.py --delete
"@ -ForegroundColor Yellow
}
finally {
    Pop-Location
}
