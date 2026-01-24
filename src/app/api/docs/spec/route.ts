/**
 * OpenAPI Specification Route Handler
 * 
 * Serves the raw OpenAPI specification JSON at /api/docs/spec
 */

import { swaggerSpec } from '@/server/config/swagger';
import {  NextResponse } from 'next/server';

/**
 * GET /api/docs/spec - Serve OpenAPI JSON specification
 */
export async function GET() {
  try {
        // Ensure we have a valid specification
    if (!swaggerSpec || !(swaggerSpec as any).info) {
      throw new Error('Invalid swagger specification');
    }
    
    if (!(swaggerSpec as any).paths || Object.keys((swaggerSpec as any).paths).length === 0) {
      console.warn('⚠️ Swagger spec has no paths defined');
    }
    
    return NextResponse.json(swaggerSpec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Disable caching during development
      }
    });
  } catch (error) {
    console.error('❌ Error serving OpenAPI spec:', error);
    return NextResponse.json(
      { 
        error: 'Unable to load API specification',
        message: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          hasSwaggerSpec: !!swaggerSpec,
          pathCount: Object.keys((swaggerSpec as any)?.paths || {}).length,
          info: (swaggerSpec as any)?.info
        }
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}