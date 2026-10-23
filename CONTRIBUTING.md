# Contributing to SheBuilds Tamil Nadu

Thanks for helping! This guide covers writing a blog for the website.

## Writing a blog

<!-- Maintainers: have someone confirm the permission wording in the checklist. -->

Every blog post is one Markdown file in `src/content/blogs/`. You add yours with a pull request, a maintainer reviews it, and it appears on the site after the next deploy.

### 1. What we publish

Stories from women across Tamil Nadu about tech, careers, marketing and business, design, work-life balance and community. You don't need to be an engineer: if your story helps women build, we'd love to read it.

- 500 to 1500 words is a good length (the minimum is 80, the maximum 3000).
- Original work only: write it yourself, or have permission to share it.

### 2. Quick start (with git)

1. Fork this repository on GitHub.
2. Clone your fork:
   ```sh
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
3. Create a branch:
   ```sh
   git checkout -b blog/your-title
   ```
4. Copy the template. The file name becomes the web address, so keep it short:
   ```sh
   cp src/content/blogs/_TEMPLATE.md src/content/blogs/your-title.md
   ```
5. Write your story in the new file.
6. Check it (needs Node.js; no install step required):
   ```sh
   npm run check:blogs
   ```
7. Commit and push:
   ```sh
   git add src/content/blogs
   git commit -m 'feat: add blog "Your title"'
   git push origin blog/your-title
   ```
8. Open a pull request from your branch on GitHub.

### 3. No git? Use the browser

1. Open the `src/content/blogs` folder on GitHub.
2. Click **Add file** → **Create new file**.
3. Name it `your-title.md` (lowercase letters, numbers and hyphens only).
4. Open `_TEMPLATE.md` in another tab, copy everything, paste it into your new file and fill it in.
5. Click **Commit changes** (GitHub may call it **Propose new file**).
6. Click **Create pull request**. GitHub makes the fork for you.

Skip the cover image on this route; a maintainer can add one later.

### 4. Field reference

The top of your file holds the fields between two `---` lines, one `key: value` per line. Lines starting with `#` are ignored, and you can put quotes around a value if you like.

| Field | Required? | Rules |
| --- | --- | --- |
| `title` | Required | Up to 90 characters |
| `author` | Required | Your name, up to 60 characters |
| `date` | Required | `YYYY-MM-DD`, e.g. `2026-10-26` |
| `category` | Required | Exactly one of: Engineering, AI & Data, Design, Marketing & Business, Career Growth, Work-Life Balance, Community Stories |
| `excerpt` | Required | One or two sentences, up to 180 characters |
| `authorLink` | Optional | A full `https://` link, e.g. your LinkedIn |
| `readTime` | Optional | Like `6 min`. Worked out for you if left out |
| `cover` | Optional | File name of an image in `src/content/blogs/images/` |
| `coverAlt` | Optional | Describes the cover image, up to 120 characters |
| `featured` | Maintainers only | Please don't set this |

Misspelled field names (like `catagory`) are reported as errors.

The file name is the web address: `my-first-hackathon.md` becomes `/blogs/my-first-hackathon`. Use lowercase letters, numbers and single hyphens. `all` is reserved, and names starting with `_` are ignored.

**Supported writing syntax**

- Paragraphs: leave an empty line between them.
- `## Heading` and `### Smaller heading`.
- Lists: start each line with `- `.
- `**bold**`, `*italic*` and `[link text](https://example.com)`.

**Not supported (yet):** images or code blocks inside the story, `# ` headings (your title is the main heading), numbered lists, tables and HTML. HTML shows up as plain text.

### 5. Cover images (optional)

- Add a `.jpg`, `.png` or `.webp` file to `src/content/blogs/images/` and set `cover` to its file name, e.g. `cover: your-title.jpg`.
- Keep it under 300 KB and about 1200 px wide (files over 1 MB fail the check).
- Only use images you made or have the right to use.
- Describe it in `coverAlt` for people using screen readers.

### 6. Pull request checklist

Copy this into your pull request description:

```md
- [ ] I wrote this myself or have permission to share it
- [ ] I'm happy for SheBuilds to publish it on the website with my name
- [ ] No private information about other people
- [ ] `npm run check:blogs` passes (or I used the browser route)
- [ ] I did not set `featured`
```

### 7. Guidelines

- Be kind and respectful.
- No hate or discrimination.
- No hard selling or spam.
- Credit your sources.

Maintainers may suggest edits or decline a post. Submitting doesn't guarantee publication.

### 8. What happens next

A maintainer reviews your pull request, may ask for changes, and then merges it. Your post appears once the site is redeployed. To fix or remove a published post, open another pull request.

### 9. Prefer not to use GitHub?

Email your draft to [team@shebuildschennai.in](mailto:team@shebuildschennai.in) and we'll take it from there.
