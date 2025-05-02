# osu-mappack-creator

A cross-platform desktop app for creating osu! map packs, built with [electron-vite](https://electron-vite.org/)

Click [here](https://github.com/1skyyks1/osu-mappack-creator/releases) to go to the Release page and download the latest version.

## Usage Notice
- **Do not select the entire `osu!/Songs` folder directly**, especially if it contains thousands of beatmaps. Doing so may cause the application to freeze or crash.

- **Recommended usage:**
Create a new folder on your computer to use as a workspace when creating map packs.
Copy the required beatmap folders (each containing `.osu` files, audio, and image files) from `osu!/Songs` into this new folder.
Then, select this folder in the application.
- **After creating the map pack**, you can find it in your workspace folder. You can compress it and change the file extension to .osz to use in osu!.
- If you have any suggestions or feedback, feel free to contact me. [my osu! profile](https://osu.ppy.sh/users/26030234).

## Project Structure (Simplified)
```
osu-mappack-creator/
├── out/               # Electron build output
├── src/               # Source code
│   ├── main/          # Main process (Electron)
│   └── renderer/      # Renderer process (Vue)
├── public/            # Static assets
├── package.json       # Project configuration
└── ...
```

## Project Setup

### Install

```bash
# Make sure you have Node.js and npm installed.
npm install
```

### Development

```bash
# Launch the app in development mode with hot-reload:
npm run dev
```

### Build

```bash
# Build project only (no installer)
npm run build:unpack

# Build Windows installer
npm run build:win

# Build macOS installer
npm run build:mac

# Build Linux installer
npm run build:linux
```
