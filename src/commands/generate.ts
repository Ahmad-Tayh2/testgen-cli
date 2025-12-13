import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { ApiClient } from '../utils/api-client';
import { Config } from '../utils/config';
import { FileValidator } from '../utils/file-validator';
import { ProjectDetector } from '../utils/project-detector';
import { ProjectContextExtractor } from '../utils/context-extractor';

export async function generateCommand(
  filePath: string,
  options?: { output?: string }
): Promise<void> {
  try {
    // Step 1: Validate authentication
    const config = Config.load();
    if (!config?.apiKey) {
      console.log(chalk.yellow('\n⚠ You need to login first\n'));
      console.log(chalk.gray('Run:'), chalk.cyan('testgen login'));
      console.log(
        chalk.gray('Or register at:'),
        chalk.cyan.underline('https://testorix.dev/register')
      );
      console.log();
      process.exit(1);
    }

    // Step 2: Resolve file path (absolute)
    const absolutePath = path.resolve(filePath);

    // Step 3: Validate file exists
    const validation = FileValidator.validateFilePath(absolutePath);
    if (!validation.valid) {
      console.error(chalk.red('✗'), validation.error);
      process.exit(1);
    }

    // Show confirmed file path
    console.log(chalk.green('✔'), chalk.gray('Found file:'), absolutePath);

    // Step 4: Detect language
    const language = FileValidator.detectLanguage(absolutePath);
    if (!language) {
      console.error(chalk.red('✗ Could not detect language'));
      process.exit(1);
    }

    // Step 5: Read file content
    let fileContent: string;
    try {
      fileContent = FileValidator.readFile(absolutePath);
    } catch (error: any) {
      console.error(chalk.red('✗'), error.message);
      process.exit(1);
    }

    // Step 6: Detect project root
    let projectRoot = ProjectDetector.detectProjectRoot(absolutePath);
    let projectInfo: any = null;
    let hasProjectContext = false;

    if (projectRoot) {
      console.log(
        chalk.green('✔'),
        chalk.gray('Project root:'),
        projectRoot
      );
      projectInfo = ProjectDetector.getProjectInfo(projectRoot);
      hasProjectContext = true;

      // Show detected info
      if (projectInfo.framework) {
        console.log(
          chalk.green('✔'),
          chalk.gray('Framework:'),
          projectInfo.framework
        );
      }
      if (projectInfo.testFramework) {
        console.log(
          chalk.green('✔'),
          chalk.gray('Test framework:'),
          projectInfo.testFramework
        );
      }
    } else {
      // Ask user for project root
      const { default: prompts } = await import('prompts');
      console.log();
      console.log(
        chalk.yellow('⚠ Could not auto-detect project root')
      );

      const response = await prompts(
        {
          type: 'text',
          name: 'projectRoot',
          message: 'Enter project root (or press Enter to skip):',
          initial: path.dirname(absolutePath),
        },
        {
          onCancel: () => {
            projectRoot = path.dirname(absolutePath);
            return projectRoot;
          },
        }
      );

      if (response.projectRoot) {
        projectRoot = path.resolve(response.projectRoot);
        projectInfo = ProjectDetector.getProjectInfo(projectRoot);
        hasProjectContext = projectInfo.hasPackageJson || projectInfo.hasComposerJson;
      } else {
        projectRoot = path.dirname(absolutePath);
      }
    }

    // Step 7: Build project context
    let projectContext;
    if (hasProjectContext && projectRoot && projectInfo) {
      projectContext = ProjectContextExtractor.buildContext(
        fileContent,
        language,
        projectRoot,
        projectInfo
      );

      // Show context info
      if (projectContext.file_imports && projectContext.file_imports.length > 0) {
        console.log(
          chalk.green('✔'),
          chalk.gray('Imports detected:'),
          projectContext.file_imports.slice(0, 5).join(', ') +
            (projectContext.file_imports.length > 5 ? '...' : '')
        );
      }
    }

    // Step 8: Determine output path
    let testFilePath: string;
    
    if (options?.output) {
      // Use custom output path if provided
      testFilePath = path.resolve(options.output);
    } else if (projectRoot) {
      // Use smart test directory detection (creates proper structure)
      const testDir = ProjectContextExtractor.getTestDirectory(
        absolutePath,
        language,
        projectRoot,
        projectInfo?.testDirectory
      );
      
      // Mirror the source file structure in tests
      const relativePath = path.relative(projectRoot, absolutePath);
      const relativeDir = path.dirname(relativePath);
      
      // Remove 'src/' prefix if present to avoid tests/src/...
      const cleanRelativeDir = relativeDir.replace(/^src\/?/, '');
      
      const testFileName = FileValidator.getTestFileName(absolutePath, language);
      
      // Build final test path
      if (cleanRelativeDir && cleanRelativeDir !== '.') {
        testFilePath = path.join(testDir, cleanRelativeDir, testFileName);
      } else {
        testFilePath = path.join(testDir, testFileName);
      }
    } else {
      // Fallback: put test next to source file
      testFilePath = FileValidator.getTestFilePath(absolutePath, language);
    }

    const testFileExists = FileValidator.testFileExists(testFilePath);

    // Check if file exists
    if (testFileExists) {
      console.warn(chalk.yellow('⚠ Test file already exists:'), testFilePath);

      const { default: prompts } = await import('prompts');
      const response = await prompts(
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Overwrite existing file?',
          initial: false,
        },
        {
          onCancel: () => {
            console.log(chalk.gray('Cancelled'));
            process.exit(0);
          },
        }
      );

      if (!response.overwrite) {
        console.log(chalk.gray('Cancelled'));
        return;
      }
    }

    // Step 9: Call API to generate test
    console.log();
    const spinner = ora({
      text: hasProjectContext
        ? `Generating ${language.toUpperCase()} tests with project context...`
        : `Generating ${language.toUpperCase()} tests...`,
      color: 'cyan',
    }).start();

    // Show warning if no context
    if (!hasProjectContext) {
      spinner.warn(
        chalk.yellow(
          'Limited context - results may be less accurate. Install in your project for best results.'
        )
      );
      spinner.start();
    }

    const apiClient = new ApiClient(config.apiKey);

    try {
      const response = await apiClient.generateTest({
        file_content: fileContent,
        file_name: path.basename(absolutePath),
        language,
        project_context: projectContext,
      });

      spinner.succeed(chalk.green('Test generated successfully!'));

      // Check remaining requests
      if (
        response.remaining_requests !== undefined &&
        response.remaining_requests >= 0
      ) {
        if (response.remaining_requests <= 5) {
          console.log(
            chalk.yellow(
              `⚠ ${response.remaining_requests} requests remaining this month`
            )
          );
        } else {
          console.log(
            chalk.gray(`  ${response.remaining_requests} requests remaining`)
          );
        }
      }

      const testCode = response.test_code || '';

      // Step 8: Write file
      // Show diff if file exists
      if (testFileExists) {
        console.log(chalk.yellow('\nChanges will be applied'));
      }

      // Write file
      FileValidator.writeFile(testFilePath, testCode);
      console.log(chalk.green('✔ Test created →'), chalk.bold(testFilePath));

      // Step 10: Show guidance
      console.log();
      console.log(chalk.cyan('📁 Test Location:'));
      if (language === 'php') {
        console.log(
          chalk.gray('   PHP projects typically use:'),
          chalk.white('tests/')
        );
      } else {
        console.log(
          chalk.gray('   JS/TS projects typically use:'),
          chalk.white('tests/'),
          chalk.gray('or'),
          chalk.white('__tests__/')
        );
      }

      console.log();
      console.log(chalk.cyan('🚀 Run Your Tests:'));
      if (language === 'php') {
        console.log(chalk.white('   ./vendor/bin/phpunit'));
        if (projectInfo?.testFramework === 'pest') {
          console.log(chalk.gray('   or'));
          console.log(chalk.white('   ./vendor/bin/pest'));
        }
      } else {
        if (projectInfo?.testFramework === 'jest') {
          console.log(chalk.white('   npm test'));
          console.log(chalk.gray('   or'));
          console.log(chalk.white(`   npx jest ${path.basename(testFilePath)}`));
        } else if (projectInfo?.testFramework === 'vitest') {
          console.log(chalk.white('   npm test'));
          console.log(chalk.gray('   or'));
          console.log(chalk.white('   npx vitest'));
        } else {
          console.log(chalk.white('   npm test'));
        }
      }
      console.log();
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to generate test'));

      // Handle rate limit error
      if (error.response?.status === 429) {
        const data = error.response.data;
        console.log();
        console.log(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.red.bold('  Monthly Limit Reached'));
        console.log(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log();
        console.log(
          chalk.yellow(data.message || 'You have reached your monthly limit')
        );
        console.log();
        console.log(
          chalk.gray('  Limit:'),
          chalk.white(`${data.used}/${data.limit} requests used`)
        );
        if (data.reset_date) {
          console.log(
            chalk.gray('  Resets:'),
            chalk.white(new Date(data.reset_date).toLocaleDateString())
          );
        }
        console.log();
        console.log(
          chalk.cyan('  💎 Upgrade to premium for unlimited access!')
        );
        console.log();
      } else if (error.response?.data?.error) {
        console.error(chalk.red('Error:'), error.response.data.error);

        // Check if it's a server-side AI connection error
        if (
          error.response.data.error.includes('localhost:11434') ||
          error.response.data.error.includes('Could not connect to server')
        ) {
          console.log();
          console.log(
            chalk.yellow('⚠ This appears to be a server configuration issue.')
          );
          console.log(
            chalk.gray(
              'The API backend is currently unavailable or misconfigured.'
            )
          );
          console.log(chalk.gray('Please try again later or contact support.'));
        }
      } else {
        console.error(chalk.red('Error:'), error.message);

        // Check for connection errors
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('connect')
        ) {
          console.log();
          console.log(chalk.yellow('⚠ Cannot connect to the API server.'));
          console.log(
            chalk.gray('Please check your internet connection and try again.')
          );
        }
      }

      process.exit(1);
    }
  } catch (error: any) {
    console.error(chalk.red('✗'), error.message);
    process.exit(1);
  }
}
