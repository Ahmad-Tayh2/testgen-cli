import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const SUPPORTED_EXTENSIONS = ['.php', '.js', '.ts', '.jsx', '.tsx'];

export class FileValidator {
  /**
   * Validate file path and check if file exists
   */
  static validateFilePath(filePath: string): {
    valid: boolean;
    error?: string;
  } {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        error: `File not found: ${filePath}`,
      };
    }

    // Check if it's a file (not directory)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return {
        valid: false,
        error: `Path is not a file: ${filePath}`,
      };
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      console.warn(
        chalk.yellow('⚠ Warning:'),
        `File extension ${ext} may not be fully supported.`
      );
      console.warn(
        chalk.yellow('  Supported extensions:'),
        SUPPORTED_EXTENSIONS.join(', ')
      );
    }

    // Check file size
    if (stats.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large (${this.formatBytes(
          stats.size
        )}). Maximum size is ${this.formatBytes(MAX_FILE_SIZE)}.`,
      };
    }

    // Warn for large files
    if (stats.size > 500 * 1024) {
      console.warn(
        chalk.yellow('⚠ Warning:'),
        `Large file detected (${this.formatBytes(
          stats.size
        )}). Generation may take longer.`
      );
    }

    return { valid: true };
  }

  /**
   * Detect language from file extension
   */
  static detectLanguage(filePath: string): 'php' | 'js' | 'ts' | null {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.php':
        return 'php';
      case '.ts':
      case '.tsx':
        return 'ts';
      case '.js':
      case '.jsx':
        return 'js';
      default:
        return null;
    }
  }

  /**
   * Get test file name based on source file
   */
  static getTestFileName(filePath: string, language: string): string {
    const parsed = path.parse(filePath);
    const baseName = parsed.name;

    if (language === 'php') {
      return `${baseName}Test${parsed.ext}`;
    } else {
      return `${baseName}.test${parsed.ext}`;
    }
  }

  /**
   * Get test file path
   */
  static getTestFilePath(filePath: string, language: string): string {
    const parsed = path.parse(filePath);
    const testFileName = this.getTestFileName(filePath, language);

    if (language === 'php') {
      // For PHP, put in tests/ directory at project root
      return path.join('tests', testFileName);
    } else {
      // For JS/TS, put in same directory
      return path.join(parsed.dir, testFileName);
    }
  }

  /**
   * Check if test file already exists
   */
  static testFileExists(testPath: string): boolean {
    return fs.existsSync(testPath);
  }

  /**
   * Format bytes to human-readable format
   */
  private static formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Read file content safely
   */
  static readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Write file content safely
   */
  static writeFile(filePath: string, content: string): void {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }
}
