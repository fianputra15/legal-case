/**
 * OpenAPI Specification Endpoint
 * 
 * Serves the raw OpenAPI spec JSON at /api/docs/spec
 */

import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/server/config/swagger';

/**
 * GET /api/docs/spec - Return OpenAPI specification
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(swaggerSpec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('OpenAPI spec error:', error);
    return NextResponse.json(
      { 
        error: 'Unable to generate API specification',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}