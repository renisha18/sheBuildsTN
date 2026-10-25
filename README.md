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
```

## ✍️ Write for SheBuilds

We publish stories from women across Tamil Nadu on tech, careers, marketing and business, design, work-life balance and community.
Every post is a Markdown file in `src/content/blogs/`, added through a pull request and reviewed by the team before it goes live.
Read the guide: [Add a blog](CONTRIBUTING.md#add-a-blog).
No GitHub account? Email your draft to [team@shebuildschennai.in](mailto:team@shebuildschennai.in).

## 🤝 Contributing

Chapters add their own events and blogs through pull requests, no coding needed:

- **Events:** [Add an event](https://github.com/renisha18/sheBuildsTN/blob/main/docs/add-event.md) (`docs/add-event.md`)
- **Blogs:** [Add a blog](CONTRIBUTING.md#add-a-blog)

Everything else (reporting bugs, development setup, the community rules) is in
[CONTRIBUTING.md](CONTRIBUTING.md).
