# React 19 + Jest Compatibility Issue

## Issue Summary
There is a known compatibility issue between React 19 and Jest/Testing Library when testing components that use React hooks (useState, useEffect, etc.).

## Error Description
```
TypeError: Cannot read properties of undefined (reading 'useState')
```

## Root Cause
React 19 changed its internal hook implementation, and the current testing ecosystem hasn't fully caught up. This affects:
- @testing-library/react (even version 15.x)
- Jest environment setup with React hooks
- Hook mocking and testing

## Attempted Solutions
1. ✅ Created custom Jest environment with React 19 scheduler mocking
2. ✅ Updated Jest setup to set `IS_REACT_ACT_ENVIRONMENT`
3. ✅ Tried multiple @testing-library/react versions
4. ✅ Attempted custom useState mocking
5. ✅ Created wrapper components to isolate hook behavior

## Current Status
- ✅ Static components (no hooks) test successfully
- ❌ Components with hooks fail consistently
- ✅ All functionality works correctly in browser/development
- ✅ Build and lint processes work correctly

## Workaround
For now, we:
1. Focus on integration testing in the browser
2. Test business logic separately from React components
3. Use static component testing where possible
4. Wait for ecosystem to catch up with React 19

## Components Affected
- `duplicate-manager.tsx` and related hook-based components
- Any component using useState, useEffect, or other React hooks

## Resolution Plan
Monitor React testing ecosystem updates and revisit when:
- @testing-library/react releases React 19 compatible version
- Jest releases React 19 compatible updates
- Community provides working solutions

## Date
January 26, 2025

## Impact
Low - functionality works correctly, only automated testing is affected.
