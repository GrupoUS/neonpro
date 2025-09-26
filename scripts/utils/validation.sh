#!/bin/bash

# NEONPRO - Common Validation Utilities
# Provides reusable validation functions for all scripts
# Version: 1.0 - REFACTOR Phase

set -euo pipefail

# ==============================================
# ENVIRONMENT VARIABLE VALIDATION
# ==============================================

# Validate required environment variables
validate_required_env_vars() {
    local required_vars=("$@")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        echo "ERROR: Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}" >&2
        return 1
    fi
    
    echo "All required environment variables are set"
    return 0
}

# Validate environment variable format
validate_env_var_format() {
    local var_name="$1"
    local var_value="${!var_name:-}"
    local format_pattern="$2"
    local error_message="${3:-"Invalid format for $var_name"}"
    
    if [[ -z "$var_value" ]]; then
        echo "WARNING: Environment variable $var_name is not set"
        return 0
    fi
    
    if [[ ! "$var_value" =~ $format_pattern ]]; then
        echo "ERROR: $error_message (got: $var_value)" >&2
        return 1
    fi
    
    echo "Environment variable $var_name format is valid"
    return 0
}

# ==============================================
# NUMERIC VALIDATION
# ==============================================

# Validate numeric value in range
validate_number_range() {
    local value="$1"
    local min="$2"
    local max="$3"
    local var_name="${4:-"value"}"
    
    if ! [[ "$value" =~ ^[0-9]+$ ]]; then
        echo "ERROR: $var_name must be a number (got: $value)" >&2
        return 1
    fi
    
    if [[ "$value" -lt "$min" ]] || [[ "$value" -gt "$max" ]]; then
        echo "ERROR: $var_name must be between $min and $max (got: $value)" >&2
        return 1
    fi
    
    echo "$var_name is within valid range ($min-$max)"
    return 0
}

# Validate percentage value
validate_percentage() {
    local value="$1"
    local var_name="${2:-"percentage"}"
    
    validate_number_range "$value" 0 100 "$var_name"
}

# ==============================================
# URL AND NETWORK VALIDATION
# ==============================================

# Validate URL format
validate_url() {
    local url="$1"
    local var_name="${2:-"URL"}"
    
    if [[ ! "$url" =~ ^https?:// ]]; then
        echo "ERROR: $var_name must start with http:// or https:// (got: $url)" >&2
        return 1
    fi
    
    echo "$var_name has valid URL format"
    return 0
}

# Validate port number
validate_port() {
    local port="$1"
    local var_name="${2:-"port"}"
    
    validate_number_range "$port" 1024 65535 "$var_name"
}

# ==============================================
# FILE AND PATH VALIDATION
# ==============================================

# Validate file exists and is readable
validate_file_readable() {
    local file_path="$1"
    local var_name="${2:-"file"}"
    
    if [[ ! -f "$file_path" ]]; then
        echo "ERROR: $var_name does not exist: $file_path" >&2
        return 1
    fi
    
    if [[ ! -r "$file_path" ]]; then
        echo "ERROR: $var_name is not readable: $file_path" >&2
        return 1
    fi
    
    echo "$var_name exists and is readable"
    return 0
}

# Validate directory exists and is writable
validate_directory_writable() {
    local dir_path="$1"
    local var_name="${2:-"directory"}"
    
    if [[ ! -d "$dir_path" ]]; then
        echo "ERROR: $var_name does not exist: $dir_path" >&2
        return 1
    fi
    
    if [[ ! -w "$dir_path" ]]; then
        echo "ERROR: $var_name is not writable: $dir_path" >&2
        return 1
    fi
    
    echo "$var_name exists and is writable"
    return 0
}

# ==============================================
# SECURITY VALIDATION
# ==============================================

# Validate secret length and complexity
validate_secret() {
    local secret="$1"
    local min_length="${2:-32}"
    local var_name="${3:-"secret"}"
    
    if [[ ${#secret} -lt "$min_length" ]]; then
        echo "ERROR: $var_name must be at least $min_length characters long" >&2
        return 1
    fi
    
    # Check for complexity (at least one uppercase, one lowercase, one number, one special char)
    if ! [[ "$secret" =~ [A-Z] ]] || \
       ! [[ "$secret" =~ [a-z] ]] || \
       ! [[ "$secret" =~ [0-9] ]] || \
       ! [[ "$secret" =~ [^a-zA-Z0-9] ]]; then
        echo "WARNING: $var_name should contain uppercase, lowercase, numbers, and special characters"
    fi
    
    echo "$var_name meets length requirements"
    return 0
}

# ==============================================
# DATABASE VALIDATION
# ==============================================

# Validate database connection string format
validate_db_connection_string() {
    local connection_string="$1"
    local db_type="${2:-"postgresql"}"
    
    case "$db_type" in
        "postgresql")
            if [[ ! "$connection_string" =~ ^postgresql:// ]]; then
                echo "ERROR: Invalid PostgreSQL connection string format" >&2
                return 1
            fi
            ;;
        "mysql")
            if [[ ! "$connection_string" =~ ^mysql:// ]]; then
                echo "ERROR: Invalid MySQL connection string format" >&2
                return 1
            fi
            ;;
        *)
            echo "ERROR: Unsupported database type: $db_type" >&2
            return 1
            ;;
    esac
    
    echo "Database connection string format is valid for $db_type"
    return 0
}

# Validate database timeout settings
validate_db_timeout() {
    local timeout="$1"
    local max_timeout="${2:-300}"  # 5 minutes default
    
    validate_number_range "$timeout" 1 "$max_timeout" "database timeout"
}

# ==============================================
# BATCH VALIDATION
# ==============================================

# Run multiple validations and collect results
validate_batch() {
    local validations=("$@")
    local failed_validations=()
    
    for validation in "${validations[@]}"; do
        if ! $validation; then
            failed_validations+=("$validation")
        fi
    done
    
    if [[ ${#failed_validations[@]} -gt 0 ]]; then
        echo "ERROR: ${#failed_validations[@]} validation(s) failed:"
        printf '  - %s\n' "${failed_validations[@]}" >&2
        return 1
    fi
    
    echo "All validations passed"
    return 0
}

# ==============================================
# EXPORT FUNCTIONS
# ==============================================

# Make all validation functions available when sourced
export -f validate_required_env_vars
export -f validate_env_var_format
export -f validate_number_range
export -f validate_percentage
export -f validate_url
export -f validate_port
export -f validate_file_readable
export -f validate_directory_writable
export -f validate_secret
export -f validate_db_connection_string
export -f validate_db_timeout
export -f validate_batch

# Auto-initialize validation utilities when sourced
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    echo "Validation utilities loaded successfully"
fi
