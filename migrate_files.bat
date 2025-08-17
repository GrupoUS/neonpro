@echo off
echo Starting source code consolidation...

echo Copying useComplianceAutomation.ts...
copy "src\hooks\useComplianceAutomation.ts" "apps\web\hooks\useComplianceAutomation.ts"

echo Copying service files...
copy "src\services\api-gateway.ts" "apps\web\lib\services\api-gateway.ts"
copy "src\services\auth.ts" "apps\web\lib\services\auth.ts"
copy "src\services\compliance.ts" "apps\web\lib\services\compliance.ts"
copy "src\services\configuration.ts" "apps\web\lib\services\configuration.ts"
copy "src\services\financial.ts" "apps\web\lib\services\financial.ts"
copy "src\services\monitoring.ts" "apps\web\lib\services\monitoring.ts"
copy "src\services\notification.ts" "apps\web\lib\services\notification.ts"
copy "src\services\patient.ts" "apps\web\lib\services\patient.ts"

echo Copying test files...
xcopy "src\__tests__\*" "apps\web\__tests__\" /E /I

echo Migration complete!
pause