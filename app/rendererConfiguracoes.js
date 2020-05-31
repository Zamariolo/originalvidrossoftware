let renderer = require('./renderer.js');
const fs = require('fs');
var {dialog} = require('electron').remote;
const app = require('electron');

let btnConfiguracoesMenu = document.getElementById('btnConfiguracoesMenu');
btnConfiguracoesMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaConfiguracoes', 'janelaMenu');});

// Botao salvar configuracoes
let btnSalvarConfiguracoes = document.getElementById('btnSalvarConfiguracoes');
btnSalvarConfiguracoes.addEventListener('click', ()=>{salvarConfiguracoes();});

// Selecionar nova logomarca
document.getElementById('inputLogo').addEventListener('click', ()=>{
    let enderecoImagem = dialog.showOpenDialogSync({title: 'Escolher imagem da logomarca',filters: [{name: 'Images', extensions: ['jpg','png','jpeg']}],properties: ['openFile']});
    document.getElementById('inputLogo').value = enderecoImagem;
})

function carregaTelaConfiguracoes()
{
    // Pega dados
    let leituraConfig = fs.readFileSync('app/config.txt', 'utf8');
    [logo, host, port, user, password, database] = leituraConfig.split(',');
    
    // Escrevendo nos inputs
    document.getElementById('inputLogo').value = logo;
    document.getElementById('inputHost').value = host;
    document.getElementById('inputPort').value = port;
    document.getElementById('inputUser').value = user;
    document.getElementById('inputPassword').value = password;
    document.getElementById('inputDatabase').value = database;
}

module.exports.carregaTelaConfiguracoes = carregaTelaConfiguracoes;

function salvarConfiguracoes()
{
    // Salva no arquivo
    let conteudo = document.getElementById('inputLogo').value + ',';
    conteudo+= document.getElementById('inputHost').value + ',';
    conteudo+= document.getElementById('inputPort').value + ',';
    conteudo+= document.getElementById('inputUser').value + ',';
    conteudo+= document.getElementById('inputPassword').value + ',';
    conteudo+= document.getElementById('inputDatabase').value;
    fs.writeFileSync('app/config.txt', conteudo);
    // Volta pro menu
    renderer.trocaTela('janelaConfiguracoes', 'janelaMenu');
    // Aviso pra reiniciar o programa
    dialog.showMessageBoxSync('',{title: 'Reinicie o programa', message: 'As alterações só funcionarão após a reinicialização. Do contrário, um mau funcionamento será observado e o programa poderá não funcionar novamente.', type:'warning'})
}