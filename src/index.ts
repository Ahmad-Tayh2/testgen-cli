#!/usr/bin/env node

import { Command } from 'commander';
import 'dotenv/config';
import { generateCommand } from './commands/generate';
import { loginCommand } from './commands/login';
import { statusCommand } from './commands/status';
import { checkAndAskRetentionQuestion } from './utils/feedback-prompt';

const program = new Command();

program
  .name('testgen')
  .description('AI-powered test generation CLI')
  .version('0.1.0');

program
  .command('login')
  .description('Authenticate with your TestGen account')
  .action(loginCommand);

program
  .command('generate <file>')
  .description('Generate unit tests for a file')
  .option('-o, --output <path>', 'Specify custom output path for the test file')
  .option(
    '-v, --verbose',
    'Show detailed output (project context, imports, etc.)'
  )
  .action(generateCommand);

program
  .command('status')
  .description('Show your account usage and remaining quota')
  .action(statusCommand);

// Check for retention question before command execution
(async () => {
  const commandName = process.argv[2];

  // Check if user wants help or no command provided
  if (!commandName) {
    program.outputHelp();
    return;
  }

  // Ask retention question before commands (except login/register)
  if (commandName && !['login', 'register'].includes(commandName)) {
    try {
      await checkAndAskRetentionQuestion(['login', 'register']);
    } catch (error) {
      // Never block CLI
    }
  }

  // Parse and execute command
  program.parse(process.argv);
})();
