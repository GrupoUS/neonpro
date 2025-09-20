const { default: app } = await import("./apps/api/src/app.js");

console.log("Testing insights route...");

try {
  const response = await app.request(
    "http://local.test/api/v2/ai/insights/patient/550e8400-e29b-41d4-a716-446655440000",
    {
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
        "X-Healthcare-Professional": "CRM-123456",
        "X-CFM-License": "CFM-12345",
      },
    },
  );

  console.log("Status:", response.status);
  console.log("Headers:", Object.fromEntries(response.headers.entries()));

  const body = await response.text();
  console.log("Body:", body);
} catch (error) {
  console.error("Error:", error);
}
