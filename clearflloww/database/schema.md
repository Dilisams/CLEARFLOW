# ClearFlow Enugu Database Schema

The static site runs in localStorage demo mode by default. Add Firebase credentials in `assets/js/firebase-config.js` to store these collections in Firestore.

## `reports`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Reporter name |
| `email` | string | Reporter email |
| `phone` | string | Reporter phone |
| `location` | string | Community, street, LGA, or landmark |
| `category` | string | Water or sanitation issue type |
| `severity` | string | Low, Medium, High, Critical |
| `description` | string | Field report narrative |
| `lat` / `lng` | number | GPS coordinates |
| `status` | string | Open, In Progress, Resolved |
| `createdAt` | timestamp/string | Submission time |

## `users`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | User profile name |
| `email` | string | Firebase Auth email |
| `role` | string | Admin, Responder, Reporter |
| `createdAt` | timestamp | Account creation time |

## `waterData`

Tracks pH, turbidity, pressure, borehole uptime, water station status, leakage risk, and contamination prediction.

## `sanitationData`

Tracks drainage blockages, waste hotspots, sewage reports, public toilet access, hygiene observations, flood-risk scores, and disease-risk indicators.
