let renderer = require('./renderer.js');
var {BrowserWindow} = require('electron').remote;
const fs = require('fs');

//Criando janela de produtos
let windowListaProdutos = new BrowserWindow({width: 800, height: 650, title: 'Lista de produtos', show: false});
// windowListaProdutos.removeMenu();

let btnOrcamentoMenu = document.getElementById('btnOrcamentoMenu');
btnOrcamentoMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaOrcamento', 'janelaMenu');windowListaProdutos.close();});

// btn Ja eh cliente
let btnToggleNovoCarregaCliente = document.querySelector('.jaEhClienteOrcamento');
btnToggleNovoCarregaCliente.addEventListener('click', ()=> {toggleClienteOrcamento();});

//Caso o input/datalist tenha sido alterado (cliente selecionado)
document.getElementById('inputComboBoxClienteOrcamento').addEventListener('change', ()=>{intermediarioCarregaDadosCliente();});

document.querySelector('.comboBoxNomeClienteOrcamento').style.display = 'none';

//Botao de adicionar novo produto ao carrinho
let btnAddProduto = document.querySelector('.btnAddProduto');
btnAddProduto.addEventListener('click', ()=>{renderer.connection.query("SELECT * FROM produtos", function(err, result, fields){if(err) throw err; abreWindowListaProdutos(result);})});

function toggleClienteOrcamento(){
/*  Descr: Troca a sessão de clientes da tela orçamento entre 'novo cliente' ou 'carregar
um cliente do banco de dados'. 
    Inclui: Trocar o texto de 'já É cliente?' para 'Novo Cliente'
            Trocar o input do nome para um combobox com pesquisa
            Travar alteracoes nos demais inputs
    Input: -
    Output: -
*/

    if(btnToggleNovoCarregaCliente.innerHTML=='Já é cliente')
    {
        btnToggleNovoCarregaCliente.innerHTML='Novo cliente'
        document.querySelector('.nomeClienteOrcamento').style.display = 'none';
        document.querySelector('.comboBoxNomeClienteOrcamento').style.display = 'flex';
        document.getElementById('inputTelefoneClienteOrcamento').setAttribute('readonly', true);
        document.getElementById('inputCPFClienteOrcamento').setAttribute('readonly', true);
        document.getElementById('inputEnderecoClienteOrcamento').setAttribute('readonly', true);
        //Carrega clientes e popula datalist
        renderer.connection.query("SELECT nome, idCliente FROM clientes", function(err, result, fields){if(err) throw err; populateDataListClientes(result);});
    
    }
    else
    {
        btnToggleNovoCarregaCliente.innerHTML = 'Já é cliente';
        document.querySelector('.nomeClienteOrcamento').style.display = 'flex';
        document.querySelector('.comboBoxNomeClienteOrcamento').style.display = 'none';
        document.getElementById('inputTelefoneClienteOrcamento').removeAttribute('readonly');
        document.getElementById('inputCPFClienteOrcamento').removeAttribute('readonly');
        document.getElementById('inputEnderecoClienteOrcamento').removeAttribute('readonly');
        //Limpa os campos (inputs)
        document.querySelector('.nomeClienteOrcamento').value = ''
        document.getElementById('inputTelefoneClienteOrcamento').value = '';
        document.getElementById('inputCPFClienteOrcamento').value = '';
        document.getElementById('inputEnderecoClienteOrcamento').value = '';
        document.querySelector('.comboBoxNomeClienteOrcamento').value = '';
    }

}

function populateDataListClientes(clientes){
    /*Descr: Carrega o nome dos clientes para dentro do datalist no caso de carregar
    um cliente do banco de dados. Essa funcao eh chamada apos requisicao sql, basta
    add o nome dos clientes
    Input: 
            - clientes: array com nome de todos os clientes, após requisicao sql
    Output:
            - [Apenas altera o inner html do datalist]
    */

    //html pra ser inserido no datalist
    let htmlInterior = '';

    //Percorre lista
    for(var i = 0; i<clientes.length; i++)
    {
        htmlInterior = htmlInterior + `<option value='${clientes[i].nome} (${clientes[i].idCliente})'>`
    }
    //Adiciona ao datalist
    document.getElementById('selectNomeClienteOrcamento').innerHTML = htmlInterior;
}

function intermediarioCarregaDadosCliente()
{
    /* 
        Descr: obtem o id do cliente selecionado a partir do valor do input e realiza o query no db
    */
    //Obtem value do input
    let valueInput = document.getElementById('inputComboBoxClienteOrcamento').value;
    //Obter indice do ( para obtencao do id (inclui antianta)
    let indexAbreParenteses = 0;
    for(var i = 0; i<valueInput.length; i++){if (valueInput[i]=='('){indexAbreParenteses = i;}}
    //Obter o id do cliente
    let id = valueInput.slice(indexAbreParenteses+1, -1);
    console.log(id);
    //Obter as demais informacoes
    renderer.connection.query(`SELECT telefone,cpf,endereco FROM clientes where idCliente='${id}'`, function(err, result, fields){if(err) throw err; carregaDadosClientes(result);})
}

function carregaDadosClientes(dados){
    /*Descr: recebe os demais dados do cliente selecionado e insere nos inputs 
     */
    document.getElementById('inputTelefoneClienteOrcamento').value = dados[0].telefone;
    document.getElementById('inputCPFClienteOrcamento').value = dados[0].cpf;
    document.getElementById('inputEnderecoClienteOrcamento').value = dados[0].endereco;
}

function abreWindowListaProdutos (produtos) {
    /*Descr: Abre uma nova janela com a lista de produtos; Carrega os produtos; gera um 
    html; carrega pra pagina e abre ela; Se a janela tiver sido fechada, é criada uma nova
    É ativada a partir de uma query para obter todos os produtos disponiveis
    
    Input:
            - produtos: array result da query com todos os dados dos produtos
    */
    
    //Gera html pra ser inserido no html
    // HTML introdutorio
    let htmlListaProdutos = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
        <meta name="viewport" content="width=device-width,initial-scale=1"> 
        <link rel="stylesheet" href="css/bootstrap.min.css">
        <link rel="stylesheet" href="css/styleListaProdutosOrcamento.css">
    
    
        <title>OriginalVidros carregado</title>
    </head>

    <!-- Barra de pesquisa-->
    <div class="barraPesquisa">
        <div class="md-form mt-0 col">
            <input class="form-control" type="text" placeholder="Pesquisar produto" aria-label="Search" id='barraPesquisa'>
        </div>
    </div>
    
    <body>

    <div id="listaProdutos">

    <!-- Servico -->
    <div class="card shadow border modeloServico">
        <h5 class="tituloServico">Serviço</h5>
        <button class="btn btn-outline-primary btn-sm btnServico" id="btnAddServico">Adicionar</button>
    </div>

    `;
    let produto = null;
    //Percorrendo todos os dados
    for (let i=0; i<produtos.length; i++)
    {
        produto = produtos[i];
        // HTML dos itens
        htmlListaProdutos = htmlListaProdutos + `<div class="modeloProduto card shadow border">
        <div class="separador"></div>
        <h5 class="gridID">${produto.idProduto}</h5>
        <img src='${produto.enderecoImagem}' class="gridIMAGEM">
        <p class="gridENDERECO" id='enderecoImagem${produto.idProduto}'>${produto.enderecoImagem}</p>
        
        <!-- Titulo -->
        <div class="input-group mb-1 gridTITULO">
            <h5 class="tituloProduto rounded" id='tituloProduto${produto.idProduto}'>${produto.titulo}</h5>
        </div>

        <!-- Descricao -->
        <div class="input-group gridDESCRICAO">
            <textarea class="form-control novoProdutoTextArea" style='border: 0px; background-color: inherit' readonly id='descricaoProduto${produto.idProduto}'>${produto.descricao}</textarea>
        </div>

        <!-- Preco m2 -->
        <div class="input-group mb-2 gridPRECOM2">
            <div class="input-group-prepend">
            <span class="input-group-text novoProdutoTituloInput text-dark" style="background-color: rgb(232, 232, 232);">Preço m²</span>
            </div>
            <input type="number" readonly class="precom2 form-control novoProdutoInput" id='precoM2Produto${produto.idProduto}' width="900" placeholder="${produto.preco_m2}" aria-describedby="basic-addon1" style='border: 0px; background-color: inherit;'>
        </div>

        <!-- Preco kit -->
        <div class="input-group gridPRECOKIT">
            <div class="input-group-prepend">
            <span class="input-group-text novoProdutoTituloInput text-dark" style="background-color: inherit;">Preço kit</span>
            </div>
            <input type="number" readonly class="precokit form-control novoProdutoInput" id='precoKitProduto${produto.idProduto}' placeholder="${produto.preco_kit}" aria-label="Username" aria-describedby="basic-addon1" style='border: 0px; background-color: inherit;'>
        </div>

        <button class="btn btn-outline-primary btn-sm gridBTN" id="btnAddProduto${produto.idProduto}">Adicionar</button>
        </div>
        <div class="separador"></div>
        <div class="linhaHorizontal"></div><div class="separador"></div>`;
    }

    // HTML final
    htmlListaProdutos = htmlListaProdutos + `</div><script src='listaProdutosOrcamento.js'></script></body></html>`;

    //Definindo html do arquivo
    fs.writeFile(`${__dirname}/windowProdutosOrcamento.html`, htmlListaProdutos, function (err) {if (err) throw err;
        windowListaProdutos.loadFile(`${__dirname}/windowProdutosOrcamento.html`);})
    //Abrindo pagina

    try{
        windowListaProdutos.show();
    }
    catch{
        windowListaProdutos = new BrowserWindow({width: 800, height: 650, title: 'Lista de produtos', show: false});
        // windowListaProdutos.removeMenu();
        // windowListaProdutos.loadFile(`${__dirname}/windowProdutosOrcamento.html`);
        windowListaProdutos.show();
    }

    windowListaProdutos.reload();
    windowListaProdutos.show();
}
