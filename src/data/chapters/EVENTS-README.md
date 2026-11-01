# Chapters and their events

Each chapter has **one JSON file** in this folder, and all of its events live inside it. A
chapter is one college, or a team that isn't a college (like the SheBuilds core team). Because
every chapter edits only its own file, two chapters never change the same file.

The file name is the chapter's id: lowercase letters, digits and hyphens, for example
`rec-chennai.json`. Start a new chapter from `_TEMPLATE.chapter.json.example` (see
[docs/add-chapter.md](../../../docs/add-chapter.md)). Files whose name starts with `_` are ignored.

`npm run validate:events` checks every file, and it also runs before every build. An error
stops the build; a warning is only a reminder.

## The chapter

```json
{
  "id": "rec-chennai",
  "college": "Rajalakshmi Engineering College",
  "city": "Chennai",
  "events": [ ... ]
}
```

| Field | Required | What it is |
|---|---|---|
| `id` | yes | The file name without `.json`. Lowercase letters, digits and hyphens. |
| `college` | yes (or `null`) | The college's full name, or `null` for a team that isn't a college. |
| `name` | when `college` is `null` | The chapter's display name, for example `"SheBuilds Chennai"`. Optional for a college: the college name is used. |
| `city` | yes | The city, spelled like the other chapters in that city, for example `"Chennai"`. |
| `events` | yes | The list of events. It may be empty (`[]`). **New events go at the top.** |

## Event fields

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The event name, 80 characters or fewer. |
| `description` | yes | One or two sentences. Keep it under about 160 characters (240 at most). |
| `tags` | no | A list of tag ids from the table below, for example `["community"]`, or `[]`. The filters use these. |
| `format` | no | The kind of event: `Conference`, `Workshop`, `Hackathon`, `Speaker Night` or `Meetup`. Shown as a small label on the card, not a filter. |
| `partners` | no* | A list of partner names, for example `["GDG Chennai"]`. *Required (at least one) when `tags` includes `collaborated`. |
| `attendees` | no | A whole number without quotes, only if you know it. Otherwise `null`. |
| `start` | no | `"2024-10"` (month only), `"2026-11-15"` (a day) or `"2026-11-15T10:00:00+05:30"` (day and time). Use the most exact one you know. `null` shows "TBA". |
| `end` | no | Same forms as `start`, for events that run over more than one day. `null` if it's a single day or unknown. |
| `venue` | no | Where it happens, for example `"Venue name, Chennai"`, or `null`. |
| `featured` | no | `true` to show the FEATURED badge, otherwise `false`. |
| `image` | no | A photo in `public/events/`, written as `"/events/my-event.webp"` (under 200 KB), or `null`. |
| `registerUrl` | no | The `https://` sign-up page. Shown as **Register** while the event is upcoming. |
| `postUrl` | no | The `https://` Instagram or LinkedIn post about the event. Shown as **View post** (the recap) once it's over. A past event without one gets a "no source link" warning. |

Events have no `chapter` field: the chapter comes from the file. The old `category` field is
now `format`.

## Tags

| Tag id | Shown as | Meaning |
|---|---|---|
| `women-only` | Women-only | Attendance is limited to women. |
| `entrepreneurship` | Entrepreneurship | Startups, founders, pitching and business. |
| `collaborated` | Collaborated | Co-organised with another community, company or college. Needs `partners`. |
| `community` | Community | Meetups, conferences and networking. |

Only add a tag if the event's post or page supports it. When unsure, leave it off.

The list itself lives in `src/sections/events/eventTags.js`; the site and the validator both
read it from there.
