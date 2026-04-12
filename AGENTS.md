# Agent Instructions

## Taking a UI screenshot

After making any visual change to the blog, take a screenshot to verify the result:

```bash
cd apps/blog && npm run test:screenshot
```

This starts the dev server (if not already running on port 5173), navigates to `/blog/`, waits for the page to finish rendering, and saves a full-page screenshot to:

```
apps/blog/screenshots/blog-overview.png
```

Read that file to see exactly what the UI looks like. The image is gitignored and regenerated on demand.
