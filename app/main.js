const {app, BrowserWindow} = require('electron');

//Se utilizar mult window
//const windowManager = require('electron-window-manager');

let mainWindow = null;

//Executa quando a aplicacao termina de carregar
app.on('ready', function(){
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.webContents.loadFile('app/index.html');
    // mainWindow.removeMenu();
});

