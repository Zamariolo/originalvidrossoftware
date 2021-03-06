// let renderer = require('./renderer.js');
const ipc = require('electron').ipcRenderer;

//Obter todos os ids elements
let ids = document.querySelectorAll('div.modeloProduto > h5.gridID');
let enderecosImagens = document.querySelectorAll('img.gridIMAGEM');
let titulos = document.querySelectorAll('h5.tituloProduto');
let descricoes = document.querySelectorAll('textarea.novoProdutoTextArea');
let precosm2 = document.querySelectorAll('input.precom2');
let precoskit = document.querySelectorAll('input.precokit');
let btnAddServico = document.getElementById('btnAddServico');

//Inserindo eventListener aos botoes
insereEventListenerBotoes();
// //Insere eventListener ao btnServico (ele requisita a mesma funcao mas com id de 'servico')
btnAddServico.addEventListener('click', function(){ipc.send('adicionar-produto-main', 'servico');});


//Colocar valores em array
let arrayProdutos = [];
for (var k = 0; k<ids.length; k++)
{
    arrayProdutos.push([ids[k].innerHTML, enderecosImagens[k].src, titulos[k].innerHTML, descricoes[k].innerHTML, precosm2[k].placeholder, precoskit[k].placeholder]);
}

//Funcionamento da barra de pesquisa
let barraPesquisa = document.getElementById('barraPesquisa');
barraPesquisa.addEventListener('keyup', ()=>{
    recarregaListaProdutos(barraPesquisa.value, arrayProdutos);
});

let divListaProdutos = document.getElementById('listaProdutos');

function recarregaListaProdutos(textoPesquisa, arrayProdutos)
{
    //Obtendo quais produtos satisfazem a pesquisa
    var produtosPesquisa = [];

    if (textoPesquisa == '')
    {
        produtosPesquisa = arrayProdutos;
    }
    else //Se o usuario esta buscando um produto especifico
    {
        //Percorrer todos elementos
        for (var k=0; k<arrayProdutos.length; k++)
        {
            [id, titulo, descricao] = [arrayProdutos[k][0].toLowerCase(), arrayProdutos[k][2].toLowerCase(), arrayProdutos[k][3].toLowerCase()];
            if (id.includes(textoPesquisa.toLowerCase()) || titulo.includes(textoPesquisa.toLowerCase()) || descricao.includes(textoPesquisa.toLowerCase()))
            {
                produtosPesquisa.push(arrayProdutos[k]);
            }
        }
    }

    //Mostra produtos
    let listaProdutosHTML = ``;

    for (let i=0; i<produtosPesquisa.length; i++)
    {
        // HTML dos itens
        listaProdutosHTML = listaProdutosHTML + `<div class="modeloProduto card shadow border">
        <div class="separador"></div>
        <h5 class="gridID">${produtosPesquisa[i][0]}</h5>
        <img src='${produtosPesquisa[i][1]}' class="gridIMAGEM">
        
        <!-- Titulo -->
        <div class="input-group mb-1 gridTITULO">
            <h5 class="tituloProduto rounded" id='tituloProduto${produtosPesquisa[i][0]}'>${produtosPesquisa[i][2]}</h5>
        </div>

        <!-- Descricao -->
        <div class="input-group gridDESCRICAO">
            <textarea class="form-control novoProdutoTextArea" style='border: 0px; background-color: inherit' readonly id='descricaoProduto${produtosPesquisa[i][0]}'>${produtosPesquisa[i][3]}</textarea>
        </div>

        <!-- Preco m2 -->
        <div class="input-group mb-2 gridPRECOM2">
            <div class="input-group-prepend">
            <span class="input-group-text novoProdutoTituloInput text-dark" style="background-color: rgb(232, 232, 232);">Preço m²</span>
            </div>
            <input type="number" readonly class="precom2 form-control novoProdutoInput" id='precoM2Produto${produtosPesquisa[i][0]}' width="900" placeholder="${produtosPesquisa[i][4]}" aria-describedby="basic-addon1" style='border: 0px; background-color: inherit;'>
        </div>

        <!-- Preco kit -->
        <div class="input-group gridPRECOKIT">
            <div class="input-group-prepend">
            <span class="input-group-text novoProdutoTituloInput text-dark" style="background-color: inherit;">Preço kit</span>
            </div>
            <input type="number" readonly class="precokit form-control novoProdutoInput" id='precoKitProduto${produtosPesquisa[i][0]}' placeholder="${produtosPesquisa[i][5]}" aria-label="Username" aria-describedby="basic-addon1" style='border: 0px; background-color: inherit;'>
        </div>

        <button class="btn btn-outline-primary btn-sm gridBTN" id="btnAddProduto${produtosPesquisa[i][0]}">Adicionar</button>
        </div>
        <div class="separador"></div>
        <div class="linhaHorizontal"></div><div class="separador"></div>`;
    }

    divListaProdutos.innerHTML = listaProdutosHTML;

    insereEventListenerBotoes();


}

//Adiciona funcionalidade a todos os botoes
function insereEventListenerBotoes(){
    /* Essa funcao adiciona addEventListener em todos os botoes e ja liga com a main
    via conexao IPC e envia o sinal para rendererOrcamento.js
     */
    let botoesInserir = document.querySelectorAll("button.gridBTN");
    let idBotao;

    // btnAddServico = document.getElementById('btnAddServico');
    // btnAddServico.addEventListener('click', function(){ipc.send('adicionar-produto-main', 'servico');});

    for(var j =0; j<botoesInserir.length; j++)
    {
        idBotao = botoesInserir[j].id;
        botoesInserir[j].addEventListener('click', function(){ipc.send('adicionar-produto-main', this.id.slice(13));});
    }
}


