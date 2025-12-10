import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { ApiClient } from '../utils/api-client';
import { ConfigManager } from '../utils/config';

export async function loginCommand() {
  console.log(chalk.blue.bold('\n🔐 Login to TestGen\n'));

  // Check if already logged in
  const config = new ConfigManager();
  const existingApiKey = config.get('apiKey');
  const existingEmail = config.get('email');

  if (existingApiKey && existingEmail) {
    console.log(
      chalk.yellow('Already logged in as:'),
      chalk.bold(existingEmail)
    );
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to login with a different account?',
      initial: false,
    });

    if (!confirm) {
      console.log(chalk.gray('\nLogin cancelled'));
      return;
    }
  }

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'email',
        message: 'Email:',
        validate: (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email) || 'Please enter a valid email';
        },
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
      },
    ],
    {
      onCancel: () => {
        console.log(chalk.yellow('\nLogin cancelled'));
        process.exit(0);
      },
    }
  );

  if (!response.email || !response.password) {
    console.log(chalk.yellow('\nLogin cancelled'));
    return;
  }

  const spinner = ora('Authenticating...').start();

  try {
    const apiClient = new ApiClient();
    const { api_key, email } = await apiClient.login(
      response.email,
      response.password
    );

    config.set('apiKey', api_key);
    config.set('email', email);

    spinner.succeed(chalk.green('Successfully logged in!'));
    console.log(chalk.dim(`\nLogged in as: ${email}`));
    console.log(chalk.dim(`Config saved to: ${config.getConfigPath()}\n`));
  } catch (error: any) {
    spinner.fail(chalk.red('Login failed'));
    console.error(chalk.red(`\n${error.message}\n`));

    // Show registration link
    console.log(chalk.yellow("Don't have an account yet?"));
    console.log(
      chalk.gray('Register at:'),
      chalk.cyan.underline('https://testorix.dev/register')
    );
    console.log();

    process.exit(1);
  }
}
