# CI/CD Quick Start Guide

##  Getting Started

### First Time Setup

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **The pipeline will automatically run!**
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Watch your pipeline execute

### Branching Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/your-feature (development)
```

**Workflow:**
1. Create feature branch from `develop`
2. Make changes and push
3. Create PR to `develop` → triggers PR checks
4. Merge to `develop` → deploys to staging
5. Create PR from `develop` to `main`
6. Merge to `main` → deploys to production

---

##  Common Tasks

### Running Checks Locally (Before Push)

```bash
# Lint your code
npm run lint

# Format your code
npm run format

# Run tests
npm run test

# Run E2E tests (requires PostgreSQL)
docker-compose up -d postgres
npm run test:e2e

# Build the application
npm run build
```

### Creating a Pull Request

```bash
# Create and switch to feature branch
git checkout -b feature/add-new-endpoint

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add new endpoint for user preferences"

# Push to GitHub
git push origin feature/add-new-endpoint

# Go to GitHub and create PR
# The PR check workflow will run automatically
```

### Viewing Pipeline Results

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click on the workflow run
4. View job details and logs

### Fixing Failed Pipelines

**If linting fails:**
```bash
npm run lint -- --fix
git add .
git commit -m "Fix linting issues"
git push
```

**If tests fail:**
```bash
# Run tests locally to debug
npm run test

# Fix the issues
# ... edit files ...

git add .
git commit -m "Fix failing tests"
git push
```

**If build fails:**
```bash
# Check TypeScript errors
npm run build

# Fix type errors
# ... edit files ...

git add .
git commit -m "Fix TypeScript errors"
git push
```

---

##  Docker Deployment

### Manual Docker Build

```bash
# Build image locally
docker build -t bookmark-api:latest .

# Run the image
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=postgres \
  bookmark-api:latest
```

### Pull from GitHub Container Registry

After the pipeline builds and pushes:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull the image
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:latest

# Run it
docker run -p 3000:3000 ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

---

##  Security Scanning

### View Security Issues

1. Go to **Security** tab in GitHub
2. Check **Dependabot alerts**
3. Review **Code scanning alerts** (if enabled)

### Fix Security Vulnerabilities

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Update specific package
npm update package-name

# Commit the fixes
git add package.json package-lock.json
git commit -m "Fix security vulnerabilities"
git push
```

---

##  Code Coverage

### View Coverage Reports

After tests run in the pipeline:
1. Check the **Actions** tab
2. Click on the workflow run
3. Look for **Upload coverage reports** step
4. Coverage is uploaded to Codecov (if configured)

### Local Coverage

```bash
# Generate coverage report
npm run test:cov

# View HTML report
open coverage/lcov-report/index.html
```

---

##  Deployment

### Deploy to Staging

```bash
# Merge to develop branch
git checkout develop
git merge feature/your-feature
git push origin develop

# Pipeline automatically deploys to staging
```

### Deploy to Production

```bash
# Create PR from develop to main
git checkout main
git merge develop
git push origin main

# Pipeline automatically:
# 1. Builds Docker image
# 2. Pushes to registry
# 3. Deploys to production
```

### Manual Deployment

If you need to deploy manually:

```bash
# SSH to your server
ssh user@your-server.com

# Pull latest code
cd /app
git pull origin main

# Rebuild and restart
docker-compose pull
docker-compose up -d
```

---

## 🔧 Troubleshooting

### Pipeline Stuck or Slow

- Check if GitHub Actions has issues: https://www.githubstatus.com/
- Cancel and re-run the workflow
- Check if dependencies are cached properly

### Docker Build Fails

- Verify Dockerfile syntax
- Check if all dependencies are in package.json
- Ensure .dockerignore is correct

### Tests Fail in CI but Pass Locally

- Check environment variables
- Verify Node.js version matches
- Ensure database is properly configured

### Can't Push Docker Image

- Verify GITHUB_TOKEN permissions
- Check if package is public/private
- Ensure you're on the main branch

---

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Workflow README](.github/workflows/README.md)

---

##  Tips

✅ **Always run tests locally before pushing**  
✅ **Use meaningful commit messages**  
✅ **Keep PRs small and focused**  
✅ **Review pipeline logs when builds fail**  
✅ **Update dependencies regularly**  
✅ **Monitor security alerts**  
✅ **Use feature branches for development**  
✅ **Never commit secrets or .env files**

