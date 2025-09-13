#!/bin/bash

# NeonPro Unified Deployment Orchestrator
# One script to build, deploy, validate, and monitor using all prior scripts' capabilities
# Version: 1.0 (unified)

set -euo pipefail

# -----------------------------
# Colors & Logging
# -----------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}✅ [SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"; }
log_error() { echo -e "${RED}❌ [ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}🔄 [STEP]${NC} $1"; }

# -----------------------------
# Utilities
# -----------------------------
ensure_project_root() {
  if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    log_error "Run from NeonPro repo root (package.json and apps/web required)"
    exit 1
  fi
}

require_command() {
  local cmd=$1
  local hint=${2:-""}
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "Command not found: $cmd"
    [ -n "$hint" ] && log_info "$hint"
    exit 1
  fi
}

run() { echo "+ $*"; "$@"; }

print_header() {
  echo -e "${CYAN}"
  echo "🚀 =============================================="
  echo "   NeonPro Unified Deployment Orchestrator"
  echo "=============================================="
  echo -e "${NC}"
}

# -----------------------------
# Help / Usage
# -----------------------------
usage() {
  cat <<'EOF'
Usage: scripts/neonpro-deploy.sh <command> [options]

Core commands:
  link                          Link repository/project to Vercel (turbo-aware)
  env ls|pull [path]            Manage Vercel environment variables
  build [--mode turbo|bun|npm]  Build the web app (default: --mode turbo)
  deploy [flags]                Deploy web app (preview/prod, turbo or bun)
  api-deploy                    Deploy API as a separate Vercel project

Validation & checks:
  smoke [--url URL] [--simple]  Run smoke tests against a URL (default prod)
  validate [--url URL]          Run comprehensive deployment validation
  verify-config                 Verify deployment configuration
  analyze-bundle                Analyze bundle sizes in apps/web/dist
  test-routes                   Validate sidebar routes & route tree
  supabase-smoke                Run Supabase smoke tests

Operational:
  logs <url> [--follow]         Stream Vercel logs for a deployment URL
  rollback <url>                Roll back to a previous Vercel deployment

Deploy flags:
  --preview | --production      Target environment (default: production)
  --force                       Force deploy (bypass cache)
  --skip-tests                  Skip tests before deploy
  --skip-build-test             Skip local build verification
  --strategy turbo|bun          Deployment strategy (default: turbo)

Examples:
  scripts/neonpro-deploy.sh build --mode turbo
  scripts/neonpro-deploy.sh deploy --preview --strategy turbo
  scripts/neonpro-deploy.sh smoke --url https://neonpro.vercel.app
  scripts/neonpro-deploy.sh api-deploy
EOF
}
# -----------------------------
# Subcommand implementations
# -----------------------------
cmd_link() {
  ensure_project_root
  require_command pnpm "Install PNPM or use: npm i -g pnpm"
  require_command npx "Install Node.js (includes npx)"
  log_step "Linking repo with Vercel using turbo config"
  run pnpm dlx vercel link --yes --local-config vercel-turbo.json
}

cmd_env() {
  ensure_project_root
  require_command npx
  local action=${1:-ls}; shift || true
  case "$action" in
    ls) run npx vercel env ls ;;
    pull)
      local dest=${1:-.env.local}
      run npx vercel env pull "$dest"
      ;;
    *) log_error "Unknown env action: $action"; exit 1;;
  esac
}

cmd_build() {
  ensure_project_root
  local mode="turbo"
  while [[ $# -gt 0 ]]; do
    case $1 in
      --mode) mode=$2; shift 2;;
      *) log_error "Unknown build option: $1"; exit 1;;
    esac
  done

  case "$mode" in
    turbo)
      require_command bun "Install Bun for fastest builds: https://bun.sh"
      log_step "Building with Turborepo (@neonpro/web)"
      run bun install
      run bunx turbo build --filter=@neonpro/web
      ;;
    bun)
      require_command bun
      log_step "Building apps/web with Bun"
      (cd apps/web && run bun install && run bun run build)
      ;;
    npm)
      log_step "Building apps/web with npm (fallback)"
      (cd apps/web && run npm install --legacy-peer-deps --production=false --ignore-scripts && run npm run build)
      ;;
    *) log_error "Unknown build mode: $mode"; exit 1;;
  esac

  # Verify build output
  if [ ! -f "apps/web/dist/index.html" ]; then
    log_error "Build output missing: apps/web/dist/index.html"
    exit 1
  fi
  log_success "Build verified at apps/web/dist/"
}
cmd_deploy() {
  ensure_project_root
  require_command npx

  local env="production"
  local force=false
  local skip_tests=false
  local skip_build_test=false
  local strategy="turbo"

  while [[ $# -gt 0 ]]; do
    case $1 in
      --preview) env="preview"; shift;;
      --production) env="production"; shift;;
      --force) force=true; shift;;
      --skip-tests) skip_tests=true; shift;;
      --skip-build-test) skip_build_test=true; shift;;
      --strategy) strategy=$2; shift 2;;
      *) log_error "Unknown deploy flag: $1"; exit 1;;
    esac
  done

  log_info "Environment: $env | Force: $force | Skip tests: $skip_tests | Skip build test: $skip_build_test | Strategy: $strategy"

  # Reuse logic from deploy-neonpro-turborepo.sh when strategy=turbo
  if [ "$strategy" = "turbo" ]; then
    require_command bun

    # Optional tests
    if [ "$skip_tests" = false ]; then
      log_step "Running tests with turbo"
      run bunx turbo test --filter=@neonpro/web || {
        if [ "$force" = true ]; then
          log_warning "Tests failed; proceeding due to --force"
        else
          log_error "Tests failed"; exit 1
        fi
      }
    else
      log_warning "Skipping tests (--skip-tests)"
    fi

    # Local build test
    if [ "$skip_build_test" = false ]; then
      log_step "Local build verification (@neonpro/web)"
      run bunx turbo build --filter=@neonpro/web
      [ -f "apps/web/dist/index.html" ] || { log_error "Build output missing"; exit 1; }
    else
      log_warning "Skipping local build test (--skip-build-test)"
    fi
  else
    # bun strategy: delegate to apps/web directly
    require_command bun
    if [ "$skip_build_test" = false ]; then
      (cd apps/web && run bun install && run bun run build)
    fi
  fi

  # Deploy
  local cmd=(npx vercel)
  [ "$env" = "production" ] && cmd+=(--prod)
  [ "$force" = true ] && cmd+=(--force)

  log_step "Deploying to Vercel: ${cmd[*]}"
  run "${cmd[@]}"

  log_success "Deployment triggered"
}
cmd_api_deploy() {
  ensure_project_root
  # Wrap existing script
  if [ -x "scripts/deploy-api-separate.sh" ]; then
    run scripts/deploy-api-separate.sh
  else
    log_error "scripts/deploy-api-separate.sh not found or not executable"
    exit 1
  fi
}

cmd_smoke() {
  ensure_project_root
  local url="https://neonpro.vercel.app"
  local simple=false
  while [[ $# -gt 0 ]]; do
    case $1 in
      --url) url=$2; shift 2;;
      --simple) simple=true; shift;;
      *) log_error "Unknown smoke option: $1"; exit 1;;
    esac
  done

  if [ "$simple" = true ]; then
    run scripts/simple-smoke-test.sh "$url"
  else
    run scripts/smoke-test.sh "$url" true
  fi
}

cmd_validate() {
  ensure_project_root
  local url="https://neonpro.vercel.app"
  while [[ $# -gt 0 ]]; do
    case $1 in
      --url) url=$2; shift 2;;
      *) log_error "Unknown validate option: $1"; exit 1;;
    esac
  done
  run scripts/validate-deployment.sh "$url"
}

cmd_verify_config() {
  ensure_project_root
  require_command node "Install Node.js 20+"
  run node scripts/verify-deployment-config.js
}

cmd_analyze_bundle() {
  ensure_project_root
  require_command node
  # Ensure dist exists
  if [ ! -d "apps/web/dist" ]; then
    log_warning "apps/web/dist not found. Building first..."
    cmd_build --mode turbo
  fi
  run node scripts/analyze-bundle.js
}

cmd_test_routes() {
  ensure_project_root
  require_command node
  run node scripts/test-sidebar-routes.js
}

cmd_supabase_smoke() {
  ensure_project_root
  require_command node
  run node scripts/supabase-smoke-tests.js
}

cmd_logs() {
  ensure_project_root
  require_command npx
  local url=""; local follow=false
  url=${1:-}
  shift || true
  while [[ $# -gt 0 ]]; do
    case $1 in
      --follow) follow=true; shift;;
      *) log_error "Unknown logs option: $1"; exit 1;;
    esac
  done
  if [ -z "$url" ]; then
    log_error "Usage: scripts/neonpro-deploy.sh logs <deployment-url> [--follow]"
    exit 1
  fi
  local cmd=(npx vercel logs "$url")
  [ "$follow" = true ] && cmd+=(--follow)
  run "${cmd[@]}"
}

cmd_rollback() {
  ensure_project_root
  require_command npx
  local url=${1:-}
  if [ -z "$url" ]; then
    log_error "Usage: scripts/neonpro-deploy.sh rollback <deployment-url>"
    exit 1
  fi
  run npx vercel rollback "$url"
}
# -----------------------------
# Main
# -----------------------------
main() {
  print_header
  ensure_project_root

  local cmd=${1:-help}
  shift || true

  case "$cmd" in
    help|-h|--help) usage ;;
    link) cmd_link "$@" ;;
    env) cmd_env "$@" ;;
    build) cmd_build "$@" ;;
    deploy) cmd_deploy "$@" ;;
    api-deploy) cmd_api_deploy "$@" ;;
    smoke) cmd_smoke "$@" ;;
    validate) cmd_validate "$@" ;;
    verify-config) cmd_verify_config "$@" ;;
    analyze-bundle) cmd_analyze_bundle "$@" ;;
    test-routes) cmd_test_routes "$@" ;;
    supabase-smoke) cmd_supabase_smoke "$@" ;;
    logs) cmd_logs "$@" ;;
    rollback) cmd_rollback "$@" ;;
    *) log_error "Unknown command: $cmd"; echo; usage; exit 1;;
  esac
}

main "$@"
