document.addEventListener("DOMContentLoaded", () => {
    
    const colecaoFS = "reunioes_fim_semana";

    // Referências dos elementos do formulário
    const form = document.getElementById('form-fim-semana');
    const campoData = document.getElementById('id-semana');
    const checkVisita = document.getElementById('check-visita');
    const campoPresidente = document.getElementById('presidente');
    const campoTema = document.getElementById('discurso-tema');
    const campoOrador = document.getElementById('discurso-orador');
    const campoCongregacao = document.getElementById('discurso-congregacao');
    const campoLeitor = document.getElementById('sentinela-leitor');
    
    // Elementos dinâmicos da visita
    const containerLeitor = document.getElementById('container-leitor');
    const secaoVisitaExtra = document.getElementById('secao-visita-extra');
    const campoDiscursoFinal = document.getElementById('visita-discurso-final');

    // Referências do Modal de Alerta
    const modal = document.getElementById('modal-alerta');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalMensagem = document.getElementById('modal-mensagem');
    const btnFecharModal = document.getElementById('btn-fechar-modal');

    // Monitora a caixa de checagem para adaptar os campos da Visita
    if (checkVisita) {
        checkVisita.addEventListener('change', () => {
            if (checkVisita.checked) {
                // É semana de visita: esconde o leitor e mostra o discurso final
                if (containerLeitor) containerLeitor.style.display = "none";
                if (campoLeitor) {
                    campoLeitor.required = false;
                    campoLeitor.value = ""; // Limpa se houver algo digitado
                }
                if (secaoVisitaExtra) secaoVisitaExtra.style.display = "block";
                if (campoDiscursoFinal) campoDiscursoFinal.required = true;
            } else {
                // Semana normal: mostra o leitor e esconde o discurso final
                if (containerLeitor) containerLeitor.style.display = "block";
                if (campoLeitor) campoLeitor.required = true;
                if (secaoVisitaExtra) secaoVisitaExtra.style.display = "none";
                if (campoDiscursoFinal) {
                    campoDiscursoFinal.required = false;
                    campoDiscursoFinal.value = "";
                }
            }
        });
    }

    function exibirAlerta(titulo, mensagem, sucesso = true) {
        if (!modal) {
            alert(titulo + ": " + mensagem);
            return;
        }
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;
        const icone = modal.querySelector('.modal-icone');
        
        if (icone) {
            if (sucesso) {
                icone.textContent = "✔";
                icone.style.backgroundColor = "#e6f4ea";
                icone.style.color = "#137333";
            } else {
                icone.textContent = "✖";
                icone.style.backgroundColor = "#fce8e6";
                icone.style.color = "#c5221f";
            }
        }
        modal.classList.add('mostrar');
        modal.classList.add('active');
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
            modal.classList.remove('mostrar');
            modal.classList.remove('active');
        });
    }

    function limparFormulario() {
        if(checkVisita) {
            checkVisita.checked = false;
            checkVisita.dispatchEvent(new Event('change')); // Reseta o visual dos campos
        }
        if(campoPresidente) campoPresidente.value = "";
        if(campoTema) campoTema.value = "";
        if(campoOrador) campoOrador.value = "";
        if(campoCongregacao) campoCongregacao.value = "";
        if(campoLeitor) campoLeitor.value = "";
        if(campoDiscursoFinal) campoDiscursoFinal.value = "";
    }

    // Escuta a mudança de data para buscar dados existentes no Firebase
    if (campoData) {
        campoData.addEventListener('change', async () => {
            const dataSelecionada = campoData.value;
            if (!dataSelecionada) return;

            try {
                const docRef = db.collection(colecaoFS).doc(dataSelecionada);
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const dados = docSnap.data();
                    
                    // Define se é visita primeiro para ajustar os campos e travas
                    if (checkVisita) {
                        checkVisita.checked = dados.ehVisitaSuperintendente || false;
                        checkVisita.dispatchEvent(new Event('change'));
                    }

                    if(campoPresidente) campoPresidente.value = dados.presidente || "";
                    if(campoTema) campoTema.value = dados.temaDiscurso || "";
                    if(campoOrador) campoOrador.value = dados.orador || "";
                    if(campoCongregacao) campoCongregacao.value = dados.congregacaoOrador || "";
                    if(campoLeitor) campoLeitor.value = dados.leitorSentinela || "";
                    if(campoDiscursoFinal) campoDiscursoFinal.value = dados.discursoFinalVisita || "";
                } else {
                    limparFormulario();
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                exibirAlerta("Erro!", "Não foi possível buscar os dados desta data.", false);
            }
        });
    }

    // Escuta o envio do formulário para salvar ou atualizar no Firebase
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dataDocumento = campoData.value;
            if (!dataDocumento) {
                exibirAlerta("Aviso", "Por favor, selecione uma data válida.", false);
                return;
            }

            const dadosReuniao = {
                data: dataDocumento,
                ehVisitaSuperintendente: checkVisita ? checkVisita.checked : false,
                presidente: campoPresidente.value.trim(),
                temaDiscurso: campoTema.value.trim(),
                orador: campoOrador.value.trim(),
                congregacaoOrador: campoCongregacao.value.trim(),
                leitorSentinela: campoLeitor ? campoLeitor.value.trim() : "",
                discursoFinalVisita: campoDiscursoFinal ? campoDiscursoFinal.value.trim() : "",
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection(colecaoFS).doc(dataDocumento).set(dadosReuniao, { merge: true });
                exibirAlerta("Sucesso!", "A programação de fim de semana foi salva com sucesso!");
            } catch (error) {
                console.error("Erro ao salvar:", error);
                exibirAlerta("Erro!", "Houve uma falha ao salvar a programação.", false);
            }
        });
    }

    // --- LÓGICA DE ACESSIBILIDADE (RESOLUÇÃO PARA CAMPOS FIXOS DO HTML) ---
    const btnDiminuir = document.getElementById('btn-diminuir');
    const btnNormal = document.getElementById('btn-normal');
    const btnAumentar = document.getElementById('btn-aumentar');

    // Recupera o tamanho salvo no navegador ou define 100% como padrão
    let tamanhoAtual = parseInt(localStorage.getItem('fontSizeAdm')) || 100;

    // Esta função força o tamanho em todos os elementos fixos do HTML, quebrando a trava do CSS
    function aplicarTamanhoFonte() {
        // 1. Aplica a proporção base no body
        document.body.style.fontSize = tamanhoAtual + '%';
        
        // 2. Transforma a porcentagem em unidade 'rem' proporcional (ex: 120% vira 1.2rem)
        const novoTamanhoRem = tamanhoAtual / 100;

        // 3. Seleciona todos os elementos fixos que o CSS travou com !important
        const elementosRígidos = document.querySelectorAll('.adm-body input, .adm-body label, .adm-body legend, .adm-body button, .adm-body select');
        
        // 4. Força o novo tamanho inline direto em cada um deles com prioridade máxima absoluta
        elementosRígidos.forEach(elemento => {
            elemento.style.setProperty('font-size', `${novoTamanhoRem}rem`, 'important');
        });
        
        // 5. Salva a preferência do usuário para as próximas páginas
        localStorage.setItem('fontSizeAdm', tamanhoAtual);
    }

    // Registra os cliques nos botões de acessibilidade
    if (btnDiminuir && btnNormal && btnAumentar) {
        // Executa uma vez ao carregar a página para aplicar o zoom guardado na memória
        aplicarTamanhoFonte();

        // Botão A-
        btnDiminuir.addEventListener('click', () => {
            tamanhoAtual = Math.max(70, tamanhoAtual - 10); // Limite mínimo de 70%
            aplicarTamanhoFonte();
        });

        // Botão A (Normal)
        btnNormal.addEventListener('click', () => {
            tamanhoAtual = 100;
            aplicarTamanhoFonte();
        });

        // Botão A+
        btnAumentar.addEventListener('click', () => {
            tamanhoAtual = Math.min(140, tamanhoAtual + 10); // Limite máximo de 140%
            aplicarTamanhoFonte();
        });
    }
});