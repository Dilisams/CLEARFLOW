# ClearFlow Enugu

Smart Water & Sanitation Intelligence for Sustainable Communities.

This is an HTML-first civic-tech website for the Enugu Water Sustainability Summit - World Water Day 2026 Innovation Challenge. It addresses water access, borehole failure, leakages, contamination, poor distribution, blocked drainage, waste management, sewage overflow, flooding, hygiene risk, and disease-risk monitoring.

## Pages

- `index.html` - animated premium home page
- `problem.html` - water and sanitation challenge analysis
- `solution.html` - workflow, architecture, and AI simulation
- `dashboard.html` - admin dashboard with Chart.js, reports table, status updates, auth demo, and CSV export
- `map.html` - Leaflet GIS map with category, severity, and region filters
- `report.html` - functional water and sanitation reporting form with GPS capture
- `impact.html` - animated impact metrics, roadmap, and SDG alignment
- `team.html` - premium team/advisor layout
- `contact.html` - EmailJS-ready partnership/contact form
- `about.html`, `sanitation.html`, `reporting.html` - compatibility aliases for the requested structure

## Features

- HTML5, CSS3, vanilla JavaScript
- Responsive design with dark/light mode
- Accessibility basics: skip link, labels, semantic landmarks, reduced-motion support
- Chart.js analytics
- Leaflet map for Enugu WASH assets and incidents
- Firebase Auth and Firestore integration hooks
- localStorage demo mode when Firebase is not configured
- EmailJS integration hook for contact form
- AI simulation for contamination, leakage, flood, and hygiene-risk scoring
- Admin report status workflow and CSV export

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Create a Firestore database.
4. Copy your Firebase web app config into `assets/js/firebase-config.js`.
5. Deploy the Firestore rules in `backend/firebase.rules`.

When configured, reports are written to Firestore. Without credentials, the site uses localStorage so judges can test immediately.

## EmailJS Setup

1. Create an EmailJS account and email service.
2. Create a template with fields matching `from_name`, `reply_to`, `organization`, `request_type`, and `message`.
3. Add the public key, service ID, and template ID in `assets/js/firebase-config.js`.

## Local Run

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deployment

This project is static and can be deployed to Firebase Hosting, Netlify, Vercel static hosting, GitHub Pages, or any conventional web server.

For Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Use the project root as the public directory and keep it as a single-page rewrite disabled, because this is a multi-page HTML site.
