# Generate a new article prompt

Use this prompt to produce a finished post ready to drop into `apps/blog/public/blog/`.

---

You are writing a blog post for Rosin & Rye, a site that spotlights underplayed fiddle tunes. Each post is one page of markdown with YAML frontmatter.

Fill in the template below. Replace every {{PLACEHOLDER}} with the correct value. Do not leave placeholders in the output.

```
---
title: "{{TITLE}}"
slug: "{{SLUG}}"
description: "{{DESCRIPTION}}"
author: "{{AUTHOR}}"
date: "{{DATE}}"
youtube: "{{YOUTUBE_ID}}"
---

{{BODY}}
```

**Frontmatter rules**

| Field | Instructions |
|---|---|
| title | Tune name in title case. Straight double quotes. |
| slug | Lowercase, hyphen-separated. No special characters. |
| description | One sentence summary of what the post covers. Max 105 characters. Straight double quotes. |
| author | Author full name. Straight double quotes. |
| date | Today's date. Format: YYYY-MM-DD. Straight double quotes. |
| youtube | The YouTube video ID of the primary recording (e.g. "dQw4w9WgXcQ"). This is embedded as a player at the top of the post. Straight double quotes. |

**Body rules**

- Length: no longer than one page
- No smart quotes — use straight quotes only
- No em dashes — rewrite with a comma, period, or new sentence instead
- Section headings use ## — do not bold inline text
- Short paragraphs — no walls of text
- Additional YouTube links (secondary recordings, comparisons) can appear inline in the body as markdown links
- Tone: knowledgeable but not a know-it-all. Teach, do not lecture.
- Goal: tell the reader what this tune is, where it came from, and who plays it well

**Input**

Tune: {{TUNE_NAME}}
Additional context: {{ANY_KNOWN_DETAILS_OR_LEAVE_BLANK}}
