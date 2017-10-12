import { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import { Discordserver } from "./discordmodule"
import * as fs from "fs-extra"
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
  enableLiveReload({ strategy: 'react-hmr' });
}

const createWindow = async () => {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    autoHideMenuBar: true,
  });
  let server = new Discordserver(mainWindow);
  await server.login().catch((reason:Error) => {
    console.log(reason.message)
    if(mainWindow)
      mainWindow.close()
  })
  mainWindow.server = server;

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  /*  // Open the DevTools.
    if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
    }*/

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    server.destroy();
    app.exit(0);
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};


const openTokenWindow = async () => {
  // Create the browser window.
  let tokenWindow = new BrowserWindow({
    width: 250,
    height: 100,
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  tokenWindow.loadURL(`file://${__dirname}/missingtoken.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    tokenWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  tokenWindow.on('closed', () => {
    if (fs.readJSONSync("./config/config.json").token != "") {
      console.log("Creating window?")
      createWindow();
    }
  });
};
fs.ensureDirSync("./config")
fs.ensureFileSync("./config/config.json")
if (fs.statSync("./config/config.json").size === 0) {
  fs.writeJsonSync("./config/config.json", { "token": "" });
}
if (fs.readJSONSync("./config/config.json").token === "")
  app.on('ready', openTokenWindow)
else
  app.on('ready', createWindow);

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
