# Add an event

Every chapter has **one file** with all of its events in it, in the folder
`src/data/chapters/`. You add an event by adding a small block to the top of your chapter's
file, with a pull request. A reviewer checks it and the site updates by itself. **You don't
need to know how to code**, and it takes about 10 minutes.

> **Your college has no file yet?** Register it first: [Add a chapter](add-chapter.md).
> Adding a blog instead? See [Add a blog](../CONTRIBUTING.md#add-a-blog).
> Everything else (reporting a bug, the rules for the community):
> [CONTRIBUTING.md](../CONTRIBUTING.md).

## Before you start

- A free [GitHub](https://github.com) account.
- Your event's details: name, date, place, a one-line description.
- **A link to the Instagram or LinkedIn post about it.** For an event that has already
  happened, this is how a reviewer checks the details.

## Steps (no terminal)

1. On the repository page, open the folder `src/data/chapters/` and click your chapter's
   file, for example `rec-chennai.json`. Only edit your own chapter's file.
2. Click the **pencil** (Edit this file).
3. Add your event at the **top** of the `"events"` list, right after `"events": [`
   (see [Where the new event goes](#where-the-new-event-goes)).
4. Click **Commit changes…** and choose **Propose changes**. (GitHub makes your own copy
   and a branch for you.)
5. Click **Create pull request**. Give it the title `Add: <Event name> (<Chapter>)`.
6. Wait about a minute for the automatic check. A green tick means it passed. A red
   cross comes with a message saying what to fix: change the file and the same pull
   request updates. Then a reviewer will look at it.

## Where the new event goes

New events go at the **top** of the list. Paste your new `{ ... }` block right after
`"events": [`, then a **comma**, then the event that used to be first:

```json
{
  "id": "rec-chennai",
  "college": "Rajalakshmi Engineering College",
  "city": "Chennai",
  "events": [
    {
      "title": "Your new event",
      ...
    },
    {
      "title": "The event that used to be first",
      ...
    }
  ]
}
```

- Every event block ends with `},` **except the last one**, which ends with `}` (no comma).
- If your new event is the **only** event in the list, it has no comma after it.
- `...` above stands for the other fields: copy them from [the event block](#the-event-block).

## Steps (terminal)

```bash
git clone https://github.com/renisha18/sheBuildsTN.git
cd sheBuildsTN
git switch -c add-event/your-event-name
npm install
# add your event at the top of "events" in src/data/chapters/<your-chapter>.json, then:
npm run validate:events
git add src public
git commit -m "Add: Your Event Name (Your Chapter)"
git push -u origin add-event/your-event-name
```

If you aren't a member of the repository, fork it first and clone your fork. Open the
pull request from GitHub with the title `Add: <Event name> (<Chapter>)`.
`npm run validate:events` shows the same messages as the automatic check.

## The event block

Copy this into your chapter's `"events"` list. The whole chapter file, with one event, is in
the repository as
[`_TEMPLATE.chapter.json.example`](../src/data/chapters/_TEMPLATE.chapter.json.example).

```json
{
  "title": "Your event name",
  "format": "Workshop",
  "tags": ["community"],
  "description": "One or two sentences about what happened at the event.",
  "start": "2026-11-15",
  "end": null,
  "venue": "Venue name, City",
  "partners": [],
  "attendees": null,
  "featured": false,
  "image": null,
  "registerUrl": null,
  "postUrl": "https://www.instagram.com/p/XXXXXXXX/"
}
```

There's no `chapter` field: the chapter comes from the file the event is in.

## What each field means

| Field | Required? | What to put |
|---|---|---|
| `title` | Yes | The event name, up to 80 characters. |
| `description` | Yes | One or two sentences, up to 240 characters. Over 160 characters may be cut off on the card. |
| `tags` | No | Tags that apply (see [Tags](#tags)), each listed once. `[]` or left out if none fit. |
| `start` | No, but add it | `"2026-11-15"` (a day), `"2026-11"` (month only) or `"2026-11-15T10:00:00+05:30"` (day and time). Without it the card shows "TBA". Don't guess a day. |
| `end` | No | Same formats, and not before `start`. It can't be set without a `start`. Usually `null`. |
| `format` | No | One of `Conference`, `Workshop`, `Hackathon`, `Speaker Night`, `Meetup`. A small label on the card. |
| `venue` | No | Where it was held, or `null`. |
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
leave it off: tags are optional.

| Tag | Use it when | Don't use it when |
|---|---|---|
| `women-only` | Attendance is limited to women. | Women only led, spoke or organised it. |
| `entrepreneurship` | The focus is startups, founders, pitching or business. | A founder merely spoke at a general tech event. |
| `collaborated` | Another community, company or college **co-organised** it. List them in `partners`. | A company only sponsored it or lent a venue. |
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

- [ ] I edited only my chapter's file in `src/data/chapters/`
- [ ] The new event is at the top of `"events"`, and the commas are right
- [ ] The event is in Tamil Nadu
- [ ] The post supports every tag (no tag is fine)
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
| `chapter is set by the file; remove it` | Delete the `"chapter"` line from the event. |
| `tech-skills was removed; delete it from tags` | Remove `"tech-skills"` from `tags`. |
| An unknown tag | Use only the four tags above, spelled exactly. |
| `collaborated` without partners | Add the co-organisers to `partners`, or remove the tag. |
| A link isn't `https://` | Copy the full link, starting with `https://`. |
| `end` is before `start`, or set without one | Fix the dates, or set `end` to `null`. |
| The image file isn't found | Upload it to `public/events/` and match the name exactly. |
| Old field `category` | Rename it to `format`. |
| Unknown field | Check the spelling against [What each field means](#what-each-field-means). |
| A tag is listed twice | List each tag once. |
| The title or description is too long | Keep the title to 80 characters and the description to 240. |
| Same chapter, start and title | Two events can't share all three: you may have pasted the event twice. |
| `"format"` isn't one of the five | Use `Conference`, `Workshop`, `Hackathon`, `Speaker Night` or `Meetup`, spelled exactly. |
| `not valid JSON` | Usually a comma: every event block but the last ends with `},`, and every line inside a block but the last ends with a comma. Text is in double quotes. |

## Need help?

Open an issue on GitHub, or message your chapter lead.
