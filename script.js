// ==========================================================================
// KOPESA EXPRESS - CORE LOGIC & CONTROLE DINÂMICO
// ==========================================================================

let modoAuth = 'entrar';
let usuarioAtual = JSON.parse(localStorage.getItem('kopesa_usuario_atual')) || null;
let carrinho = JSON.parse(localStorage.getItem('kopesa_carrinho')) || [];

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoSessao();
    atualizarBadgeCarrinho();
});

// MOSTRAR TOAST DE NOTIFICAÇÃO SUAVE
function mostrarToast(mensagem, icone = 'check-circle') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-${icone}" style="color: var(--cor-destaque);"></i> ${mensagem}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ALTERNAR MODO DE AUTENTICAÇÃO (ENTRAR / CRIAR CONTA)
function mudarModoAuth(modo) {
    modoAuth = modo;
    const tabEntrar = document.getElementById('tab-entrar');
    const tabCriar = document.getElementById('tab-criar');
    const grupoNome = document.getElementById('grupo-nome');
    const btnSubmit = document.getElementById('btn-submit-auth');

    if (modo === 'entrar') {
        tabEntrar.classList.add('ativo');
        tabCriar.classList.remove('ativo');
        grupoNome.classList.add('oculto');
        btnSubmit.innerHTML = 'Entrar na Plataforma <i class="fas fa-arrow-right icon-btn-right"></i>';
    } else {
        tabCriar.classList.add('ativo');
        tabEntrar.classList.remove('ativo');
        grupoNome.classList.remove('oculto');
        btnSubmit.innerHTML = 'Criar Nova Conta <i class="fas fa-user-plus icon-btn-right"></i>';
    }
}

// PROCESSAR LOGIN / REGISTO
function processarAutenticacao(event) {
    event.preventDefault();
    const contacto = document.getElementById('auth-contacto').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const perfil = document.getElementById('auth-perfil').value;
    const nome = document.getElementById('auth-nome').value.trim();

    let utilizadores = JSON.parse(localStorage.getItem('kopesa_utilizadores')) || [];

    if (modoAuth === 'criar') {
        if (!nome) {
            mostrarToast('Por favor, insira o seu nome completo.', 'exclamation-circle');
            return;
        }
        const existe = utilizadores.find(u => u.contacto === contacto);
        if (existe) {
            mostrarToast('Este contacto já se encontra registado.', 'exclamation-circle');
            return;
        }
        const novoUser = { nome, contacto, password, tipo: perfil };
        utilizadores.push(novoUser);
        localStorage.setItem('kopesa_utilizadores', JSON.stringify(utilizadores));
        usuarioAtual = novoUser;
        mostrarToast('Conta criada com sucesso!');
    } else {
        const user = utilizadores.find(u => u.contacto === contacto && u.password === password);
        if (!user) {
            mostrarToast('Contacto ou palavra-passe incorretos.', 'exclamation-circle');
            return;
        }
        usuarioAtual = user;
        mostrarToast(`Bem-vindo de volta, ${usuarioAtual.nome}!`);
    }

    localStorage.setItem('kopesa_usuario_atual', JSON.stringify(usuarioAtual));
    mostrarEcraEscolha();
}

// TERMINAR SESSÃO
function realizarLogout() {
    usuarioAtual = null;
    localStorage.removeItem('kopesa_usuario_atual');
    mostrarToast('Sessão terminada.', 'info-circle');
    verificarEstadoSessao();
}

// GESTÃO DOS ECRÃS E NAVEGAÇÃO
function verificarEstadoSessao() {
    ocultarTodosEcras();

    const badgeUtilizador = document.getElementById('badge-utilizador');
    const btnCarrinho = document.getElementById('btn-carrinho');

    if (usuarioAtual) {
        if (badgeUtilizador) badgeUtilizador.innerText = `${usuarioAtual.nome}`;
        logoutBtnVisibility(true);
        mostrarEcraEscolha();
    } else {
        const ecraAuth = document.getElementById('ecra-auth');
        if (ecraAuth) ecraAuth.classList.remove('oculto');
        if (badgeUtilizador) badgeUtilizador.innerText = '';
        logoutBtnVisibility(false);
        if (btnCarrinho) btnCarrinho.classList.add('oculto');
    }
}

function mostrarEcraEscolha() {
    ocultarTodosEcras();
    const ecraEscolha = document.getElementById('ecra-escolha');
    if (ecraEscolha) ecraEscolha.classList.remove('oculto');
    const btnCarrinho = document.getElementById('btn-carrinho');
    if (btnCarrinho) btnCarrinho.classList.add('oculto');
}

function irParaMarketplace() {
    ocultarTodosEcras();
    const ecraCliente = document.getElementById('ecra-cliente');
    const btnCarrinho = document.getElementById('btn-carrinho');

    if (ecraCliente) ecraCliente.classList.remove('oculto');
    if (btnCarrinho) btnCarrinho.classList.remove('oculto');
    carregarProdutosMarketplace();
}

function irParaPainelVendedor() {
    ocultarTodosEcras();
    const ecraVendedor = document.getElementById('ecra-vendedor');

    if (ecraVendedor) ecraVendedor.classList.remove('oculto');
    carregarPainelVendedorResumo();
}

function voltarParaEscolha() {
    mostrarEcraEscolha();
}

function ocultarTodosEcras() {
    ['ecra-auth', 'ecra-escolha', 'ecra-cliente', 'ecra-vendedor', 'ecra-admin'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('oculto');
    });
}

function logoutBtnVisibility(mostrar) {
    const btn = document.getElementById('btn-logout');
    if (btn) {
        if (mostrar) btn.classList.remove('oculto');
        else btn.classList.add('oculto');
    }
}

function irParaHome() {
    if (usuarioAtual) mostrarEcraEscolha();
    else verificarEstadoSessao();
}

// ==========================================
// PUBLICAÇÃO DE PRODUTOS
// ==========================================
function abrirModalNovoProduto() {
    document.getElementById('modal-produto').classList.remove('oculto');
}

function fecharModalNovoProduto() {
    document.getElementById('modal-produto').classList.add('oculto');
}

function guardarNovoProduto(event) {
    event.preventDefault();
    const nome = document.getElementById('prod-nome').value.trim();
    const valor = Number(document.getElementById('prod-valor').value);
    const contacto = document.getElementById('prod-contacto').value.trim();
    const fotoInput = document.getElementById('prod-foto');

    let produtos = JSON.parse(localStorage.getItem('kopesa_produtos')) || [];

    const salvarEAtualizar = (imgUrl) => {
        const novoProd = {
            id: Date.now().toString(),
            nome,
            valor,
            contacto,
            vendedor: usuarioAtual ? usuarioAtual.nome : 'Anónimo',
            foto: imgUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
        };
        produtos.push(novoProd);
        localStorage.setItem('kopesa_produtos', JSON.stringify(produtos));
        
        fecharModalNovoProduto();
        document.querySelector('#modal-produto form').reset();
        
        mostrarToast('Produto publicado com sucesso no Kopesa Market!');
        carregarProdutosMarketplace();
    };

    if (fotoInput.files && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            salvarEAtualizar(e.target.result);
        };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        salvarEAtualizar('');
    }
}

// ==========================================
// RESUMO DO LOJISTA
// ==========================================
function carregarPainelVendedorResumo() {
    if (!usuarioAtual) return;
    let produtos = JSON.parse(localStorage.getItem('kopesa_produtos')) || [];
    const meusProdutos = produtos.filter(p => p.vendedor === usuarioAtual.nome);

    const statTotal = document.getElementById('stat-total-produtos');
    if (statTotal) statTotal.innerText = meusProdutos.length;
}

// ==========================================
// MARKETPLACE, PESQUISA E CARRINHO
// ==========================================
function carregarProdutosMarketplace(filtro = '') {
    let produtos = JSON.parse(localStorage.getItem('kopesa_produtos')) || [];
    const lista = document.getElementById('lista-produtos-cliente');
    if (!lista) return;

    if (filtro) {
        produtos = produtos.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()));
    }

    if (produtos.length === 0) {
        lista.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: 14px; border: 1px dashed var(--borda-subtil);">
                <i class="fas fa-store-slash" style="font-size: 2rem; color: var(--texto-cinza); margin-bottom: 10px;"></i>
                <p style="color: var(--texto-cinza); font-size: 0.85rem;">Nenhum produto encontrado.</p>
                <button class="btn-principal btn-sm" style="margin-top: 12px;" onclick="abrirModalNovoProduto()">Publicar um produto</button>
            </div>
        `;
        return;
    }

    lista.innerHTML = '';
    produtos.forEach(p => {
        lista.innerHTML += `
            <div class="produto-card animate-fade">
                <img src="${p.foto}" alt="${p.nome}">
                <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--texto-claro);">${p.nome}</h4>
                <p style="font-size: 0.75rem; color: var(--texto-cinza); margin-top: 2px;">Vendedor: ${p.vendedor}</p>
                <div class="produto-info-bottom" style="margin-top: 12px;">
                    <div style="color: var(--cor-destaque); font-weight: 700; font-size: 1.05rem; margin-bottom: 8px;">
                        ${Number(p.valor).toLocaleString()} Kz
                    </div>
                    <button class="btn-principal" style="padding: 8px; font-size: 0.8rem;" onclick='adicionarAoCarrinho(${JSON.stringify(p)})'>
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </div>
            </div>
        `;
    });
}

function filtrarProdutosMarketplace() {
    const termo = document.getElementById('input-pesquisa-produto').value;
    carregarProdutosMarketplace(termo);
}

function adicionarAoCarrinho(produto) {
    carrinho.push(produto);
    localStorage.setItem('kopesa_carrinho', JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
    mostrarToast('Produto adicionado ao carrinho!');
}

function atualizarBadgeCarrinho() {
    const badge = document.getElementById('badge-carrinho');
    if (badge) badge.innerText = carrinho.length;
}

function abrirCarrinho() {
    document.getElementById('modal-carrinho').classList.remove('oculto');
    const container = document.getElementById('itens-carrinho-lista');
    const totalEl = document.getElementById('carrinho-total-valor');

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="color: var(--texto-cinza); text-align: center; padding: 20px;">O seu carrinho está vazio.</p>';
        totalEl.innerText = '0 Kz';
        return;
    }

    container.innerHTML = '';
    let total = 0;
    carrinho.forEach((item, index) => {
        total += item.valor;
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--borda-input);">
                <div>
                    <span style="font-size: 0.88rem; font-weight: 500;">${item.nome}</span><br>
                    <small style="color: var(--cor-destaque); font-weight: 600;">${item.valor.toLocaleString()} Kz</small>
                </div>
                <button class="btn-perigo" onclick="removerDoCarrinho(${index})"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    });
    totalEl.innerText = total.toLocaleString() + ' Kz';
}

function fecharCarrinho() {
    document.getElementById('modal-carrinho').classList.add('oculto');
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('kopesa_carrinho', JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
    abrirCarrinho();
    mostrarToast('Produto removido do carrinho.', 'info-circle');
}

function finalizarSolicacaoCompra() {
    if (carrinho.length === 0) return;

    let totalCompra = carrinho.reduce((acc, item) => acc + item.valor, 0);
    let comissaoCriador = totalCompra * 0.10;

    let adminDados = JSON.parse(localStorage.getItem('kopesa_admin_financeiro')) || { vendas: 0, comissoes: 0 };
    adminDados.vendas += totalCompra;
    adminDados.comissoes += comissaoCriador;
    localStorage.setItem('kopesa_admin_financeiro', JSON.stringify(adminDados));

    let contactosVendedores = carrinho.map(i => `${i.nome} (${i.contacto})`).join('\n- ');

    alert(`Solicitação concluída!\n\nContactos diretos para combinar entrega e pagamento:\n- ${contactosVendedores}`);

    carrinho = [];
    localStorage.removeItem('kopesa_carrinho');
    atualizarBadgeCarrinho();
    fecharCarrinho();
    mostrarToast('Compra solicitada com sucesso!');
}

// ==========================================
// PAINEL ADMINISTRATIVO (PIN: 1504)
// ==========================================
function solicitarPinAdmin() {
    const pin = prompt("Insira o PIN do Administrador:");
    if (pin === "1504") {
        abrirPainelAdmin();
    } else if (pin !== null) {
        mostrarToast("PIN incorreto.", "exclamation-circle");
    }
}

function abrirPainelAdmin() {
    ocultarTodosEcras();
    const ecraAdmin = document.getElementById('ecra-admin');
    if (ecraAdmin) ecraAdmin.classList.remove('oculto');

    let adminDados = JSON.parse(localStorage.getItem('kopesa_admin_financeiro')) || { vendas: 0, comissoes: 0 };
    document.getElementById('admin-total-vendas').innerText = adminDados.vendas.toLocaleString() + ' Kz';
    document.getElementById('admin-comissoes').innerText = adminDados.comissoes.toLocaleString() + ' Kz';
}

function realizarSaqueAdmin() {
    const conta = document.getElementById('admin-conta-saque').value.trim();
    const valor = Number(document.getElementById('admin-valor-saque').value);

    if (!conta || !valor) {
        mostrarToast('Preencha os dados da conta e o valor.', 'exclamation-circle');
        return;
    }

    let adminDados = JSON.parse(localStorage.getItem('kopesa_admin_financeiro')) || { vendas: 0, comissoes: 0 };
    if (valor > adminDados.comissoes) {
        mostrarToast('Saldo insuficiente de comissões.', 'exclamation-circle');
        return;
    }

    adminDados.comissoes -= valor;
    localStorage.setItem('kopesa_admin_financeiro', JSON.stringify(adminDados));

    mostrarToast(`Levantamento de ${valor.toLocaleString()} Kz efetuado!`);
    document.getElementById('admin-conta-saque').value = '';
    document.getElementById('admin-valor-saque').value = '';
    abrirPainelAdmin();
}