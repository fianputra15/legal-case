/**
 * OpenAPI Specification Route Handler
 * 
 * Serves the raw OpenAPI specification JSON at /api/docs/spec
 */

import { swaggerSpec } from '@/server/config/swagger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/docs/spec - Serve OpenAPI JSON specification
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📡 Serving swagger spec...');
    console.log('📊 Swagger spec paths:', Object.keys(swaggerSpec.paths || {}));
    console.log('📋 Swagger spec info:', swaggerSpec.info);
    
    // Ensure we have a valid specification
    if (!swaggerSpec || !swaggerSpec.info) {
      throw new Error('Invalid swagger specification');
    }
    
    if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
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
          pathCount: Object.keys(swaggerSpec?.paths || {}).length,
          info: swaggerSpec?.info
        }
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}