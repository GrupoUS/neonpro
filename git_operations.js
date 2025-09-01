import { execSync } from "node:child_process";

// Use environment variables or defaults for repo path and branch
const repoPath = process.env.REPO_PATH || process.cwd();
let targetBranch = process.env.TARGET_BRANCH;

// If TARGET_BRANCH is not set, detect current branch dynamically
if (!targetBranch) {
  try {
    targetBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoPath }).toString().trim();
  } catch (err) {
    console.error("Could not determine current branch. Set TARGET_BRANCH env variable.");
    process.exit(1);
  }
}

try {
  console.log("Adding files to staging...");
  execSync("git add .", { cwd: repoPath, stdio: "inherit" });

  console.log("Committing changes...");
  execSync('git commit -m "chore: finalize bun migration configuration updates"', {
    cwd: repoPath,
    stdio: "inherit",
  });

  console.log("Pushing current branch...");
  execSync(`git push origin ${targetBranch}`, { cwd: repoPath, stdio: "inherit" });

  console.log("Checking out main...");
  execSync("git checkout main", { cwd: repoPath, stdio: "inherit" });

  console.log("Pulling latest main...");
  execSync("git pull origin main", { cwd: repoPath, stdio: "inherit" });

  console.log("Merging branch...");
  execSync(`git merge ${targetBranch}`, { cwd: repoPath, stdio: "inherit" });

  console.log("Pushing main...");
  execSync("git push origin main", { cwd: repoPath, stdio: "inherit" });

  console.log("Git operations completed successfully!");
} catch (error) {
  console.error("Error during git operations:", error.message);
  process.exit(1);
}