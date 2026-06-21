#!/usr/bin/env pwsh

# ===================================================
# PRODUCTION BUILD VERIFICATION SCRIPT
# ===================================================
# Purpose: Verify all aspects of the production build
# Author: Deployment Automation
# Date: 2026-06-22

param(
    [string]$BuildMode = "production",
    [bool]$Verbose = $true
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Color output helpers
function Write-Success { Write-Host "[✓] $args" -ForegroundColor Green }
function Write-Error { Write-Host "[✗] $args" -ForegroundColor Red }
function Write-Warning { Write-Host "[!] $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "[*] $args" -ForegroundColor Cyan }

Write-Info "=========================================="
Write-Info "Production Build Verification Started"
Write-Info "=========================================="
Write-Info ""

# Change to project directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# ===================================================
# 1. ENVIRONMENT CHECK
# ===================================================
Write-Info "1. Checking Environment..."

try {
    # Check Node.js version
    $NodeVersion = & node --version 2>&1
    Write-Success "Node.js version: $NodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js 16+."
    exit 1
}

try {
    # Check npm version
    $NpmVersion = & npm --version 2>&1
    Write-Success "npm version: $NpmVersion"
} catch {
    Write-Error "npm not found. Please install npm."
    exit 1
}

# ===================================================
# 2. DEPENDENCY CHECK
# ===================================================
Write-Info ""
Write-Info "2. Checking Dependencies..."

if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules directory not found. Installing dependencies..."
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
} else {
    Write-Success "node_modules found"
}

# ===================================================
# 3. TYPE CHECKING
# ===================================================
Write-Info ""
Write-Info "3. Running TypeScript Type Checking..."

& npm run lint 2>&1 | Tee-Object -Variable TypeCheckOutput
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript type checking failed"
    $TypeCheckOutput | ForEach-Object { Write-Error $_ }
    exit 1
} else {
    Write-Success "TypeScript type checking passed"
}

# ===================================================
# 4. BUILD VERIFICATION
# ===================================================
Write-Info ""
Write-Info "4. Verifying Build Artifacts..."

# Remove old build if exists
if (Test-Path "dist") {
    Write-Info "Cleaning previous build..."
    Remove-Item -Recurse -Force dist
}

# Run production build
Write-Info "Running production build (npm run build)..."
& npm run build 2>&1 | Tee-Object -Variable BuildOutput

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    $BuildOutput | ForEach-Object { Write-Error $_ }
    exit 1
}

# Verify build output
$BuildChecks = @{
    "dist/index.html" = "Frontend bundle"
    "dist/server.cjs" = "Server bundle"
    "dist/server.cjs.map" = "Server source map"
}

foreach ($file in $BuildChecks.Keys) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1KB
        Write-Success "$($BuildChecks[$file]): $file (${size}KB)"
    } else {
        Write-Error "Missing build artifact: $file"
        exit 1
    }
}

# ===================================================
# 5. ASSET VERIFICATION
# ===================================================
Write-Info ""
Write-Info "5. Verifying Build Assets..."

if (Test-Path "dist/assets") {
    $assetCount = (Get-ChildItem -Recurse "dist/assets" | Measure-Object).Count
    Write-Success "Assets directory found with $assetCount files"
} else {
    Write-Warning "Assets directory not found (may be empty project)"
}

# ===================================================
# 6. CONFIGURATION VALIDATION
# ===================================================
Write-Info ""
Write-Info "6. Validating Configuration Files..."

$ConfigFiles = @(
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "vercel.json",
    ".env.example"
)

foreach ($file in $ConfigFiles) {
    if (Test-Path $file) {
        Write-Success "Configuration file found: $file"
    } else {
        Write-Error "Missing configuration file: $file"
        exit 1
    }
}

# ===================================================
# 7. PRODUCTION CONFIG CHECK
# ===================================================
Write-Info ""
Write-Info "7. Checking Production-Specific Configuration..."

if (Test-Path ".env.production") {
    Write-Success "Production environment file (.env.production) found"
} else {
    Write-Warning ".env.production not found - will use .env"
}

if (Test-Path "vercel.production.json") {
    Write-Success "Production Vercel config (vercel.production.json) found"
} else {
    Write-Warning "vercel.production.json not found"
}

# ===================================================
# 8. ENVIRONMENT VARIABLE VALIDATION
# ===================================================
Write-Info ""
Write-Info "8. Validating Environment Variables..."

$RequiredVars = @("GEMINI_API_KEY", "APP_URL")
foreach ($var in $RequiredVars) {
    $value = [System.Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Success "Environment variable set: $var"
    } else {
        Write-Warning "Environment variable not set: $var (will be required in production)"
    }
}

# ===================================================
# 9. FILE SIZE ANALYSIS
# ===================================================
Write-Info ""
Write-Info "9. Build Size Analysis..."

$IndexHtml = Get-Item "dist/index.html" -ErrorAction SilentlyContinue
$ServerCjs = Get-Item "dist/server.cjs" -ErrorAction SilentlyContinue

if ($IndexHtml) {
    $htmlSize = $IndexHtml.Length / 1KB
    Write-Info "index.html size: ${htmlSize}KB"
    if ($htmlSize -gt 500) {
        Write-Warning "HTML bundle is large (${htmlSize}KB) - consider optimization"
    }
}

if ($ServerCjs) {
    $serverSize = $ServerCjs.Length / 1MB
    Write-Info "server.cjs size: ${serverSize}MB"
    if ($serverSize -gt 10) {
        Write-Warning "Server bundle is large (${serverSize}MB) - consider optimization"
    }
}

# ===================================================
# 10. GIT STATUS CHECK
# ===================================================
Write-Info ""
Write-Info "10. Checking Git Status..."

$gitStatus = & git status --porcelain 2>&1
if ($gitStatus) {
    Write-Warning "Uncommitted changes detected:"
    $gitStatus | ForEach-Object { Write-Warning "  $_" }
} else {
    Write-Success "All changes committed"
}

# Check for secrets in git history
Write-Info "Scanning for exposed secrets..."
$secretPatterns = @(
    "GEMINI_API_KEY\s*[=:]\s*['\"]?[^'\"]+['\"]?",
    "password\s*[=:]\s*['\"]?[^'\"]+['\"]?",
    "secret\s*[=:]\s*['\"]?[^'\"]+['\"]?",
    "token\s*[=:]\s*['\"]?[^'\"]+['\"]?"
)

$foundSecrets = $false
foreach ($pattern in $secretPatterns) {
    $matches = Get-Content -Path "*.ts", "*.tsx", "*.json" -Recurse -ErrorAction SilentlyContinue | Select-String -Pattern $pattern
    if ($matches) {
        Write-Warning "Potential secret found in files:"
        $matches | ForEach-Object { Write-Warning "  $_.FileName: $_.Line" }
        $foundSecrets = $true
    }
}

if (-not $foundSecrets) {
    Write-Success "No obvious secrets detected in codebase"
}

# ===================================================
# SUMMARY
# ===================================================
Write-Info ""
Write-Info "=========================================="
Write-Info "BUILD VERIFICATION COMPLETE ✓"
Write-Info "=========================================="
Write-Info ""
Write-Success "All critical checks passed"
Write-Success "Build is ready for deployment"
Write-Success "Production artifacts: dist/"
Write-Info ""
Write-Info "Next Steps:"
Write-Info "1. Review SECURITY_AUDIT.md for security recommendations"
Write-Info "2. Configure Vercel secrets via dashboard"
Write-Info "3. Execute pre-deployment health checks"
Write-Info "4. Deploy to production environment"
Write-Info "5. Run post-deployment validation tests"
