# Publishing TestGen CLI to npm

This guide covers how to publish the TestGen CLI package to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm Login**: Login via CLI:
   ```bash
   npm login
   ```
3. **Organization Access** (optional): If using `@testgen` scope, ensure you have access to the organization

## Pre-publish Checklist

Before publishing, ensure:

- [ ] All tests pass (if you have tests)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Version number is updated in `package.json`
- [ ] `CHANGELOG.md` is updated with release notes
- [ ] `README.md` is up to date
- [ ] No sensitive information in code (API keys, tokens, etc.)
- [ ] `.npmignore` is configured correctly
- [ ] `LICENSE` file exists

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes, backward compatible

Update version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

Or use npm:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## Publishing Steps

### 1. Clean Build

```bash
# Remove old build
rm -rf dist/

# Install dependencies
npm install

# Build TypeScript
npm run build

# Verify dist/ folder contains compiled JavaScript
ls -la dist/
```

### 2. Test Package Locally

```bash
# Pack the package (creates a tarball)
npm pack

# This creates a file like: testgen-cli-1.0.0.tgz
# Install it globally to test
npm install -g ./testgen-cli-1.0.0.tgz

# Test commands
testgen --help
testgen --version

# Uninstall after testing
npm uninstall -g @testgen/cli
```

### 3. Publish to npm

```bash
# For scoped packages (@testgen/cli), use --access public
npm publish --access public

# For non-scoped packages
npm publish
```

### 4. Verify Publication

Check your package on npm:
- URL: `https://www.npmjs.com/package/@testgen/cli`
- Install test: `npm install -g @testgen/cli`

### 5. Create Git Tag

```bash
# Create a tag for this release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to GitHub
git push origin v1.0.0

# Push all tags
git push --tags
```

## Post-publish

1. **Create GitHub Release**
   - Go to: `https://github.com/Ahmad-Tayh2/testgen-cli/releases`
   - Click "Draft a new release"
   - Select the tag you created
   - Add release notes from `CHANGELOG.md`

2. **Update Documentation**
   - Ensure README badges show correct version
   - Update any version-specific documentation

3. **Announce**
   - Social media
   - Blog post
   - Community forums

## Updating an Existing Package

### Patch Release (Bug Fix)

```bash
# Update version
npm version patch

# Build and publish
npm run build
npm publish --access public

# Tag and push
git push origin main
git push --tags
```

### Minor Release (New Feature)

```bash
npm version minor
npm run build
npm publish --access public
git push origin main
git push --tags
```

### Major Release (Breaking Changes)

```bash
npm version major
npm run build
npm publish --access public
git push origin main
git push --tags
```

## Unpublishing (Use with Caution)

⚠️ **Warning**: Unpublishing can break projects that depend on your package.

```bash
# Unpublish a specific version (within 72 hours of publishing)
npm unpublish @testgen/cli@1.0.0

# Deprecate instead (recommended)
npm deprecate @testgen/cli@1.0.0 "This version has a critical bug. Please upgrade to 1.0.1"
```

## Automation with GitHub Actions (Optional)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add `NPM_TOKEN` to GitHub Secrets:
1. Generate token at npmjs.com (Account Settings -> Access Tokens)
2. Add to GitHub: Settings -> Secrets -> Actions -> New repository secret

## Troubleshooting

### "Package already exists"
- Version already published
- Update version number and try again

### "You do not have permission to publish"
- Not logged in: Run `npm login`
- No org access: Request access to @testgen organization
- Check package name availability

### "Package name too similar to existing package"
- Choose a different name
- Use a scope: `@your-username/cli`

### "Missing required files"
- Ensure `dist/` folder exists
- Check `files` field in `package.json`
- Verify `.npmignore` doesn't exclude needed files

## Testing Before Publishing

### Dry Run

```bash
# See what would be published without actually publishing
npm publish --dry-run
```

### Check Package Contents

```bash
# List files that will be included
npm pack --dry-run
```

## Best Practices

1. **Always test locally** before publishing
2. **Use semantic versioning** correctly
3. **Update CHANGELOG** with every release
4. **Tag releases** in Git
5. **Never publish** with uncommitted changes
6. **Double-check** version number
7. **Test installation** from npm after publishing
8. **Monitor** download stats and issues

## Package Maintenance

### Regular Updates

- Update dependencies regularly
- Address security vulnerabilities
- Respond to issues and PRs
- Keep documentation current

### Deprecation

If deprecating the package:
```bash
npm deprecate @testgen/cli "This package is deprecated. Use @testgen/new-cli instead."
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/v9)
- [Package.json Documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

---

**Current Package Info:**
- Name: `@testgen/cli`
- Current Version: See `package.json`
- Repository: https://github.com/Ahmad-Tayh2/testgen-cli
- npm: https://www.npmjs.com/package/@testgen/cli
