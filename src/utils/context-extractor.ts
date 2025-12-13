import * as fs from 'fs';
import * as path from 'path';

export interface ProjectContext {
  framework?: string;
  test_framework?: string;
  project_root: string;
  test_directory?: string;
  dependencies?: string[];
  file_imports?: string[];
  naming_convention?: 'camelCase' | 'snake_case' | 'PascalCase';
}

export class ProjectContextExtractor {
  /**
   * Extract imports from file content
   */
  static extractImports(
    fileContent: string,
    language: string
  ): string[] | undefined {
    const imports: Set<string> = new Set();

    if (language === 'php') {
      // Match: use Namespace\Class;
      const phpImports =
        fileContent.match(/use\s+([A-Za-z0-9\\\_]+)(?:\s+as\s+\w+)?;/g) || [];
      phpImports.forEach((imp) => {
        const match = imp.match(/use\s+([A-Za-z0-9\\\_]+)/);
        if (match) {
          imports.add(match[1]);
        }
      });
    } else {
      // JavaScript/TypeScript imports
      // Match: import X from 'module' or import { X } from 'module'
      const jsImports =
        fileContent.match(
          /import\s+(?:[\w\*\s{},]*)\s+from\s+['"]([^'"]+)['"]/g
        ) || [];
      jsImports.forEach((imp) => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          const moduleName = match[1];
          // Extract package name (ignore relative imports)
          if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
            // For scoped packages like @nestjs/common, keep the full name
            // For regular packages, take the first part
            const parts = moduleName.split('/');
            if (moduleName.startsWith('@')) {
              imports.add(`${parts[0]}/${parts[1]}`);
            } else {
              imports.add(parts[0]);
            }
          }
        }
      });

      // Match: require('module')
      const requires =
        fileContent.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
      requires.forEach((req) => {
        const match = req.match(/['"]([^'"]+)['"]/);
        if (match) {
          const moduleName = match[1];
          if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
            const parts = moduleName.split('/');
            if (moduleName.startsWith('@')) {
              imports.add(`${parts[0]}/${parts[1]}`);
            } else {
              imports.add(parts[0]);
            }
          }
        }
      });
    }

    return imports.size > 0 ? Array.from(imports) : undefined;
  }

  /**
   * Detect naming convention from file content
   */
  static detectNamingConvention(
    fileContent: string,
    language: string
  ): 'camelCase' | 'snake_case' | 'PascalCase' | undefined {
    if (language === 'php') {
      // PHP typically uses camelCase for methods, PascalCase for classes
      // We'll check for snake_case which is common in some PHP projects
      const hasSnakeCase = /\bfunction\s+\w+_\w+/.test(fileContent);
      if (hasSnakeCase) return 'snake_case';
      return 'camelCase'; // Default for PHP
    } else {
      // JavaScript/TypeScript
      // Check for snake_case function/variable names
      const hasSnakeCase =
        /(?:const|let|var|function)\s+\w+_\w+/.test(fileContent);
      if (hasSnakeCase) return 'snake_case';

      // Check for PascalCase (classes/components)
      const hasPascalCase = /(?:class|function)\s+[A-Z]\w+/.test(fileContent);
      if (hasPascalCase) return 'PascalCase';

      return 'camelCase'; // Default for JS/TS
    }
  }

  /**
   * Build complete project context
   */
  static buildContext(
    fileContent: string,
    language: string,
    projectRoot: string,
    projectInfo: {
      framework?: string;
      testFramework?: string;
      dependencies?: string[];
      testDirectory?: string;
    }
  ): ProjectContext {
    const context: ProjectContext = {
      project_root: projectRoot,
    };

    // Add framework info
    if (projectInfo.framework) {
      context.framework = projectInfo.framework;
    }

    // Add test framework
    if (projectInfo.testFramework) {
      context.test_framework = projectInfo.testFramework;
    }

    // Add test directory
    if (projectInfo.testDirectory) {
      context.test_directory = projectInfo.testDirectory;
    }

    // Add dependencies (limit to relevant ones)
    if (projectInfo.dependencies && projectInfo.dependencies.length > 0) {
      // Filter out common/noise packages and limit to 20
      const filtered = projectInfo.dependencies.filter(
        (dep) => !dep.startsWith('php') && !dep.startsWith('@types/')
      );
      context.dependencies = filtered.slice(0, 20);
    }

    // Extract imports from the file
    const imports = this.extractImports(fileContent, language);
    if (imports && imports.length > 0) {
      context.file_imports = imports;
    }

    // Detect naming convention
    const namingConvention = this.detectNamingConvention(fileContent, language);
    if (namingConvention) {
      context.naming_convention = namingConvention;
    }

    return context;
  }

  /**
   * Get smart test directory path
   */
  static getTestDirectory(
    filePath: string,
    language: string,
    projectRoot: string,
    detectedTestDir?: string
  ): string {
    // Use detected test directory if available
    if (detectedTestDir) {
      return path.join(projectRoot, detectedTestDir);
    }

    // Language-specific defaults
    if (language === 'php') {
      return path.join(projectRoot, 'tests');
    }

    // For JS/TS, check if file is in src/ and use __tests__ or tests/
    const relativePath = path.relative(projectRoot, path.dirname(filePath));

    if (relativePath.startsWith('src')) {
      // Check if __tests__ exists
      const testsInSrc = path.join(projectRoot, 'src', '__tests__');
      if (fs.existsSync(testsInSrc)) {
        return testsInSrc;
      }
    }

    // Default fallback
    const testsDir = path.join(projectRoot, 'tests');
    const testsDirAlt = path.join(projectRoot, '__tests__');

    if (fs.existsSync(testsDirAlt)) {
      return testsDirAlt;
    }

    return testsDir;
  }
}
