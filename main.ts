import { app, BrowserWindow, globalShortcut, ipcMain, Menu, remote, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import commandExists = require('command-exists');

export let win: BrowserWindow = null;
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
    },
    frame: true
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  bindKeys();
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  Menu.setApplicationMenu(null);
  ipcMain.on('window-min',function(){
    win.minimize();
  })
  ipcMain.on('window-max',function(){
    if(win.isMaximized()){
      win.restore();
    }else{
      win.maximize();
    }
  })
  ipcMain.on('window-close',function(){
    win.close();
  })
  return win;
}

try {

  app.allowRendererProcessReuse = true;

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    /*
    由于整合了hexo，故不需要外部依赖
    commandExists('git').catch(()=>{
      dialog.showErrorBox('错误', '缺少git,请安装');
      app.quit();
    });
    commandExists('hexo').catch(()=>{
      dialog.showErrorBox('错误', '缺少hexo,请安装');
      app.quit();
    });
    */
    setTimeout(createWindow, 400);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
  app.on('before-quit', () => {
    remote.dialog.showErrorBox('', 'before-quit');
  })
  app.on('quit', () => {
    globalShortcut.unregisterAll();
  });

} catch (e) {
  // Catch Error
  // throw e;
}

function bindKeys() {
  if(serve) {
    globalShortcut.register('ctrl+alt+k', () => win.webContents.openDevTools());
  }
  globalShortcut.register('ctrl+alt+k', () => win.webContents.openDevTools());
}