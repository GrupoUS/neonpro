#!/bin/bash

echo "Testing AI Insights endpoint..."
curl -v http://localhost:3007/api/v2/ai/insights/patient/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer test-token"

echo -e "\n\nTesting No-Show Prediction endpoint..."
curl -v -X POST http://localhost:3007/api/v2/ai/insights/no-show-prediction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "appointments": [
      {
        "id": "appt-123",
        "patientId": "550e8400-e29b-41d4-a716-446655440000",
        "datetime": "2024-01-15T10:00:00Z",
        "appointmentType": "consultation",
        "provider": "Dr. Silva",
        "duration": 30
      }
    ],
    "contextualFactors": {
      "weather": "sunny",
      "dayOfWeek": "monday",
      "timeOfDay": "morning",
      "previousNoShows": 2
    }
  }'