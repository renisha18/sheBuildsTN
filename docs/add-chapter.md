# Add a chapter

Each SheBuilds chapter (one college) has its own file in `src/data/chapters/`, and all of
the chapter's events live in it. If your college doesn't have a file yet, register it with
one pull request that creates the file **and** adds your first event. After that, you add
events to your own file: see [Add an event](add-event.md).

**You don't need to know how to code**, and it takes about 10 minutes.

## Before you start

- A free [GitHub](https://github.com) account.
- Your college's **full name**, spelled the way the college writes it.
- Your **city**. Check the other files in `src/data/chapters/` first: if a chapter in your
  city already exists, write the city exactly the same way (for example `Chennai`, not
  `chennai` or `Madras`).
- The details of your first event, and the Instagram or LinkedIn post about it.

## Steps (no terminal)

1. On the repository page, open the folder `src/data/chapters/`.
2. Open [`_TEMPLATE.chapter.json.example`](../src/data/chapters/_TEMPLATE.chapter.json.example)
   and copy everything in it.
3. Go back to `src/data/chapters/` and click **Add file → Create new file**.
4. Name it `<id>.json`, where `<id>` is a short name for your college in lowercase letters,
   digits and hyphens, for example `rec-chennai.json`.
5. Paste the template and fill it in:
   - `"id"`: the file name without `.json`, for example `"rec-chennai"`. They must match.
   - `"college"`: your college's full name.
   - `"city"`: your city, spelled like the other chapters there.
   - The one block in `"events"`: your first event. Each field is explained in
     [Add an event](add-event.md#what-each-field-means). If you have no event yet, use
     `"events": []`.
6. Click **Commit changes…** and choose **Propose changes**.
7. Click **Create pull request**. Give it the title `Add chapter: <College> (<City>)`.
8. Wait about a minute for the automatic check, fix anything it reports, and a reviewer
   will look at it.

## The template

```json
{
  "id": "your-college-name",
  "college": "Your College Name",
  "city": "Chennai",
  "events": [
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
  ]
}
```

| Field | Required? | What to put |
|---|---|---|
| `id` | Yes | The file name without `.json`. Lowercase letters, digits and hyphens. |
| `college` | Yes | The college's full name. (`null` is only for teams that aren't a college, such as the SheBuilds core team; they also need a `"name"`.) |
| `name` | No | A different display name for the chapter. Leave it out to use the college name. |
| `city` | Yes | The city, spelled the same way as the other chapters in it. |
| `events` | Yes | Your events, newest at the top. `[]` if there are none yet. |

## For reviewers

- [ ] The college's name is spelled correctly (check the college's own website).
- [ ] The city is spelled exactly like the other chapters in that city. The automatic check
      warns when two spellings look like the same city.
- [ ] No other file already exists for this college.
- [ ] The first event follows the [Add an event](add-event.md) rules.

## Need help?

Open an issue on GitHub, or message the SheBuilds team.
