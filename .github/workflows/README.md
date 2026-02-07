# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated testing, building, and deployment of the Bookmark Manager API.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

####  Lint & Format Check
- Runs ESLint to check code quality
- Validates code formatting with Prettier
- **Runs on:** All pushes and PRs

####  Unit Tests
- Executes all unit tests with coverage
- Uploads coverage reports to Codecov
- **Runs on:** All pushes and PRs

#### 🔬 E2E Tests
- Runs end-to-end tests against a PostgreSQL database
- Uses GitHub Actions services for database
- **Runs on:** All pushes and PRs

####  Build
- Compiles TypeScript to JavaScript
- Uploads build artifacts
- **Runs on:** All pushes and PRs (after lint and test pass)

####  Security Audit
- Runs `npm audit` to check for vulnerabilities
- Executes Snyk security scan (requires `SNYK_TOKEN` secret)
- **Runs on:** All pushes and PRs
- **Note:** Continues on error to not block pipeline

####  Docker Build & Push
- Builds Docker image
- Pushes to GitHub Container Registry (ghcr.io)
- Tags with branch name, SHA, and `latest`
- **Runs on:** Push to `main` branch only
- **Requires:** All previous jobs to pass

####  Deploy to Staging
- Deploys to staging environment
- **Runs on:** Push to `develop` branch only
- **Requires:** Docker build to complete
- **Note:** Placeholder - add your deployment commands

####  Deploy to Production
- Deploys to production environment
- **Runs on:** Push to `main` branch only
- **Requires:** Docker build to complete
- **Note:** Placeholder - add your deployment commands

---

### 2. Pull Request Checks (`pr-check.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches

**Jobs:**

####  Validate PR
- Quick validation for pull requests
- Runs linting, formatting, type checking, and unit tests
- Posts a comment on the PR when checks pass

---

## Setup Instructions

### Required Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

1. **SNYK_TOKEN** (Optional)
   - Get from: https://snyk.io/
   - Used for security vulnerability scanning
   - Pipeline continues without it (optional)

2. **SLACK_WEBHOOK** (Optional)
   - Get from: Slack App settings
   - Used for deployment notifications
   - Comment out notification job if not needed

3. **GITHUB_TOKEN**
   - Automatically provided by GitHub Actions
   - No setup required

### Environment Configuration

The pipeline uses GitHub Environments for deployment:

1. **Create Environments:**
   - Go to `Settings > Environments`
   - Create `staging` and `production` environments

2. **Add Protection Rules:**
   - For `production`: Require manual approval
   - For `staging`: Optional approval

3. **Add Environment Secrets:**
   - Add deployment-specific secrets (API keys, credentials, etc.)

---

## Customization

### Modify Deployment Steps

Edit the deployment jobs in `ci-cd.yml`:

```yaml
- name: Deploy to production
  run: |
    # Add your deployment commands
    # Examples:
    # - kubectl apply -f k8s/production/
    # - ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
    # - aws ecs update-service --cluster prod --service api --force-new-deployment
```

### Change Node Version

Update the `NODE_VERSION` environment variable:

```yaml
env:
  NODE_VERSION: '20.x'  # Change to your desired version
```

### Disable Jobs

Comment out or remove jobs you don't need:

```yaml
# Disable security scanning
# security:
#   name: Security Audit
#   ...
```

---

## Pipeline Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Push/PR Triggered                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌──────┐           ┌──────┐           ┌──────┐
    │ Lint │           │ Test │           │ E2E  │
    └──────┘           └──────┘           └──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                       ┌────────┐
                       │ Build  │
                       └────────┘
                            │
                            ▼
                      ┌──────────┐
                      │ Security │
                      └──────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
         (main branch)           (develop branch)
                │                       │
                ▼                       ▼
           ┌────────┐             ┌─────────┐
           │ Docker │             │ Docker  │
           └────────┘             └─────────┘
                │                       │
                ▼                       ▼
          ┌────────────┐          ┌─────────┐
          │ Production │          │ Staging │
          └────────────┘          └─────────┘
```

---

## Troubleshooting

### Tests Failing

- Check test logs in the Actions tab
- Ensure database connection is working in E2E tests
- Verify environment variables are set correctly

### Docker Build Failing

- Check Dockerfile syntax
- Ensure all dependencies are in package.json
- Verify build context is correct

### Deployment Failing

- Check deployment logs
- Verify secrets are configured
- Ensure deployment target is accessible

---

## Best Practices

✅ **Always run tests locally** before pushing  
✅ **Use feature branches** and create PRs  
✅ **Review pipeline logs** when builds fail  
✅ **Keep secrets secure** - never commit them  
✅ **Update dependencies** regularly  
✅ **Monitor security alerts** from Snyk/npm audit  

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Codecov Action](https://github.com/codecov/codecov-action)
- [Snyk GitHub Actions](https://github.com/snyk/actions)

