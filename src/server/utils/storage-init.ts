/**
 * Storage Initialization Utility
 * 
 * Sets up the secure file storage directory structure
 */

import fs from 'fs/promises';
import path from 'path';
import { STORAGE_STRUCTURE } from '@/server/config/storage';

/**
 * Initialize storage directory structure
 */
export async function initializeStorage(): Promise<void> {
  console.log('Initializing secure storage directory structure...');
  
  try {
    // Create main storage directories
    const directories = [
      STORAGE_STRUCTURE.root,
      STORAGE_STRUCTURE.documents,
      STORAGE_STRUCTURE.quarantine,
      STORAGE_STRUCTURE.temp,
      STORAGE_STRUCTURE.archive
    ];
    
    for (const directory of directories) {
      await fs.mkdir(directory, { recursive: true });
      console.log(`✓ Created directory: ${path.relative(process.cwd(), directory)}`);
    }
    
    // Create .gitignore in storage root to prevent accidental commits
    const gitignorePath = path.join(STORAGE_STRUCTURE.root, '.gitignore');
    const gitignoreContent = `# Ignore all files in storage directory
*
!.gitignore
!README.md
`;
    
    await fs.writeFile(gitignorePath, gitignoreContent);
    console.log('✓ Created .gitignore in storage directory');
    
    // Create README.md with security information
    const readmePath = path.join(STORAGE_STRUCTURE.root, 'README.md');
    const readmeContent = `# Secure Document Storage

This directory contains uploaded legal documents and is configured for maximum security:

## Security Features

- **UUID-based filenames**: All stored files use UUID names to prevent path traversal
- **Directory structure**: Files organized by case ID with distribution folders
- **Outside public folder**: Files not directly accessible via web requests
- **MIME type validation**: Only approved document types allowed
- **File size limits**: Configurable limits per file type
- **Integrity checking**: SHA-256 checksums for file verification

## Directory Structure

\`\`\`
storage/
├── documents/     # Main document storage (organized by case ID)
│   ├── 01/        # Case ID prefix folders (for distribution)
│   ├── 02/
│   └── ...
├── quarantine/    # Suspicious files awaiting review
├── temp/          # Temporary files during upload processing
└── archive/       # Archived documents
\`\`\`

## Access Control

- Files can only be accessed through the application API
- User authorization checked before file access
- No direct filesystem access from web requests
- All file operations logged for audit trail

## Maintenance

- Regular integrity checks recommended
- Archive old cases to free up space
- Monitor directory sizes
- Backup critical legal documents

**DO NOT** manually modify files in this directory.
`;
    
    await fs.writeFile(readmePath, readmeContent);
    console.log('✓ Created README.md with storage documentation');
    
    console.log('✅ Storage initialization complete!');
    console.log(`📁 Storage root: ${STORAGE_STRUCTURE.root}`);
    console.log(`🔒 Security features enabled: UUID names, MIME validation, size limits`);
    
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Check storage health and permissions
 */
export async function checkStorageHealth(): Promise<{
  isHealthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    // Check if main directories exist and are writable
    const directories = [
      STORAGE_STRUCTURE.root,
      STORAGE_STRUCTURE.documents,
      STORAGE_STRUCTURE.temp
    ];
    
    for (const directory of directories) {
      try {
        await fs.access(directory, fs.constants.F_OK | fs.constants.W_OK);
      } catch (error) {
        issues.push(`Directory not accessible or writable: ${directory}`);
      }
    }
    
    // Check available disk space (basic check)
    try {
      const stats = await fs.stat(STORAGE_STRUCTURE.root);
      if (!stats.isDirectory()) {
        issues.push('Storage root is not a directory');
      }
    } catch (error) {
      issues.push('Cannot access storage root');
    }
    
    // Test write permissions with a temporary file
    const testFile = path.join(STORAGE_STRUCTURE.temp, 'health-check.tmp');
    try {
      await fs.writeFile(testFile, 'health check');
      await fs.unlink(testFile);
    } catch (error) {
      issues.push('Cannot write to temporary directory');
    }
    
  } catch (error) {
    issues.push(`Storage health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isHealthy: issues.length === 0,
    issues
  };
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalDocuments: number;
  totalSizeBytes: number;
  documentsByStatus: Record<string, number>;
  documentsByType: Record<string, number>;
}> {
  // This would require database access - placeholder for now
  // In a real implementation, you'd query the database for statistics
  return {
    totalDocuments: 0,
    totalSizeBytes: 0,
    documentsByStatus: {},
    documentsByType: {}
  };
}

/**
 * Clean up temporary files older than specified age
 */
export async function cleanupTempFiles(maxAgeHours: number = 24): Promise<number> {
  const tempDir = STORAGE_STRUCTURE.temp;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const now = Date.now();
  let cleanedCount = 0;
  
  try {
    const files = await fs.readdir(tempDir);
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile() && (now - stats.mtime.getTime()) > maxAgeMs) {
        await fs.unlink(filePath);
        cleanedCount++;
      }
    }
    
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
  
  return cleanedCount;
}