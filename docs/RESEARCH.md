# Research and external requirements

Checked 28 October 2026. Sources are current primary documentation or official event data. A checked requirement is not an assertion that the owner personally satisfies it.

## Codegeist

The authenticated Devpost read connector returned event ID **31572**, slug `codegeist2026`, phase `submissions_open`, at 2026-10-28 03:36:58–59 UTC. Calls: `get_hackathon_rules`, `get_submission_requirements`, `get_judging_criteria`, `get_key_dates`. No registration, submission, or account mutation was performed.

[Official event](https://codegeist2026.devpost.com/) · [Official rules](https://codegeist2026.devpost.com/rules)

- Submission deadline: **22 December 2026, 20:00 UTC**, which is **23 December 2026, 01:30 IST**. Plan internal delivery earlier.
- The rules state the opening time as 27 October, 09:00 Pacific; the connector records 16:15 UTC. This small opening-time discrepancy does not affect this build's 28 October start. Deadline values agree.
- Target category: “Apps for Specialized Industries”.
- Rubric: implementation, design, potential impact, innovation/idea, presentation — each 20%; connector scale maximum 5.
- Forge plus a supported Atlassian integration must work. Judges need an installation link and instructions; an actual app ID is a required form field.
- Public YouTube demonstration is required; keep it under five minutes and show the core journey in the first three.
- Marketplace bonus evidence is a real listing or submitted review-ticket URL. Metadata drafts do not satisfy it.
- Participation swag is limited to 300 eligible entrants, maximum four per submission; do not promise availability.

Owner must review and affirm personal eligibility, rights, rules and declarations before entering. The connector's eligibility summary includes “Above legal age of majority in country of residence”. Geographic, sanctions, employment, conflict-of-interest and ownership restrictions require the owner's review of the full official rules. No personal eligibility declaration has been made.

## Domain grounding

[New Zealand MPI simulated-recall guidance](https://www.mpi.govt.nz/food-business/food-recalls/doing-food-recall) describes scenario design, a realistic problem/back-story, supporting records, participating roles, execution and review. It distinguishes a rehearsal from a genuine recall. Product decisions: model a hazard and explicit scenario clock; retain documentary references; expose role gaps; compare observed results with known expectations; document limitations. The tool covers traceability evidence rehearsal, not every communication, leadership or physical-inventory aspect of a complete organizational exercise.

[UK FSA/GOV.UK traceability guidance](https://www.gov.uk/government/publications/managing-food-safety/managing-food-safety) identifies supplier/customer records, product type/quantity and transaction/delivery dates as useful traceability information. Product decisions: use typed supplier/destination references, timestamps and compatible units; never interpret a missing record as proof of no association. Jurisdictional legal duties are outside this application's claims.

[UK recall/withdrawal guidance](https://www.gov.uk/food-feed-incident/what-to-do) distinguishes product in the supply chain from product already reaching consumers. Product decision: quarantine of future movement must not remove historical shipments from the report. LotZero must not send operational recall communications or direct a real incident.

## Forge and distribution decisions

- [Jira project page](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-project-page/): use a Custom UI resource with a resolver; `render: native` is a UI Kit setting, not required for Custom UI.
- [Storage overview](https://developer.atlassian.com/platform/forge/storage-reference/): use Forge-hosted persistence scoped to installation. Application code still needs project authorization and server-side validation.
- [Authorize API](https://developer.atlassian.com/platform/forge/runtime-reference/authorize-api/): `asApp` does not by itself establish user authorization. Prefer user-context Jira operations and independently verify project permissions.
- [Distribution](https://developer.atlassian.com/platform/forge/distribute-your-apps/): production deployment precedes console sharing; an administrator installs from the sharing link. A licensed or Marketplace-submitted app cannot use that sharing route. Maintain separate registered judge and Marketplace app identities with the same tested implementation.

## External blockers and owner decisions

No real application ID, Jira test site/project, production deployment receipt, tested sharing link, Marketplace review ticket, public video, legal policy URL or verified support identity is created by this research. These must be recorded from actual operations. App registration/deployment is authorized by the build brief when credentials permit; publication, agreements, identity verification and legal representations require the owner's approval. No paid services are necessary for the deterministic local core.

See `COMPETITIVE_ANALYSIS.md` for the novelty boundary, `MARKETPLACE.md` for the submission package, and `DEVPOST_SUBMISSION.md` for the exact field inventory. Read `FINAL_EVIDENCE.md` for implementation status rather than treating these research notes as verification.
