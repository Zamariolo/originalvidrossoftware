let renderer = require('./renderer.js');
var {BrowserWindow} = require('electron').remote;
var {dialog} = require('electron').remote;
var fs = require('fs');

var status_selecionado = 0;

let btnServicoMenu = document.getElementById('btnServicoMenu');
btnServicoMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaServicos', 'janelaMenu');});

// Escondendo o inspec ao inicializar
document.getElementById('div_inspec').style.display = 'none';

// Botoes salvar e excluir do inspec
document.getElementById('btnSalvar_inspec').addEventListener('click',()=>{salvarServico(document.getElementById('id_inspec').innerHTML);});
document.getElementById('btnExcluir_inspec').addEventListener('click', ()=>{excluirServico(document.getElementById('id_inspec').innerHTML);});

// Botao trocar status
document.getElementById('btnTrocaStatus_1').addEventListener('click', ()=>{trocaStatus(document.getElementById('id_inspec').innerHTML,1);});
document.getElementById('btnTrocaStatus_2').addEventListener('click', ()=>{trocaStatus(document.getElementById('id_inspec').innerHTML,2);});
document.getElementById('btnTrocaStatus_3').addEventListener('click', ()=>{trocaStatus(document.getElementById('id_inspec').innerHTML,3);});

// Escuta barra de pesquisa
document.getElementById('barraPesquisaServicos').addEventListener('change', ()=>{
    atualizaLista();
})

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
            <p class="col-1 lead texto_item_servico" id='idServico_${dados_servicos[i].idServico}'>${dados_servicos[i].idServico}</p>
            <p class="col-2 lead texto_item_servico">${dados_servicos[i].dataServico}</p>
            <p class="col-5 lead texto_item_servico" id='nomeCliente_${dados_servicos[i].idServico}'>${dados_servicos[i].nome}</p>
            <p class="col-2 lead texto_item_servico"><b>R$ ${dados_servicos[i].valorTotal}</b></p>
            <img src="media/assets/comments.png" alt="" class="imagem_item_servico col-1 inspec" id='statusServico_${dados_servicos[i].idServico}'>
            <p class="lead small" id='comentario_${dados_servicos[i].idServico}'>${dados_servicos[i].comentarios}</p>
            <p id='status_num_${dados_servicos[i].idServico}' style='display: none'>${dados_servicos[i].status}</p>
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
    // id numerico
    console.log('id numerico:')
    console.log(id.slice(14))
    var id_num = id.slice(14);

    // Abre inspec
    document.getElementById('div_inspec').style.display = 'grid';
    //Scroll para o topo
    window.scrollTo({top: 0, behavior: 'smooth'});
    // Carrega dados ao inspec
    document.getElementById('id_inspec').innerHTML = document.getElementById(`idServico_${id_num}`).innerHTML;
    document.getElementById('nome_inspec').innerHTML = document.getElementById(`nomeCliente_${id_num}`).innerHTML;
    document.getElementById('endereco_inspec').value = `${__dirname}\\app\\pdf_servicos\\serv_${id_num}.pdf`;
    document.getElementById('comentarios_inspec').value = document.getElementById(`comentario_${id_num}`).innerHTML;
    
    console.log("Status:" + document.getElementById(`status_num_${id_num}`).innerHTML)
    
    switch (document.getElementById(`status_num_${id_num}`).innerHTML)
    {
        case '1':
            document.getElementById("btnTrocaStatus_1").style.border = "2px solid black";
            document.getElementById("btnTrocaStatus_2").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_3").style.border = "0px solid black";
            status_selecionado = 1;
            break;
        case '2':
            document.getElementById("btnTrocaStatus_1").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_2").style.border = "2px solid black";
            document.getElementById("btnTrocaStatus_3").style.border = "0px solid black";
            status_selecionado = 2;
            break;
        case '3':
            document.getElementById("btnTrocaStatus_1").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_2").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_3").style.border = "2px solid black";
            status_selecionado = 3;
            break;
    }
    // Recarrega servicos | atualiza tela

}

function atualizaLista()
{
    // Faz o intermedio entre mysql e a funcao nodejs
    // Chamar esta funcao sempre que a lista de servicos precise ser atualizada
    // renderer.connection.query("SELECT servicos.idServico, DATE_FORMAT(servicos.dataServico, '%d-%m-%Y') as dataServico, servicos.valorTotal, servicos.comentarios, servicos.status, clientes.nome FROM servicos LEFT JOIN clientes ON servicos.idCliente = clientes.idCliente;", function(err, result, fields){mostraServicos(result)});

    // Le barra de pesquisa
    var textoPesquisa = document.getElementById('barraPesquisaServicos').value;

    renderer.connection.query(`SELECT servicos.idServico, DATE_FORMAT(servicos.dataServico, '%d-%m-%Y') as dataServico, servicos.valorTotal, servicos.comentarios, servicos.status, clientes.nome FROM servicos LEFT JOIN clientes ON servicos.idCliente = clientes.idCliente WHERE servicos.idServico LIKE '%${textoPesquisa}%' OR DATE_FORMAT(servicos.dataServico, '%d-%m-%Y') LIKE '%${textoPesquisa}%' OR clientes.nome LIKE '%${textoPesquisa}%' OR servicos.valorTotal LIKE '%${textoPesquisa}%' OR servicos.comentarios LIKE '%${textoPesquisa}%'`, function(err, result, fields){if(err) throw err; mostraServicos(result);});

}

function salvarServico(id)
{
    renderer.connection.query(`UPDATE servicos set comentarios='${document.getElementById('comentarios_inspec').value}', status = '${status_selecionado}' where idServico='${id}'`);
    // Limpa e fecha janela inspec
    document.getElementById('id_inspec').innerHTML = '';
    document.getElementById('nome_inspec').innerHTML = '';
    document.getElementById('endereco_inspec').value = '';
    document.getElementById('comentarios_inspec').value = '';
    document.getElementById('div_inspec').style.display = 'none';
    atualizaLista();
}

function excluirServico(id)
{
    const confirmOptions = {
        type: 'warning',
        defaultId: 0,
        buttons: ['Tenho certeza!', 'Cancelar'],
        title: 'Deletar serviço',
        message: `Você tem certeza que deseja remover o serviço de id ${id} da base de dados?`,
        detail: 'Essa ação não pode ser desfeita e o boleto será apagado'
    };
    let confirmacao = dialog.showMessageBoxSync(null, confirmOptions)
    //Aceitou deletar
    if (confirmacao == 0) {
        renderer.connection.query(`DELETE FROM servicos where idServico='${id}'`);
        fs.unlinkSync(`${__dirname}\\pdf_servicos\\serv_${id}.pdf`, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            console.log('File deleted!');
        });
        atualizaLista();
    }

    // Limpa e fecha janela inspec
    document.getElementById('id_inspec').innerHTML = '';
    document.getElementById('nome_inspec').innerHTML = '';
    document.getElementById('endereco_inspec').value = '';
    document.getElementById('comentarios_inspec').value = '';
    document.getElementById('div_inspec').style.display = 'none';
}

function trocaStatus(id, paraStatus)
{
    console.log('troca status');
    console.log('paraStatus' + String(paraStatus));
    console.log(id);

    switch (paraStatus)
    {
        case 1:
            document.getElementById("btnTrocaStatus_1").style.border = "2px solid black";
            document.getElementById("btnTrocaStatus_2").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_3").style.border = "0px solid black";
            status_selecionado = 1;
            break;
        case 2:
            document.getElementById("btnTrocaStatus_1").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_2").style.border = "2px solid black";
            document.getElementById("btnTrocaStatus_3").style.border = "0px solid black";
            status_selecionado = 2;
            break;
        case 3:
            document.getElementById("btnTrocaStatus_1").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_2").style.border = "0px solid black";
            document.getElementById("btnTrocaStatus_3").style.border = "2px solid black";
            status_selecionado = 3;
            break;
    }

}