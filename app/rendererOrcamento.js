let renderer = require('./renderer.js');
var {dialog, BrowserWindow} = require('electron').remote;

//Criando janela de produtos
let windowListaProdutos = new BrowserWindow({width: 400, height: 600, title: 'Lista de produtos', show: false});
windowListaProdutos.removeMenu();

let btnOrcamentoMenu = document.getElementById('btnOrcamentoMenu');
btnOrcamentoMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaOrcamento', 'janelaMenu');});

// btn Ja eh cliente
let btnToggleNovoCarregaCliente = document.querySelector('.jaEhClienteOrcamento');
btnToggleNovoCarregaCliente.addEventListener('click', ()=> {toggleClienteOrcamento();});

//Caso o input/datalist tenha sido alterado (cliente selecionado)
document.getElementById('inputComboBoxClienteOrcamento').addEventListener('change', ()=>{intermediarioCarregaDadosCliente();});

document.querySelector('.comboBoxNomeClienteOrcamento').style.display = 'none';

//Botao de adicionar novo produto ao carrinho
let btnAddProduto = document.querySelector('.btnAddProduto');
btnAddProduto.addEventListener('click', ()=>{abreWindowListaProdutos();});

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

function abreWindowListaProdutos () {
    /*Descr: Abre uma nova janela com a lista de produtos; Carrega os produtos; gera um 
    html; carrega pra pagina e abre ela; Se a janela tiver sido fechada, é criada uma nova

     */

    try{
        windowListaProdutos.show();
        console.log(windowListaProdutos.isVisible());
    }
    finally{
        windowListaProdutos = new BrowserWindow({width: 400, height: 600, title: 'Lista de produtos', show: false});
        windowListaProdutos.removeMenu();
    }
}
