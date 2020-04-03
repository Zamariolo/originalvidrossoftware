const {app, BrowserWindow, remote} = require('electron');
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

//Se utilizar mult window
// const windowManager = require('electron-window-manager');

let mainWindow = null;

//Executa quando a aplicacao termina de carregar
app.on('ready', function(){
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.webContents.loadFile('app/index.html');
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();  
    // mainWindow.removeMenu();

    //window ListaProdutos
    let windowListaProdutos = new BrowserWindow({width: 800, height: 650, title: 'Lista de produtos', show: false, webPreferences: {
        nodeIntegration: true
    }});

    // windowListaProdutos.removeMenu();
    global.windowListaProdutos = windowListaProdutos;

    //detectar fechamento de janela > se ocorrer, fechar windowListaProdutos
    mainWindow.on('close', function(){app.quit();});
});




// #################################################################
// #################### IPC COMMUNICATION ##########################
 ipc.on('adicionar-produto-main', function(event, arg){
     mainWindow.webContents.send('adicionar-produto-orcamento', arg); //Envia sinal para rendererOrcamento.js
 });

