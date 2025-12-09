import chalk from 'chalk';
import { createTwoFilesPatch } from 'diff';

export function createDiff(oldContent: string, newContent: string): string {
  const patch = createTwoFilesPatch(
    'existing',
    'generated',
    oldContent,
    newContent,
    '',
    '',
    { context: 3 }
  );

  // Colorize the diff
  const lines = patch.split('\n').slice(4); // Skip header lines

  return lines
    .map((line) => {
      if (line.startsWith('+')) {
        return chalk.green(line);
      } else if (line.startsWith('-')) {
        return chalk.red(line);
      } else if (line.startsWith('@')) {
        return chalk.cyan(line);
      }
      return chalk.dim(line);
    })
    .join('\n');
}

export function showDiff(oldContent: string, newContent: string): void {
  const diff = createDiff(oldContent, newContent);
  console.log(diff);
}
