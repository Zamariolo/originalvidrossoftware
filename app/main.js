const electron = require('electron');
const app = electron.app;
const windowManager = require('electron-window-manager');

let mainWindow = null;

//Executa quando a aplicacao termina de carregar
app.on('ready', function(){
    windowManager.init();
    //Open a window
    mainWindow = windowManager.open('mainWindow', 'Originalll vidros', '/app/index.html',null,{
        webPreferences: {nodeIntegration: true},
        //Colocar outras configuracoes aqui
    });
})