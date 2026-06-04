# Sky COTL Clock

Desktop Sky: Children of the Light clock and planner built with Tauri 2,
React, Rust, shadcn/ui, and Tailwind CSS.

The app is Windows-first and includes:

- Sky-time aware recurring event countdowns using `America/Los_Angeles`
- A passive transparent overlay window with global hotkey toggles
- Sidebar-first dashboard, calendar, goals, collection, overlay, and settings pages
- Light, dark, and system theme modes
- Local planner storage for goals and wishlist state

## Development

```bash
bun install
bun run test
bun run build
cd src-tauri && cargo check
```

Run the desktop app during development:

```bash
bun tauri dev
```

## Data Credit

This app bundles a selected offline subset of
[SkyGame-Data](https://github.com/Silverfeelin/SkyGame-Data) by Silverfeelin.
SkyGame-Data is MIT licensed and is used as game data input for the planner and
collection views.

Sky: Children of the Light is by thatgamecompany. This project is unofficial.
