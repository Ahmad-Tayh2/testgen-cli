import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { ApiClient } from '../utils/api-client';
import { Config } from '../utils/config';
import { FileValidator } from '../utils/file-validator';

export async function generateCommand(filePath: string): Promise<void> {
  try {
    // Step 1: Validate authentication
    const config = Config.load();
    if (!config?.apiKey) {
      console.log(chalk.yellow('\n⚠ You need to login first\n'));
      console.log(chalk.gray('Run:'), chalk.cyan('testgen login'));
      console.log(chalk.gray('Or register at:'), chalk.cyan.underline('https://testorix.dev/register'));
      console.log();
      process.exit(1);
    }

    // Step 2: Resolve file path
    const absolutePath = path.resolve(filePath);

    // Step 3: Validate file
    console.log(chalk.gray('Validating file...'));
    const validation = FileValidator.validateFilePath(absolutePath);
    if (!validation.valid) {
      console.error(chalk.red('✗'), validation.error);
      process.exit(1);
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

    // Step 6: Determine output path
    const testFilePath = FileValidator.getTestFilePath(absolutePath, language);
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

    // Step 7: Call API to generate test
    const spinner = ora({
      text: `Generating ${language.toUpperCase()} tests...`,
      color: 'cyan',
    }).start();

    const apiClient = new ApiClient(config.apiKey);

    try {
      const response = await apiClient.generateTest({
        file_content: fileContent,
        file_name: path.basename(absolutePath),
        language,
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
        if (error.response.data.error.includes('localhost:11434') || 
            error.response.data.error.includes('Could not connect to server')) {
          console.log();
          console.log(chalk.yellow('⚠ This appears to be a server configuration issue.'));
          console.log(chalk.gray('The API backend is currently unavailable or misconfigured.'));
          console.log(chalk.gray('Please try again later or contact support.'));
        }
      } else {
        console.error(chalk.red('Error:'), error.message);
        
        // Check for connection errors
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
          console.log();
          console.log(chalk.yellow('⚠ Cannot connect to the API server.'));
          console.log(chalk.gray('Please check your internet connection and try again.'));
        }
      }

      process.exit(1);
    }
  } catch (error: any) {
    console.error(chalk.red('✗'), error.message);
    process.exit(1);
  }
}
