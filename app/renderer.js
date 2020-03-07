// ======================= menuSuperior ==========================

// getting global elements
let janelaMenu = document.querySelector('.janelaMenu');
let janelaProdutos = document.querySelector('.janelaProdutos');

// >>>>>>>>>>>>>>>>>>>>>>> Relogio
let relogio = document.querySelector('.relogio');

function attRelogio() {
    let date = new Date();
    let hora = date.getHours();
    let minuto = date.getMinutes();
    let segundo = date.getSeconds();

    let horario = hora+":"+minuto+":"+segundo;
    relogio.innerHTML = horario;
}
setInterval(attRelogio, 1000);
// <<<<<<<<<<<<<<<<<<<<<<<< fim relogio

// ======================= fim menuSuperior ====================


// =========================== janelaMenu ===========================

//Troca telas
let btnProdutos = document.getElementById('btnProdutos');

//menu -> produtos
btnProdutos.addEventListener('click', () => {janelaMenu.style.display = 'none'; janelaProdutos.style.display='inline';});


// =========================== fim JanelaMenu ===========================

//=========================== janelaProdutos ===========================
let btnProdutosMenu = document.getElementById('btnProdutosMenu');
let btnNovoProduto = document.getElementById('btnNovoProduto');

let divNovoProduto = document.querySelector('.novoProdutoTemplate');

btnProdutosMenu.addEventListener('click', ()=>{janelaMenu.style.display='inline'; janelaProdutos.style.display='none';})
btnNovoProduto.addEventListener('click', ()=>{
    if(divNovoProduto.style.display=='none'){divNovoProduto.style.display = 'grid';}
    else {divNovoProduto.style.display = 'none';}}
);
// =========================== fim janelaProdutos ===========================