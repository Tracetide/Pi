const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('./gpio-listener'); // 引入GPIO监听脚本

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

ipcMain.on('gpio-button-pressed', () => {
    mainWindow.webContents.send('gpio-button-pressed');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
