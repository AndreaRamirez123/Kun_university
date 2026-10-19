# Despliegue de KUN University AI
#   API (NestJS + agente de Krucn) -> Google Cloud Run (servicio kun-api)
#   Web (export estático)          -> Firebase Hosting (sitio kun-university)
#
# Uso, desde la raíz del repo:
#   powershell -ExecutionPolicy Bypass -File .\deploy.ps1                # API y web
#   powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -OnlyWeb       # solo la web
#   powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -SetKrucnKey   # clave de Krucn
#
# Requisitos (una sola vez): Google Cloud CLI instalado, `gcloud auth login`,
# `npx firebase-tools login` y el proyecto en plan Blaze.

param(
  [switch]$OnlyWeb,
  [switch]$SetKrucnKey
)

$ErrorActionPreference = "Stop"
$Project = "kun-university2026"
$Region = "us-east1"
$Service = "kun-api"
$Secret = "krucn-anthropic-key"
$Site = "kununiversityai"
$Frontend = "https://$Site.web.app,https://$Site.firebaseapp.com"

$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
$env:NODE_OPTIONS = "--use-system-ca"
Set-Location $PSScriptRoot

function Invoke-Step($label, [scriptblock]$cmd) {
  Write-Host "`n==> $label" -ForegroundColor Cyan
  & $cmd
  if ($LASTEXITCODE -ne 0) { throw "Falló: $label" }
}

function Get-ApiUrl {
  gcloud.cmd run services describe $Service --project $Project --region $Region --format "value(status.url)"
}

if ($SetKrucnKey) {
  $secure = Read-Host "Pega la clave de Anthropic (no se mostrará)" -AsSecureString
  $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
  $exists = gcloud.cmd secrets list --project $Project --filter "name~$Secret" --format "value(name)"
  if (-not $exists) {
    Invoke-Step "Creando el secreto $Secret" { gcloud.cmd secrets create $Secret --project $Project --replication-policy automatic }
  }
  # Archivo temporal sin salto de línea final (un "\n" extra invalidaría la clave).
  $tmp = [IO.Path]::GetTempFileName()
  try {
    [IO.File]::WriteAllText($tmp, $key.Trim())
    Invoke-Step "Guardando la clave" { gcloud.cmd secrets versions add $Secret --project $Project --data-file=$tmp }
  } finally {
    Remove-Item $tmp -Force
  }
  $number = gcloud.cmd projects describe $Project --format "value(projectNumber)"
  Invoke-Step "Permiso de lectura para Cloud Run" {
    gcloud.cmd secrets add-iam-policy-binding $Secret --project $Project `
      --member "serviceAccount:$number-compute@developer.gserviceaccount.com" `
      --role roles/secretmanager.secretAccessor --condition None | Out-Null
  }
  Invoke-Step "Conectando la clave a $Service" {
    gcloud.cmd run services update $Service --project $Project --region $Region --update-secrets "ANTHROPIC_API_KEY=${Secret}:latest"
  }
  Write-Host "`nListo: Krucn ya responde con IA. Comprueba: $(Get-ApiUrl)/api/krucn/status" -ForegroundColor Green
  exit 0
}

if (-not $OnlyWeb) {
  Invoke-Step "Activando servicios de Google Cloud" {
    gcloud.cmd services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com --project $Project
  }
  # --max-instances limita cuántas copias corren a la vez (y el gasto).
  Invoke-Step "Desplegando la API en Cloud Run" {
    gcloud.cmd run deploy $Service --project $Project --region $Region --source . `
      --allow-unauthenticated --memory 512Mi --timeout 300 --min-instances 0 --max-instances 3 `
      --set-env-vars "^@^FRONTEND_URL=$Frontend" --quiet
  }
}

$ApiUrl = Get-ApiUrl
if (-not $ApiUrl) { throw "No encontré el servicio $Service. Ejecuta primero .\deploy.ps1 sin -OnlyWeb." }
Write-Host "API publicada en $ApiUrl" -ForegroundColor Green

# La web se genera leyendo la API publicada (build) y el navegador la llama para Krucn.
$env:API_URL = "$ApiUrl/api"
$env:NEXT_PUBLIC_API_URL = "$ApiUrl/api"
Invoke-Step "Construyendo la web" { npm.cmd run build --workspace=web }
Invoke-Step "Publicando en Firebase Hosting" { npx.cmd --yes firebase-tools deploy --only "hosting:$Site" --project $Project }

Write-Host "`nListo: https://$Site.web.app/campus" -ForegroundColor Green
