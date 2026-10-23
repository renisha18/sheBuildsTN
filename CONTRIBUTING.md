# Contributing to SheBuilds Tamil Nadu

Thanks for your interest in contributing! SheBuilds is a community for women in tech across Tamil Nadu. Whether you're writing a blog, fixing a bug or improving the docs, every contribution matters.

Nothing goes live directly: every change is reviewed by the SheBuilds team before it's merged.

## 🎯 Quick Start

1. Fork the repo on GitHub.
2. Clone your fork:
   ```sh
   git clone https://github.com/your-username/sheBuildsTN.git
   cd sheBuildsTN
   ```
3. Create a branch:
   ```sh
   git checkout -b blog/your-title
   ```
4. Install dependencies:
   ```sh
   npm install
   ```

Don't use git? Jump to [Option B](#option-b-no-git-do-it-in-the-browser) below, everything works in the browser.

<a id="writing-a-blog"></a>
## ✍️ Writing a Blog (Most Common Contribution)

We publish stories from women across Tamil Nadu on tech, careers, marketing and business, design, work-life balance and community. You don't need to be an engineer: if your story helps women build, we'd love to read it. 500 to 1500 words is a good length. Original work only.

### Step 1: Create your post file

- Posts live in `src/content/blogs/`, one Markdown file per post.
- Copy the template:
  ```sh
  cp src/content/blogs/_TEMPLATE.md src/content/blogs/your-title.md
  ```
- File name rules:
  - Lowercase letters, numbers and single hyphens only, e.g. `my-first-hackathon.md`.
  - The name becomes the post's address: `your-title.md` → `/blogs/your-title`.
  - `all` is reserved, so `all.md` won't work.
  - Don't start it with `_` (those files are ignored by the site).

### Step 2: Fill in the template

The top of the file holds the fields, between two `---` lines. Your story goes below them. Here's a complete example:

```markdown
---
title: How I organised my first community meetup
author: Meena Raghavan
date: 2026-11-14
category: Community Stories
excerpt: From an empty room booking to forty chairs filled: what I planned, what went wrong and what I'd do again.
# authorLink: https://www.linkedin.com/in/your-profile
# readTime: 5 min
# cover: first-community-meetup.jpg
# coverAlt: A small group of women chatting around a table with laptops
---
I had been to plenty of meetups, but I had never organised one. When a friend offered a free room for a Saturday afternoon, I said yes before I had a plan.

## Start small

I kept the first event simple: one short talk, time to chat and a shared snack table. A few things made the biggest difference:

- A clear start and end time
- A friendly welcome at the door
- One question on every name tag to start conversations

The **most useful** thing was asking two friends to help on the day. If you want to try this yourself, the [SheBuilds Instagram](https://www.instagram.com/shebuilds_chennai) shares what is coming up next.
```

**Field Requirements**

| Field | Required? | Rule | Example |
| --- | --- | --- | --- |
| `title` | Required | Up to 90 characters | `How I organised my first community meetup` |
| `author` | Required | Your name, up to 60 characters | `Meena Raghavan` |
| `date` | Required | `YYYY-MM-DD`, a real date. The date you'd like it published; the team may adjust it | `2026-11-14` |
| `category` | Required | Exactly one of: `Engineering`, `AI & Data`, `Design`, `Marketing & Business`, `Career Growth`, `Work-Life Balance`, `Community Stories` | `Community Stories` |
| `excerpt` | Required | One or two sentences shown on the card, up to 180 characters | `From an empty room booking to...` |
| `authorLink` | Optional | A full `https://` link (http and other links are rejected) | `https://www.linkedin.com/in/your-profile` |
| `readTime` | Optional | Like `5 min`. Leave it out and it's worked out for you (200 words a minute) | `5 min` |
| `cover` | Optional | The exact file name of an image in `src/content/blogs/images/` (see Step 3) | `first-community-meetup.jpg` |
| `coverAlt` | Optional | Describes the cover for screen reader users, up to 120 characters | `A small group of women chatting...` |
| `featured` | Team only | Chosen by the team. Please don't set it | |
| `placeholder` | Sample content only | Marks the sample posts. Please don't set it | |

One `key: value` per line, each value on a single line. Quotes around values are optional. Lines starting with `#` are ignored, so you can leave the optional fields commented out. Unknown keys are rejected, so typos like `catagory` fail the check.

**Writing Syntax**

Supported:
- Paragraphs: leave an empty line between them.
- Headings: `## Heading` and `### Smaller heading`.
- Lists: start each line with `- `.
- `**bold**`, `*italic*` and `[link text](https://example.com)`.

Not supported (yet):
- Images inside the story (use a cover image instead).
- Code blocks.
- Raw HTML: it shows up as plain text.

Your story (everything below the second `---`) must be 80 to 3000 words.

### Step 3: Add a cover image (optional)

1. Put a `.jpg`, `.png` or `.webp` file in `src/content/blogs/images/`.
2. Set `cover` to its exact file name, e.g. `cover: first-community-meetup.jpg`.
3. Add `coverAlt` describing the image.

Keep it under 300 KB and about 1200 px wide (files over 1 MB fail the check). Only use images you made or have the right to use. No cover? The post gets the default pattern header.

### Step 4: Validate your post

```sh
npm run check:blogs
npm run dev
```

Then open http://localhost:5173/blogs/your-title (use the port Vite prints if it's different).

- [ ] The checker passes with no errors
- [ ] The post looks right on its page and on its card
- [ ] Category is one of the seven
- [ ] All links open correctly
- [ ] It's your own writing, or you have permission to share it
- [ ] No private information about other people
- [ ] You didn't set `featured`

### Step 5: Submit your changes

Commit using [Conventional Commits](https://www.conventionalcommits.org/):

```sh
git add src/content/blogs/your-title.md
# and your cover image, if you added one:
git add src/content/blogs/images/your-title.jpg
git commit -m 'feat(blog): add "Your Post Title"'
git push origin blog/your-title
```

**Commit Message Guidelines**

| Type | Use it for | Example |
| --- | --- | --- |
| `feat` | A new post or feature | `feat(blog): add "Finding my first mentor"` |
| `fix` | A correction | `fix(blog): correct date in "Your Post Title"` |
| `docs` | Documentation changes | `docs: clarify cover image size` |
| `refactor` | Code changes that don't change behaviour | `refactor: simplify blog card` |
| `chore` | Maintenance | `chore: update dependencies` |

Please use only these types.

**Create a Pull Request**

Open a pull request from your branch to `main` on GitHub. Write the title in conventional commit format, e.g. `feat(blog): add "Your Post Title"`. The description form has a checklist: tick each box.

### Option B: No git? Do it in the browser

1. Open the [template](https://github.com/renisha18/sheBuildsTN/blob/main/src/content/blogs/_TEMPLATE.md), copy its contents and fill it in with any text editor. Save it as `your-title.md` (following the file name rules in Step 1).
2. Sign in to GitHub, open the [`src/content/blogs` folder](https://github.com/renisha18/sheBuildsTN/tree/main/src/content/blogs), click **Add file** → **Upload files** and drop your file in.
3. Choose **Create a new branch for this commit and start a pull request** (GitHub may call it **Propose changes**), then click **Create pull request**. GitHub makes the fork for you.
4. Skip the cover image here. Say in your pull request that you have one, and the team will add it.

### Option C: Prefer email?

Send your draft to [team@shebuildschennai.in](mailto:team@shebuildschennai.in).

### What happens next

Someone from the SheBuilds team reviews your pull request, may suggest edits or ask for changes, and merges it. Your post appears on the site after the merge deploys. Submission doesn't guarantee publication. To fix or remove a published post, open another pull request.

<!-- Maintainers: have someone confirm the permission wording in the checklist. -->

## 🐛 Reporting Bugs

First check the [existing issues](https://github.com/renisha18/sheBuildsTN/issues) to see if it's already reported. If not, open a new issue with:

- A clear title
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots, if you can
- Your device and browser

## 💡 Feature Requests

Open an [issue](https://github.com/renisha18/sheBuildsTN/issues) with:

- A clear title
- A detailed description
- Use cases: who it helps and how
- Implementation ideas, if you have any

## 💻 Development Setup

You'll need Node 20 or newer.

```sh
npm install          # install dependencies
npm run dev          # start the dev server
npm run build        # production build
npm run lint         # lint the code
npm run check:blogs  # check every blog post
```

Development guidelines:

- Follow the existing code style.
- Use conventional commits.
- Keep changes small and focused.
- Test locally before opening a pull request.

## 🤝 Community Guidelines

- Be kind and respectful.
- No hate or discrimination.
- No spam or hard selling.
- Credit your sources.
- Help others.

## 📝 Your Writing

You keep ownership of your writing. By opening a pull request you give SheBuilds permission to publish it on the website with your name.
