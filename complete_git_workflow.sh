#!/bin/bash

# Complete Git Workflow Script
# This script completes the remaining Git operations

echo "Starting Git workflow completion..."
echo "Current directory: $(pwd)"
echo "Current branch: $(git branch --show-current)"

# Step 1: Push current branch to origin
echo "\n=== Step 1: Pushing current branch to origin ==="
git push origin coderabbitai/utg/b3d6a5a
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed branch coderabbitai/utg/b3d6a5a to origin"
else
    echo "❌ Failed to push branch to origin"
    exit 1
fi

# Step 2: Checkout to main branch
echo "\n=== Step 2: Checking out to main branch ==="
git checkout main
if [ $? -eq 0 ]; then
    echo "✅ Successfully checked out to main branch"
else
    echo "❌ Failed to checkout to main branch"
    exit 1
fi

# Step 3: Pull latest changes from main
echo "\n=== Step 3: Pulling latest changes from main ==="
git pull origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pulled latest changes from main"
else
    echo "❌ Failed to pull latest changes from main"
    exit 1
fi

# Step 4: Merge feature branch into main
echo "\n=== Step 4: Merging feature branch into main ==="
git merge coderabbitai/utg/b3d6a5a --no-ff -m "Merge branch 'coderabbitai/utg/b3d6a5a' into main"
if [ $? -eq 0 ]; then
    echo "✅ Successfully merged feature branch into main"
else
    echo "❌ Merge failed - conflicts may need to be resolved"
    echo "Current status:"
    git status
    exit 1
fi

# Step 5: Push updated main branch
echo "\n=== Step 5: Pushing updated main branch ==="
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed updated main branch to origin"
else
    echo "❌ Failed to push updated main branch"
    exit 1
fi

# Final verification
echo "\n=== Final Verification ==="
echo "Current branch: $(git branch --show-current)"
echo "Latest commit on main:"
git log --oneline -1
echo "\n🎉 Git workflow completed successfully!"
echo "All changes have been merged into main and pushed to origin."
