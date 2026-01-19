// Base API configuration and utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  // baseUrl: string;
  private authFailureCallbacks: Set<() => void> = new Set();

  onAuthFailure(callback: () => void) {
    this.authFailureCallbacks.add(callback);
    return () => this.authFailureCallbacks.delete(callback);
  }

  private notifyAuthFailure() {
    this.authFailureCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Auth failure callback error:', error);
      }
    });
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Include cookies for authentication
        ...options,
      });

      // Handle auth failures
      if (response.status === 401) {
        this.notifyAuthFailure();
        const errorData = await this.safeParseResponse(response);
        throw new ApiError(
          errorData?.error || 'Authentication required',
          response.status,
          response.statusText,
          errorData
        );
      }

      if (response.status === 403) {
        const errorData = await this.safeParseResponse(response);
        throw new ApiError(
          errorData?.error || 'Insufficient permissions',
          response.status,
          response.statusText,
          errorData
        );
      }

      if (!response.ok) {
        const errorData = await this.safeParseResponse(response);
        throw new ApiError(
          errorData?.error || `API request failed: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('ApiClient.request: Caught error', error);
      if (error instanceof ApiError) {
        throw error;
      }
      // Network or other errors
      throw new ApiError(
        'Network error or server unavailable',
        0,
        'Network Error'
      );
    }
  }

  private async safeParseResponse(response: Response): Promise<any> {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();