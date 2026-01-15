import { NextResponse } from 'next/server';

/**
 * Standardized API response utilities
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ResponseHandler {
  /**
   * Success response
   */
  static success<T>(data?: T, message?: string, pagination?: ApiResponse<T>['pagination']): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
      ...(pagination && { pagination }),
    };

    return NextResponse.json(response);
  }

  /**
   * Created response (201)
   */
  static created<T>(data?: T, message?: string): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      ...(data !== undefined && { data }),
      message: message || 'Resource created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * No content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Error response
   */
  static error(message: string, statusCode: number = 500): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      error: message,
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Bad request response (400)
   */
  static badRequest(message: string = 'Bad request'): NextResponse<ApiResponse> {
    return this.error(message, 400);
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401);
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 403);
  }

  /**
   * Not found response (404)
   */
  static notFound(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return this.error(message, 404);
  }

  /**
   * Conflict response (409)
   */
  static conflict(message: string): NextResponse<ApiResponse> {
    return this.error(message, 409);
  }

  /**
   * Internal server error response (500)
   */
  static internalError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
    return this.error(message, 500);
  }
}