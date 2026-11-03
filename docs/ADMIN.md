# Pegbox Admin Guide (ADMIN.md)

Because Pegbox uses no database, operations and management are achieved entirely through Git, environment flags, and browser health diagnostics.

## Kill Switch
If a tool encounters a bug or regression in production:
1. Set the environment variable in Vercel:
   ```
   PEGBOX_DISABLED_TOOLS=voice-cleaner,silence-cutter
   ```
2. The endpoint `/api/flags` returns disabled tool IDs with Edge caching (`s-maxage=60`).
3. Tool workspaces inspect disabled flags: if disabled, the workspace displays a polite notice ("This tool is currently paused for maintenance") and blocks loading the engine.

## Announcement Banner
Set an announcement in `apps/web/src/lib/announcement.ts`:
```ts
export const CURRENT_ANNOUNCEMENT = "Welcome to Pegbox v1! All tools run 100% in your browser.";
```
Set to `null` to hide the banner.

## Admin Health Dashboard (`/admin`)
- Accessible at `/admin`.
- Protected by HTTP Basic Auth via Next.js middleware using `ADMIN_USER` and `ADMIN_PASSWORD`.
- Features:
  - **Registry Inventory**: Inspects all registered tools, categories, runtimes, and statuses.
  - **In-Browser Self-Test Runner**: Executes synthetic tests (`selftest.ts`) directly within the browser, reporting pass/fail, execution time, and diagnostics.
  - **Environment Inspector**: Detects WebAssembly capabilities, Worker support, Cross-Origin Isolation status, and browser headers.

