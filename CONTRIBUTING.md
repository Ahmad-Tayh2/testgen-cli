# Contributing to TestGen CLI

Thank you for your interest in contributing to TestGen CLI! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and constructive in your interactions with other contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Ahmad-Tayh2/testgen-cli/issues)
2. If not, create a new issue with:
   - A clear title and description
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

1. Check existing [Issues](https://github.com/Ahmad-Tayh2/testgen-cli/issues) for similar suggestions
2. Create a new issue describing:
   - The enhancement you'd like to see
   - Why it would be useful
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Ensure code follows the existing style
5. Test your changes thoroughly
6. Commit your changes (`git commit -am 'Add some feature'`)
7. Push to the branch (`git push origin feature/your-feature-name`)
8. Create a Pull Request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Ahmad-Tayh2/testgen-cli.git
   cd testgen-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

5. Test locally:
   ```bash
   npm link
   testgen --help
   ```

## Project Structure

```
cli/
├── src/
│   ├── commands/     # CLI commands
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   ├── config.ts     # Configuration
│   └── index.ts      # Entry point
├── dist/             # Compiled output (generated)
└── package.json
```

## Coding Guidelines

- Use TypeScript for all new code
- Follow existing code style and conventions
- Add comments for complex logic
- Keep functions small and focused
- Write descriptive commit messages

## Testing

Before submitting a PR, ensure your changes work correctly:

1. Test with PHP files
2. Test with JavaScript/TypeScript files
3. Test error handling
4. Test edge cases

## Environment Variables

The CLI uses the following environment variable:

- `TESTGEN_API_URL` - API endpoint (defaults to `http://localhost:8000/api`)

For development, you can set:
```bash
export TESTGEN_API_URL=http://localhost:8000/api
```

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create a git tag
5. Push to GitHub
6. Publish to npm: `npm publish --access public`

## Questions?

Feel free to open an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
