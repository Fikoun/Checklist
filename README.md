# Packing Checklist

A tiny, single-page checklist app. The list is defined in **`checklist.json`** and rendered in the
browser at runtime. Each person's progress is saved in their own browser (`localStorage`), so it's
private to their device and survives reloads. No build step, no dependencies — ideal for GitHub Pages.

The first list is a **summer camp retreat packing list**.

## Files

| File             | What it is                                            |
| ---------------- | ----------------------------------------------------- |
| `index.html`     | Page skeleton (header, progress bar, reset button).   |
| `styles.css`     | Mobile-first styling.                                 |
| `app.js`         | Loads the JSON, renders it, saves/restores progress.  |
| `checklist.json` | **The list itself — this is the file you edit.**      |

## Editing the list

Open `checklist.json` and change the items. The shape is:

```json
{
  "id": "summer-camp-2026",
  "title": "Summer Camp Retreat 2026",
  "subtitle": "Your packing checklist",
  "sections": [
    {
      "name": "Clothing",
      "items": [
        { "id": "tshirts", "label": "T-shirts (3-4)", "recommended": true, "note": "Quick-dry is best" },

        {
          "id": "rain-protection",
          "label": "Rain protection",
          "note": "Pick at least one",
          "options": [
            { "id": "raincoat", "label": "Raincoat", "recommended": true },
            { "id": "umbrella", "label": "Umbrella" }
          ]
        }
      ]
    }
  ]
}
```

Two kinds of item:

- **Plain item** — a single checkbox. Fields: `id`, `label`, optional `recommended` (adds a ★ badge),
  optional `note` (small hint under the label).
- **Choice group** — any item with an `options` array. Each option is its own checkbox; the
  recommended one is highlighted. The group counts as "packed" once **any** option is ticked.

Rules of thumb:

- Every `id` must be **unique** and stable. Changing an `id` later resets that item's saved state.
- Changing `id` at the top of the file gives everyone a fresh checklist (old progress is kept under
  the old id, not lost).
- Adding/removing items is safe — existing checked items stay checked.

## Preview locally

`fetch()` is blocked when you open `index.html` directly (`file://`), so use a tiny local server:

```bash
cd Checklist
python3 -m http.server 8000
# then open http://localhost:8000
```

(Any static server works, e.g. `npx serve`.)

## Deploy to GitHub Pages

1. Create a GitHub repo and push these files.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Choose branch **`main`** and folder **`/ (root)`**, then **Save**.
4. Wait ~1 minute; your site appears at `https://<user>.github.io/<repo>/`.

To update later: edit `checklist.json`, commit, and push — Pages redeploys automatically.
