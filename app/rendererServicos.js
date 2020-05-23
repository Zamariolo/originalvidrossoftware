let renderer = require('./renderer.js');
var {BrowserWindow} = require('electron').remote;

let btnServicoMenu = document.getElementById('btnServicoMenu');
btnServicoMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaServicos', 'janelaMenu');});


function mostraServicos(dados_servicos, grupo){
    console.log('Mostra servicos funcionando!');
    console.log(dados_servicos);

    // Percorrer os servicos
    // Funcionamento: Vai olhar o status e adicionar o novo html para seu respectivo lugar
    var html_grupo1 = '';
    var html_grupo2 = '';
    var html_grupo3 = '';

    for(var i=0; i<dados_servicos.length; i++)
    {
        console.log(dados_servicos[i].idServico);
    }
}
module.exports.mostraServicos = mostraServicos; //deixa func visivel pra renderer.js