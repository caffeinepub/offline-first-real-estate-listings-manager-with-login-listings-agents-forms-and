# Specification

## Summary
**Goal:** Update the app branding to use the uploaded logo across the header and PWA assets, and redeploy to restore a working production icp0.io URL.

**Planned changes:**
- Regenerate the static branding PNGs so the header logo, favicon/Apple touch icon, and PWA manifest icons visually match the uploaded logo (IMG_4299-3.jpeg).
- Bump the service worker cache version and ensure the logo/icon assets remain precached so existing/offline installs receive the updated branding.
- Rebuild and redeploy to production to produce a fresh icp0.io URL that loads successfully (no HTTP 400 “Canister ID Not Resolved”).

**User-visible outcome:** The app loads on a new working production URL and displays the updated logo in the header, browser tab/favicon, and installed PWA icon (including after cache updates).
