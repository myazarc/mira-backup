import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import path from 'path';
const electronOauth2 = require('electron-oauth2');

import AutoLaunch from 'auto-launch';

const autoLaunch = new AutoLaunch({
  name: 'Mira Backup',
});

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const application = {
  isQuiting: false,
};

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    icon: path.join(__static,'256x256.png'),
    title: 'Mira Backup',
  })

  let iconPath=null;
  
  switch (process.platform) {
    case 'win32':
      iconPath = path.join(__static,'icon.ico');
    break;
    default:
      iconPath = path.join(__static,'256x256.png');
    break;
  };

  mainWindow.loadURL(winURL);
  const appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click:  function(){
        mainWindow.show();
    } },
    { label: 'Quit', click:  function(){
        application.isQuiting = true;
        app.quit();
    } }
  ]);

  appIcon.setContextMenu(contextMenu);

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
    mainWindow.webContents.send('hide-window');
  });

  mainWindow.on('show', function () {
    appIcon.setHighlightMode('always');
    mainWindow.webContents.send('show-window');
  })

  mainWindow.on('close', function (event) {
      if(!application.isQuiting){
          event.preventDefault();
          mainWindow.hide();
          mainWindow.webContents.send('hide-window');
      }

      return false;
  });

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
  
  if (process.env.NODE_ENV !== 'development') {
    autoLaunch.isEnabled().then((isEnabled) => {
      if(isEnabled){
          return;
      }
      autoLaunch.enable();
    }).catch((err) => {
      console.log(err);
    });
  }
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
