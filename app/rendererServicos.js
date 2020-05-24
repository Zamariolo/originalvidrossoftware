let renderer = require('./renderer.js');
var {BrowserWindow} = require('electron').remote;

let btnServicoMenu = document.getElementById('btnServicoMenu');
btnServicoMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaServicos', 'janelaMenu');});


function mostraServicos(dados_servicos){
    console.log('Mostra servicos funcionando!');
    console.log(dados_servicos);

    // Percorrer os servicos
    // Funcionamento: Vai olhar o status e adicionar o novo html para seu respectivo lugar
    var html_lista_servicos = '';
    var icone_status = 1

    for(var i=0; i<dados_servicos.length; i++)
    {
        switch (dados_servicos[i].status)
        {
            case 1:
                icone_status = "media/assets/green_circle.png";
                break;
            case 2:
                icone_status = "media/assets/yellow_circle.png";
                break;
            case 3:
                icone_status = "media/assets/red_circle.png";
                break;
        }

        html_lista_servicos = html_lista_servicos + 
        `<div class="item_servico row">
        <img src="${icone_status}" alt="" class="imagem_item_servico col-1 status" id='status_${dados_servicos[i].idServico}'>
            <p class="col-1 lead texto_item_servico">${dados_servicos[i].idServico}</p>
            <p class="col-2 lead texto_item_servico">${dados_servicos[i].dataServico}</p>
            <p class="col-5 lead texto_item_servico">${dados_servicos[i].nome}</p>
            <p class="col-2 lead texto_item_servico"><b>R$ ${dados_servicos[i].valorTotal}</b></p>
            <img src="media/assets/comments.png" alt="" class="imagem_item_servico col-1 inspec" id='btn_inspec_${dados_servicos[i].idServico}'>
        </div> <!-- Fecha div item-->
        `
    }

    //Atualiza html
    document.getElementById('div_lista_servicos').innerHTML = html_lista_servicos;

    //Ligando botoes de inspec a funcao
    let botoesInspec = document.querySelectorAll(".inspec");
    for (i=0; i<botoesInspec.length; i++)
    {
        botoesInspec[i].addEventListener('click', function(){abreInspec(this.id);});
    }
    //Ligando botoes de status a funcao
    let botoesStatus = document.querySelectorAll(".status");
    for (i=0; i<botoesStatus.length; i++)
    {
        botoesStatus[i].addEventListener('click', function(){trocaStatus(this.id);});
    }
}
module.exports.mostraServicos = mostraServicos; //deixa func visivel pra renderer.js


function abreInspec(id)
{
    console.log('Inspec aberto');
    console.log(id);
}

function trocaStatus(id)
{
    console.log('troca status');
    console.log(id);
}