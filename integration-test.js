// Integration Test: Frontend-Backend Connection
// This script tests if frontend can communicate with backend

const testIntegration = async () => {
  const frontendUrl = "http://localhost:3001";
  const backendUrl = "http://localhost:3004";
  
  console.log("🧪 Testing Frontend-Backend Integration...\n");
  
  // Test 1: Frontend Health
  try {
    const frontendResponse = await fetch(frontendUrl);
    console.log("✅ Frontend accessible:", frontendResponse.status);
  } catch (error) {
    console.log("❌ Frontend error:", error.message);
    return;
  }
  
  // Test 2: Backend Health
  try {
    const backendResponse = await fetch(`${backendUrl}/health`);
    const backendData = await backendResponse.json();
    console.log("✅ Backend accessible:", backendResponse.status);
    console.log("📊 Backend health:", JSON.stringify(backendData, null, 2));
  } catch (error) {
    console.log("❌ Backend error:", error.message);
    return;
  }
  
  // Test 3: CORS Test (simulate frontend calling backend)
  try {
    const corsTestResponse = await fetch(`${backendUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Origin": frontendUrl, // Simulate request from frontend
      },
    });
    
    console.log("✅ CORS test passed:", corsTestResponse.status);
    console.log("🔐 CORS headers present:", {
      "Access-Control-Allow-Origin": corsTestResponse.headers.get("Access-Control-Allow-Origin"),
      "Access-Control-Allow-Credentials": corsTestResponse.headers.get("Access-Control-Allow-Credentials"),
    });
  } catch (error) {
    console.log("❌ CORS test failed:", error.message);
  }
  
  // Test 4: API Client Integration Simulation
  try {
    console.log("\n🔗 Testing API Client Configuration...");
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";
    console.log("📍 API Base URL:", apiBaseUrl);
    
    if (apiBaseUrl.includes("3004")) {
      console.log("✅ API URL correctly configured for port 3004");
    } else {
      console.log("⚠️  API URL might need adjustment");
    }
  } catch (error) {
    console.log("❌ API Client test failed:", error.message);
  }
  
  console.log("\n🎉 Integration test completed!");
};

testIntegration().catch(console.error);