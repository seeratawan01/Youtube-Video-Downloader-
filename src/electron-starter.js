// Modules to control application life and create native browser window
const { ipcMain, app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const { downloadVideo, getVideoInfo } = require('./Component/youtube')

const title = 'Youtube Video Downloader'


function createWindow() {

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 600,
        center: true,
        resizable: false,
        fullscreenable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.setTitle(title);

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    if (isDev) {
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        mainWindow.webContents.openDevTools();
    }
}

// When URL is recieved
ipcMain.on('url', (event, arg) => {
    // getDirectory(arg);

    getVideoInfo(arg, (data) => {

        const mainWindow = BrowserWindow.getAllWindows()[0];

        if (data != null) {
            // When finish, send data to renderer
            mainWindow.webContents.send('videoInfo', data)
        } else {
            mainWindow.webContents.send('videoInfo', null)
        }

    });
})

ipcMain.on('download', (event, arg) => {
    getDirectory(arg.url, arg.f[0], arg.f[1]);
})

const getDirectory = (url, f, ext) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];

    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if (result.filePaths.length > 0) {
            let dir = result.filePaths[0];

            downloadVideo(title, mainWindow, { dir, url, f, ext });

        }
    }).catch(err => {
        console.log(err)
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


// Messages Handlers
ipcMain.on('error', (event, arg) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    dialog.showMessageBoxSync(mainWindow, {
        type: 'error',
        buttons: ['Cancel'],
        title: "Error Message",
        message: arg
    })
})