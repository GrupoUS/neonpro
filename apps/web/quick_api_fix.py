#!/usr/bin/env python3
"""Quick API files replacement"""

import os

base_dir = r"E:\neonpro\apps\web"

api_template = """import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      message: "Placeholder endpoint",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "Placeholder endpoint",
      data: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
"""

api_files = [
    "app/api/analytics/advanced/route.ts",
    "app/api/analytics/alerts/route.ts", 
    "app/api/analytics/alerts/[id]/route.ts",
    "app/api/analytics/alerts/[id]/acknowledge/route.ts",
    "app/api/analytics/dashboard/route.ts",
    "app/api/analytics/dashboards/route.ts",
    "app/api/analytics/drill-down/route.ts",
    "app/api/analytics/events/route.ts",
    "app/api/analytics/export/route.ts",
]

for file_path in api_files:
    full_path = os.path.join(base_dir, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    try:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(api_template)
        print(f"Replaced: {file_path}")
    except Exception as e:
        print(f"Error: {file_path} - {e}")

print("API files replacement complete!")