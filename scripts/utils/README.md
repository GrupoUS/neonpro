# NeonPro Script Utilities

This directory contains reusable utility modules for NeonPro shell scripts, providing standardized functionality and reducing code duplication.

## Available Utilities

### validation.sh
Comprehensive validation functions for environment variables, numeric values, URLs, files, security, and healthcare compliance.

**Key Functions:**
- `validate_required_env_vars()` - Check required environment variables
- `validate_env_var_format()` - Validate variable formats with regex
- `validate_number_range()` - Validate numeric values in range
- `validate_percentage()` - Validate percentage values (0-100)
- `validate_url()` - Validate URL format
- `validate_port()` - Validate port numbers (1024-65535)
- `validate_file_readable()` - Check file existence and readability
- `validate_directory_writable()` - Check directory existence and writability
- `validate_secret()` - Validate secret length and complexity
- `validate_db_connection_string()` - Validate database connection strings
- `validate_batch()` - Run multiple validations and collect results

### logging.sh (REMOVED)
The logging.sh utility has been removed to reduce token consumption and complexity. Scripts now use simple built-in logging functions or direct echo statements.

**Replacement:**
For new scripts, use simple logging functions:
```bash
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_error() { echo "[ERROR] $1" >&2; }
```

## Usage

### Sourcing Utilities in Scripts

```bash
#!/bin/bash

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils/validation.sh"

# Simple logging functions
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_warning() { echo "[WARNING] $1" >&2; }

# Use validation functions
validate_required_env_vars "NODE_ENV" "DATABASE_URL"
validate_url "$DATABASE_URL" "database URL"

# Use logging functions
log_info "Starting application"
log_success "Application started successfully"
log_warning "Configuration file not found, using defaults"
```

### Configuration

The utilities are designed to work with the centralized configuration in `config.sh`. Environment-specific settings are loaded automatically.



### Best Practices

1. **Always source utilities** at the beginning of your script
2. **Validate inputs** before using them
3. **Use simple logging functions** for consistent output formatting
4. **Handle validation failures** gracefully with proper error messages
5. **Maintain consistency** across all scripts using these utilities

## Examples

### Environment Validation
```bash
validate_required_env_vars "DATABASE_URL" "API_KEY" "NODE_ENV"
validate_env_var_format "DATABASE_URL" "^postgresql://" "Database URL must start with postgresql://"
validate_number_range "$DB_TIMEOUT" 1 300 "database timeout"
```

### Healthcare Compliance
```bash
# Validate healthcare data retention
validate_healthcare_retention "$DATA_AGE_DAYS" 365

# Check for LGPD compliance
validate_lgpd_compliance "$USER_DATA_CONTENT" "user data"

# Use simple logging for healthcare-specific messages
log_info "Patient data validation completed"
```

### Secure Operations
```bash
# Validate secrets
validate_secret "$JWT_SECRET" 32 "JWT secret"

# Simple logging for security messages
log_info "Authentication check completed"

# Validate file permissions
validate_file_permissions "$CONFIG_FILE" "600" "configuration file"
```

## Error Handling

The utilities provide consistent error handling:

```bash
# Batch validation with error collection
validate_batch \
    "validate_required_env_vars DATABASE_URL" \
    "validate_url $DATABASE_URL" \
    "validate_port $DB_PORT"

# Simple result-based logging
command_result=$(some_command)
if [ $command_result -eq 0 ]; then
    log_success "Command succeeded"
else
    log_error "Command failed"
fi
```

## Integration with Existing Scripts

All existing scripts should be refactored to use these utilities:

1. Replace inline validation with utility functions
2. Use simple logging functions instead of echo statements
3. Source the utilities at the beginning of each script
4. Follow the established patterns for consistency

## Testing

The utilities are designed to be testable and include comprehensive error handling. Each function returns appropriate exit codes for scripting.

## Version History

- **1.1** - Removed logging.sh utility to reduce token consumption and complexity
- **1.0** - Initial release with validation and logging utilities
- Added comprehensive validation functions for healthcare compliance
- Implemented standardized logging with color coding and icons
- Created batch validation capabilities
- Added support for environment-specific configuration
