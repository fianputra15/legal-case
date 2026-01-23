import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client for server-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // Server-side, no session persistence needed
    },
  }
);

// Storage bucket configuration
export const STORAGE_BUCKET = 'legal-case';

// Supabase storage utilities
export class SupabaseStorage {
  /**
   * Generate secure file path for Supabase storage
   */
  static generateFilePath(caseId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `cases/${caseId}/documents/${timestamp}_${randomSuffix}_${sanitizedName}`;
  }

  /**
   * Upload file to Supabase storage
   */
  static async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    options: {
      contentType: string;
      upsert?: boolean;
    }
  ): Promise<{ path: string; fullUrl: string }> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: options.contentType,
        upsert: options.upsert || false,
      });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      fullUrl: urlData.publicUrl,
    };
  }

  /**
   * Download file from Supabase storage
   */
  static async downloadFile(filePath: string): Promise<{ buffer: Buffer; contentType: string }> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) {
      throw new Error(`File download failed: ${error.message}`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const contentType = data.type || 'application/octet-stream';

    return { buffer, contentType };
  }

  /**
   * Delete file from Supabase storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  static async getFileInfo(filePath: string): Promise<{
    size: number;
    contentType: string;
    lastModified: Date;
  }> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(path.dirname(filePath), {
        search: path.basename(filePath),
      });

    if (error || !data?.length) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileInfo = data[0];
    return {
      size: fileInfo.metadata?.size || 0,
      contentType: fileInfo.metadata?.mimetype || 'application/octet-stream',
      lastModified: new Date(fileInfo.updated_at || fileInfo.created_at),
    };
  }

  /**
   * Generate signed URL for private access
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}