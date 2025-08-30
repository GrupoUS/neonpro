#!/bin/bash
cd /home/vibecoder/neonpro

# Add all changes
git add .

# Commit changes
git commit -m "chore: finalize bun migration configuration updates"

# Push current branch
git push origin coderabbitai/utg/b3d6a5a

# Checkout main
git checkout main

# Merge the branch
git merge coderabbitai/utg/b3d6a5a

# Push main
git push origin main

echo "Git operations completed successfully"
