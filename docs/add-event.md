# Add an event

Every SheBuilds event on the website is **one small file**. You add yours with a pull
request: copy the template, fill it in, propose it. A reviewer checks it and the site
updates by itself. **You don't need to know how to code**, and it takes about 10 minutes.

> Adding a blog instead? See [Add a blog](../CONTRIBUTING.md#add-a-blog).
> Everything else (reporting a bug, the rules for the community):
> [CONTRIBUTING.md](../CONTRIBUTING.md).

## Before you start

- A free [GitHub](https://github.com) account.
- Your event's details: name, date, place, a one-line description.
- **A link to the Instagram or LinkedIn post about it.** For an event that has already
  happened, this is how a reviewer checks the details.

## Steps (no terminal)

1. On the repository page, open the folder `src/data/events/`.
2. Click **Add file → Create new file**.
3. Name it `YYYY-MM-DD-short-name.json`, for example `2026-11-15-your-event-name.json`.
   If you only know the month, use `YYYY-MM-short-name.json`.
4. Copy [the template](#the-template) into the file and fill it in.
5. Click **Commit changes…** and choose **Propose changes**. (GitHub makes your own copy
   and a branch for you.)
6. Click **Create pull request**. Give it the title `Add: <Event name> (<Chapter>)`.
7. Wait about a minute for the automatic check. A green tick means it passed. A red
   cross comes with a message saying what to fix: change the file and the same pull
   request updates. Then a reviewer will look at it.

## Steps (terminal)

```bash
git clone https://github.com/renisha18/sheBuildsTN.git
cd sheBuildsTN
git switch -c add-event/your-event-name
npm install
# create src/data/events/2026-11-15-your-event-name.json from the template, then:
npm run validate:events
git add src public
git commit -m "Add: Your Event Name (Your Chapter)"
git push -u origin add-event/your-event-name
```

If you aren't a member of the repository, fork it first and clone your fork. Open the
pull request from GitHub with the title `Add: <Event name> (<Chapter>)`.
`npm run validate:events` shows the same messages as the automatic check.

## The template

Copy this. The same file is in the repository as
[`_TEMPLATE.json.example`](../src/data/events/_TEMPLATE.json.example).

```json
{
  "title": "Your event name",
  "format": "Workshop",
  "tags": ["tech-skills"],
  "description": "One or two sentences about what happened at the event.",
  "start": "2026-11-15",
  "end": null,
  "venue": "Venue name, City",
  "chapter": "SheBuilds Chennai",
  "partners": [],
  "attendees": null,
  "featured": false,
  "image": null,
  "registerUrl": null,
  "postUrl": "https://www.instagram.com/p/XXXXXXXX/"
}
```

## What each field means

| Field | Required? | What to put |
|---|---|---|
| `title` | Yes | The event name, up to 80 characters. |
| `description` | Yes | One or two sentences, up to 240 characters. Over 160 characters may be cut off on the card. |
| `tags` | Yes | At least one tag (see [Tags](#tags)), each listed once. |
| `start` | No, but add it | `"2026-11-15"` (a day), `"2026-11"` (month only) or `"2026-11-15T10:00:00+05:30"` (day and time). Without it the card shows "TBA". Don't guess a day. |
| `end` | No | Same formats, and not before `start`. It can't be set without a `start`. Usually `null`. |
| `format` | No | One of `Conference`, `Workshop`, `Hackathon`, `Speaker Night`, `Meetup`. A small label on the card. |
| `venue` | No | Where it was held, or `null`. |
| `chapter` | No | Your chapter's name, written the same way every time, or `null`. |
| `partners` | When tagged `collaborated` | The communities, companies or colleges that **co-organised** it, for example `["GDG Chennai"]`. At least one is needed with the `collaborated` tag. Otherwise `[]`. |
| `attendees` | No | A whole number without quotes, only if you know it. Otherwise `null`. |
| `featured` | No | `true` only for a highlight. Otherwise `false` (no quotes). |
| `image` | No | `null`, or `"/events/your-file.webp"` (`.webp`, `.jpg` or `.png`). The file must exist in `public/events/` (see [Images](#images)). |
| `registerUrl` | No | The registration page for an **upcoming** event, or `null`. Must start with `https://`. |
| `postUrl` | For past events | The Instagram or LinkedIn post about the event. Must start with `https://`. The automatic check warns if a past event has none, and reviewers will ask for it. |

If something is unknown, use `null`. **Never invent a number or a date.** Only these fields are
allowed: a misspelled or extra field fails the check.

## Tags

Pick every tag that applies, **only if your post or page supports it**. When unsure,
leave it off.

| Tag | Use it when | Don't use it when |
|---|---|---|
| `women-only` | Attendance is limited to women. | Women only led, spoke or organised it. |
| `entrepreneurship` | The focus is startups, founders, pitching or business. | A founder merely spoke at a general tech event. |
| `collaborated` | Another community, company or college **co-organised** it. List them in `partners`. | A company only sponsored it or lent a venue. |
| `tech-skills` | Hands-on learning, build sprints, hackathons. | The point was meeting people. |
| `community` | Meetups, conferences, networking. | It was a hands-on workshop. |

`women-only` is the tag reviewers check hardest: a wrong label tells people who may
attend the wrong thing.

## Links: which one do I use?

- **Upcoming event:** `registerUrl`, the page where people sign up. The card shows a
  **Register** button.
- **Past event:** `postUrl`, the Instagram or LinkedIn post. The card shows a
  **View post** button.
- **Upcoming event with only a `postUrl`:** the card shows **View post**.
- **No link:** the card shows no button at all. That's fine for an upcoming event whose
  registration isn't open yet. A past event with only a `registerUrl` also shows no button,
  so add its `postUrl`.

## Images

Optional. Upload a WebP file to `public/events/` (**Add file → Upload files**), about
1200 × 600 pixels and under 200 KB (the check warns above that). `.jpg` and `.png` also work. Then set `"image": "/events/your-file.webp"`.
The automatic check fails if the file isn't there. Only use pictures you have the right
to share, and take care with photos of people.

## Before you submit

- [ ] The file is in `src/data/events/` and named `YYYY-MM-DD-short-name.json`
- [ ] The event is in Tamil Nadu and `chapter` is filled in
- [ ] There's at least one tag, and the post supports every tag
- [ ] `collaborated` is used only with `partners` listed (co-organisers, not sponsors)
- [ ] A past event has `postUrl`, and the link opens
- [ ] I didn't guess any date or number (unknown = `null`)
- [ ] No phone numbers, emails or other personal contact details in the file

## What happens next

1. **An automatic check runs** (about a minute) and shows a green tick or a message.
2. **A reviewer reads it.** First-time contributors' checks may wait for a maintainer to
   approve them to run: that's normal. Reviewers may ask for changes.
3. **It's merged** by a maintainer. Nobody can change the live site directly.
4. **The site updates by itself** a minute or two later.

## Common mistakes the check will catch

| Message says | What to do |
|---|---|
| No tags, or an unknown tag | Use only the five tags above, spelled exactly. |
| `collaborated` without partners | Add the co-organisers to `partners`, or remove the tag. |
| A link isn't `https://` | Copy the full link, starting with `https://`. |
| `end` is before `start`, or set without one | Fix the dates, or set `end` to `null`. |
| The image file isn't found | Upload it to `public/events/` and match the name exactly. |
| Old field `category` | Rename it to `format`. |
| Unknown field | Check the spelling against [What each field means](#what-each-field-means). |
| A tag is listed twice | List each tag once. |
| The title or description is too long | Keep the title to 80 characters and the description to 240. |
| The file name | Use only lowercase letters, numbers and hyphens, ending in `.json`. |
| `"format"` isn't one of the five | Use `Conference`, `Workshop`, `Hackathon`, `Speaker Night` or `Meetup`, spelled exactly. |
| A comma or quote is wrong | JSON is strict: every line but the last in a block ends with a comma, and text is in double quotes. |

## Need help?

Open an issue on GitHub, or message your chapter lead.
