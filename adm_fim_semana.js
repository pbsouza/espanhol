// Inicializa o Firestore através do Firebase que já foi configurado no config.js
const db = firebase.firestore();
const colecaoFS = "reunioes_fim_semana";

// Referências dos elementos do formulário
const form = document.getElementById('form-fim-semana');
const campoData = document.getElementById('id-semana');
const campoPresidente = document.getElementById('presidente');
const campoTema = document.getElementById('discurso-tema');
const campoOrador = document.getElementById('discurso-orador');
const campoCongregacao = document.getElementById('discurso-congregacao');
const campoLeitor = document.getElementById('sentinela-leitor');

// Referências do Modal de Alerta
const modal = document.getElementById('modal-alerta');
const modalTitulo = document.getElementById('modal-titulo');
const modalMensagem = document.getElementById('modal-mensagem');
const btnFecharModal = document.getElementById('btn-fechar-modal');

// Função para exibir o modal de alerta personalizado
function exibirAlerta(titulo, mensagem, sucesso = true) {
    modalTitulo.textContent = titulo;
    modalMensagem.textContent = mensagem;
    const icone = modal.querySelector('.modal-icone');
    
    if (sucesso) {
        icone.textContent = "✔";
        icone.style.backgroundColor = "#e6f4ea";
        icone.style.color = "#137333";
    } else {
        icone.textContent = "✖";
        icone.style.backgroundColor = "#fce8e6";
        icone.style.color = "#c5221f";
    }
    
    modal.classList.add('active');
}

// Fecha o modal ao clicar no botão
btnFecharModal.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Função para limpar o formulário (exceto a data)
function limparFormulario() {
    campoPresidente.value = "";
    campoTema.value = "";
    campoOrador.value = "";
    campoCongregacao.value = "";
    campoLeitor.value = "";
}

// Escuta a mudança de data para buscar dados existentes no Firebase
campoData.addEventListener('change', async () => {
    const dataSelecionada = campoData.value;
    if (!dataSelecionada) return;

    try {
        const docRef = db.collection(colecaoFS).doc(dataSelecionada);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const dados = docSnap.data();
            campoPresidente.value = dados.presidente || "";
            campoTema.value = dados.temaDiscurso || "";
            campoOrador.value = dados.orador || "";
            campoCongregacao.value = dados.congregacaoOrador || "";
            campoLeitor.value = dados.leitorSentinela || "";
        } else {
            // Se não houver dados para essa data, limpa os campos para uma nova inserção
            limparFormulario();
        }
    } catch (error) {
        console.error("Erro ao buscar programação:", error);
        exibirAlerta("Erro!", "Não foi possível buscar os dados desta data.", false);
    }
});

// Escuta o envio do formulário para salvar ou atualizar no Firebase
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dataDocumento = campoData.value;
    if (!dataDocumento) {
        exibirAlerta("Aviso", "Por favor, selecione uma data válida.", false);
        return;
    }

    // Monta o objeto com os dados exatos pedidos
    const dadosReuniao = {
        data: dataDocumento,
        presidente: campoPresidente.value.trim(),
        temaDiscurso: campoTema.value.trim(),
        orador: campoOrador.value.trim(),
        congregacaoOrador: campoCongregacao.value.trim(),
        leitorSentinela: campoLeitor.value.trim(),
        ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Salva utilizando a data como ID do documento para evitar duplicidades
        await db.collection(colecaoFS).doc(dataDocumento).set(dadosReuniao, { merge: true });
        exibirAlerta("Sucesso!", "A programação de fim de semana foi salva com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar no Firebase:", error);
        exibirAlerta("Erro!", "Houve uma falha ao salvar a programação. Tente novamente.", false);
    }
});

// --- LÓGICA DE ACESSIBILIDADE (CONTROLE DE TAMANHO DE FONTE) ---
const btnDiminuir = document.getElementById('btn-diminuir');
const btnNormal = document.getElementById('btn-normal');
const btnAumentar = document.getElementById('btn-aumentar');

let tamanhoAtual = parseInt(localStorage.getItem('fontSizeAdm')) || 100;
document.body.style.fontSize = tamanhoAtual + '%';

btnDiminuir.addEventListener('click', () => {
    tamanhoAtual = Math.max(70, tamanhoAtual - 10);
    aplicarTamanhoFonte();
});

btnNormal.addEventListener('click', () => {
    tamanhoAtual = 100;
    aplicarTamanhoFonte();
});

btnAumentar.addEventListener('click', () => {
    tamanhoAtual = Math.min(140, tamanhoAtual + 10);
    aplicarTamanhoFonte();
});

function aplicarTamanhoFonte() {
    document.body.style.fontSize = tamanhoAtual + '%';
    localStorage.setItem('fontSizeAdm', tamanhoAtual);
}
