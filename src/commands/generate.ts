import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { ApiClient } from '../utils/api-client';
import { Config } from '../utils/config';
import { ProjectContextExtractor } from '../utils/context-extractor';
import { askImmediateFeedback } from '../utils/feedback-prompt';
import { FileValidator } from '../utils/file-validator';
import { ProjectDetector } from '../utils/project-detector';

export async function generateCommand(
  filePath: string,
  options?: { output?: string; verbose?: boolean }
): Promise<void> {
  try {
    // Step 1: Load config (optional for authentication)
    const config = Config.load();

    // Step 2: Resolve file path (absolute)
    const absolutePath = path.resolve(filePath);

    // Step 3: Validate file exists
    const validation = FileValidator.validateFilePath(absolutePath);
    if (!validation.valid) {
      console.error(chalk.red('✗'), validation.error);
      process.exit(1);
    }

    // Show confirmed file path only in verbose mode
    if (options?.verbose) {
      const relativePath = path.relative(process.cwd(), absolutePath);
      console.log(chalk.green('✔'), chalk.gray('Found file:'), relativePath);
    }

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
      projectInfo = ProjectDetector.getProjectInfo(projectRoot);
      hasProjectContext = true;

      // Show detected info only in verbose mode
      if (options?.verbose) {
        const projectName = path.basename(projectRoot);
        console.log(
          chalk.green('✔'),
          chalk.gray('Project:'),
          chalk.white(projectName),
          projectInfo.framework || projectInfo.testFramework
            ? chalk.gray(
                `(${[projectInfo.framework, projectInfo.testFramework]
                  .filter(Boolean)
                  .join(' + ')})`
              )
            : ''
        );
      }
    } else {
      // Ask user for project root
      const { default: prompts } = await import('prompts');
      console.log();
      console.log(chalk.yellow('⚠ Could not auto-detect project root'));

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
        hasProjectContext =
          projectInfo.hasPackageJson || projectInfo.hasComposerJson;
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

      // Show context info only in verbose mode
      if (
        options?.verbose &&
        projectContext.file_imports &&
        projectContext.file_imports.length > 0
      ) {
        console.log(
          chalk.green('✔'),
          chalk.gray('Imports:'),
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

      const testFileName = FileValidator.getTestFileName(
        absolutePath,
        language
      );

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
      const relativeTestPath = path.relative(process.cwd(), testFilePath);
      console.log();
      console.log(
        chalk.yellow('  ⚠  File exists: ') + chalk.white(relativeTestPath)
      );

      const { default: prompts } = await import('prompts');
      const response = await prompts(
        {
          type: 'confirm',
          name: 'overwrite',
          message: '  Overwrite?',
          initial: false,
        },
        {
          onCancel: () => {
            console.log(chalk.gray('\n  Cancelled\n'));
            process.exit(0);
          },
        }
      );

      if (!response.overwrite) {
        console.log(chalk.gray('\n  Cancelled\n'));
        return;
      }
    }

    // Step 9: Call API to generate test
    console.log();
    const spinner = ora({
      text: chalk.cyan('Analyzing code...'),
      color: 'cyan',
    }).start();

    // Show warning if no context (verbose mode only)
    if (!hasProjectContext && options?.verbose) {
      spinner.warn(
        chalk.yellow('Limited context - results may be less accurate.')
      );
      spinner.start();
    }

    const startTime = Date.now();

    const apiClient = new ApiClient(config?.apiKey);

    try {
      const response = await apiClient.generateTest({
        file_content: fileContent,
        file_name: path.basename(absolutePath),
        language,
        project_context: projectContext,
      });

      spinner.text = chalk.cyan('Generating tests...');

      const testCode = response.test_code || '';
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);

      // Count tests and assertions (simple heuristic)
      const testCount = (testCode.match(/\b(test|it)\(/g) || []).length;
      const assertCount = (testCode.match(/\b(expect|assert|should)\(/g) || [])
        .length;

      spinner.text = chalk.cyan('Writing file...');

      // Step 8: Write file
      FileValidator.writeFile(testFilePath, testCode);

      spinner.succeed(chalk.green('Test generated'));

      // Show compact but informative output
      const relativeTestPath = path.relative(process.cwd(), testFilePath);
      console.log();
      console.log(chalk.bold('  ' + relativeTestPath));

      // Show metrics in a clean line (minimal mode) or detailed (verbose)
      if (options?.verbose) {
        if (testCount > 0) {
          console.log(
            chalk.gray(
              `  ${testCount} tests • ${assertCount} assertions • ${generationTime}s`
            )
          );
        } else {
          console.log(
            chalk.gray(
              `  ${(testCode.length / 1024).toFixed(1)}KB • ${generationTime}s`
            )
          );
        }
      } else {
        // Ultra minimal - just show time
        if (testCount > 0) {
          console.log(chalk.gray(`  ${testCount} tests • ${generationTime}s`));
        }
      }

      // Show quota info (subtle unless low)
      if (
        response.remaining_requests !== undefined &&
        response.remaining_requests >= 0
      ) {
        if (response.remaining_requests < 3) {
          console.log();
          const bars = 20;
          const filled = Math.ceil((response.remaining_requests / 20) * bars);
          const empty = bars - filled;
          const progressBar =
            chalk.yellow('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
          console.log(
            chalk.yellow(
              '  ⚠  ' + progressBar + ` ${response.remaining_requests}/20`
            )
          );
          console.log(chalk.gray('     Resets next month'));
        } else if (options?.verbose) {
          console.log(
            chalk.gray(`  ${response.remaining_requests} requests remaining`)
          );
        }
      }

      // Ask for immediate feedback if generation_id is available
      if (response.generation_id && config?.apiKey) {
        await askImmediateFeedback(response.generation_id, config.apiKey);
      }

      // Step 10: Show guidance (verbose, first run, random 10%, or full quota)
      const isFullQuota =
        response.remaining_requests !== undefined &&
        response.remaining_requests >= 10;
      const randomChance = Math.random() < 0.1; // 10% chance
      const showTips =
        options?.verbose || !config?.hasSeenTips || isFullQuota || randomChance;

      if (showTips) {
        console.log();
        if (language === 'php') {
          console.log(
            chalk.gray('  Run: ') + chalk.cyan('./vendor/bin/phpunit')
          );
          if (projectInfo?.testFramework === 'pest') {
            console.log(
              chalk.gray('   or: ') + chalk.cyan('./vendor/bin/pest')
            );
          }
        } else {
          console.log(chalk.gray('  Run: ') + chalk.cyan('npm test'));
          if (projectInfo?.testFramework === 'jest' && options?.verbose) {
            console.log(
              chalk.gray('   or: ') +
                chalk.cyan(`npx jest ${path.basename(testFilePath)}`)
            );
          }
        }

        if (!options?.verbose && !config?.hasSeenTips) {
          console.log(chalk.gray('        --verbose for detailed output'));
        }

        // Mark tips as seen
        if (config && !config.hasSeenTips) {
          Config.save({ ...config, hasSeenTips: true });
        }
      }
    } catch (error: any) {
      spinner.fail(chalk.red('Generation failed'));

      // Handle authentication errors (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log();
        console.log(chalk.red('  ✗  Authentication failed'));
        console.log();
        console.log(
          chalk.gray('     Your session may have expired or API key is invalid')
        );
        console.log();
        console.log(chalk.cyan('     → Run: ') + chalk.white('testgen login'));
        console.log();
      }
      // Handle rate limit error
      else if (error.response?.status === 429) {
        const data = error.response.data;
        console.log();
        console.log(chalk.red('  ⚠  Monthly limit reached'));
        console.log();
        console.log(
          chalk.gray('     Used: ') + chalk.white(`${data.used}/${data.limit}`)
        );
        if (data.reset_date) {
          console.log(
            chalk.gray('     Resets: ') +
              chalk.white(new Date(data.reset_date).toLocaleDateString())
          );
        }
        console.log();
        console.log(
          chalk.cyan(
            '     → Join waitlist for premium: https://testorix.dev/#beta'
          )
        );
        console.log();
      } else if (error.response?.data?.error) {
        console.log();
        console.log(chalk.red('  ✗  ') + error.response.data.error);

        // Check if it's a server-side AI connection error
        if (
          error.response.data.error.includes('localhost:11434') ||
          error.response.data.error.includes('Could not connect to server')
        ) {
          console.log();
          console.log(chalk.gray('     Server is temporarily unavailable'));
          console.log(chalk.gray('     Try again later or contact support'));
        }
      } else {
        console.log();
        console.log(chalk.red('  ✗  ') + error.message);

        // Check for connection errors
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('connect')
        ) {
          console.log();
          console.log(chalk.gray('     Check your internet connection'));
        }
      }

      process.exit(1);
    }
  } catch (error: any) {
    console.error(chalk.red('✗'), error.message);
    process.exit(1);
  }
}
