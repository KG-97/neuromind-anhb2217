# NeuronLab Port Status

## Scope of this branch
- This branch is a donor-side cleanup step only.
- It is not the full Atlas master merge.

## Implemented in donor repo
The donor repository work completed here includes:
- NeuronLab consolidation.
- App and StudyHub wiring to support the consolidated NeuronLab surfaces in the donor context.

## Blocked until real Atlas base files are available
The following work remains blocked pending access to the actual Atlas base source files:
- Final placement and compatibility checks against the canonical Atlas directory structure.
- Conflict-resolution against live Atlas implementations and routing/layout conventions.
- Validation of shared dependencies, feature flags, and integration boundaries with existing Atlas modules.
- End-to-end merge verification across Atlas app flows.

### Blocker note
Full integration cannot proceed without a readable Atlas source tree.

## Intended master-merge order
1. Clone/import `atlas-v2-current` as canonical base.
2. Port `NeuronLab` into `/neuron-lab`.
3. Port pathways lab.
4. Merge quiz content.
5. Integrate AI tutor panel cleanly.
