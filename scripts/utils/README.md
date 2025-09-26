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

### logging.sh
Standardized logging functions with color coding, icons, log levels, and formatted output.

**Key Functions:**
- `log_info()`, `log_success()`, `log_warning()`, `log_error()` - Standard logging levels
- `log_debug()` - Debug messages with log level control
- `log_step()` - Process step indicators
- `log_healthcare()`, `log_security()`, `log_performance()` - Domain-specific logging
- `log_section()`, `log_subsection()` - Formatted section headers
- `log_progress()` - Progress indicators with progress bars
- `log_script_start()`, `log_script_end()` - Script lifecycle logging
- `set_log_level()` - Configure logging verbosity (debug, info, warning, error, off)

## Usage

### Sourcing Utilities in Scripts

```bash
#!/bin/bash

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils/logging.sh"
source "$SCRIPT_DIR/utils/validation.sh"

# Initialize logging
log_script_start

# Use validation functions
validate_required_env_vars "NODE_ENV" "DATABASE_URL"
validate_url "$DATABASE_URL" "database URL"

# Use logging functions
log_info "Starting application"
log_success "Application started successfully"
log_warning "Configuration file not found, using defaults"

# End script
log_script_end 0
```

### Configuration

The utilities are designed to work with the centralized configuration in `config.sh`. Environment-specific settings are loaded automatically.

#### Log Level Configuration

Set log level using environment variable or function:
```bash
# Via environment variable
export NEONPRO_LOG_LEVEL=debug

# Via function
set_log_level "debug"  # Options: debug, info, warning, error, off
```

### Best Practices

1. **Always source utilities** at the beginning of your script
2. **Initialize logging** with `log_script_start` and end with `log_script_end`
3. **Validate inputs** before using them
4. **Use appropriate log levels** for different message types
5. **Handle validation failures** gracefully with proper error messages
6. **Maintain consistency** across all scripts using these utilities

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

# Use healthcare-specific logging
log_healthcare "Patient data validation completed"
```

### Secure Operations
```bash
# Validate secrets
validate_secret "$JWT_SECRET" 32 "JWT secret"

# Security-specific logging
log_security "Authentication check completed"

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

# Result-based logging
command_result=$(some_command)
log_result $? "Command succeeded" "Command failed"
```

## Integration with Existing Scripts

All existing scripts should be refactored to use these utilities:

1. Replace inline validation with utility functions
2. Use standardized logging instead of echo statements
3. Source the utilities at the beginning of each script
4. Follow the established patterns for consistency

## Testing

The utilities are designed to be testable and include comprehensive error handling. Each function returns appropriate exit codes for scripting.

## Version History

- **1.0** - Initial release with validation and logging utilities
- Added comprehensive validation functions for healthcare compliance
- Implemented standardized logging with color coding and icons
- Created batch validation capabilities
- Added support for environment-specific configuration
