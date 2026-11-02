# Graphify integration · NexaPagUXUI

## Status and honest boundary
Graphify is a connected external tool, but `list_workspaces` returned no authorized workspaces on 2026-11-01. **No Graphify repository index, persistent memory or active monitoring was started.** Do not report it as active.

Until the owner connects a workspace, the GitHub Actions pipeline computes an **independent local design impact graph** on each PR and main push.

## Always-on local fallback
- Script: `scripts/design-impact-graph.mjs`
- Test: `tests/design-impact-graph.test.mjs`
- Command: `npm run check:impact`
- CI: `.github/workflows/quality-pages.yml`
- Artifact: `test-results/design-impact.json` (attached to the QA artifacts where available)
- Provenance: explicit JS/CSS import links and HTML resources; critical hand-reviewed contracts in the script.
- Scope: Workbench, Motion Studio, acrylic material engine, geometry, Liquid / financial prototype.
- Blockers: if the main entrypoint stops importing a critical engine, a required file is missing, or motion loses its finite budget, CI fails.

This graph is **not** a result of Graphify. CSS runtime selectors, dynamic rendering and non-imported legacy HTML may need manual review.

## Activate Graphify for real
1. Open the Graphify app and create/select a workspace with access to `Marcelol090/NexaPagUXUI`.
2. Authorize indexing of the GitHub repository and the `main` branch.
3. Re-run `list_workspaces` then `set_workspace(handle)` using a handle returned by the service. Never invent IDs.
4. Verify `list_repositories` contains the target and record exact repository_id/snapshot SHA.
5. Before motion/material changes: `graphify_file_neighbors`, `impact_and_risk`, `graphify_tests_for`, then live tests.
6. Store concrete design rules via Graphify `remember` only when a workspace/repository is genuinely authorized.
7. For ongoing Graphify indexing, configure its workspace/project indexing schedule or webhook in Graphify's interface and verify its status. ChatGPT cannot hold a permanent background connection open.

## Guardrail
The Android app lives in a **different** repo; do not falsely treat Graphify coverage of UXUI as proof of parity with Kotlin or real Room data. Port only reviewed designs after Android-specific tests.
