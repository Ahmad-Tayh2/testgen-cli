import * as fs from 'fs';
import * as path from 'path';

export interface ProjectInfo {
  projectRoot: string;
  hasPackageJson: boolean;
  hasComposerJson: boolean;
  framework?: string;
  testFramework?: string;
  dependencies?: string[];
  devDependencies?: string[];
  testDirectory?: string;
}

export class ProjectDetector {
  /**
   * Detect project root by searching upward for package.json or composer.json
   */
  static detectProjectRoot(startPath: string): string | null {
    let currentDir = this.isDirectory(startPath)
      ? startPath
      : path.dirname(startPath);

    // Search upward (max 10 levels to avoid infinite loops)
    for (let i = 0; i < 10; i++) {
      // Check for package.json or composer.json
      if (
        fs.existsSync(path.join(currentDir, 'package.json')) ||
        fs.existsSync(path.join(currentDir, 'composer.json'))
      ) {
        return currentDir;
      }

      // Check for common project folders
      const hasProjectStructure =
        fs.existsSync(path.join(currentDir, 'src')) ||
        fs.existsSync(path.join(currentDir, 'app')) ||
        fs.existsSync(path.join(currentDir, 'lib'));

      if (hasProjectStructure) {
        return currentDir;
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);

      // Stop if we've reached the root
      if (parentDir === currentDir) {
        break;
      }

      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Get detailed project information
   */
  static getProjectInfo(projectRoot: string): ProjectInfo {
    const info: ProjectInfo = {
      projectRoot,
      hasPackageJson: false,
      hasComposerJson: false,
    };

    // Check for package.json (JS/TS project)
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      info.hasPackageJson = true;
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8')
        );

        // Extract dependencies
        info.dependencies = packageJson.dependencies
          ? Object.keys(packageJson.dependencies)
          : [];
        info.devDependencies = packageJson.devDependencies
          ? Object.keys(packageJson.devDependencies)
          : [];

        // Detect framework
        info.framework = this.detectJsFramework(
          info.dependencies,
          info.devDependencies
        );

        // Detect test framework
        info.testFramework = this.detectTestFramework(
          info.dependencies,
          info.devDependencies
        );

        // Detect test directory from scripts
        info.testDirectory = this.detectTestDirectory(packageJson, projectRoot);
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Check for composer.json (PHP project)
    const composerJsonPath = path.join(projectRoot, 'composer.json');
    if (fs.existsSync(composerJsonPath)) {
      info.hasComposerJson = true;
      try {
        const composerJson = JSON.parse(
          fs.readFileSync(composerJsonPath, 'utf-8')
        );

        // Extract dependencies
        info.dependencies = composerJson.require
          ? Object.keys(composerJson.require)
          : [];
        info.devDependencies = composerJson['require-dev']
          ? Object.keys(composerJson['require-dev'])
          : [];

        // Detect framework
        info.framework = this.detectPhpFramework(
          info.dependencies,
          info.devDependencies
        );

        // Detect test framework (PHPUnit is default)
        info.testFramework = this.detectPhpTestFramework(
          info.dependencies,
          info.devDependencies
        );

        // PHP projects typically use tests/ directory
        info.testDirectory = 'tests';
      } catch (error) {
        // Ignore parse errors
      }
    }

    return info;
  }

  /**
   * Detect JavaScript/TypeScript framework
   */
  private static detectJsFramework(
    dependencies: string[] = [],
    devDependencies: string[] = []
  ): string | undefined {
    const allDeps = [...dependencies, ...devDependencies];

    if (allDeps.includes('next')) return 'next';
    if (allDeps.includes('@nestjs/core')) return 'nestjs';
    if (allDeps.includes('express')) return 'express';
    if (allDeps.includes('react')) return 'react';
    if (allDeps.includes('vue')) return 'vue';
    if (allDeps.includes('@angular/core')) return 'angular';
    if (allDeps.includes('svelte')) return 'svelte';

    return undefined;
  }

  /**
   * Detect PHP framework
   */
  private static detectPhpFramework(
    dependencies: string[] = [],
    devDependencies: string[] = []
  ): string | undefined {
    const allDeps = [...dependencies, ...devDependencies];

    if (allDeps.includes('laravel/framework')) return 'laravel';
    if (allDeps.includes('symfony/symfony')) return 'symfony';
    if (allDeps.includes('cakephp/cakephp')) return 'cakephp';
    if (allDeps.includes('slim/slim')) return 'slim';

    return undefined;
  }

  /**
   * Detect test framework for JS/TS
   */
  private static detectTestFramework(
    dependencies: string[] = [],
    devDependencies: string[] = []
  ): string | undefined {
    const allDeps = [...dependencies, ...devDependencies];

    if (allDeps.includes('jest')) return 'jest';
    if (allDeps.includes('vitest')) return 'vitest';
    if (allDeps.includes('mocha')) return 'mocha';
    if (allDeps.includes('@playwright/test')) return 'playwright';
    if (allDeps.includes('cypress')) return 'cypress';

    return undefined;
  }

  /**
   * Detect test framework for PHP
   */
  private static detectPhpTestFramework(
    dependencies: string[] = [],
    devDependencies: string[] = []
  ): string | undefined {
    const allDeps = [...dependencies, ...devDependencies];

    if (allDeps.includes('pestphp/pest')) return 'pest';
    if (allDeps.includes('phpunit/phpunit')) return 'phpunit';

    return 'phpunit'; // Default for PHP
  }

  /**
   * Detect test directory from package.json scripts or existing folders
   */
  private static detectTestDirectory(
    packageJson: any,
    projectRoot: string
  ): string | undefined {
    // Check scripts for test directory hints
    if (packageJson.scripts?.test) {
      const testScript = packageJson.scripts.test;

      if (testScript.includes('__tests__')) return '__tests__';
      if (testScript.includes('tests/')) return 'tests';
      if (testScript.includes('test/')) return 'test';
      if (testScript.includes('spec/')) return 'spec';
    }

    // Check for existing test directories
    const commonTestDirs = ['__tests__', 'tests', 'test', 'spec'];
    for (const dir of commonTestDirs) {
      if (fs.existsSync(path.join(projectRoot, dir))) {
        return dir;
      }
    }

    return undefined;
  }

  /**
   * Check if path is a directory
   */
  private static isDirectory(dirPath: string): boolean {
    try {
      return fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }
}
