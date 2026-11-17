# Antlife public website — project state

Updated 17 November 2026. Phase 1 only. Source baseline: `b4604b93faa57af4f2802c74e90b821645686318`. Working branch: `redesign/antlife-public-site`.

## Approved direction

- Antlife — Investment Intelligence; supplied v3 brand identity, master Through-line symbol and refined wordmark.
- Green-led, ivory reading surfaces, navy research surfaces. Figtree primary; Outfit for display; DM Mono for analytical metadata. Self-hosted supplied fonts.
- Original restrained pixel/matrix imagery, responsive interactions, visible evidence and limitations. No logo deformation, parallax or mandatory motion.
- Conversation first; `info@antlife.one`. No public paid-report checkout.
- Services: market entry, commercial feasibility, investment due diligence (commercial research scope), sector research, strategy review, capital intelligence. Financial modelling is a supporting method.
- Audience remains broad pending enquiry evidence. Do not invent a settled client niche.
- Home, Services, Approach, Work, About, Contact, Insights. Insights distinguishes research, commentary and observations.
- Resend planned for transactional email; PostHog planned for analytics. Polar/Paystack later for invoicing/onboarding, not public report checkout.
- Public site and private Commercial Workspace remain separate repositories and deployment boundaries. No Phase 2 or Phase 3 implementation here.

## Implemented locally

Shared responsive site, mobile menu with Escape/focus restoration, Mitumba keyboard-operable decision tabs, historical expansion chart toggle, separate fictional unit-economics calculator, Insights filters and an editorial observation, validated contact UI and fail-closed Resend handler. Legacy `/start` and `/success` no longer assert that a payment occurred.

Supplied logo masters and licensed fonts have been copied into assets. Brand package is an external reference, not an executable setup script. No source scripts from that package were executed.

## Evidence treatment

- **Mitumba:** commissioned secondary-source desk research. Public summary is anonymised. No engineering verification, launched plant, realised savings or investment returns are asserted. Underlying report/source register not recovered. Exact composition, tax savings, bale prices and markup claims omitted pending source/date/basis recovery. Source artifact: user's three-page “From Mitumba to Yarn” PDF. It references Changing Markets' “Trashion” report and vendor material, without a full source register.
- **Ed-tech:** user's Upwork toolkit classifies Pan-Africa as self-initiated showcase work, not commissioned client work. Historical figures transcribed from the supplied visual: expected/risk-adjusted USD losses, Rwanda 126509/149280, Burundi 166193/235994, Uganda 334320/434616, Tanzania 392781/542038. Original notebook and risk method unavailable. No observed losses asserted.
- **Scenario calculator:** newly authored fictional demonstration; distinct from original historical results. Profit = (annual revenue per customer - annual customer cost including acquisition) × customers - USD 20,000 fixed cost. No tax, financing or timing model.
- **Editorial observation:** new draft derived from the expansion example; requires owner editorial sign-off. No Ray Dalio articles were provided or fabricated.
- **Capital intelligence:** provisional research/briefing description; cadence and scope agreed per enquiry pending owner's fuller definition.

## Outstanding before public launch

1. Owner sign-off on copy, case disclosure rights and personal-versus-firm attribution. General direction approved; do not represent that as evidence of third-party permission.
2. Final company bio/legal entity, privacy practices, retention and applicable rights; draft privacy page explicitly identifies open details.
3. Resend account/domain verification, server variables, deployment anti-abuse controls, mailbox and delivery testing. Current endpoint is inactive; local form reports failure honestly. No auto-acknowledgement email implemented.
4. PostHog project/region, events, privacy/consent decisions and masking. No tracker/session replay installed. Never include enquiry text or email in analytics events.
5. Final article submissions and editorial review.
6. Live production/source match and actual Vercel project/deployment settings. Last HTTP/Chromium attempts were blocked by the environment proxy, not a confirmed site failure. AI-2027 also blocked; interaction inspiration comes from user's screenshots, not a verified live inspection.
7. Desktop/mobile user review of the first version; full accessibility audit and hosted performance checks have not been claimed.

## Publication and rollback

The owner authorised committing and pushing variation 1 to `redesign/antlife-public-site` on 17 November 2026. Keep `main` unchanged. Two additional design variations are planned; repository cleanup is deferred until the variations are reviewed. Hosted preview deployment and production launch remain separate authorisation gates. No deployment has been performed by the agent. Hosting is Vercel per owner; actual production deployment ID and settings unverified. Before any launch, record the current deployment ID and environment settings, validate the approved preview, and prepare to promote the previous Vercel deployment if checks fail. Keep baseline Git commit available. Confirm retained legacy routes and existing payment-link handling with owner. Do not delete payment products or change provider configuration during website redesign.
