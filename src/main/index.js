import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import path from 'path'
import { parseOsuFile, updateOsuFile } from './osuParser'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const getStaticDir = () => {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked/resources/static') // 打包后
    : path.join(__dirname, '../../resources/static') // 开发环境
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Choose osu! songs path
ipcMain.handle('select-osu-path', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return canceled ? null : filePaths[0]
})

// Load all osu! Songs document
ipcMain.handle('load-osu-files', (_, osuPath) => {
  const songsDir = path.join(osuPath)
  const beatmaps = []

  fs.readdirSync(songsDir).forEach((folder) => {
    const folderPath = path.join(songsDir, folder)
    if (!fs.statSync(folderPath).isDirectory()) return

    fs.readdirSync(folderPath).forEach((file) => {
      if (!file.endsWith('.osu')) return

      const osuPath = path.join(folderPath, file)
      const content = fs.readFileSync(osuPath, 'utf-8')
      const parsed = parseOsuFile(content)

      beatmaps.push({
        id: path.basename(file, '.osu'),
        path: osuPath,
        folder,
        audio: parsed.General.AudioFilename,
        image: parsed.Events.find((e) => e.includes('.jpg') || e.includes('.png'))?.split('"')[1],
        metadata: {
          title: parsed.Metadata.Title,
          artist: parsed.Metadata.Artist,
          creator: parsed.Metadata.Creator,
          version: parsed.Metadata.Version
        }
      })
    })
  })

  return beatmaps
})

// Create new mapset
ipcMain.handle('create-mapset', async (_, { osuPath, selectedBeatmaps, options }) => {
  const mapsetDir = path.join(osuPath, options.mapsetName)
  fs.mkdirSync(mapsetDir, { recursive: true })

  for (const [index, beatmap] of selectedBeatmaps.entries()) {
    try {
      const baseDir = path.dirname(beatmap.path)

      const newAudioName = `${index + 1}${path.extname(beatmap.audio)}`
      const newImageName = beatmap.image ? `${index + 1}${path.extname(beatmap.image)}` : null

      const audioSrc = path.join(baseDir, beatmap.audio)
      const audioDest = path.join(mapsetDir, newAudioName)
      await fs.promises.copyFile(audioSrc, audioDest)

      let imageDest = null
      if (beatmap.image) {
        const imageSrc = path.join(baseDir, beatmap.image)
        imageDest = path.join(mapsetDir, newImageName)
        await fs.promises.copyFile(imageSrc, imageDest)
      }

      const osuContent = await fs.promises.readFile(beatmap.path, 'utf-8')

      const newContent = updateOsuFile(osuContent, {
        options,
        beatmap,
        overrides: {
          audio: newAudioName,
          image: newImageName
        }
      })

      const newOsuName = `${options.mapsetName}(${beatmap.id}).osu`
      await fs.promises.writeFile(path.join(mapsetDir, newOsuName), newContent)
    } catch (error) {
      console.error(`Load ${beatmap.path} failed`, error)
      throw error
    }
  }

  if (options.includeStaticFiles) {
    const staticDir = getStaticDir()
    const files = await fs.promises.readdir(staticDir)
    for (const file of files) {
      const sourceFilePath = path.join(staticDir, file)
      const destFilePath = path.join(mapsetDir, file)
      if (file.endsWith('.osu')) {
        let content = await fs.promises.readFile(sourceFilePath, 'utf8')
        content = content.replace(/Title:[^\n]+/, `Title:${options.mapsetName}`)
          .replace(/TitleUnicode:[^\n]+/, `TitleUnicode:${options.mapsetName}`)
          .replace(/Artist:[^\n]+/, `Artist:${options.artistName}`)
          .replace(/ArtistUnicode:[^\n]+/, `ArtistUnicode:${options.artistName}`)
          .replace(/Creator:[^\n]+/, `Creator:${options.mapsetCreator}`)
        let newOsuFileName = `${options.mapsetName}(delete).osu`
        let filePath = path.join(mapsetDir, newOsuFileName)
        await fs.promises.writeFile(filePath, content)
      } else {
        await fs.promises.copyFile(sourceFilePath, destFilePath)
      }
    }
  }
})
