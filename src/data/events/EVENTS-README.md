# Adding an event

Each event is one JSON file in this folder. The file name is the event's id: lowercase words
joined by hyphens, for example `women-in-ai-meetup.json`. Start from `_TEMPLATE.json.example`.

`npm run validate:events` checks every file, and it also runs before every build. An error
stops the build; a warning is only a reminder.

## Fields

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The event name, 80 characters or fewer. |
| `description` | yes | One or two sentences. Keep it under about 160 characters (240 at most). |
| `tags` | yes | A list of 1 or more tag ids from the table below, for example `["community"]`. The filters use these. |
| `format` | no | The kind of event: `Conference`, `Workshop`, `Hackathon`, `Speaker Night` or `Meetup`. Shown as a small label on the card, not a filter. |
| `partners` | no* | A list of partner names, for example `["GDG Chennai"]`. *Required (at least one) when `tags` includes `collaborated`. |
| `chapter` | no | Which chapter ran it, as text, for example `"SheBuilds Chennai"`. |
| `start` | no | `"2024-10"` (month only), `"2026-11-15"` (a day) or `"2026-11-15T10:00:00+05:30"` (day and time). Use the most exact one you know. `null` shows "TBA". |
| `end` | no | Same forms as `start`, for events that run over more than one day. `null` if it's a single day or unknown. |
| `venue` | no | Where it happens, for example `"Venue name, Chennai"`, or `null`. |
| `attendees` | no | How many people came, as a number without quotes, or `null`. |
| `featured` | no | `true` to show the FEATURED badge, otherwise `false`. |
| `image` | no | A photo in `public/events/`, written as `"/events/my-event.webp"` (under 200 KB), or `null`. |
| `registerUrl` | no | The `https://` sign-up page. Shown as **Register** while the event is upcoming. |
| `postUrl` | no | The `https://` Instagram or LinkedIn post about the event. Shown as **View post** (the recap) once it's over. A past event without one gets a "no source link" warning. |

The old `category` field is now `format`: rename it, and add `tags`.

## Tags

| Tag id | Shown as | Meaning |
|---|---|---|
| `women-only` | Women-only | Attendance is limited to women. |
| `entrepreneurship` | Entrepreneurship | Startups, founders, pitching and business. |
| `collaborated` | Collaborated | Co-organised with another community, company or college. Needs `partners`. |
| `tech-skills` | Tech & skills | Hands-on learning, build sprints and hackathons. |
| `community` | Community | Meetups, conferences and networking. |

Only add a tag if the event's post or page supports it. When unsure, leave it off.

The list itself lives in `src/sections/events/eventTags.js`; the site and the validator both
read it from there.
