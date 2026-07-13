# Mod-B Demo Seed

This seed uses only collections and globals that already exist in the Mod-B application.

It does not add new Bookmark, Like, Mention, or other application collections.

## Existing storage used by the seed

### Bookmarks

Bookmarks use the application's existing collections:

```text
bookmark-folders
bookmark-items
```

Each demo user receives:

- A default bookmark folder
- A research bookmark folder
- Several bookmark items linked to seeded posts

### Likes

The current application stores aggregate like values directly on content:

```text
posts.likeCount
comments.likeCount
```

The seed populates these fields with varied values for Popular and Trending testing. It does not create a second competing like data model.

### Mentions

Mentions use the application's existing behavior:

- `@username` text in post/comment content
- `notifications` records with `type: 'mention'`

No separate mentions collection is required.

## Date and time settings

The seed attempts to configure the existing `date-time-settings` global with:

```ts
displayMode: 'rolling'
```

Locations:

| City | Time zone | Latitude | Longitude |
|---|---|---:|---:|
| Seoul | Asia/Seoul | 37.532600 | 127.024612 |
| Honolulu | Pacific/Honolulu | 21.315603 | -157.858093 |
| New York | America/New_York | 40.730610 | -73.935242 |

The seed reads the current global field configuration and writes only fields that exist.

## Commands

Add the following scripts:

```json
{
  "scripts": {
    "seed:mod-b": "tsx src/seed/index.ts",
    "seed:mod-b:reset": "tsx src/seed/index.ts --reset",
    "seed:mod-b:fresh": "pnpm seed:mod-b:reset && pnpm seed:mod-b"
  }
}
```

Run:

```bash
pnpm seed:mod-b
```

Reset and rebuild:

```bash
pnpm seed:mod-b:fresh
```

## Demo accounts

Default password:

```text
ModB-Demo-2026!
```

Accounts include:

```text
admin@mod-b.local
manager@mod-b.local
editor@mod-b.local
member1@mod-b.local
...
member12@mod-b.local
inactive@mod-b.local
```

Override the password with:

```bash
MOD_B_SEED_PASSWORD='YourPassword123!' pnpm seed:mod-b
```

## Important

This seed intentionally follows the existing Mod-B data model. It does not require:

- New Payload collections
- New database migrations
- New generated collection types
- Changes to `payload.config.ts`


## Safe reset behavior

The reset command deletes only data identified as Mod-B demo seed data.

It preserves:

- The existing built-in Home page
- Unrelated users and uploads
- Unrelated boards and posts
- Existing application globals

Seed posts are identified by the `mod-b-seed` tag. Bookmark folders and items are removed through their relationships to Mod-B demo users.


## Global sidebar compatibility

The global sidebar intentionally uses only single-board sections:

- Notice ticker
- Recent community posts
- Gallery picks
- Recent questions

Latest, Popular, Trending, and Recent Comments remain on the home page through Page Builder blocks. They are not added as global sidebar section types because this project's `Boards for Latest Posts` field uses a project-specific row shape that should not be guessed by the seed.


## Navigation links

Main navigation items use the application's relationship-based navigation structure:

```text
type: board
board: boardId
```

The Community item uses:

```text
type: dropdown
children: board links
```

No duplicate Home item is created.

## Enabled rolling date/time

The existing date-time global is populated with compatible enabled flags and:

```ts
displayMode: 'rolling'
```

The three locations are Seoul, Honolulu, and New York.

## Global sidebar

The sidebar includes:

1. Notice board as a ticker
2. Sidebar advertisement
3. Latest posts as a list
4. Grid advertisement
5. Gallery picks

The Latest section passes board IDs directly because the current `Boards for Latest Posts` field is a hasMany relationship.

## Advertisement placements

The seed creates advertisements for:

- Home
- Sidebar
- Board top
- Board middle
- Board bottom
- Post bottom
- Hero slide
- Sidebar grid
- AdSense placeholder


## Schema compatibility patch v5

- Global sidebar `Gallery Picks` uses `displayType: 'card'` because the current sidebar display-type select does not accept `gallery`.
- Footer column links and bottom-bar links use only `label` and `url`. The current footer link schema does not include a `type` field.
- Main navigation items still use relationship-based `type: 'board'` entries and the Community dropdown.


## Schema-safe globals v6

This version reads the active Payload global field definitions before building:

- Main navigation
- Footer
- Global board sidebar
- Date/time settings

Advertisement sidebar sections no longer receive `displayType`.

The global sidebar contains:

1. Notice board with ticker display
2. Sidebar advertisement
3. Latest posts with list display
4. Featured advertisement

The date/time seed writes every compatible enabled flag that actually exists and logs the final payload sent to `date-time-settings`.
