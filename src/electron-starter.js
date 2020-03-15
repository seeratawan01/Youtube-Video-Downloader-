// Modules to control application life and create native browser window
const { ipcMain, app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');

// Youtube
const fs = require('fs')
const youtubedl = require('youtube-dl')
const title = 'Youtube Video Downloader'


function createWindow() {

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.setTitle(title);

    // and load the index.html of the app.
    // mainWindow.loadURL('http://localhost:3000');

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    if (isDev) {
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        mainWindow.webContents.openDevTools();
    }


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}


ipcMain.on('value', (event, arg) => {
    downloadVideo(arg);
    event.sender.send('reply', 'get')
})

const downloadVideo = (url) => {

    const mainWindow = BrowserWindow.getAllWindows()[0];

    const video = youtubedl(url,
        // Optional arguments passed to youtube-dl.
        ['-f', '18']
    )

    var size = 0
    // Will be called when the download starts.
    video.on('info', function (info) {
        size = info.size

        console.log('Got video info')
        var file = path.join(__dirname, info._filename)
        video.pipe(fs.createWriteStream(file))
    })

    var pos = 0
    video.on('data', function data(chunk) {
        pos += chunk.length

        // `size` should not be 0 here.
        if (size) {
            let p = ((pos / size)).toFixed(2);
            mainWindow.setProgressBar(parseFloat(p))
            mainWindow.setTitle(`${title} - (${p})`);
        }
    })

    video.on('end', function end() {
        'use strict'
        console.log('\nDone')
        mainWindow.setProgressBar(-1)

        // When finish, send signal to renderer
        mainWindow.webContents.send('done', 'done')
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.