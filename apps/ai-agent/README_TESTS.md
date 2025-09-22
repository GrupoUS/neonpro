# AI Agent Service Test Suite

## Test Structure

The test suite is organized into the following categories:

### Unit Tests (`tests/test_*.py`)
- `test_database_service.py` - Database operations and caching
- `test_websocket_manager.py` - WebSocket connection management
- `test_agent_service.py` - AI query processing and intent detection

### Integration Tests (`tests/test_integration.py`)
- Full workflow testing (query → processing → response)
- WebSocket real-time communication
- Database caching integration
- Error handling flows
- LGPD compliance checks
- Concurrent request handling
- Conversation memory functionality
- Brazilian document validation

## Running Tests

### Quick Test Run
```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=services
```

### Using Test Runner Script
```bash
# Run complete test suite
./run_tests.sh

# Run specific test categories
./run_tests.sh --unit-only
./run_tests.sh --integration-only
```

### Test Categories
```bash
# Unit tests only
python -m pytest tests/ -m "unit"

# Integration tests only
python -m pytest tests/ -m "integration"

# LGPD compliance tests
python -m pytest tests/ -m "lgpd"

# WebSocket tests
python -m pytest tests/ -m "websocket"

# Slow tests (marked explicitly)
python -m pytest tests/ -m "slow"
```

## Test Coverage

The test suite aims for:
- **Unit Tests**: 95%+ code coverage
- **Integration Tests**: 80%+ feature coverage
- **Edge Cases**: All major error conditions
- **Compliance**: 100% LGPD requirement coverage

## Key Test Scenarios

### 1. Query Processing
- Intent detection for Portuguese queries
- Entity extraction (names, CPFs, dates)
- Context-aware responses
- Memory integration

### 2. Database Operations
- Patient search with caching
- Appointment queries
- Financial data access
- LGPD audit logging
- Consent validation

### 3. WebSocket Communication
- Connection management
- Real-time updates
- Subscription handling
- Error recovery
- Rate limiting

### 4. Error Handling
- Database connection failures
- API rate limiting
- Invalid query formats
- Permission errors
- WebSocket disconnections

### 5. Compliance
- LGPD audit trail
- Data retention policies
- Consent management
- Brazilian document validation
- Access logging

## Mock Data

Tests use realistic mock data:
- Brazilian patient records (with CPFs)
- Healthcare appointments
- Financial transactions
- Consent records
- Audit logs

## CI/CD Integration

The test suite is designed for CI/CD:
- Fast unit tests for quick feedback
- Integration tests for full workflow validation
- Coverage reports for quality metrics
- Parallel test execution support

## Adding New Tests

1. **Unit Tests**: For individual service methods
2. **Integration Tests**: For multi-service workflows
3. **Compliance Tests**: For LGPD requirements
4. **Performance Tests**: For load and concurrency

Example:
```python
@pytest.mark.asyncio
async def test_new_feature(self):
    # Arrange
    # Set up test data
    
    # Act
    # Execute feature
    
    # Assert
    # Verify expected behavior
```

## Test Data Management

- Use fixtures for reusable test data
- Mock external dependencies
- Clean up after each test
- Use realistic Brazilian healthcare data patterns