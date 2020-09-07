/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let authWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

let SteamAuthUri = 'https://api.benhogben.dev/api/steamAuth/';

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  app.on('ready', () => {
    app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
    app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
    session.defaultSession.setCertificateVerifyProc((req, callback) => {
      callback(0);
    });
  });
  SteamAuthUri = 'https://steambed.test/api/steamAuth/';
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hiddenInset',
    show: false,
    width: 1920,
    height: 1080,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    authWindow = null;
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

ipcMain.on('newAuthWindow', (event, args) => {
  if (args.type === 'beginAuth') {
    authWindow = new BrowserWindow({
      title: 'Log in to your Steam account',
      frame: true,
      titleBarStyle: 'default',
      parent: mainWindow,
      modal: true,
      show: false,
      width: 800,
      height: 600,
    });
    authWindow?.loadURL(SteamAuthUri, {
      postData: [
        {
          type: 'postData',
          bytes: Buffer.from('force=post'),
        },
      ],
    });
    const webContents = authWindow?.webContents;

    webContents.on('will-redirect', (e: Event, newUrl: string) => {
      // console.log(`${newUrl}`);
      const urlReg = new RegExp(`${SteamAuthUri}callback`);
      const idRegex = /(Fopenid%2Fid%2F)(\d+)/;
      if (urlReg.test(newUrl)) {
        try {
          const steamId = idRegex.exec(newUrl)[2];
          event.reply('auth-window-closed', {
            id: steamId,
            err: false,
            message: 'Logged in successfully',
          });
        } catch (error) {
          console.error(error);
          event.reply('auth-window-closed', {
            id: undefined,
            err: true,
            message: 'Sorry could not confirm Steam User ID - please try again',
          });
        }
        // console.log(steamId[2]);
        // do something with steamId[2]
        authWindow?.hide();
      }
    });
    authWindow.once('ready-to-show', () => {
      authWindow?.focus();
      authWindow?.show();
    });
    authWindow.on('close', () => {
      mainWindow?.focus();
      authWindow = null;
    });
  }
});

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
