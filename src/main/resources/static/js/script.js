"use strict";

const CHAVE_CARRINHO = "cafefiot_carrinho";

let carrinho = carregarCarrinho();

function carregarCarrinho() {
    try {
        const carrinhoSalvo = localStorage.getItem(CHAVE_CARRINHO);
        return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
    } catch (erro) {
        console.error("Não foi possível carregar o carrinho:", erro);
        return [];
    }
}

function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function adicionarAoCarrinho(nome, preco) {
    const produtoExistente = carrinho.find(
        produto => produto.nome === nome
    );

    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nome,
            preco: Number(preco),
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();

    alert(`${nome} foi adicionado ao carrinho.`);
}

function removerItem(index) {
    if (index < 0 || index >= carrinho.length) {
        return;
    }

    carrinho.splice(index, 1);

    salvarCarrinho();
    atualizarCarrinho();
}

function alterarQuantidade(index, quantidade) {
    const novaQuantidade = Number(quantidade);

    if (!Number.isInteger(novaQuantidade) || novaQuantidade <= 0) {
        removerItem(index);
        return;
    }

    carrinho[index].quantidade = novaQuantidade;

    salvarCarrinho();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const lista = document.getElementById("listaCarrinho");
    const totalElemento = document.getElementById("total");
    const quantidadeElemento = document.getElementById("quantidadeCarrinho");

    /*
     * A página inicial não possui a lista do carrinho.
     * Nesse caso, apenas atualizamos o contador.
     */
    if (!lista || !totalElemento) {
        atualizarQuantidadeCarrinho(quantidadeElemento);
        return;
    }

    lista.innerHTML = "";

    if (carrinho.length === 0) {
        lista.innerHTML = `
            <p class="text-muted">
                Seu carrinho está vazio.
            </p>
        `;

        totalElemento.textContent = formatarMoeda(0);
        atualizarQuantidadeCarrinho(quantidadeElemento);
        return;
    }

    let total = 0;

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const elemento = document.createElement("div");
        elemento.className =
            "item d-flex justify-content-between align-items-center border-bottom py-3";

        elemento.innerHTML = `
            <div>
                <strong>${escaparHTML(item.nome)}</strong>
                <br>
                <span>
                    ${formatarMoeda(item.preco)} cada
                </span>
                <br>
                <label>
                    Quantidade:
                    <input
                        type="number"
                        min="1"
                        value="${item.quantidade}"
                        class="form-control d-inline-block"
                        style="width: 80px;"
                        aria-label="Quantidade de ${escaparHTML(item.nome)}"
                    >
                </label>
                <br>
                <strong>Subtotal: ${formatarMoeda(subtotal)}</strong>
            </div>

            <button
                type="button"
                class="btn btn-danger btn-sm"
                aria-label="Remover ${escaparHTML(item.nome)}"
            >
                Remover
            </button>
        `;

        const inputQuantidade = elemento.querySelector("input");
        const botaoRemover = elemento.querySelector("button");

        inputQuantidade.addEventListener("change", () => {
            alterarQuantidade(index, inputQuantidade.value);
        });

        botaoRemover.addEventListener("click", () => {
            removerItem(index);
        });

        lista.appendChild(elemento);
    });

    totalElemento.textContent = formatarMoeda(total);
    atualizarQuantidadeCarrinho(quantidadeElemento);
}

function atualizarQuantidadeCarrinho(elemento) {
    if (!elemento) {
        return;
    }

    const quantidadeTotal = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    elemento.textContent = quantidadeTotal;
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    let total = 0;

    const itens = carrinho.map(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        return `• ${item.nome} - ${item.quantidade}x - ${formatarMoeda(subtotal)}`;
    });

    const mensagem = [
        "☕ Pedido CaféFiot",
        "",
        ...itens,
        "",
        `Total: ${formatarMoeda(total)}`
    ].join("\n");

    /*
     * Troque este número pelo WhatsApp real da cafeteria.
     * Use o formato internacional, sem espaços, parênteses ou traços.
     */
    const telefone = "5511999999999";

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
}

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarCarrinho();

    const botaoFinalizar = document.getElementById("finalizarPedido");

    if (botaoFinalizar) {
        botaoFinalizar.addEventListener("click", finalizarPedido);
    }
});
