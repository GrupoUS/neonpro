# GitHub Quick Reference for NeonPro

## GitHub CLI Commands

### Repository Operations
```bash
# View repository details
gh repo view GrupoUS/neonpro

# Clone repository
gh repo clone GrupoUS/neonpro

# Fork repository
gh repo fork GrupoUS/neonpro

# Create new repository
gh repo create new-repo-name
```

### Issue Management
```bash
# List issues
gh issue list
gh issue list --state open
gh issue list --assignee @me

# View specific issue
gh issue view 12

# Create new issue
gh issue create --title "Bug: Login not working" --body "Description of the issue"

# Close issue
gh issue close 12

# Reopen issue
gh issue reopen 12
```

### Pull Request Workflows
```bash
# List pull requests
gh pr list
gh pr list --state open

# View specific PR
gh pr view 123

# Create pull request
gh pr create --title "Feature: Add user authentication" --body "Description"

# Checkout PR locally
gh pr checkout 123

# Merge PR
gh pr merge 123

# Close PR
gh pr close 123
```

### GitHub Actions & Workflows
```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run deploy.yml

# List workflow runs
gh run list

# View specific run
gh run view 123456

# Download run artifacts
gh run download 123456
```

### Releases
```bash
# List releases
gh release list

# Create release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"

# View release
gh release view v1.0.0

# Delete release
gh release delete v1.0.0
```

## Augment GitHub API Tool

### Repository Operations
```yaml
# Get repository info
path: /repos/GrupoUS/neonpro
method: GET

# List repository branches
path: /repos/GrupoUS/neonpro/branches
method: GET

# Get repository statistics
path: /repos/GrupoUS/neonpro/stats/contributors
method: GET
```

### Issue Management
```yaml
# List issues
path: /repos/GrupoUS/neonpro/issues
method: GET
data: {"state": "open", "per_page": 10}

# Get specific issue
path: /repos/GrupoUS/neonpro/issues/12
method: GET

# Create issue
path: /repos/GrupoUS/neonpro/issues
method: POST
data: {
  "title": "Bug: Login not working",
  "body": "Description of the issue",
  "labels": ["bug"]
}

# Update issue
path: /repos/GrupoUS/neonpro/issues/12
method: PATCH
data: {"state": "closed"}
```

### Pull Request Operations
```yaml
# List pull requests
path: /repos/GrupoUS/neonpro/pulls
method: GET

# Get specific PR
path: /repos/GrupoUS/neonpro/pulls/123
method: GET

# Create pull request
path: /repos/GrupoUS/neonpro/pulls
method: POST
data: {
  "title": "Feature: Add authentication",
  "body": "Description",
  "head": "feature-branch",
  "base": "main"
}

# Merge pull request
path: /repos/GrupoUS/neonpro/pulls/123/merge
method: PUT
data: {"commit_title": "Merge feature"}
```

### GitHub Actions
```yaml
# List workflow runs
path: /repos/GrupoUS/neonpro/actions/runs
method: GET

# Get specific workflow run
path: /repos/GrupoUS/neonpro/actions/runs/123456
method: GET

# List workflows
path: /repos/GrupoUS/neonpro/actions/workflows
method: GET

# Trigger workflow
path: /repos/GrupoUS/neonpro/actions/workflows/deploy.yml/dispatches
method: POST
data: {"ref": "main"}
```

### User & Organization
```yaml
# Get current user
path: /user
method: GET

# List user repositories
path: /user/repos
method: GET

# Get organization info
path: /orgs/GrupoUS
method: GET
```

## Common Workflow Examples

### Creating and Managing Issues
```bash
# GitHub CLI approach
gh issue create --title "Feature: Add dark mode" --body "Users want dark mode support"
gh issue list --label "enhancement"
gh issue view 15

# API approach (use github-api tool)
# Create issue: POST /repos/GrupoUS/neonpro/issues
# List issues: GET /repos/GrupoUS/neonpro/issues?labels=enhancement
# View issue: GET /repos/GrupoUS/neonpro/issues/15
```

### Pull Request Workflow
```bash
# GitHub CLI approach
git checkout -b feature/dark-mode
# ... make changes ...
git push origin feature/dark-mode
gh pr create --title "Add dark mode support" --body "Implements dark mode theme"
gh pr list
gh pr merge 16

# API approach (use github-api tool)
# Create PR: POST /repos/GrupoUS/neonpro/pulls
# List PRs: GET /repos/GrupoUS/neonpro/pulls
# Merge PR: PUT /repos/GrupoUS/neonpro/pulls/16/merge
```

### Deployment Monitoring
```bash
# GitHub CLI approach
gh workflow list
gh run list --workflow=deploy.yml
gh run view 789012

# API approach (use github-api tool)
# List workflows: GET /repos/GrupoUS/neonpro/actions/workflows
# List runs: GET /repos/GrupoUS/neonpro/actions/runs?workflow_id=deploy.yml
# View run: GET /repos/GrupoUS/neonpro/actions/runs/789012
```

## Authentication Status Check

```bash
# Check GitHub CLI authentication
gh auth status

# Test API access (use github-api tool)
# GET /user - should return your user info
```

Both tools are fully configured and ready for use in the NeonPro project!
