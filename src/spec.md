# Specification

## Summary
**Goal:** Build an offline-first real estate listings manager with local login, a post-login dashboard, category-based entry forms (including agents), unified search, Excel-compatible import/export, and optional backend canister storage mode.

**Planned changes:**
- Add a landing-page login using default credentials (Vivid@Btm / 123456), protect all dashboard routes, and show clear English error messages on failure.
- Add a Settings area to change and persist the app’s login username/password for future sessions.
- Implement offline-first local persistence in the browser for all records and attachments (images/videos/documents), ensuring CRUD works without network connectivity.
- Add Excel-compatible export/import (CSV or similar), including clear success/failure feedback and a replace-vs-merge choice on import.
- Create the post-login dashboard with a property search bar, property-type selector (Commercial Land, House, Agriculture Land, Flat, Shops, Rental, Add Custom), and primary actions for “New Entry” and “Agent List”.
- Implement “New Entry” category selection and forms:
  - Customer form with Sold/Available toggle and red/green visual accents, plus required fields and notes.
  - Commercial Land form with required fields, attachments with custom filenames, and a clickable Google Maps link (opens when online).
  - House form with required fields and attachments.
  - Placeholder forms for Agriculture Land, Flat, Shops, Rental, and Custom with basic fields, notes, and attachments.
- Implement Agent List page with “Add New Agent” form (including citizenship upload), saved agents list, and agent detail viewing.
- Add a “Top Priority” dashboard section listing up to 20 buyers and 20 sellers (Name, Property Type, Budget) with “View Detail” actions.
- Apply a consistent, distinct visual theme across screens (not primarily blue/purple) with all UI text in English.
- Add basic PWA/offline app-shell caching and an English offline/online indicator in the UI.
- Add a local-vs-canister storage mode switch (default local-only); in canister mode, store and retrieve records/attachments via the backend actor.

**User-visible outcome:** Users can log in, manage property/customer entries and agents entirely offline (including attachments), search across saved records, view top-priority buyer/seller lists, export/import data for Excel use, and optionally switch storage to a backend canister—while the app remains usable offline after first load with a clear offline indicator.
