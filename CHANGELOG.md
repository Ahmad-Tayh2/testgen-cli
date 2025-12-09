# Changelog

All notable changes to TestGen CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-09

### Added
- Initial release of TestGen CLI
- AI-powered test generation for PHP, JavaScript, and TypeScript
- Support for PHPUnit (PHP) and Jest (JS/TS) test frameworks
- Interactive login command
- File validation (max 5MB)
- Usage tracking and status command
- Diff preview before saving tests
- Comprehensive error handling
- Configuration management in `~/.testgen/config.json`
- Environment variable support (`TESTGEN_API_URL`)

### Features
- `testgen login` - Authenticate with TestGen account
- `testgen generate <file>` - Generate tests for a source file
- `testgen status` - View account usage statistics
- Automatic language and framework detection
- Support for `.php`, `.js`, `.ts`, `.jsx`, `.tsx` file extensions

### Documentation
- README with installation and usage instructions
- Contributing guidelines
- MIT License
- Environment configuration examples

## [Unreleased]

### Planned
- Support for additional test frameworks (Mocha, AVA, etc.)
- Batch test generation for multiple files
- Custom test template support
- Watch mode for automatic test generation
- Integration with CI/CD pipelines
- VS Code extension

---

## Release Notes

### Version 1.0.0

This is the initial public release of TestGen CLI. The tool provides:

- **Multi-language support**: Generate tests for PHP, JavaScript, and TypeScript files
- **AI-powered analysis**: Uses advanced language models to create intelligent test cases
- **Interactive workflow**: Login, generate, and review tests with simple commands
- **Developer-friendly**: Clear error messages, diff previews, and usage tracking

Thank you for using TestGen CLI! We welcome your feedback and contributions.
