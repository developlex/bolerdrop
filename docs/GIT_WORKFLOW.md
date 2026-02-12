# GIT_WORKFLOW.md

Status: DRAFT
Type: Governance / Delivery Workflow
Scope: Branching, pull-request flow, and merge controls
Freeze: Not applied

## 1. Purpose

This document defines the mandatory Git workflow for the repository.

Its goals are to:

- enforce a predictable branch model,
- require reviewable pull-request based delivery,
- prevent direct unreviewed changes to stable branches.

## 2. Branch Model

The repository uses the following long-lived branches:

- `main`: production-ready stable branch
- `master`: production-ready stable branch (compatibility/prod mirror if used)
- `dev`: integration branch for accepted feature work

Delivery governance is enforced on stable branches (`main` and `master`).

Short-lived branches:

- `feature/<scope>-<short-name>` for new work
- `fix/<scope>-<short-name>` for defect fixes
- `hotfix/<scope>-<short-name>` for urgent production corrections

Feature/fix/hotfix branches are temporary and must be deleted after merge.

## 3. Mandatory Flow

Required path for normal development:

1. Branch from `dev` into `feature/*` (or `fix/*`).
2. Implement changes and tests in the branch.
3. Push feature updates directly to the working branch as needed.
4. Merge to `dev` either by direct push (allowed) or by PR (recommended for larger changes).

Promotion flow to production branches:

1. Open PR from `dev` (or `feature/*` when needed) into `main` or `master`.
2. Merge only after required approvals and checks pass.

Direct commits to `main` and `master` are forbidden.

## 3.1 Conflict Prevention Routine (Mandatory)

To avoid repetitive PR conflicts and oversized diffs, the following routines are mandatory.

### Dev Branch Alignment Routine

After every merge to `main`, align `dev` to `main` immediately:

```bash
make sync-dev
```

Equivalent explicit commands:

```bash
git fetch origin --prune
git checkout dev
git reset --hard origin/main
git push --force-with-lease origin dev
```

This keeps `dev` and `main` in lockstep and prevents accumulated cross-branch drift.

### Feature Branch Pre-Push Routine

Before pushing a feature/fix branch, rebase it onto `main` with local-safety steps:

```bash
git stash push -u -m "pre-rebase"
git fetch origin --prune
git rebase origin/main
git stash pop
```

If conflicts occur:

1. resolve conflict files,
2. `git add <resolved-files>`,
3. continue rebase with `git rebase --continue` (if rebase is active),
4. run required tests/checks,
5. push with `--force-with-lease` if branch history changed.

For README-only or small docs changes, branch from `main` directly instead of `dev`.

## 4. Pull Request Rules

Every change must go through PR.

PR requirements:

- linked scope/intent in PR description,
- clear change summary with dedicated `What changed` section,
- explicit rationale with dedicated `Why this change is needed` section,
- test evidence for first-party code changes,
- CI checks green.
- at least one approval from an eligible invited reviewer on protected branches.

Repository pull request template must be used to enforce consistent reviewer context.

Optional automation:

- If PR has label `automerge`, workflow `pr-automerge` may enable auto-merge after approval + green checks.
- Auto-merge automation applies only to PRs targeting `main` or `master`.

## 5. Test Coverage Requirement

For all first-party code (non-third-party):

- every change must include or update automated tests at the appropriate layer,
- untested first-party production code changes must be rejected in PR review,
- CI must run required test suites before merge.

Third-party vendor code is excluded from this requirement.

## 6. Merge Policy

Allowed merge strategy:

- squash merge (default) for feature/fix branches.

Rules:

- no force-push to `main` or `master`,
- no bypass of required checks,
- no merge with failing CI.

## 7. Branch Protection (Repository Setting Requirement)

Repository settings must enforce for `main` and `master`:

- require PR before merge,
- require status checks to pass,
- require at least one approval,
- restrict direct push access.

If settings and this document conflict, stricter controls apply.

## 8. Reproducible Setup Procedure

This section documents the exact bootstrap sequence to reproduce repository governance.

### 8.1 Create long-lived branches

```bash
git checkout main
git branch dev main
git push -u origin main
git push -u origin dev
```

Optional compatibility branch:

```bash
git branch master main
git push -u origin master
```

### 8.2 Add PR template and required check workflow

Required files:

- `.github/pull_request_template.md` (includes `What changed` and `Why this change is needed`)
- `.github/workflows/pr-gate.yml` (always-on required status check)
- `.github/workflows/pr-automerge.yml` (optional label-driven auto-merge for stable branches)

Push them to `dev` and merge to `main` via PR.

### 8.3 Authenticate GitHub CLI

```bash
gh auth logout -h github.com -u <your-user>
gh auth login -h github.com
gh auth status
```

### 8.4 Apply branch protection

Create payload:

```bash
cat > /tmp/branch-protection.json <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["pr-gate / pr-gate"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON
```

Apply to both protected branches:

```bash
for BR in main master; do
  gh api --method PUT \
    -H "Accept: application/vnd.github+json" \
    "/repos/<owner>/<repo>/branches/${BR}/protection" \
    --input /tmp/branch-protection.json
done
```

Remove protection from `dev` (direct pushes allowed):

```bash
gh api --method DELETE \
  -H "Accept: application/vnd.github+json" \
  "/repos/<owner>/<repo>/branches/dev/protection"
```

### 8.5 Verify protections

```bash
for BR in main master; do
  gh api "/repos/<owner>/<repo>/branches/${BR}/protection"
done
```

Verification must show:

- required status checks (`pr-gate / pr-gate`),
- required PR reviews (1 approval),
- force push disabled,
- deletion disabled,
- admins enforced.
- `dev` is not protected and allows direct push.
## 9. Direct Push Policy

Direct pushes are allowed to:

- `dev`
- `feature/*`
- `fix/*`
- `hotfix/*`

Direct pushes are not allowed to:

- `main`
- `master`

## 10. Relationship to Other Documents

This document is authoritative for:

- git branching and PR flow governance

This document depends on:

- `CI_CD_OVERVIEW.md`
- `TESTING_STRATEGY.md`
- `DEFINITION_OF_DONE.md`
- `RUNBOOK.md`

In case of conflict, security and authority documents take precedence.

## 11. Change Management

Changes to git workflow:

- must be documented here,
- require ADR if they alter delivery governance materially,
- must not weaken PR/testing controls.

## 12. Document Status

This document is DRAFT

No freeze applied

Workflow rules are binding once accepted.

End of document
