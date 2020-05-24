let renderer = require('./renderer.js');
var {BrowserWindow} = require('electron').remote;
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
var {dialog} = require('electron').remote;
convertFactory = require('electron-html-to');

//Inicializando
document.querySelector('.nomeClienteOrcamento').style.display = 'flex'

//Variabel global para armazenar produtos do carrinho
let divProdutosCarrinho = document.getElementById('divProdutosCarrinho');
let carrinho = [];
let idInterno = 0;
//Variaveis globais para gerar boleto
let idDoCliente = 0;
let idDoServico = 0;

//Criando janela de produtos
// let windowListaProdutos = new BrowserWindow({width: 800, height: 650, title: 'Lista de produtos', show: false, webPreferences: {
//     nodeIntegration: true
// }});
// // windowListaProdutos.removeMenu();
windowListaProdutos = require('electron').remote.getGlobal( "windowListaProdutos" );

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

//btn Salvar e imprimir
let btnSalvarImprimir = document.querySelector(".btnSalvarImprimir");
btnSalvarImprimir.addEventListener('click', ()=>{salvarImprimir();});

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

    //Carregando dados
    renderer.connection.query('SELECT MAX(idCliente) FROM clientes', function(err, maxID, fields){idDoCliente=maxID});
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
    //Obter as demais informacoes
    renderer.connection.query(`SELECT idCliente,telefone,cpf,endereco FROM clientes where idCliente='${id}'`, function(err, result, fields){if(err) throw err; carregaDadosClientes(result);})
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
    
    
        <title>Lista de produtos</title>
    </head>

    <!-- Barra de pesquisa-->
    <div class="barraPesquisa">
        <div class="md-form mt-0 col">
            <input class="form-control" type="text" placeholder="Pesquisar produto" aria-label="Search" id='barraPesquisa'>
        </div>
    </div>
    
    <body>

    <!-- Servico -->
    <div class="card shadow border modeloServico">
        <h5 class="tituloServico">Serviço</h5>
        <button class="btn btn-outline-primary btn-sm btnServico" id="btnAddServico">Adicionar</button>
    </div>

    <div id="listaProdutos">

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
        windowListaProdutos = require('electron').remote.getGlobal( "windowListaProdutos" );
        windowListaProdutos = new BrowserWindow({width: 800, height: 650, title: 'Lista de produtos', show: false, webPreferences: {
            nodeIntegration: true
        }});
        // windowListaProdutos.webContents.openDevTools();
        // windowListaProdutos.removeMenu();
        // windowListaProdutos.loadFile(`${__dirname}/windowProdutosOrcamento.html`);
        windowListaProdutos.show();
    }

    windowListaProdutos.reload();
    windowListaProdutos.show();
}

function addProduto(dados){

    //Aquisicao de dados
    let id = dados[0].idProduto;
    let titulo = dados[0].titulo;
    let descricao = dados[0].descricao;
    let endereco = dados[0].enderecoImagem;
    let precom2 = dados[0].preco_m2;

    //Gerenciamento de insercao
    idInterno = idInterno + 1; //Para evitar que ids se repitam nos divs dos produtos inseridos
    carrinho.push({idCarrinho: id+'_'+idInterno.toString(), idOriginal: id})
    console.log(carrinho);

    divProdutosCarrinho.innerHTML = divProdutosCarrinho.innerHTML + 
    `<!-- Modelo produto -->
    <div class="divProdutoAdicionado border" id='div_${id+'_'+idInterno.toString()}'>
        <!-- Imagem -->
        <img src="${endereco}" id="imagem_${id}_${idInterno}" class="imagemProdutoAdd">
        <!-- Titulo -->
        <h5 class="tituloProdutoAdd" id="titulo_${id}_${idInterno}">${titulo}</h5>
        <div class="divPrecom2 lead" id='precom2_${id}_${idInterno}'>R$ ${precom2}/m²</div>
        <!-- Descricao -->
        <textarea class="descricaoProdutoAdd form-control" rows="4" readonly id="descricao_${id}_${idInterno}">${descricao}</textarea>
        <!-- Entrada das dimensoes e valor kit -->
        <div class="divEntradaProdutoAdd">
            <input type="text" id='input1_${id}_${idInterno}' class="entrada1ProdutoAdd form-control addListener" placeholder="" value='0'>
            <input type="text" id='input2_${id}_${idInterno}' class="entrada2ProdutoAdd form-control addListener" placeholder="" value='0'>
            <div class="x">x</div>
            <div class="areaProdutoAdd" id='area_${id}_${idInterno}'>= 0.00 m²</div>
            <!-- Kit -->
            <div class="input-group inputKit">
                <div class="input-group-prepend">
                <span class="input-group-text bg-light">Kit (R$)</span>
                </div>
                <input type="number" id="inputKit_${id}_${idInterno}" min="0" class="form-control addListener" width="900" placeholder="R$ KIT" aria-describedby="basic-addon1">
            </div>
        </div>
        <!-- Preço -->
        <h5 class="precoProdutoAdd" id='valor_${id}_${idInterno}'>R$ 00.00</h5>
        <!-- btn exclui produto -->
        <div class="btnExcluiProdutoAdd" id='remove_${id}_${idInterno}'><a class="btn btn-sm">x</a></div>
    </div>`;

    //Dando eventListener aos inputs
    let inputs = document.querySelectorAll("input.addListener");

    for (let j=0; j<inputs.length; j++)
    {
        inputs[j].addEventListener('keyup', ()=>{atualizaCustoProduto(inputs[j].id);});
    }

    //Dando eventListener aos botoes de excluir produto do carrinho
    let btnRemover = document.querySelectorAll("div.btnExcluiProdutoAdd");
    for (let j=0; j<btnRemover.length; j++)
    {
        btnRemover[j].addEventListener('click', ()=>{removeProdutoCarrinho(btnRemover[j].id);});
    }
}

function addServico(){
    idInterno = idInterno + 1;
    carrinho.push({idCarrinho: 'Servico_'+idInterno.toString(), idOriginal: 'servico'})

    divProdutosCarrinho.innerHTML = divProdutosCarrinho.innerHTML +
    `<!-- Modelo servico -->
    <div class="divProdutoAdicionado border" id='div_Servico_${idInterno}'>
        <!-- Imagem -->
        <div id='' class="imagemProdutoAdd"></div>
        <!-- Titulo -->
        <input type="text" class="form-control tituloProdutoAdd" id="titulo_Servico_${idInterno}" placeholder="Nome do serviço/desconto/instalação">
        <div class="divPrecom2 lead"></div>
        <!-- Descricao -->
        <textarea class="descricaoProdutoAdd form-control" rows="4" id="descricao_Servico_${idInterno}"></textarea>
        <!-- Entrada das dimensoes e valor kit -->
        <div class="divEntradaProdutoAdd">
            <!-- Valor do servico -->
            <div class="input-group inputKit">
                <div class="input-group-prepend">
                <span class="input-group-text bg-light">Valor (R$)</span>
                </div>
                <input type="number" id="input_Servico_${idInterno}" class="form-control addListener" width="1000" placeholder="Valor do serviço" aria-describedby="basic-addon1">
            </div>
        </div>
        <!-- Preço -->
        <h5 class="precoProdutoAdd" id='valor_Servico_${idInterno}'>R$ 0.00</h5>
        <!-- btn exclui produto -->
        <div class="btnExcluiProdutoAdd" id='remove_Servico_${idInterno}'><a class="btn btn-sm">x</a></div>
        
    </div>`;

    //Dando eventListener aos inputs
    let inputs = document.querySelectorAll("input.addListener");

    for (let j=0; j<inputs.length; j++)
    {
        inputs[j].addEventListener('keyup', ()=>{atualizaCustoProduto(inputs[j].id);});
    }

    //Dando eventListener aos botoes de excluir produto do carrinho
    let btnRemover = document.querySelectorAll("div.btnExcluiProdutoAdd");
    for (let j=0; j<btnRemover.length; j++)
    {
        btnRemover[j].addEventListener('click', ()=>{removeProdutoCarrinho(btnRemover[j].id);});
    }
}

function atualizaCustoProduto(idElement){
    //Atualiza somente os precos do item selecionado, nao de todos igual mostraClientes()
    //Obter idCarrinho
    let posUnderline = idElement.indexOf('_');
    let idCarrinho = idElement.slice(posUnderline+1);
    //Detecta se é produto ou servico e calcula o valor deste item
    if(idCarrinho.slice(0,7)=='Servico'){
        //Eh serviço
        let valor = document.getElementById(`input_${idCarrinho}`).value;
        //Mostra valor final do item
        document.getElementById(`valor_${idCarrinho}`).innerHTML = "R$ "+ Number(valor).toFixed(2);
    }
    else {
        //Eh produto
        let valor1 = document.getElementById(`input1_${idCarrinho}`).value;
        let valor2 = document.getElementById(`input2_${idCarrinho}`).value;
        let area = Number(valor1)*Number(valor2);
        //Mostra area
        document.getElementById(`area_${idCarrinho}`).innerHTML = area.toFixed(2) + "m²"
        let valorKit = document.getElementById(`inputKit_${idCarrinho}`).value;
        //Obtem valor do m2
        let textoPrecom2 = document.getElementById(`precom2_${idCarrinho}`).innerHTML;
        let valorm2 = textoPrecom2.slice(3,textoPrecom2.indexOf('/'));
        let precoProduto = (area*valorm2);
        //Mostra valor final
        document.getElementById(`valor_${idCarrinho}`).innerHTML = "R$ " + (Number(precoProduto)+Number(valorKit)).toFixed(2);
    }

    //Atualiza preço total
    atualizaPrecoTotal();

}

function atualizaPrecoTotal(){
    //Obtem todos os preços dos itens
    let precosItens = document.querySelectorAll('h5.precoProdutoAdd');
    let valorTotal = 0;
    //Calcula o valor total
    for (var i = 0; i<precosItens.length; i++){
        valorTotal = valorTotal + Number(precosItens[i].innerHTML.slice(3));
    }
    // Mostra o valor total
    document.getElementById('precoTotal').innerHTML = "R$ " + valorTotal.toFixed(2);
}

function removeProdutoCarrinho(idElement){
    document.getElementById(`div${idElement.slice(6)}`).remove();

    // Remove do carrinho
        //Busca pela posicao e tira do array pela posicao
    for (i=0; i<carrinho.length; i++)
    {
        if (String(carrinho[i].idCarrinho) == idElement.slice(7))
        {
            pos = i;
        }
    }
    carrinho.splice(pos,1) //Remove elemento do array carrinho

    atualizaPrecoTotal();
}

function salvarImprimir(){

    // Le id do cliente e servico
    var idCliente = parseInt(fs.readFileSync('app/last_idCliente.txt'))+1;
    var idServico = fs.readFileSync('app/last_idServico.txt');

    ///////////////////// CLIENTE
    ////////////////////////////////////

    //Obtem dados (menos nome pq vai depender se é novo cliente ou nao)
    let nomeCliente = '';
    let cpfCliente = document.getElementById('inputCPFClienteOrcamento').value;
    let enderecoCliente = document.getElementById('inputEnderecoClienteOrcamento').value;
    let telefoneCliente = document.getElementById('inputTelefoneClienteOrcamento').value;

    //Se for cliente novo => verifica e insere no banco de dados
    if (document.querySelector('.nomeClienteOrcamento').style.display == 'flex')
    {
        //Obtem nomeCliente
        nomeCliente = document.getElementById('inputNomeClienteOrcamento').value;
        //Verifica se as entradas (nome, telefone) são válidos
        //Verifica se foi inserido nome
        if (nomeCliente==''){dialog.showMessageBoxSync('',{title: `Campo 'nome' vazio!`, message: 'Não se pode inserir um cliente sem nome', type:'warning'}); return 0;}
        //Verifica se foi inserido numero de telefone
        if (telefoneCliente==''){dialog.showMessageBoxSync('',{title: `Campo 'telefone' vazio!`, message: 'Não se pode inserir um cliente sem telefone', type:'warning'}); return 0;}
    
        //Insere no banco de dados (se nao tiver falhado nas etapas acima)
        renderer.connection.query(`INSERT INTO clientes (nome, cpf, telefone, endereco) values ('${nomeCliente}','${cpfCliente}','${telefoneCliente}','${enderecoCliente}')`);
        
        fs.writeFileSync('app/last_idCliente.txt', String(parseInt(idCliente)+1));
    }
    else{
        //Obtem nomeCliente
        nomeCliente = document.getElementById('inputComboBoxClienteOrcamento').value;
        idCliente = nomeCliente.slice(-3,-1) //Arrumar isso aqui pra aceitar clientes com 3digitos de id
    }

   
    console.log('Idservico: ' + idServico);
    console.log('idCliente: ' +idCliente);

    fs.writeFileSync('app/last_idServico.txt', String(parseInt(idServico)+1));

    //Obtem data
    let data = new Date();
    let hoje = String("0" + data.getDay()).slice(-2) + '/' + String("0" + data.getMonth()).slice(-2) + '/' + data.getFullYear();

    //Adiciona servico no banco de dados
    renderer.connection.query(`INSERT INTO servicos (idCliente, dataServico, valorTotal, comentarios, status) 
    VALUES ('${idCliente}', '${data.getFullYear()}-${String("0" + data.getMonth()).slice(-2)}-${String("0" + data.getDay()).slice(-2)}', '${String(document.getElementById('precoTotal').innerHTML).slice(3)}','' , '1')`);
    

    //Gera html para imprimir
    //Html inicial
    let htmlImprimir = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
        <meta name="viewport" content="width=device-width,initial-scale=1"> 
        <link rel="stylesheet" href="./css/bootstrap.min.css">
        <link rel="stylesheet" href="./css/styleWindowImprimir.css">
    
    
        <title>Imprimir orçamento</title>

            <embed
        type="application/pdf"
        src="path_to_pdf_document.pdf"
        id="pdfDocument"
        width="100%"
        height="100%" />
    </head>
    
    <body>

        <!-- Div cabecalho -->
        <div class="divCabecalho container border">
            <img src="https://comerciomogiguacu.com.br/wp-content/uploads/2019/10/logovidracaria-1.jpg.webp" alt="" class="logo">
            <p class="texto1">Box - Espelho - Vidros - Ferragens</p>
            <p class="texto2">Fone: (19) 3831-1112</p>
            <p class="texto3">Avenida Mogi Mirim, N° 503 - Areião - Mogi Guaçu - SP</p>
            <p class="texto4">E-mail: vidracariaoriginal@hotmail.com</p>
        </div>
        
        <!-- Numero do servico  -->
        <div class="container"><h3 style="color: red;" class="float-right">${idServico}</h3></div>

        <div class="separador"></div>

        <!-- div dados cliente -->
        <div class="divCliente container">
            <table>
                <tr>
                    <td>Data: </td>
                    <td colspan="3">${hoje}</td>
                </tr>

                <tr>
                    <td>Cliente: </td>
                    <td colspan="3">${nomeCliente}</td>
                </tr>
                <tr>
                    <td>CPF:</td>
                    <td>${cpfCliente}</td>
                    <td>Fone:</td>
                    <td>${telefoneCliente}</td>
                </tr>
                <tr>
                    <td>Endereço</td>
                    <td colspan="3">${enderecoCliente}</td>
                </tr>
            </table>
        </div>

        <div class="separador"></div>
        <div class="separador"></div>

        <!-- Div lista de produtos -->
        <div class="container">
        <!-- Continua no codigo -->
        `
    
    // Carrega produtos e servicos na pagina
    for (var i=0; i<carrinho.length; i++)
    {
        // Verifica se é servico
        if(carrinho[i].idOriginal == 'servico')
        {
            id_servico = carrinho[i].idCarrinho;

            // Obtem parametros do servico
            var valor = document.getElementById(`input_${id_servico}`).value;
            var titulo = document.getElementById(`titulo_${id_servico}`).value;
            var descricao = document.getElementById(`descricao_${id_servico}`).value;

            // Insere servico no html
            htmlImprimir = htmlImprimir + 
            `<div class="div_servico_imprimir border">
                <h3 class="titulo_servico">${titulo}</h3>
                <p class="lead descricao_servico" align="justify">${descricao}</p>
                <h2 class="valor_servico">R$ ${valor}</h2>
            </div>`
        }
        // Se for um produto...
        else
        {
            id_servico = carrinho[i].idCarrinho;            
            // Obtem parametros do produto
            var titulo = document.getElementById(`titulo_${id_servico}`).innerHTML;
            var descricao = document.getElementById(`descricao_${id_servico}`).value;
            var imagem = document.getElementById(`imagem_${id_servico}`).src;
            var input1 = document.getElementById(`input1_${id_servico}`).value;
            var input2 = document.getElementById(`input2_${id_servico}`).value;
            var kit = document.getElementById(`inputKit_${id_servico}`).value;
            var area = document.getElementById(`area_${id_servico}`).innerHTML;
            var valor = document.getElementById(`valor_${id_servico}`).innerHTML;

            console.log(titulo, descricao, imagem, input1, input2, kit, area, valor);

            // Insere produto no html
            htmlImprimir = htmlImprimir + `
            <div class="container div_produto_imprimir border">
                <h3 class="titulo"_produto>${titulo}</h3>
                <p class="lead descricao_produto">${descricao}</p>
                <img src="${imagem}" class="imagem_produto">
                <div class="div_dados_produto">
                    <p>${input1} X ${input2} = ${area}</p>
                    <p>Kit: ${kit}</p>
                </div>
                
                <h2 class="valor_produto">${valor}</h2>
            </div>
            `
        }

    }

    //Html final
    htmlImprimir = htmlImprimir + `</div>

    <!-- Div condicoes -->
    <div class="separador"></div>
    <div class="separador"></div>
    <div class="separador"></div>
    <div class="divCondicoes container">
        <p>À vista 5% de desconto ou 4x no cartão; Prazo de 20 dias; Depois de instalado o vidro não tem garantia; o Kit possui garantia de 3 meses após instalação.</p>
    </div>

    <!-- div Assinatura e total -->
    <div class="separador"></div>
    <div class="container divAssinatura">
        <h4 class="textoAssinatura1">Concordo com os termos</h4>
        <h4 class="linhaAssinatura">___________________________________</h4>
        <h6 class="textoAssinatura2">Assinatura</h6>
        <div class="divTotal">
            <h3 class="textoTotal">Total</h3>
            <h3 class="valorTotal">${document.getElementById('precoTotal').innerHTML}</h3>
        </div>
        
    </div>

</body>
</html>`

    //Cria janela, abre, maximiza e carrega seu html
    let windowImprimir = new BrowserWindow({width: 800, height: 650, title: 'Lista de produtos', webPreferences: {
        nodeIntegration: true
    }});

    windowImprimir.maximize();
    //Definindo html do arquivo e o carregando
    fs.writeFile(`${__dirname}/windowImprimir.html`, htmlImprimir, function (err) {if (err) throw err;
        windowImprimir.loadFile(`${__dirname}/windowImprimir.html`);    
    })

    // windowImprimir.loadFile(`${__dirname}/windowImprimir.html`);

    //Salva copia de pdf
    windowImprimir.webContents.on('did-finish-load', () => {
        // Use default printing options
        windowImprimir.webContents.printToPDF({
            marginsType: 0,
            printBackground: false,
            printSelectionOnly: false,
            landscape: false,
            pageSize: 'A4',
            scaleFactor: 100
          }).then(data => {
          fs.writeFile(`${__dirname}/pdf_servicos/serv_${idServico}.pdf`, data, (error) => {
            if (error) throw error
            console.log('Write PDF successfully.')
          })
        }).catch(error => {
          console.log(error)
        })

         //Limpando tela de orcamento
         divProdutosCarrinho.innerHTML = '';
         document.getElementById('precoTotal').innerHTML = 'R$ 00.00';
         document.getElementById('inputTelefoneClienteOrcamento').value = '';
         document.getElementById('inputCPFClienteOrcamento').value = '';
         document.getElementById('inputEnderecoClienteOrcamento').value = '';
         document.querySelector('.nomeClienteOrcamento').value = '';
         document.querySelector('.comboBoxNomeClienteOrcamento').value = '';
         document.querySelector('.comboBoxNomeClienteOrcamento').selectedIndex = 0;
         carrinho = [];

         console.log("Abrindo impressora")
         var options = {
             pageSize: 'A4'
         }
         windowImprimir.webContents.print(options)

    })
    





}
// #################################################################
// #################### IPC COMMUNICATION ##########################
//Recebe o sinal da main que por sua vez é recebido da outra janela

ipc.on('adicionar-produto-orcamento', function(event, arg){
    if (arg!='servico')
    {renderer.connection.query(`SELECT * FROM produtos WHERE idProduto='${arg}'`, function(err, result, fields){if(err) throw err; addProduto(result);})}
    else if(arg=='servico'){addServico();} 
});
