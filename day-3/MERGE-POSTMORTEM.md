````markdown
# Merge Post-Mortem Report

---

## 🔹 Learning Outcomes
- Ability to recover from mistakes
- Proper commit discipline

---

## 🔹 Tasks

### 1. Create Repository with 8+ Commits
- Intentionally introduce a bug in **commit 4**
- **Commands used**:
```bash
git init
git add .
git commit -m "Initial commit"
# ... subsequent commits ...
# commit 4: introduce bug
````

* **Notes**: Keep a clean history and make small, logical commits.

---

### 2. Detect Faulty Commit using `git bisect`

* **Commands used**:

```bash
git bisect start
git bisect bad        # mark current commit as bad
git bisect good <commit_hash> # mark known good commit
# Follow bisect instructions until faulty commit is identified
git bisect reset
```
![alt text](<Screenshot from 2025-11-05 12-51-15.png>)

![alt text](<Screenshot from 2025-11-05 12-51-15-1.png>)

![alt text](<Screenshot from 2025-11-05 12-52-01.png>)



* **Deliverable:** `bisect-session.txt`

  * Include terminal log showing how the faulty commit was detected.

---

### 3. Fix Bug and Revert Only Buggy Commit

* **Commands used**:

```bash
# After identifying faulty commit
# Fix the bug
git add .
git commit -m "Fix bug in commit 4"
git revert <faulty_commit_hash>   # undo faulty commit without touching history
```

* **Notes:** Avoid using `git reset` for public branches. Use `revert` for safe undo.

---

### 4. Use Git Stash Workflow

* **Scenario:** Save local changes, update repo, reapply changes
* **Commands used**:

```bash
git stash
git pull
git stash apply
```

![alt text](<Screenshot from 2025-11-05 13-21-15.png>)

![alt text](<Screenshot from 2025-11-05 13-22-03.png>)




* **Deliverable:** `stash-session.txt`

  * Terminal log showing stash saved changes, applied after pull.

---

### 5. Merge Conflicts Using Two Clones

* **Scenario:** Edit same line in same file in two clones, then merge
* **Steps:**

```bash
# Clone repo in two directories
git clone <repo_url> clone1
git clone <repo_url> clone2

# Edit same line in the same file in both clones
# Commit in clone1
git add .
git commit -m "Edit line in clone1"

# Commit in clone2
git add .
git commit -m "Edit line in clone2"

# Merge clone2 changes into clone1
git pull ../clone2 master
# Resolve conflicts manually to keep both changes
git add <resolved_file>
git commit -m "Merge conflict resolved: kept both changes"
```

![alt text](<Screenshot from 2025-11-05 13-41-55.png>)



* **Deliverable:**

  * Include resolved file with both changes
  * Screenshot or snippet of merge conflict resolution

---

## 🔹 Git Commands Reference

| Command              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `git add`            | Move changes from working directory to staging area           |
| `git branch`         | Create isolated development environments within the same repo |
| `git checkout`       | Navigate between branches or restore files                    |
| `git clean`          | Remove untracked files from working directory                 |
| `git clone`          | Create a copy of a remote repository                          |
| `git commit`         | Commit staged changes to project history                      |
| `git commit --amend` | Amend the most recent commit                                  |
| `git fetch`          | Download branches from remote without merging                 |
| `git init`           | Initialize a new Git repository                               |
| `git log`            | View commit history                                           |
| `git merge`          | Integrate changes from divergent branches                     |
| `git pull`           | Fetch and merge remote changes                                |
| `git rebase`         | Move branches to avoid unnecessary merge commits              |
| `git rebase -i`      | Interactive rebase to edit, add, or delete commits            |
| `git reflog`         | Track updates to branch tips                                  |
| `git remote`         | Manage remote repositories                                    |
| `git reset`          | Undo changes in working directory or staging                  |
| `git revert`         | Undo a committed snapshot safely                              |
| `git status`         | Show working directory and staging status                     |

---

## 🔹 Version Control Notes

* Version control is used for **tracking and managing changes to software code**.
* Git setup on Ubuntu:

```bash
sudo apt-get install git
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

---

## 🔹 Deliverables

1. **bisect-session.txt** – Terminal log of `git bisect` session
2. **stash-session.txt** – Terminal log of stash workflow
3. **Merge conflict resolution** – File showing combined edits

---

### 🔹 Merge Conflict Example

```diff
<<<<<<< HEAD
Line from clone1
=======
Line from clone2
>>>>>>> branch
```

* After manual resolution:

```text
Line from clone1
Line from clone2
```

---

## 🔹 Notes / Best Practices

* Commit frequently with meaningful messages
* Always test before pushing
* Use stash when switching branches with uncommitted changes
* Use `git bisect` to identify regressions efficiently
* Prefer `git revert` over `reset` on public/shared branches

```
