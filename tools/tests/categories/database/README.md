# Database Tests

## RLS (Row Level Security) Tests
- Patient data access control
- Healthcare provider permissions
- Role-based data access
- Multi-tenant data isolation
- LGPD compliance validation

## Security Tests
- SQL injection prevention
- Data encryption validation
- Audit trail verification
- Data integrity checks
- Healthcare data security standards

## Compliance Tests
- LGPD (Brazilian Data Protection) compliance
- ANVISA regulatory compliance
- CFM (Federal Medical Council) standards
- Healthcare data retention policies
- Privacy regulation validation

## Performance Tests
- Query optimization validation
- Index performance testing
- Connection pool testing
- Migration performance
- Large dataset handling

## Test Commands
```bash
# Run all database tests
cd tools/tests && bun run test:database

# Run RLS tests
cd tools/tests && bun run test:rls

# Run security tests
cd tools/tests && bun run test:security

# Run compliance tests
cd tools/tests && bun run test:compliance

# Run performance tests
cd tools/tests && bun run test:performance
```