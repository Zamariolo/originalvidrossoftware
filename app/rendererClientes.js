let renderer = require('./renderer.js');
var {dialog} = require('electron').remote;

//globals
let idCliente = null;
let g_cpfExcecao = null;

// btns
btnClientesMenu = document.getElementById('btnClientesMenu');
btnClientesMenu.addEventListener('click', ()=>{renderer.trocaTela('janelaClientes', 'janelaMenu'); divListaClientes.innerHTML='';});

btnCarregaClientes = document.getElementById('btnCarregaClientes');
btnCarregaClientes.addEventListener('click', ()=> {renderer.connection.query("SELECT * FROM clientes", function(err, result, fields){if(err) throw err; mostraClientes(result);});})

btnInsereCliente = document.getElementById('btnNovoCliente');
btnInsereCliente.addEventListener('click', ()=>{
    divInsereClientes.style.display = 'inline';
    //Desativa botoes
    let filhosListaClientes = document.querySelectorAll(".clienteTemplate > .gridBtnEditarCliente");
    for (var i=0; i<filhosListaClientes.length; i++)
    {
        elemento = filhosListaClientes[i];
        elemento.disabled = true;
    }
});

btnFechaInsereCliente = document.querySelector(".gridInsereBtnFecha");
btnFechaInsereCliente.addEventListener('click', ()=> {
    divInsereClientes.style.display = 'none';
    //Reativa botoes
    let filhosListaClientes = document.querySelectorAll(".clienteTemplate > .gridBtnEditarCliente");
    for (var i=0; i<filhosListaClientes.length; i++)
    {
        elemento = filhosListaClientes[i];
        elemento.disabled = false;
}});

btnFechaEditaCliente = document.querySelector(".gridEditaBtnFecha");
btnFechaEditaCliente.addEventListener('click', ()=>{divEditaClientes.style.display = 'none'; btnClientesMenu.disabled=false; btnCarregaClientes.disabled=false; btnInsereCliente.disabled=false;})

btnSalvaEditaCliente = document.getElementById('btnEditaClienteDB');
btnSalvaEditaCliente.addEventListener('click', ()=> {renderer.connection.query("SELECT cpf from clientes", function(err, result, fields){if(err) throw err; salvarEditarCliente(result);});})

btnAddClienteDB = document.getElementById('btnAddClienteDB');
btnAddClienteDB.addEventListener('click', ()=>{renderer.connection.query("SELECT cpf from clientes", function(err, result, fields){if(err) throw err; inserirCliente(result);});})

inputBarraPesquisaClientes = document.getElementById('inputBarraPesquisaClientes');
inputBarraPesquisaClientes.addEventListener('keyup', ()=>{
    renderer.connection.query(`SELECT * FROM clientes WHERE nome LIKE '%${inputBarraPesquisaClientes.value}%' OR cpf LIKE '%${inputBarraPesquisaClientes.value}%' OR telefone LIKE '%${inputBarraPesquisaClientes.value}%' OR endereco LIKE '%${inputBarraPesquisaClientes.value}%'`, function(err, result, fields){if(err) throw err; mostraClientes(result);});
});
// Divs
let divListaClientes = document.querySelector('.listaClientes');
let divInsereClientes = document.querySelector('.insereCliente');
divInsereClientes.style.display = 'none';
let divEditaClientes = document.querySelector('.editaCliente');
divEditaClientes.style.display = 'none';

//Insere inputs
let inputInsereNome = document.getElementById('inputInsereNome');
let inputInsereCPF = document.getElementById('inputInsereCPF');
let inputInsereTelefone = document.getElementById('inputInsereTelefone');
let inputInsereEndereco = document.getElementById('inputInsereEndereco');

function mostraClientes(clientes){
    let i;
    let htmlListaClientes = '<div class="separador-sm"></div>';
    let cliente = null;

    //Percorrendo todos os dados
    for (i=0; i<clientes.length; i++)
    {
        cliente = clientes[i];

        htmlListaClientes = htmlListaClientes + 
        `
        <div class="clienteTemplate container card">
            <p class="gridIDCliente">${cliente.idCliente}</p>
            <h5 class="gridNome" id='nomeCliente${cliente.idCliente}'>${cliente.nome}</h5>
            <p class="gridCPF" id='cpfCliente${cliente.idCliente}'>${cliente.cpf}</p>
            <h6 class="gridTelefone" id='telefoneCliente${cliente.idCliente}'>${cliente.telefone}</h6>
            <p class="gridEndereco" id='enderecoCliente${cliente.idCliente}'>${cliente.endereco}</p>
            <div class="gridDivOrdens"></div>
            <button class="gridBtnEditarCliente btn btn-sm btn-outline-secondary" id='btnEditarCliente${cliente.idCliente}'>Editar</button>
            <button class="gridBtnExcluirCliente btn btn-sm btn-outline-danger" id='btnExcluirCliente${cliente.idCliente}'>Excluir</button>
        </div>
        `
    }
    divListaClientes.innerHTML = htmlListaClientes;

    // Adicionando funcionalidade aos botoes
    let botoesClientes = document.querySelectorAll(".clienteTemplate > .gridBtnExcluirCliente");
    let idBotao;

    //Opcao deletar
    for (i=0; i<botoesClientes.length; i++)
    {
        idBotao = botoesClientes[i].id;
        botoesClientes[i].addEventListener('click', function(){deletarCliente(this.id);});
    }
    //Opcao editar
    botoesClientes = document.querySelectorAll(".clienteTemplate > .gridBtnEditarCliente");
    for(i=0; i<botoesClientes.length; i++)
    {
        idBotao = botoesClientes[i].id;
        botoesClientes[i].addEventListener('click', function(){editarCliente(this.id);});
    }
}
module.exports.mostraClientes = mostraClientes; //deixa a funcao visivel ao arquivo renderer.js

function deletarCliente(idElemento) {
    let idCliente = idElemento.slice(17)
    const confirmOptions = {
        type: 'warning',
        defaultId: 0,
        buttons: ['Tenho certeza!', 'Cancelar'],
        title: 'Deletar cliente',
        message: `Você tem certeza que deseja remover o cliente ${document.getElementById(`nomeCliente${idCliente}`).innerHTML} da base de dados?`,
        detail: 'Essa ação não pode ser desfeita'
    };
    let confirmacao = dialog.showMessageBoxSync(null, confirmOptions)
    //Aceitou deletar
    if (confirmacao == 0) {
        renderer.connection.query(`delete from clientes where idCliente='${idCliente}'`);
        // renderer.connection.query("SELECT * FROM clientes", function(err, result, fields){if(err) throw err; mostraClientes(result);});
        renderer.connection.query(`SELECT * FROM clientes WHERE nome LIKE '%${inputBarraPesquisaClientes.value}%' OR cpf LIKE '%${inputBarraPesquisaClientes.value}%' OR telefone LIKE '%${inputBarraPesquisaClientes.value}%' OR endereco LIKE '%${inputBarraPesquisaClientes.value}%'`, function(err, result, fields){if(err) throw err; mostraClientes(result);});
    }
}

function editarCliente(idElemento) {
    idCliente = idElemento.slice(16);

    //Desativa menuSuperior
    btnClientesMenu.disabled = true;
    btnInsereCliente.disabled = true;
    btnCarregaClientes.disabled = true;
    //Atualiza pagina de clientes
    // renderer.connection.query("SELECT * FROM clientes", function(err, result, fields){if(err) throw err; mostraClientes(result);});
    renderer.connection.query(`SELECT * FROM clientes WHERE nome LIKE '%${inputBarraPesquisaClientes.value}%' OR cpf LIKE '%${inputBarraPesquisaClientes.value}%' OR telefone LIKE '%${inputBarraPesquisaClientes.value}%' OR endereco LIKE '%${inputBarraPesquisaClientes.value}%'`, function(err, result, fields){if(err) throw err; mostraClientes(result);});
    //Abre janela de edicao
    divEditaClientes.style.display = 'inline';
    //Insere dados dos clientes nos campos (fazendo direto pra nao criar mais variaveis)
    document.getElementById('inputEditaNome').value = document.getElementById(`nomeCliente${idCliente}`).innerHTML;
    document.getElementById('inputEditaCPF').value = document.getElementById(`cpfCliente${idCliente}`).innerHTML;
    document.getElementById('inputEditaTelefone').value = document.getElementById(`telefoneCliente${idCliente}`).innerHTML;
    document.getElementById('inputEditaEndereco').value = document.getElementById(`enderecoCliente${idCliente}`).innerHTML;
    g_cpfExcecao = document.getElementById('inputEditaCPF').value;
    //Scroll para o topo
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function salvarEditarCliente(resultQueryCPFs){
    //Obtem valores (pra simplificar dps)
    let [nome, cpf, telefone,endereco] = [document.getElementById('inputEditaNome').value, document.getElementById('inputEditaCPF').value, document.getElementById('inputEditaTelefone').value, document.getElementById('inputEditaEndereco').value];
    //Validar nome e telefone
    if (nome==''){dialog.showMessageBoxSync('',{title: `Campo 'nome' vazio!`, message: 'Não se pode inserir um cliente sem nome', type:'warning'}); return 0;}
    if (telefone==''){dialog.showMessageBoxSync('',{title: `Campo 'telefone' vazio!`, message: 'Não se pode inserir um cliente sem telefone', type:'warning'}); return 0;}
    //Valida cpf e if == 1
    if(validaCPF(cpf, resultQueryCPFs, g_cpfExcecao))
    {
        //Att o banco de dados
        renderer.connection.query(`update clientes set nome='${nome}', cpf='${cpf}', telefone='${telefone}', endereco='${endereco}' where idCliente='${idCliente}'`);
        //Reativa menu superior
        btnClientesMenu.disabled = false;
        btnInsereCliente.disabled = false;
        btnCarregaClientes.disabled = false;
        //Fecha edicao cliente
        divEditaClientes.style.display = 'none';
    }

    //Atualiza tela
    renderer.connection.query(`SELECT * FROM clientes WHERE nome LIKE '%${inputBarraPesquisaClientes.value}%' OR cpf LIKE '%${inputBarraPesquisaClientes.value}%' OR telefone LIKE '%${inputBarraPesquisaClientes.value}%' OR endereco LIKE '%${inputBarraPesquisaClientes.value}%'`, function(err, result, fields){if(err) throw err; mostraClientes(result);});
    // renderer.connection.query("SELECT * FROM clientes", function(err, result, fields){if(err) throw err; mostraClientes(result);})
}

function validaCPF(cpf, resultQuery, cpfExcecao) {
    /*  Essa funcao foi alterada e agora ela nao cancela a operacao, apenas alerta que
    existe uma irregularidade nos valores de CPF inseridos
      
    Descr: valida se o cpf fornecido pelo usuario é valido, segundo a lógica
    matematica de cadastros, a quantidade de digitos inseridos e se ele já não se 
    encontra no banco de dados

        Input:
                -cpf: o cpf inserido pelo usuario (direto do input, contendo caracteres invalidos)
                - resultQuery: result da busca dos cpfs no banco de dados
                - cpfExcecao: CPF que pode ser repetido (no caso de edicao, o cpf pode se manter intacto mas nao pode repetir com os demais)
        Output:
                - 0: Se o cpf inserido for invalido (falhar em algum dos criterios)
                - 1: Cpf passou em todos os testes e vai ser inserido no banco de dados
    */

    //se cpf foi inserido, comparar pra ver se nao é repetido
    let numerosCPF =[];
    let primeiroDigito; //armazena primeiro digito
    let segundoDigito; //armazena segundo digito
    let numerosValidos = ['0','1','2','3','4','5','6','7','8','9'];
    let seqPrimeiroDigito = [10,9,8,7,6,5,4,3,2];
    let seqSegundoDigito =[11,10,9,8,7,6,5,4,3,2];
    let somaPrimeiroDigito = 0;
    let somaSegundoDigito = 0;
    let cpfsCadastrados = [];

    //Transformando o result da query em uma list de cpfsCadastrados
    for(var j=0; j<resultQuery.length; j++){cpfsCadastrados.push(resultQuery[j].cpf);}

    if (cpf!='') //Se nao é vazio
    {
        //Retorna 1 se for valido
        //Retorna 0 se for invalido

        //Obtendo somente digitos do cpf
        for(var i=0; i<cpf.length; i++) 
        {
            if(numerosValidos.includes(cpf[i]))
            {
                numerosCPF.push(parseInt(cpf[i]));
            }
        }

        primeiroDigito = numerosCPF[9];
        segundoDigito = numerosCPF[10];
    
        //Verificando se contem 11 digitos
        if (numerosCPF.length != 11) {dialog.showMessageBoxSync('',{title: 'CPF inválido!', message: 'Quantidade de digitos inseridos para CPF é invalido!No entanto a operação foi realizada mesmo assim.', type:'warning'}); return 1;}
        inputInsereCPF.focus();
    
        //Verifica validez do primeiro digito
        for(var k=0; k<9; k++){somaPrimeiroDigito = somaPrimeiroDigito + numerosCPF[k]*seqPrimeiroDigito[k];}
        somaPrimeiroDigito = (somaPrimeiroDigito*10)%11;

        //Verifica validez do segundo digito
        for(var k=0; k<10; k++){somaSegundoDigito = somaSegundoDigito + numerosCPF[k]*seqSegundoDigito[k];}
        somaSegundoDigito = (somaSegundoDigito*10)%11;

        if (primeiroDigito!=somaPrimeiroDigito || segundoDigito!=somaSegundoDigito){
            dialog.showMessageBoxSync('',{title: 'CPF inválido!', message: 'O CPF inserido é inválido porém a operação foi realizada mesmo assim',detail:'Os digitos inseridos não respeitam a lógica do Governo Federal para CPFs mas os dados foram salvos assim mesmo', type:'warning'}); return 1;
        }
        //Verifica se o cpf nao é repetido
        // console.log(numerosCPF.join(''));
        // console.log(cpfExcecao);
        if (cpfsCadastrados.includes(numerosCPF.join('')) && numerosCPF.join('')!=cpfExcecao)
        {
            dialog.showMessageBoxSync('',{title: 'CPF já cadastrado!', message: 'O CPF inserido já consta na base de dados', type:'warning'}); return 1;
        }
        else
        {
            return 1;
        }

    }

    //Caso nao tenha cpf digitado
    else {return 1}
}

function inserirCliente(cpfsCadastrados){
    /*  Descr: Coleta todos os dados inseridos pelo usuario, faz a verificao de cpf e nome validos e insere no banco de dados

        Input: -cpfsCadastrados: resultado da query na busca pelos cpfs no banco de
    dados; Este parametro é repassado a funcao validaCPF() para verificacao de 
    cpfs repetidos

        Output: nenhum (os dados são inseridos ou nao no banco de dados)
     */

    //Obter valores
    let nome, cpf, telefone, endereco;
    nome = inputInsereNome.value;
    cpf = inputInsereCPF.value;
    telefone = inputInsereTelefone.value;
    endereco = inputInsereEndereco.value;

    let numerosCPF = [];
    let numerosValidos = ['0','1','2','3','4','5','6','7','8','9'];

    //Verifica se foi inserido nome
    if (nome==''){dialog.showMessageBoxSync('',{title: `Campo 'nome' vazio!`, message: 'Não se pode inserir um cliente sem nome', type:'warning'}); return 0;}
    //Verifica se foi inserido numero de telefone
    if (telefone==''){dialog.showMessageBoxSync('',{title: `Campo 'telefone' vazio!`, message: 'Não se pode inserir um cliente sem telefone', type:'warning'}); return 0;}

    //Verifica validez cpf
    if(validaCPF(cpf, cpfsCadastrados, null)){
        //Converte cpf do input em valores de cpf
        //Obtendo somente digitos do cpf
        for(var i=0; i<cpf.length; i++) 
        {
            if(numerosValidos.includes(cpf[i]))
            {
                numerosCPF.push(parseInt(cpf[i]));
            }
        }
        //Insere no banco de dados
        renderer.connection.query(`INSERT INTO clientes (nome, cpf, telefone, endereco) values ('${nome}','${numerosCPF.join('')}','${telefone}','${endereco}')`);
        // renderer.connection.query("SELECT * FROM clientes", function(err, result, fields){if(err) throw err; mostraClientes(result);});
        renderer.connection.query(`SELECT * FROM clientes WHERE nome LIKE '%${inputBarraPesquisaClientes.value}%' OR cpf LIKE '%${inputBarraPesquisaClientes.value}%' OR telefone LIKE '%${inputBarraPesquisaClientes.value}%' OR endereco LIKE '%${inputBarraPesquisaClientes.value}%'`, function(err, result, fields){if(err) throw err; mostraClientes(result);});
        //Limpa a janela de insercao
        inputInsereNome.value = '';
        inputInsereCPF.value = '';
        inputInsereTelefone.value = '';
        inputInsereEndereco.value = '';
    }
}


