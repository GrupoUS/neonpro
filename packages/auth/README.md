# @neonpro/auth (DEPRECATED)

⚠️ **This package has been deprecated and merged into `@neonpro/security`.**

## Migration Guide

### Before (deprecated):
```typescript
import { AuthService } from "@neonpro/auth";
import type { User, AuthSession } from "@neonpro/auth";
```

### After (recommended):
```typescript
import { AuthService } from "@neonpro/security/auth/enterprise";
import type { User, AuthSession } from "@neonpro/security/auth/enterprise";
```

## Why was this package merged?

- **Zero inbound dependencies**: No other packages were importing from @neonpro/auth
- **Logical consolidation**: Authentication is a core security concern
- **Reduced complexity**: Fewer packages to maintain and version
- **Better organization**: All security-related functionality now lives under @neonpro/security

## Timeline

- **Current**: Re-export shim maintains backward compatibility
- **Next release**: Deprecation warnings
- **Future release**: Package removal

## Need Help?

If you encounter issues during migration, please check the consolidated documentation in `@neonpro/security` or reach out to the development team.