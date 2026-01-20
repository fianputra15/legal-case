/**
 * OpenAPI Documentation Route Handler
 * 
 * Serves OpenAPI documentation with Redoc at /api/docs
 */

import {  NextResponse } from 'next/server';

// Generate the Redoc HTML page
function generateRedocHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legal Case Management API - Documentation</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="redoc-container"></div>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    // Initialize Redoc
    Redoc.init('/api/docs/spec', {
      scrollYOffset: 50,
      hideDownloadButton: false,
      disableSearch: false,
      expandDefaultServerVariables: true,
      expandResponses: "200,201",
      jsonSampleExpandLevel: 2,
      hideSchemaTitles: false,
      simpleOneOfTypeLabel: false,
      payloadSampleIdx: 0,
      theme: {
        colors: {
          primary: {
            main: '#1f2937'
          },
          success: {
            main: '#10b981'
          },
          warning: {
            main: '#f59e0b'  
          },
          error: {
            main: '#ef4444'
          }
        },
        typography: {
          fontSize: '14px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          headings: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600'
          },
          code: {
            fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
          }
        },
        sidebar: {
          width: '300px',
          backgroundColor: '#fafafa'
        },
        rightPanel: {
          backgroundColor: '#1f2937',
          width: '40%'
        }
      }
    }, document.getElementById('redoc-container'));
  </script>
</body>
</html>
  `.trim();
}

/**
 * GET /api/docs - Serve Redoc UI
 */
export async function GET() {
  try {
    const html = generateRedocHTML();
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Redoc error:', error);
    return new NextResponse('Unable to load API documentation', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}