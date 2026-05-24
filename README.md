# Achyutam Sharma — Portfolio

This repository contains the React portfolio application inside `react-src/`. The site is built with **React + Vite** and styled using modern CSS utilities.

> Cleaned project files: removed non-essential generated and legacy files such as top-level `achyutam-portfolio.html`, root `node_modules`, and `react-src/dist`.

## Tech Stack

- **Frontend** — React 19, Vite 8
- **Styling** — Tailwind CSS utilities in `styles.css`
- **Backend** — Express.js contact API in `server.js`
- **Fonts** — JetBrains Mono, Space Grotesk via Google Fonts

## Project Structure

```
react-src/
├── src/
│   ├── components/
│   │   ├── About.jsx          # Bio + info highlight cards
│   │   ├── AdminPanel.jsx     # Browser-based admin editor
│   │   ├── ChatbotWidget.jsx  # Floating AI chatbot widget
│   │   ├── Contact.jsx        # Contact form and social links
│   │   ├── Education.jsx      # Education timeline + resume buttons
│   │   ├── Footer.jsx         # Footer section
│   │   ├── Header.jsx         # Navigation bar
│   │   ├── Hero.jsx           # Landing hero section
│   │   ├── Projects.jsx       # Project portfolio cards
│   │   └── Skills.jsx         # Skill progress bars
│   ├── data.js                # Editable portfolio content
│   ├── index.css              # Global base styles
│   ├── styles.css             # Utility CSS classes
│   ├── App.jsx                # Root application component
│   └── main.jsx               # Vite entry point
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── server.js                  # Express server for contact form
├── .env                       # Optional environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── vite.config.js
```

## Getting Started

Open a terminal in `react-src/` and run:

```bash
npm install
npm run dev
```

Then visit `http://localhost:5173` in your browser.

To build and run the production bundle:

```bash
npm run build
npm start
```

## Customize Portfolio Content

Update `src/data.js` to change the portfolio content.

- `profile` — personal info, titles, contact URLs, resume settings
- `projects` — featured project cards
- `skills` — technology and tool proficiency
- `education` — academic timeline items

Example:

```js
export const portfolioData = {
  profile: {
    name: 'Your Name',
    title: 'Your Title',
    email: 'you@example.com',
    linkedin: 'https://linkedin.com/in/...',
    github: 'https://github.com/...',
  },
  projects: [ /* ... */ ],
  skills: [ /* ... */ ],
  education: [ /* ... */ ],
};
```

## Resume Upload

The admin panel supports uploading a resume PDF. Uploaded data is stored in browser local storage, and the Education section will reflect the latest uploaded resume.

## Contact Form

The contact form submits to `/api/contact` and is handled by `server.js`.

## Notes

- `react-src/dist/` is a generated build folder and is not included in this cleaned version.
- If dependencies are removed, reinstall from `react-src/` with `npm install`.
