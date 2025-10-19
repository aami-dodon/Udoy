for branch in $(git branch -r | grep -v "origin/main" | sed 's/origin\///'); do
  git push origin --delete "$branch"
done