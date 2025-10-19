#!/usr/bin/env bash
set -euo pipefail

# This script periodically checks for updates in the git repository.
# When updates are found, it pulls the latest changes and rebuilds the
# Docker Compose services with the --build flag. The script repeats every
# two minutes until interrupted with Ctrl+C.

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: $REPO_DIR is not a git repository." >&2
  exit 1
fi

if ! git rev-parse --abbrev-ref @{u} >/dev/null 2>&1; then
  echo "Error: Current branch has no upstream configured."
  echo "Set an upstream with 'git push -u <remote> <branch>' before running this script." >&2
  exit 1
fi

trap 'echo "\nStopping auto-update watcher."; exit 0' INT

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for remote updates..."
  git fetch --quiet

  LOCAL_SHA=$(git rev-parse @)
  REMOTE_SHA=$(git rev-parse @{u})
  BASE_SHA=$(git merge-base @ @{u})

  if [[ "$LOCAL_SHA" == "$REMOTE_SHA" ]]; then
    echo "Repository is up to date."
  elif [[ "$LOCAL_SHA" == "$BASE_SHA" ]]; then
    echo "New updates found. Pulling latest changes..."
    git pull --rebase --autostash
    echo "Rebuilding Docker Compose services with --build flag..."
    docker compose up --build -d
  elif [[ "$REMOTE_SHA" == "$BASE_SHA" ]]; then
    echo "Local repository is ahead of remote. Skipping pull to avoid overwriting local commits."
  else
    echo "Local and remote have diverged. Manual intervention required."
  fi

  echo "Sleeping for 2 minutes..."
  sleep 120
done
