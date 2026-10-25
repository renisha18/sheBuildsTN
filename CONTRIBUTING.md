# Contributing to SheBuilds Tamil Nadu

This website is built by the community. Chapters add their own events (and blogs)
themselves, through a **pull request**: you copy a small template, fill it in, and
propose it. A reviewer checks it and the site updates. **You don't need to know how
to code.**

If you've never done this before, the "no terminal" way below takes about 10 minutes.

Fixing a bug or improving the docs counts too: see [Reporting bugs](#reporting-bugs),
[Feature requests](#feature-requests) and [Development setup](#development-setup).

## Before you start

- A free [GitHub](https://github.com) account.
- The details of your event.
- **A link to the Instagram or LinkedIn post about it** (required for past events,
  so reviewers can check the details).

---

## Add an event

For chapters adding an event (past or upcoming) to the website: no coding needed.
The full step-by-step guide, template and tag rules are in
[docs/add-event.md](https://github.com/renisha18/sheBuildsTN/blob/main/docs/add-event.md).

---

## Add a blog

<a id="writing-a-blog"></a>

We publish stories from women across Tamil Nadu on tech, careers, marketing and business,
design, work-life balance and community. You don't need to be an engineer. Original work only
(or with the author's permission); 500 to 1500 words is a good length.

Each blog is **one Markdown file** in `src/content/blogs/`. The file name becomes the post's
address: `my-first-hackathon.md` is shown at `/blogs/my-first-hackathon`.

### The no-terminal way

1. On the repository page, open the folder `src/content/blogs/`.
2. Click **Add file → Create new file**.
3. Name it `your-title.md`: lowercase letters, numbers and single hyphens only, for
   example `my-first-hackathon.md`. Don't start it with `_` (those files are ignored), and
   don't use `all.md` (that name is taken).
4. Copy the template below into the file, fill in the fields, and write your story under the
   second `---` line.
5. (Optional) For a cover image, open `src/content/blogs/images/`, click **Add file → Upload
   files**, and upload it (see Cover image below).
6. Click **Commit changes…**, choose **Propose changes**. (GitHub makes your own copy and a
   branch for you.)
7. Click **Create pull request**. Give it the title `Add: <Blog title> (<Your name>)`.
8. Wait about a minute for the automatic check (a green tick or a red cross, with a message
   saying what to fix). Then a reviewer will look at it.

**Prefer to write offline?** Copy the
[template](https://github.com/renisha18/sheBuildsTN/blob/main/src/content/blogs/_TEMPLATE.md)
into any text editor, fill it in and save it as `your-title.md` (same file name rules). Then in
`src/content/blogs/` click **Add file → Upload files**, drop your file in, choose **Propose
changes** (or **Create a new branch for this commit and start a pull request**) and click
**Create pull request**. If adding a cover image in the browser is a hassle, skip it: say in
your pull request that you have one, and the team will add it.

### The template

This is the same as `src/content/blogs/_TEMPLATE.md`:

```markdown
---
title: Your title here (up to 90 characters)
author: Your Name
date: 2026-01-31
category: Community Stories
excerpt: One or two sentences that make people want to read your story (up to 180 characters).
# Optional fields: remove the "# " at the start of a line to use it.
# authorLink: https://www.linkedin.com/in/your-profile
# readTime: 6 min
# cover: your-title.jpg
# coverAlt: A short description of the cover image
---
Write your story here, in plain paragraphs with an empty line between them.
```

| Field | Required? | What to put |
|---|---|---|
| `title` | Required | The title, up to 90 characters. |
| `author` | Required | Your name, up to 60 characters. |
| `date` | Required | `YYYY-MM-DD`, a real date: the day you'd like it published (the team may adjust it). |
| `category` | Required | Exactly one of `Engineering`, `AI & Data`, `Design`, `Marketing & Business`, `Career Growth`, `Work-Life Balance`, `Community Stories`. |
| `excerpt` | Required | One or two sentences shown on the card, up to 180 characters. |
| `authorLink` | Optional | A full `https://` link to your profile. |
| `readTime` | Optional | Like `6 min`. Leave it out and it's worked out for you (200 words a minute). |
| `cover` | Optional | The exact file name of an image in `src/content/blogs/images/`, for example `my-first-hackathon.jpg`. |
| `coverAlt` | Optional | Describes the cover for people using screen readers, up to 120 characters. |

One `key: value` per line, each value on one line. Lines starting with `#` are ignored, so the
optional fields can stay commented out. Unknown fields are rejected, so a typo like
`catagory` fails the check. Don't add `placeholder`: it only marks the sample posts.

**Writing your story:** paragraphs separated by an empty line; `## Heading` and
`### Smaller heading`; lists with `- ` at the start of each line; `**bold**`, `*italic*` and
`[link text](https://example.com)`. Images inside the story, code blocks and HTML aren't
supported yet. The story must be 80 to 3000 words.

### Cover image (optional)

A `.jpg`, `.png` or `.webp` file in `src/content/blogs/images/`, about 1200 pixels wide and
under 300 KB (files over 1 MB fail the check). Set `cover` to its exact file name and add
`coverAlt`. Only use pictures you made or have the right to share. No cover? The post gets the
default pattern header.

### The terminal way

```bash
git clone https://github.com/renisha18/sheBuildsTN.git
cd sheBuildsTN
git switch -c add-blog/your-title
npm install
cp src/content/blogs/_TEMPLATE.md src/content/blogs/your-title.md
# fill it in, then:
npm run check:blogs
git add src/content/blogs
git commit -m "Add: Your Blog Title (Your Name)"
git push -u origin add-blog/your-title
```

If you're not a member of the repository, fork it first, then clone your fork.

To preview it on your computer (terminal way), run `npm run dev` and open
http://localhost:5173/blogs/your-title (use the port Vite prints if it's different).

### Before you submit a blog

- [ ] The automatic check (or `npm run check:blogs`) passes with no errors
- [ ] The post looks right on its page and on its card
- [ ] The category is one of the seven
- [ ] All links open correctly
- [ ] It's your own writing, or you have permission to share it
- [ ] No private information about other people

<!-- Maintainers: have someone confirm the permission wording in the checklist. -->

No GitHub account? Email your draft to [team@shebuildschennai.in](mailto:team@shebuildschennai.in).

### Your writing

You keep ownership of your writing. By opening a pull request you give SheBuilds permission to
publish it on the website with your name.

---

## What happens after you open a pull request

1. **An automatic check runs** (about a minute). It rejects bad dates, unknown tags or
   formats, `collaborated` without partners, links that aren't `https://` and so on, and
   warns about a past event with no `postUrl`. Read the message and fix it by adding more
   changes to the same pull request.
2. **A reviewer reads it.** First-time contributors may wait a little for the check to
   be approved to run: that's normal.
3. **It's merged** by a maintainer, who may first suggest edits or ask for changes. Nobody can
   change the live site directly, and submitting doesn't guarantee publication.
4. **The site updates by itself** a minute or two later. To fix or remove something that's
   already published, open another pull request.

## Rules

- Events must be in Tamil Nadu and must really have happened (or be really planned).
- Every past event needs a `postUrl` so a reviewer can check it.
- Tag only what the source supports. When unsure, leave it off.
- No phone numbers, emails or other personal contact details in any file.
- One event per file. Don't edit other chapters' files.
- Be respectful. Pull requests that don't follow these rules will be asked to change.

## Community guidelines

- Be kind and respectful.
- No hate or discrimination.
- No spam or hard selling.
- Credit your sources.
- Help others.

## Commit messages

Event and blog pull requests use the title `Add: <name> (<Chapter or your name>)`, as above.
For commit messages, and for pull requests that change code or docs, use
[Conventional Commits](https://www.conventionalcommits.org/):

| Type | Use it for | Example |
| --- | --- | --- |
| `feat` | A new post or feature | `feat(blog): add "Finding my first mentor"` |
| `fix` | A correction | `fix(blog): correct date in "Your Post Title"` |
| `docs` | Documentation changes | `docs: clarify cover image size` |
| `refactor` | Code changes that don't change behaviour | `refactor: simplify blog card` |
| `chore` | Maintenance | `chore: update dependencies` |

Please use only these types.

## For reviewers: a quick checklist

- [ ] The file is named correctly and the automatic check is green.
- [ ] The `postUrl` opens and matches the title, date and venue.
- [ ] Every tag is supported by the post (`women-only` is the one to check hardest).
- [ ] `collaborated` lists real co-organisers, not sponsors.
- [ ] No invented numbers, no personal contact details, and the image is allowed.

## Reporting bugs

First check the [existing issues](https://github.com/renisha18/sheBuildsTN/issues) to see if
it's already reported. If not, open a new issue with:

- A clear title
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots, if you can
- Your device and browser

## Feature requests

Open an [issue](https://github.com/renisha18/sheBuildsTN/issues) with:

- A clear title
- A detailed description
- Use cases: who it helps and how
- Implementation ideas, if you have any

## Development setup

You'll need Node 20 or newer.

```sh
npm install              # install dependencies
npm run dev              # start the dev server
npm run build            # production build (checks the event files first)
npm run lint             # lint the code
npm run check:blogs      # check every blog post
npm run validate:events  # check every event file
```

Development guidelines:

- Follow the existing code style.
- Use conventional commits (see [Commit messages](#commit-messages)).
- Keep changes small and focused.
- Test locally before opening a pull request.

## Need help?

Open an issue on GitHub, or message your chapter lead.
