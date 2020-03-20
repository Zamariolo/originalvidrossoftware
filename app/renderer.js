// =========================== GLOBAL ===============================
// ==================================================================

var {dialog} = require('electron').remote;
var rendererClientes = require('./rendererClientes.js');

//mysql connection
var mysql = require('mysql');
con = mysql.createConnection({  //Conectando ao banco de dados
    host: "localhost",
    port: 3306,
    user: "admin",
    password: "admin",
    database: 'databaseOriginalVidros'
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("mysql connected!");
  });

module.exports.connection = con; //Deixa a conexao ao db global p/ todos arquivos


function trocaTela(origem, destino){
    let telaOrigem = document.querySelector("."+origem);
    let telaDestino = document.querySelector("."+destino);
    telaOrigem.style.display = 'none';
    telaDestino.style.display = 'inline';
}

module.exports.trocaTela = trocaTela; //deixa a funcao acessivel p todos arquivos

let idProduto = null;
// ==================== fim GLOBAL ==================================
// ==================================================================

// ======================= menuSuperior ==========================
// ==================================================================

// getting global elements
let janelaMenu = document.querySelector('.janelaMenu');
let janelaProdutos = document.querySelector('.janelaProdutos');
let janelaClientes = document.querySelector('.janelaClientes')

// >>>>>>>>>>>>>>>>>>>>>>> Relogio
let relogio = document.querySelector('.relogio');

function attRelogio() {
    let date = new Date();
    let hora = String("0" + date.getHours()).slice(-2);
    let minuto = String("0" + date.getMinutes()).slice(-2);
    let segundo = String("0" + date.getSeconds()).slice(-2);



    let horario = hora+":"+minuto+":"+segundo;
    relogio.innerHTML = horario;
}
setInterval(attRelogio, 1000);
// <<<<<<<<<<<<<<<<<<<<<<<< fim relogio

// ======================= fim menuSuperior ====================
// ==================================================================


// =========================== janelaMenu ===========================
// ==================================================================

//Troca telas
let btnProdutos = document.getElementById('btnProdutos');
let btnClientes = document.getElementById('btnClientes');

//menu -> produtos
btnProdutos.addEventListener('click', () => {trocaTela('janelaMenu','janelaProdutos'); carregaProdutosDB();});
btnClientes.addEventListener('click', ()=>{trocaTela('janelaMenu', 'janelaClientes'); con.query("SELECT * FROM clientes", function(err, result, fields){if(err) throw err; rendererClientes.mostraClientes(result);});});

// =========================== fim JanelaMenu ===========================
// ==================================================================


//=========================== janelaProdutos ===========================
// ==================================================================
let btnProdutosMenu = document.getElementById('btnProdutosMenu');
let btnNovoProduto = document.getElementById('btnNovoProduto');
let btnCarregarProdutosDB = document.getElementById('btnCarregaProdutosDB');
let btnInserirProduto = document.getElementById('btnInserirProduto');
let btnEditarProduto = document.getElementById('btnEditarProduto');

//NovoProduto
let inputTituloNovoProduto = document.getElementById('inputTituloNovoProduto');
let btnEnderecoImagemNovoProduto = document.getElementById('btnEnderecoImagemNovoProduto');
let pEnderecoImagem = document.getElementById('pEnderecoImagem');
let inputDescricaoNovoProduto = document.getElementById('inputDescricaoNovoProduto');
let inputPrecoM2NovoProduto = document.getElementById('inputPrecoM2NovoProduto');
let inputPrecoKitNovoProduto = document.getElementById('inputPrecoKitNovoProduto');

//EditarProduto
let editarImagem = document.getElementById('editarImagem');
let editarEnderecoImagem = document.getElementById('editarEnderecoImagem');
let editarTituloProduto = document.getElementById('editarTituloProduto');
let editarDescricaoProduto = document.getElementById('editarDescricaoProduto');
let editarPrecoM2Produto = document.getElementById('editarPrecoM2Produto');
let editarPrecoKitProduto = document.getElementById('editarPrecoKitProduto');

let divNovoProduto = document.querySelector('.novoProdutoTemplate');
divNovoProduto.style.display='none'
let divEditarProduto = document.getElementById('divEditarProduto');
divEditarProduto.style.display = 'none'
let divListaProdutos = document.querySelector('.listaProdutos');

//carregamento da janelaProdutos
btnProdutosMenu.addEventListener('click', ()=>{trocaTela('janelaProdutos', 'janelaMenu');divListaProdutos.innerHTML='';});

//Abre box para adicionar novo produto    
btnNovoProduto.addEventListener('click', ()=>{exibeEntradaProdutos()});

//Insercao de produto
btnInserirProduto.addEventListener('click', ()=>{aquisicaoANDcomparacao();});

//Obtem enderecoDaImagem e exibindo tela Insercao
btnEnderecoImagemNovoProduto.addEventListener('click', ()=>{obtemEnderecoImagem(btnEnderecoImagemNovoProduto, pEnderecoImagem)});

//Obtendo enderedoDaImagem e exibindo tela Edicao
editarImagem.addEventListener('click', ()=>{obtemEnderecoImagem(editarImagem,editarEnderecoImagem)});

//Salvar edições de um produto
btnEditarProduto.addEventListener('click', ()=> {salvarEdicaoProduto();});
 
//Carrega banco de dados produtos e chama exibicao na janela produtos
btnCarregarProdutosDB.addEventListener('click', () => {carregaProdutosDB();}); //Atrelado ao botao recarregar produtos
function carregaProdutosDB () {
    con.query("SELECT * FROM produtos", function(err, result, fields){if(err) throw err; mostraProdutos(result);});
}

function mostraProdutos(produtos){  
    let i;
    let htmlListaProdutos = '<div class="separador"></div>';
    let produto = null;

    //Percorrendo todos os dados
    for (i=0; i<produtos.length; i++)
    {
        produto = produtos[i];

        htmlListaProdutos = htmlListaProdutos + 
        `        
        <div class="modeloProduto">
        <div class="separador"></div>
        <h5 class="gridID">${produto.idProduto}</h5>
        <img src='${produto.enderecoImagem}' class="gridIMAGEM">
        <p class="gridENDERECO" id='enderecoImagem${produto.idProduto}'>${produto.enderecoImagem}</p>
        
        <!-- Titulo -->
        <div class="input-group mb-1 gridTITULO">
            <h5 class="tituloProduto rounded" id='tituloProduto${produto.idProduto}'>${produto.titulo}</h5>
            <!-- <input type="text" class="form-control novoProdutoTextArea" placeholder="Título do produto" aria-label="titulo" aria-describedby="basic-addon1"> -->
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
            <input type="number" readonly class="form-control novoProdutoInput" id='precoM2Produto${produto.idProduto}' width="900" placeholder="${produto.preco_m2}" aria-describedby="basic-addon1" style='border: 0px; background-color: inherit;'>
        </div>

        <!-- Preco kit -->
        <div class="input-group gridPRECOKIT">
            <div class="input-group-prepend">
            <span class="input-group-text novoProdutoTituloInput text-dark" style="background-color: inherit;">Preço kit</span>
            </div>
            <input type="number" readonly class="form-control novoProdutoInput" id='precoKitProduto${produto.idProduto}' placeholder="${produto.preco_kit}" aria-label="Username" aria-describedby="basic-addon1" style='border: 0px; background-color: inherit;'>
        </div>

        <button class="btn btn-outline-secondary btn-sm btnEditarProduto" id="btnEditarProduto${produto.idProduto}">Editar</button>
        <button class="btn btn-outline-danger btn-sm btnDeletarProduto" id="btnDeletarProduto${produto.idProduto}">Excluir</button>
    </div>
    <div class="separador"></div>
    <div class="linhaHorizontal"></div><div class="separador"></div>
    `
    }
    //Exibe lista de produtos
    divListaProdutos.innerHTML = htmlListaProdutos;

    //Adicionando funcionalidades aos botoes
    let botoesProduto = document.querySelectorAll(".modeloProduto > .btnDeletarProduto");
    let idBotao;
    //Opcao deletar
    for (i=0; i<botoesProduto.length; i++)
    {
        idBotao = botoesProduto[i].id;
        botoesProduto[i].addEventListener('click', function(){deletarProduto(this.id);});
    }
    //Opcao editar
    botoesProduto = document.querySelectorAll(".modeloProduto > .btnEditarProduto");
    for(i=0; i<botoesProduto.length; i++)
    {
        idBotao = botoesProduto[i].id;
        botoesProduto[i].addEventListener('click', function(){editarProduto(this.id);});
    }
}

function exibeEntradaProdutos(){

    //Filhos dos divs
    let filhosListaProdutos = document.querySelectorAll(".modeloProduto > button");
    var i;
    var elemento;

    //Se a janela esta oculta
    if(divNovoProduto.style.display=='none')
    {
        divNovoProduto.style.display = 'grid';
        divListaProdutos.style.opacity=0.08; 
        divListaProdutos.style.filter="alpha(opacity=8)";

        //Desativar botoes
        for (i=0; i<filhosListaProdutos.length; i++)
        {
            elemento = filhosListaProdutos[i];
            elemento.disabled = true;
        }
    }
    else  //Se a janela esta sendo exibida
    {
        divNovoProduto.style.display = 'none';
        divListaProdutos.style.opacity=1; 
        divListaProdutos.style.filter="alpha(opacity=100)";

        //Reativar botoes
        for (i=0; i<filhosListaProdutos.length; i++)
        {
            elemento = filhosListaProdutos[i];
            elemento.disabled = false;
        }
    }
}

function obtemEnderecoImagem(imagemDestino, enderecoDestino){
    //Obtem o endereco da imagem na hora de inserir e editar o arqui
    //destino refere-se a quais elementos vao ser exibidos as alteracoes (hora de incluir ou editar)

    //Seleciona arquivo
    let enderecoImagem = dialog.showOpenDialogSync({title: 'Escolher imagem do produto',filters: [{name: 'Images', extensions: ['jpg','png','jpeg']}],properties: ['openFile']});
    //Verifica se eh png ou jpeg
    let extensaoArquivo = enderecoImagem.slice(-3);
    //Altera imagem
    imagemDestino.src = enderecoImagem;
    enderecoDestino.innerHTML = enderecoImagem;
}

function aquisicaoANDcomparacao(){
    //Verificacao do titulo
    con.query("SELECT titulo FROM produtos", function(err,result, fields){if(err)throw err; insereProduto(result)});
}

function insereProduto(result){
    //Getting values
    let enderecoImagem = pEnderecoImagem.innerHTML;
    enderecoImagem = enderecoImagem.replace(/\\/g, '/'); //Corrigindo bug do slash do mysql (/ -> //)
    let tituloNovoProduto = inputTituloNovoProduto.value;
    let descricao = inputDescricaoNovoProduto.value;
    let precoM2 = inputPrecoM2NovoProduto.value;
    let preco_kit = inputPrecoKitNovoProduto.value;

    let titulos = []; //log all titles
    //Colocando resultados da busca pelos titulos existentes em um list
    for(let j=0; j<result.length; j++)
    {
        titulos.push(result[j].titulo);
    }

    if(titulos.includes(tituloNovoProduto))
    {
        alert("Título digitado já se encontra no banco de dados e não é permitido sua repetição");
    }
    else
    {
        con.query(`INSERT INTO produtos (enderecoImagem, titulo, descricao, preco_m2, preco_kit) values ('${enderecoImagem}','${tituloNovoProduto}','${descricao}','${precoM2}','${preco_kit}')`)
        carregaProdutosDB(); //Atualiza pagina
        //Limpa valores
        pEnderecoImagem.innerHTML = '-';
        inputTituloNovoProduto.value = '';
        inputDescricaoNovoProduto.value = '';
        inputPrecoM2NovoProduto.value = null;
        inputPrecoKitNovoProduto.value = null;
        // alert("Produto Inserido!");
    }
    
}

function deletarProduto(idElemento){
    let idProduto = idElemento.slice(17);
    const confirmOptions = {
        type: 'warning',
        defaultId: 0,
        buttons: ['Tenho certeza!', 'Cancelar'],
        title: 'Deletar produto',
        message: `Você tem certeza que deseja remover o produto ${document.getElementById('tituloProduto'+idProduto).innerHTML} do banco de dados?`,
        detail: 'Essa ação não pode ser desfeita'
    };
    let confirmacao = dialog.showMessageBoxSync(null, confirmOptions)
    //Aceitou deletar
    if (confirmacao == 0) {
        con.query(`delete from produtos where idProduto='${idProduto}'`);
        carregaProdutosDB();
    }
}

function editarProduto(idElemento){
    idProduto = idElemento.slice(16);
    var k;
    
    //Desativa menuSuperior
    btnProdutosMenu.disabled = true;
    btnNovoProduto.disabled = true;
    btnCarregarProdutosDB.disabled = true;
    //Atualiza valores dos produtos direto do banco de dados
    carregaProdutosDB();
    //Abre janela de edicao
    divEditarProduto.style.display = 'grid'
    //Mostrar valores na tela de edicao com aquisicao direto da tela grafica
    editarImagem.src = document.getElementById('enderecoImagem'+idProduto).innerHTML;
    editarEnderecoImagem.innerHTML = document.getElementById('enderecoImagem'+idProduto).innerHTML;
    editarTituloProduto.value = document.getElementById('tituloProduto'+idProduto).innerHTML;
    editarDescricaoProduto.value = document.getElementById('descricaoProduto'+idProduto).value;
    editarPrecoM2Produto.placeholder = document.getElementById('precoM2Produto' + idProduto).placeholder;
    editarPrecoKitProduto.placeholder = document.getElementById('precoKitProduto'+idProduto).placeholder;
    //Desativa botoes listaProdutos
    let botoesListaProdutos = document.querySelectorAll(".modeloProduto > button");
    divListaProdutos.style.opacity=0.08; 
    divListaProdutos.style.filter="alpha(opacity=8)";
    for (k=0; k<botoesListaProdutos.length; k++)
    {
        botoesListaProdutos[k].disabled = true; 
    }
    //Os efeitos reversos sao obtidos com o clique do botao btnEditarProduto
}

function salvarEdicaoProduto(){
    //Adquire valores
    let enderecoImagem, titulo, descricao, precoM2, precoKit;
    enderecoImagem = editarEnderecoImagem.innerHTML;
    enderecoImagem = enderecoImagem.replace(/\\/g, '/'); //Corrigindo bug do slash do mysql (/ -> //)
    titulo = editarTituloProduto.value;
    descricao = editarDescricaoProduto.value;
    precoM2 = editarPrecoM2Produto.placeholder;
    precoKit = editarPrecoKitProduto.placeholder;
    //Atualiza db
    con.query(`update produtos set enderecoImagem='${enderecoImagem}', titulo='${titulo}', descricao='${descricao}', preco_m2='${precoM2}', preco_kit='${precoKit}' where idProduto='${idProduto}'`);
    //Esconde janela edicao
    divEditarProduto.style.display = 'none';
    //Recarrega banco de dados e exibe
    carregaProdutosDB();
    //Reativa menu superior
    btnProdutosMenu.disabled = false;
    btnNovoProduto.disabled = false;
    btnCarregarProdutosDB.disabled = false;
    //Reativa divListaProdutos
    let botoesListaProdutos = document.querySelectorAll(".modeloProduto > button");
    divListaProdutos.style.opacity=1; 
    divListaProdutos.style.filter="alpha(opacity=100)";
    for (var i=0; i<botoesListaProdutos.length; i++){botoesListaProdutos[i].disabled = false;}
}
// =========================== fim janelaProdutos ===========================
// ==================================================================