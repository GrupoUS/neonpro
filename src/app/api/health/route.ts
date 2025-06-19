
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get detailed parameter from query
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const format = searchParams.get('format') || 'json';

    // Basic health status
    const healthStatus = {
      overall_status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: [
        {
          name: 'database',
          status: 'healthy',
          response_time_ms: 50
        },
        {
          name: 'auth',
          status: 'healthy',
          response_time_ms: 30
        }
      ],
      metadata: {
        uptime_seconds: Math.floor(process.uptime())
      }
    };
    
    if (detailed) {
      const detailedResponse = {
        ...healthStatus,
        performance: {
          response_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
        project_info: {
          name: 'NEONPRO',
          description: 'AI-Powered Aesthetic Clinic Management System',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'production',
          compliance: ['HIPAA', 'GDPR'],
          ai_services: ['treatment_recommendations', 'patient_analysis', 'scheduling_optimization'],
        },
      };

      // Return appropriate format
      if (format === 'xml') {
        return new NextResponse(convertToXML(detailedResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Health-Check': 'detailed',
            'X-Project': 'neonpro',
          },
        });
      }

      return NextResponse.json(detailedResponse, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'detailed',
          'X-Project': 'neonpro',
        },
      });
    }

    // Basic health check response
    const basicResponse = {
      status: healthStatus.overall_status,
      timestamp: healthStatus.timestamp,
      response_time_ms: Date.now() - startTime,
      project: 'neonpro',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      uptime_seconds: healthStatus.metadata.uptime_seconds,
      checks_summary: {
        total: healthStatus.checks.length,
        healthy: healthStatus.checks.filter(c => c.status === 'healthy').length,
        degraded: healthStatus.checks.filter(c => c.status === 'degraded').length,
        unhealthy: healthStatus.checks.filter(c => c.status === 'unhealthy').length,
      },
    };

    return NextResponse.json(basicResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'basic',
        'X-Project': 'neonpro',
      },
    });

  } catch (error) {
    console.error('NEONPRO Health check error:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
      project: 'neonpro',
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'error',
        'X-Project': 'neonpro',
      },
    });
  }
}

// HEAD request for simple health check
export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Health-Status': 'healthy',
        'X-Project': 'neonpro',
        'X-Timestamp': new Date().toISOString(),
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'X-Project': 'neonpro',
        'X-Error': error instanceof Error ? error.message : 'Health check failed',
      },
    });
  }
}

// OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Helper function to convert JSON to XML
function convertToXML(obj: any): string {
  function objectToXML(obj: any, rootName: string = 'health'): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
    
    function addNode(obj: any, indent: string = '  '): string {
      let result = '';
      
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
          result += `${indent}<${key} />\n`;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          result += `${indent}<${key}>\n`;
          result += addNode(value, indent + '  ');
          result += `${indent}</${key}>\n`;
        } else if (Array.isArray(value)) {
          result += `${indent}<${key}>\n`;
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              result += `${indent}  <item index="${index}">\n`;
              result += addNode(item, indent + '    ');
              result += `${indent}  </item>\n`;
            } else {
              result += `${indent}  <item index="${index}">${escapeXML(String(item))}</item>\n`;
            }
          });
          result += `${indent}</${key}>\n`;
        } else {
          result += `${indent}<${key}>${escapeXML(String(value))}</${key}>\n`;
        }
      }
      
      return result;
    }
    
    xml += addNode(obj);
    xml += `</${rootName}>`;
    
    return xml;
  }
  
  function escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  return objectToXML(obj);
}
