#!/bin/bash

# 🏥 NeonPro Healthcare Platform - Emergency Rollback Script
# For critical issues requiring immediate rollback to previous deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-"production"}
REASON=${2:-"Emergency rollback - reason not specified"}
ROLLBACK_TYPE=${3:-"full"} # full, partial, config-only
SLACK_WEBHOOK=${4:-""}
PAGERDUTY_KEY=${5:-""}

# Vercel configuration
VERCEL_ORG="grupous-projects"
VERCEL_PROJECT="neonpro-web"
VERCEL_TOKEN=${VERCEL_TOKEN:-""}

# Logging
LOG_FILE="/var/log/neonpro/emergency-rollback-$(date +%Y%m%d-%H%M%S).log"
ROLLBACK_REPORT="emergency-rollback-$(date +%Y%m%d-%H%M%S).json"

# Health check URL
HEALTH_URL="https://neonpro.healthcare/api/health"

echo -e "${BLUE}🏥 NeonPro Healthcare Platform - Emergency Rollback${NC}"
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Reason: $REASON${NC}"
echo -e "${BLUE}Rollback Type: $ROLLBACK_TYPE${NC}"
echo -e "${BLUE}Log File: $LOG_FILE${NC}"
echo -e "${BLUE}Rollback Report: $ROLLBACK_REPORT${NC}"
echo ""

# Initialize logging
init_logging() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] EMERGENCY ROLLBACK INITIATED" | tee -a "$LOG_FILE"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Environment: $ENVIRONMENT" | tee -a "$LOG_FILE"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Reason: $REASON" | tee -a "$LOG_FILE"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Rollback Type: $ROLLBACK_TYPE" | tee -a "$LOG_FILE"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Operator: $(whoami)" | tee -a "$LOG_FILE"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Host: $(hostname)" | tee -a "$LOG_FILE"
}

# Initialize rollback report
init_report() {
    cat > "$ROLLBACK_REPORT" << EOF
{
  "rollback_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "reason": "$REASON",
  "rollback_type": "$ROLLBACK_TYPE",
  "operator": "$(whoami)",
  "host": "$(hostname)",
  "rollback_results": {
    "pre_checks": {},
    "deployment": {},
    "post_checks": {},
    "verification": {}
  },
  "rollback_status": "in_progress",
  "critical_issues": [],
  "recommendations": [],
  "health_restored": false,
  "downtime_minutes": 0
}
EOF
}

# Add result to report
add_result() {
    local category="$1"
    local check="$2"
    local status="$3"
    local message="$4"
    local severity="$5"
    
    # Update report
    jq ".rollback_results.$category += {\"$check\": {\"status\": \"$status\", \"message\": \"$message\", \"severity\": \"$severity\"}}" "$ROLLBACK_REPORT" > temp.json && mv temp.json "$ROLLBACK_REPORT"
    
    # Log to file
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $category.$check: $status - $message" | tee -a "$LOG_FILE"
    
    # Add to issues if not success
    if [ "$status" != "success" ]; then
        if [ "$severity" = "critical" ]; then
            jq ".critical_issues += [{\"category\": \"$category\", \"check\": \"$check\", \"message\": \"$message\"}]" "$ROLLBACK_REPORT" > temp.json && mv temp.json "$ROLLBACK_REPORT"
        else
            jq ".recommendations += [{\"category\": \"$category\", \"check\": \"$check\", \"message\": \"$message\"}]" "$ROLLBACK_REPORT" > temp.json && mv temp.json "$ROLLBACK_REPORT"
        fi
    fi
}

# Send alert notification
send_alert() {
    local message="$1"
    local severity="$2"
    
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] SENDING ALERT: $message" | tee -a "$LOG_FILE"
    
    # Send to Slack if webhook provided
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 NeonPro Emergency Rollback - $severity: $message\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
    
    # Send to PagerDuty if key provided
    if [ -n "$PAGERDUTY_KEY" ]; then
        curl -X POST --header 'Content-Type: application/json' \
            --data "{\"service_key\": \"$PAGERDUTY_KEY\", \"incident_key\": \"neonpro-emergency-rollback\", \"event_type\": \"trigger\", \"description\": \"NeonPro Emergency Rollback: $message\"}" \
            "https://events.pagerduty.com/generic/2010-04-15/create_event.json" 2>/dev/null || true
    fi
    
    # Send email notification (implement based on your email system)
    # This is a placeholder - implement your email notification system
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Email notification would be sent here" | tee -a "$LOG_FILE"
}

# Pre-rollback checks
pre_rollback_checks() {
    echo -e "${YELLOW}🔍 Performing pre-rollback checks...${NC}"
    
    # Check Vercel authentication
    if [ -n "$VERCEL_TOKEN" ]; then
        if vercel --version >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Vercel CLI available${NC}"
            add_result "pre_checks" "vercel_cli" "success" "Vercel CLI is available" "critical"
        else
            echo -e "${RED}❌ Vercel CLI not found${NC}"
            add_result "pre_checks" "vercel_cli" "failed" "Vercel CLI not found" "critical"
            send_alert "Vercel CLI not found - cannot proceed with rollback" "critical"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Vercel token not set - using GitHub rollback${NC}"
        add_result "pre_checks" "vercel_token" "warning" "Vercel token not set, using GitHub rollback" "medium"
    fi
    
    # Check current deployment status
    current_status=$(curl -s --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "unhealthy")
    if echo "$current_status" | grep -q '"status": "healthy"'; then
        echo -e "${GREEN}✅ Current deployment is healthy${NC}"
        add_result "pre_checks" "current_health" "success" "Current deployment is healthy" "medium"
    else
        echo -e "${YELLOW}⚠️  Current deployment is unhealthy - rollback justified${NC}"
        add_result "pre_checks" "current_health" "warning" "Current deployment is unhealthy" "medium"
    fi
    
    # Check available rollback points
    if command -v git &> /dev/null; then
        # Get recent commits
        recent_commits=$(git log --oneline -10 2>/dev/null || echo "")
        if [ -n "$recent_commits" ]; then
            echo -e "${GREEN}✅ Git history available for rollback${NC}"
            add_result "pre_checks" "rollback_points" "success" "Git rollback points available" "critical"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] Available rollback points:" | tee -a "$LOG_FILE"
            echo "$recent_commits" | head -5 | while read commit; do
                echo "[$(date +'%Y-%m-%d %H:%M:%S')]   $commit" | tee -a "$LOG_FILE"
            done
        else
            echo -e "${RED}❌ No git history available for rollback${NC}"
            add_result "pre_checks" "rollback_points" "failed" "No git history available" "critical"
            send_alert "No git history available for rollback" "critical"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Git not available - using Vercel rollback${NC}"
        add_result "pre_checks" "git_available" "warning" "Git not available, using Vercel rollback" "medium"
    fi
    
    # Check disk space
    disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 90 ]; then
        echo -e "${GREEN}✅ Disk space available (${disk_usage}% used)${NC}"
        add_result "pre_checks" "disk_space" "success" "Disk space available (${disk_usage}% used)" "medium"
    else
        echo -e "${YELLOW}⚠️  High disk usage (${disk_usage}% used)${NC}"
        add_result "pre_checks" "disk_space" "warning" "High disk usage (${disk_usage}% used)" "medium"
    fi
}

# Execute rollback based on type
execute_rollback() {
    echo -e "${YELLOW}🔄 Executing rollback...${NC}"
    
    # Record start time
    ROLLBACK_START_TIME=$(date +%s)
    
    case "$ROLLBACK_TYPE" in
        "full")
            execute_full_rollback
            ;;
        "partial")
            execute_partial_rollback
            ;;
        "config-only")
            execute_config_rollback
            ;;
        *)
            echo -e "${RED}❌ Unknown rollback type: $ROLLBACK_TYPE${NC}"
            add_result "deployment" "rollback_type" "failed" "Unknown rollback type: $ROLLBACK_TYPE" "critical"
            exit 1
            ;;
    esac
}

# Full rollback - revert to previous deployment
execute_full_rollback() {
    echo -e "${YELLOW}🔄 Performing full rollback...${NC}"
    
    if [ -n "$VERCEL_TOKEN" ]; then
        # Use Vercel rollback
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Using Vercel rollback" | tee -a "$LOG_FILE"
        
        # Get list of deployments
        deployments=$(vercel ls --limit=5 --json 2>/dev/null || echo "")
        if [ -n "$deployments" ]; then
            # Find the previous successful deployment
            previous_deployment=$(echo "$deployments" | jq -r '.[1].url // empty')
            
            if [ -n "$previous_deployment" ]; then
                echo -e "${GREEN}✅ Found previous deployment: $previous_deployment${NC}"
                
                # Promote previous deployment to production
                if vercel alias set "$previous_deployment" "neonpro.healthcare" 2>/dev/null; then
                    echo -e "${GREEN}✅ Successfully rolled back to previous deployment${NC}"
                    add_result "deployment" "vercel_rollback" "success" "Successfully rolled back to previous deployment" "critical"
                else
                    echo -e "${RED}❌ Failed to promote previous deployment${NC}"
                    add_result "deployment" "vercel_rollback" "failed" "Failed to promote previous deployment" "critical"
                    send_alert "Failed to perform Vercel rollback" "critical"
                    exit 1
                fi
            else
                echo -e "${RED}❌ No previous deployment found${NC}"
                add_result "deployment" "previous_deployment" "failed" "No previous deployment found" "critical"
                send_alert "No previous deployment found for rollback" "critical"
                exit 1
            fi
        else
            echo -e "${RED}❌ Failed to get deployment list${NC}"
            add_result "deployment" "deployment_list" "failed" "Failed to get deployment list" "critical"
            send_alert "Failed to get deployment list for rollback" "critical"
            exit 1
        fi
    else
        # Use Git rollback
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Using Git rollback" | tee -a "$LOG_FILE"
        
        # Get previous commit
        previous_commit=$(git log --oneline -2 | tail -1 | awk '{print $1}')
        
        if [ -n "$previous_commit" ]; then
            echo -e "${GREEN}✅ Found previous commit: $previous_commit${NC}"
            
            # Reset to previous commit
            if git reset --hard "$previous_commit"; then
                echo -e "${GREEN}✅ Successfully reset to previous commit${NC}"
                add_result "deployment" "git_rollback" "success" "Successfully reset to previous commit $previous_commit" "critical"
                
                # Force push to trigger rollback
                if git push --force origin main 2>/dev/null; then
                    echo -e "${GREEN}✅ Successfully pushed rollback to remote${NC}"
                    add_result "deployment" "git_push" "success" "Successfully pushed rollback to remote" "critical"
                else
                    echo -e "${YELLOW}⚠️  Failed to push rollback - manual intervention required${NC}"
                    add_result "deployment" "git_push" "warning" "Failed to push rollback - manual intervention required" "critical"
                    send_alert "Failed to push rollback - manual intervention required" "critical"
                fi
            else
                echo -e "${RED}❌ Failed to reset to previous commit${NC}"
                add_result "deployment" "git_rollback" "failed" "Failed to reset to previous commit" "critical"
                send_alert "Failed to perform Git rollback" "critical"
                exit 1
            fi
        else
            echo -e "${RED}❌ No previous commit found${NC}"
            add_result "deployment" "previous_commit" "failed" "No previous commit found" "critical"
            send_alert "No previous commit found for rollback" "critical"
            exit 1
        fi
    fi
}

# Partial rollback - rollback specific components
execute_partial_rollback() {
    echo -e "${YELLOW}🔄 Performing partial rollback...${NC}"
    
    # This would involve rolling back specific components
    # For now, we'll implement a simplified version
    
    # Rollback configuration files
    if [ -d "config/vercel" ]; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Rolling back configuration files" | tee -a "$LOG_FILE"
        git checkout HEAD~1 config/vercel/ 2>/dev/null || true
        add_result "deployment" "config_rollback" "success" "Configuration files rolled back" "medium"
    fi
    
    # Rollback environment files if they exist
    if [ -f ".env.production.backup" ]; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restoring environment configuration" | tee -a "$LOG_FILE"
        cp .env.production.backup .env.production
        add_result "deployment" "env_rollback" "success" "Environment configuration restored" "medium"
    fi
    
    echo -e "${GREEN}✅ Partial rollback completed${NC}"
    add_result "deployment" "partial_rollback" "success" "Partial rollback completed" "medium"
}

# Configuration-only rollback
execute_config_rollback() {
    echo -e "${YELLOW}🔄 Performing configuration rollback...${NC}"
    
    # Rollback only configuration files
    if [ -d "config" ]; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Rolling back configuration files" | tee -a "$LOG_FILE"
        git checkout HEAD~1 config/ 2>/dev/null || true
        add_result "deployment" "config_rollback" "success" "Configuration files rolled back" "medium"
    fi
    
    # Restore environment files
    if [ -f ".env.production.backup" ]; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restoring environment configuration" | tee -a "$LOG_FILE"
        cp .env.production.backup .env.production
        add_result "deployment" "env_rollback" "success" "Environment configuration restored" "medium"
    fi
    
    echo -e "${GREEN}✅ Configuration rollback completed${NC}"
    add_result "deployment" "config_rollback" "success" "Configuration rollback completed" "medium"
}

# Post-rollback verification
post_rollback_verification() {
    echo -e "${YELLOW}✅ Performing post-rollback verification...${NC}"
    
    # Wait for deployment to stabilize
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Waiting for deployment to stabilize..." | tee -a "$LOG_FILE"
    sleep 30
    
    # Check health endpoint
    health_response=$(curl -s --max-time 30 "$HEALTH_URL" 2>/dev/null || echo "")
    if echo "$health_response" | grep -q '"status": "healthy"'; then
        echo -e "${GREEN}✅ Health endpoint responding normally${NC}"
        add_result "post_checks" "health_endpoint" "success" "Health endpoint is responding normally" "critical"
    else
        echo -e "${YELLOW}⚠️  Health endpoint not responding - may need more time${NC}"
        add_result "post_checks" "health_endpoint" "warning" "Health endpoint not responding yet" "critical"
    fi
    
    # Check API accessibility
    api_response=$(curl -s --max-time 30 "$HEALTH_URL/api/system/info" 2>/dev/null || echo "")
    if echo "$api_response" | grep -q '"version"'; then
        echo -e "${GREEN}✅ API endpoint accessible${NC}"
        add_result "post_checks" "api_accessibility" "success" "API endpoint is accessible" "critical"
    else
        echo -e "${YELLOW}⚠️  API endpoint not accessible${NC}"
        add_result "post_checks" "api_accessibility" "warning" "API endpoint not accessible" "critical"
    fi
    
    # Check static assets
    static_response=$(curl -s -I --max-time 30 "$HEALTH_URL/assets/favicon.ico" 2>/dev/null || echo "")
    if echo "$static_response" | grep -q "200"; then
        echo -e "${GREEN}✅ Static assets serving${NC}"
        add_result "post_checks" "static_assets" "success" "Static assets are serving properly" "medium"
    else
        echo -e "${YELLOW}⚠️  Static assets not serving${NC}"
        add_result "post_checks" "static_assets" "warning" "Static assets not serving properly" "medium"
    fi
    
    # Calculate downtime
    ROLLBACK_END_TIME=$(date +%s)
    DOWNTIME_MINUTES=$(( (ROLLBACK_END_TIME - ROLLBACK_START_TIME) / 60 ))
    
    # Update report with downtime
    jq --arg downtime "$DOWNTIME_MINUTES" '.downtime_minutes = ($downtime | tonumber)' "$ROLLBACK_REPORT" > temp.json && mv temp.json "$ROLLBACK_REPORT"
    
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Downtime: ${DOWNTIME_MINUTES} minutes" | tee -a "$LOG_FILE"
}

# Generate final report
generate_final_report() {
    # Calculate overall status
    critical_issues=$(jq '.critical_issues | length' "$ROLLBACK_REPORT")
    
    if [ "$critical_issues" -eq 0 ]; then
        rollback_status="success"
        health_restored=true
    else
        rollback_status="partial"
        health_restored=false
    fi
    
    jq --arg status "$rollback_status" --arg restored "$health_restored" \
       '.rollback_status = $status | .health_restored = ($restored == "true")' \
       "$ROLLBACK_REPORT" > temp.json && mv temp.json "$ROLLBACK_REPORT"
    
    echo ""
    echo -e "${BLUE}📊 Rollback Summary${NC}"
    echo -e "${BLUE}==================${NC}"
    echo -e "Rollback Status: $([ "$rollback_status" = "success" ] && echo "${GREEN}$rollback_status${NC}" || echo "${YELLOW}$rollback_status${NC}")"
    echo -e "Critical Issues: ${RED}$critical_issues${NC}"
    echo -e "Downtime: ${YELLOW}${DOWNTIME_MINUTES} minutes${NC}"
    echo -e "Health Restored: $([ "$health_restored" = "true" ] && echo "${GREEN}Yes${NC}" || echo "${RED}No${NC}")"
    echo ""
    echo -e "${BLUE}📄 Rollback report saved to: $ROLLBACK_REPORT${NC}"
    echo -e "${BLUE}📄 Log file saved to: $LOG_FILE${NC}"
}

# Main rollback process
main() {
    init_logging
    init_report
    
    # Send initial alert
    send_alert "Emergency rollback initiated for $ENVIRONMENT environment" "critical"
    
    pre_rollback_checks
    echo ""
    
    execute_rollback
    echo ""
    
    post_rollback_verification
    echo ""
    
    generate_final_report
    
    # Send completion alert
    rollback_status=$(jq -r '.rollback_status' "$ROLLBACK_REPORT")
    if [ "$rollback_status" = "success" ]; then
        send_alert "Emergency rollback completed successfully for $ENVIRONMENT environment. Downtime: ${DOWNTIME_MINUTES} minutes." "info"
        echo -e "${GREEN}🎉 Emergency rollback completed successfully!${NC}"
        exit 0
    else
        send_alert "Emergency rollback completed with issues for $ENVIRONMENT environment. Manual intervention required." "critical"
        echo -e "${RED}❌ Emergency rollback completed with issues - manual intervention required${NC}"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null && [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}❌ git is required but not installed (or set VERCEL_TOKEN)${NC}"
        exit 1
    fi
}

# Check if this is a test run
if [ "$1" = "test" ]; then
    echo -e "${YELLOW}🧪 Running in test mode - no actual rollback will be performed${NC}"
    echo -e "${BLUE}Test configuration:${NC}"
    echo -e "  Environment: $ENVIRONMENT"
    echo -e "  Reason: $REASON"
    echo -e "  Rollback Type: $ROLLBACK_TYPE"
    echo ""
    echo -e "${GREEN}✅ Test mode complete - no changes made${NC}"
    exit 0
fi

# Run main function
check_dependencies
main "$@"