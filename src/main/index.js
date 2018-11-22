import { app, BrowserWindow, ipcMain } from 'electron'
const electronOauth2 = require('electron-oauth2');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipcMain.on('yandex-oauth',(event,arg) => {
    const windowParams = {
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    };
    const oauthConfig = {
      clientId: 'af1fa0f8e27b4434842da38d52ca3ff0',
      clientSecret: '72e746c651f04f2dbdf61fac329533d4',
      authorizationUrl: 'https://oauth.yandex.com/authorize',
      tokenUrl: 'https://oauth.yandex.com/token',
      useBasicAuthorizationHeader: false,
      redirectUri: 'http://localhost'
    };

    const options = {
      scope: 'cloud_api:disk.write',
      accessType: 'ACCESS_TYPE'
    };
    const yandexOAuth = electronOauth2(oauthConfig, windowParams);

    yandexOAuth.getAccessToken(options)
    .then(token => {
      // use your token.access_token
      event.sender.send('yandex-oauth-reply', {status:true,token});
    }).catch((e) => {
      event.sender.send('yandex-oauth-reply', {status:false});
    });
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
