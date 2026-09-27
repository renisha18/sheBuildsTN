# SheBuilds Tamil Nadu

Official website for **SheBuilds Tamil Nadu** — a community creating spaces, opportunities, and connections for women interested in technology and building.

## ✨ About

SheBuilds Tamil Nadu is a community-driven initiative focused on bringing together women in technology through events, learning, collaboration, and community.

This repository contains the source code for the SheBuilds Tamil Nadu website.

## 🛠️ Tech Stack

- **React** — UI development
- **Vite** — Development and build tooling
- **JavaScript** — Application logic
- **CSS** — Styling and responsive design

## 📁 Project Structure

```text
src/
├── assets/                 # Images and static assets
│
├── components/            # Reusable UI components
│   ├── Layout.jsx
│   └── Navbar.jsx
│
├── pages/                 # Page-level components
│   ├── Home.jsx
│   ├── About.jsx
│   └── ComingSoon.jsx
│
├── sections/              # Individual sections of pages
│   ├── home/
│   │   └── Hero.jsx
│   │
│   └── about/
│       ├── AboutImage.jsx
│       ├── AboutIntro.jsx
│       └── Journey.jsx
│
├── App.jsx                # Application entry component
├── index.css              # Global styles
└── main.jsx               # Application entry point

public/                    # Public static files
index.html                 # HTML entry point
vite.config.js             # Vite configuration
package.json               # Dependencies and scripts