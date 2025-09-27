@echo off
echo Starting Chrome with remote debugging enabled...
echo This enables Chrome DevTools MCP server integration from WSL
echo.
echo Chrome will start with debugging on port 9222
echo You can access Chrome DevTools at: http://localhost:9222
echo.
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --remote-allow-origins=*
echo Chrome started successfully!
echo.
echo To test if debugging is working, open: http://localhost:9222/json
echo.
pause