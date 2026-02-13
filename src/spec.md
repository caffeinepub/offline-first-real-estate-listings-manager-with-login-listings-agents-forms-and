# Specification

## Summary
**Goal:** Improve offline workflow by adding customer Category-based filtering, automated buyer–seller matching alerts, button-driven reminder creation, and Excel import/export for locally stored data.

**Planned changes:**
- Update Customer/Buyer form and customer list UI to replace “Need” with a “Category” dropdown, while preserving compatibility with existing records that only have `need`.
- On customer record details, show a “Matching Properties” section that filters property/seller records by the customer’s selected Category and links to each property record.
- Add a dismissible “Matches” section on the Dashboard that automatically finds and persists buyer↔property match alerts based on budget/price category and other comparable fields.
- Change reminder creation so reminder inputs appear only after clicking an “Add Reminder” button, then save via the existing reminder flow and continue triggering the existing due-reminder modal.
- Add Settings actions to Export to Excel and Import from Excel for local offline data (at minimum records and agents; include other local stores if present such as reminders and deals), with validation and user-visible English error messages.

**User-visible outcome:** Users can categorize customers, see category-matched properties per customer, view and dismiss automatic buyer–seller match alerts on the dashboard, create reminders via an “Add Reminder” button flow, and import/export their offline data using Excel files.
