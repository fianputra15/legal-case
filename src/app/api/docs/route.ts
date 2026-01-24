/**
 * OpenAPI Documentation Route Handler
 * 
 * Serves interactive API documentation with Redoc at /api/docs
 * The documentation is styled to match the Legal Case Management application theme
 */

import { swaggerSpec } from '@/server/config/swagger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate Redoc HTML page with custom styling and configuration
 * @param spec - OpenAPI specification object (not used directly, served via /api/docs/spec)
 * @returns HTML string for Redoc documentation page
 */
function generateRedocHTML(spec: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legal Case Management API - Documentation</title>
  <meta name="description" content="Interactive API documentation for the Legal Case Management System">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fafafa;
    }
    
    /* Loading spinner */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 18px;
      color: #6b7280;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #f97316;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Custom header */
    .docs-header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 20px 0;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .docs-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .docs-header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="docs-header">
    <h1>Legal Case Management API</h1>
    <p>Interactive API Documentation & Testing Interface</p>
  </div>
  
  <div class="loading" id="loading">
    <div class="spinner"></div>
    Loading API Documentation...
  </div>
  
  <div id="redoc-container" style="display: none;"></div>
  
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    // Initialize Redoc with enhanced configuration and proper error handling
    function initializeRedoc() {
      // Check if Redoc is loaded
      if (typeof Redoc === 'undefined') {
        console.error('Redoc library failed to load');
        document.getElementById('loading').innerHTML = 
          '<div style="text-align: center; color: #ef4444;">' +
          '<h2>Documentation Library Not Available</h2>' +
          '<p>The documentation library failed to load. Please check your internet connection and try again.</p>' +
          '<button onclick="window.location.reload()" style="background: #f97316; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">Retry</button>' +
          '</div>';
        return;
      }

      try {
        const redocPromise = Redoc.init('/api/docs/spec', {
          scrollYOffset: 80, // Account for header
          hideDownloadButton: false,
          disableSearch: false,
          expandDefaultServerVariables: true,
          expandResponses: "200,201,400,401,403,404,500",
          jsonSampleExpandLevel: 3,
          hideSchemaTitles: false,
          simpleOneOfTypeLabel: false,
          payloadSampleIdx: 0,
          showExtensions: ['x-code-samples'],
          sortPropsAlphabetically: true,
          menuToggle: true,
          nativeScrollbars: false,
          theme: {
            colors: {
              primary: {
                main: '#f97316', // Brand orange
                light: '#fb923c',
                dark: '#ea580c'
              },
              success: {
                main: '#10b981',
                light: '#34d399',
                dark: '#059669'
              },
              warning: {
                main: '#f59e0b',
                light: '#fbbf24',
                dark: '#d97706'
              },
              error: {
                main: '#ef4444',
                light: '#f87171',
                dark: '#dc2626'
              },
              text: {
                primary: '#111827',
                secondary: '#6b7280'
              }
            },
            typography: {
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              headings: {
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: '600'
              },
              code: {
                fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: '13px'
              }
            },
            sidebar: {
              width: '280px',
              backgroundColor: '#ffffff',
              textColor: '#374151',
              groupItems: {
                textTransform: 'none'
              },
              level1Items: {
                textTransform: 'none'
              }
            },
            rightPanel: {
              backgroundColor: '#1f2937',
              width: '42%',
              textColor: '#f9fafb'
            },
            codeBlock: {
              backgroundColor: '#1f2937'
            }
          }
        }, document.getElementById('redoc-container'));

        // Handle both Promise and non-Promise returns
        if (redocPromise && typeof redocPromise.then === 'function') {
          redocPromise
            .then(() => {
              // Hide loading and show documentation
              document.getElementById('loading').style.display = 'none';
              document.getElementById('redoc-container').style.display = 'block';
            })
            .catch((error) => {
              console.error('Failed to load API documentation:', error);
              document.getElementById('loading').innerHTML = 
                '<div style="text-align: center; color: #ef4444;">' +
                '<h2>Failed to Load Documentation</h2>' +
                '<p>Please check the console for more details or contact support.</p>' +
                '<button onclick="window.location.reload()" style="background: #f97316; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">Retry</button>' +
                '</div>';
            });
        } else {
          // Redoc initialized synchronously
          setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('redoc-container').style.display = 'block';
          }, 1000); // Give it a moment to render
        }
      } catch (error) {
        console.error('Error initializing Redoc:', error);
        document.getElementById('loading').innerHTML = 
          '<div style="text-align: center; color: #ef4444;">' +
          '<h2>Documentation Initialization Error</h2>' +
          '<p>There was an error setting up the documentation. Please try again.</p>' +
          '<button onclick="window.location.reload()" style="background: #f97316; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">Retry</button>' +
          '</div>';
      }
    }

    // Initialize when DOM is ready or immediately if already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeRedoc);
    } else {
      initializeRedoc();
    }
  </script>
</body>
</html>
  `.trim();
}

/**
 * GET /api/docs - Serve interactive API documentation with Redoc
 * 
 * Features:
 * - Custom branded styling matching application theme
 * - Loading state with spinner
 * - Enhanced error handling
 * - Mobile-responsive design
 * - Comprehensive Redoc configuration
 * 
 * @param request - NextRequest object
 * @returns NextResponse with HTML content or error response
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📄 Serving API docs page...');
    
    // Validate swagger spec exists
    if (!swaggerSpec) {
      throw new Error('OpenAPI specification not found');
    }
    
    console.log('✅ Swagger spec available with', Object.keys(swaggerSpec.paths || {}).length, 'paths');
    
    const html = generateRedocHTML(swaggerSpec);
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable caching during development
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });
    
  } catch (error) {
    console.error('❌ Error serving API documentation:', error);
    
    // Return a user-friendly error page
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f9fafb;
      color: #374151;
    }
    .error-container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }
    .error-icon {
      font-size: 48px;
      color: #ef4444;
      margin-bottom: 16px;
    }
    h1 {
      color: #111827;
      margin-bottom: 8px;
    }
    p {
      color: #6b7280;
      margin-bottom: 24px;
    }
    .retry-button {
      background: #f97316;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .retry-button:hover {
      background: #ea580c;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <h1>Documentation Unavailable</h1>
    <p>We're unable to load the API documentation at this time. Please try again later or contact support if the problem persists.</p>
    <a href="/api/docs" class="retry-button">Retry</a>
  </div>
</body>
</html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}