// SEGURANÇA: Verifica se o utilizador está logado antes de liberar o banco
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Se não houver utilizador logado, chuta para o login
        window.location.href = "login.html";
    }
});

// 2. AGUARDA O CARREGAMENTO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    
    const containerMinisterio = document.getElementById("container-ministerio-partes");
    const btnAddMinisterio = document.getElementById("btn-add-ministerio");
    const containerVida = document.getElementById("container-vida-partes");
    const btnAddVida = document.getElementById("btn-add-vida");
    const formReuniao = document.getElementById("form-reuniao");
    const inputData = document.getElementById("id-semana");

    // --- FUNÇÃO: CARREGAR DADOS AO MUDAR A DATA ---
    inputData.addEventListener("change", () => {
        const dataId = inputData.value;
        if (!dataId) return;

        // Limpa os campos dinâmicos antigos antes de carregar os novos
        containerMinisterio.innerHTML = "";
        containerVida.innerHTML = "";

        db.collection("reunioes_meio_semana").doc(dataId).get()
            .then((doc) => {
                if (doc.exists) {
                    const dados = doc.data();
                    
                    // Preenche os campos fixos
                    document.getElementById("leitura-semana").value = dados.leituraSemana || "";
                    document.getElementById("presidente").value = dados.presidente || "";
                    document.getElementById("oracao-inicial").value = dados.oracaoInicial || "";
                    document.getElementById("conselheiro-sala-b").value = dados.conselheiroSalaB || "";
                    document.getElementById("oracao-final").value = dados.oracaoFinal || "";
                    
                    document.getElementById("tesouros-discurso-tema").value = dados.tesouros?.discurso10min?.tema || "";
                    document.getElementById("tesouros-discurso-designado").value = dados.tesouros?.discurso10min?.designado || dados.tesouros?.discurso10min?.designated || "";
                    document.getElementById("tesouros-joias-tema").value = dados.tesouros?.joias10min?.tema || "";
                    document.getElementById("tesouros-joias-designado").value = dados.tesouros?.joias10min?.designado || dados.tesouros?.joias10min?.designated || "";
                    document.getElementById("leitura-principal").value = dados.tesouros?.leituraBiblia_salaPrincipal || "";
                    document.getElementById("leitura-sala-b").value = dados.tesouros?.leituraBiblia_salaB || "";

                    // Preenche dinamicamente as partes do Ministério
                    if (dados.facaSeuMelhor && Array.isArray(dados.facaSeuMelhor)) {
                        dados.facaSeuMelhor.forEach(item => {
                            btnAddMinisterio.click(); 
                            const ultimoBloco = containerMinisterio.lastElementChild;
                            
                            ultimoBloco.querySelector(".min-parte").value = item.parte || "";
                            ultimoBloco.querySelector(".min-p-estudante").value = item.principal_estudante || "";
                            ultimoBloco.querySelector(".min-p-ajudante").value = item.principal_ajudante || "";
                            ultimoBloco.querySelector(".min-b-estudante").value = item.salaB_estudante || "";
                            ultimoBloco.querySelector(".min-b-ajudante").value = item.salaB_ajudante || "";
                        });
                    }

                    // Preenche dinamicamente as partes da Vida Cristã
                    if (dados.nossaVida && Array.isArray(dados.nossaVida)) {
                        dados.nossaVida.forEach(item => {
                            btnAddVida.click();
                            const ultimoBloco = containerVida.lastElementChild;
                            
                            ultimoBloco.querySelector(".vida-parte").value = item.parte || "";
                            ultimoBloco.querySelector(".vida-dirigente").value = item.dirigente || item.designado || "";
                            ultimoBloco.querySelector(".vida-leitor").value = item.leitor || "";
                        });
                    }
                    
                    console.log("Dados carregados para edição!");
                } else {
                    console.log("Nova semana. Formulário pronto para preenchimento.");
                }
            })
            .catch(error => console.error("Erro ao carregar dados para o ADM:", error));
    });

    // --- FUNÇÃO: ADICIONAR PARTE DO MINISTÉRIO ---
    btnAddMinisterio.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "card-dinamico bloco-ministerio-item";
        div.innerHTML = `
            <button type="button" class="btn-remover-parte" onclick="this.parentElement.remove()">❌ Remover</button>
            <div class="form-group">
                <label>Título/Descrição da Parte:</label>
                <input type="text" class="min-parte" placeholder="Ex: 4. Inicie Conversas (4 min.)" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Salão Principal - Estudante:</label>
                    <input type="text" class="min-p-estudante" placeholder="Estudante" required>
                </div>
                <div class="form-group">
                    <label>Salão Principal - Ajudante:</label>
                    <input type="text" class="min-p-ajudante" placeholder="Ajudante (se houver)">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Sala B - Estudante:</label>
                    <input type="text" class="min-b-estudante" placeholder="Estudante (se houver)">
                </div>
                <div class="form-group">
                    <label>Sala B - Ajudante:</label>
                    <input type="text" class="min-b-ajudante" placeholder="Ajudante (se houver)">
                </div>
            </div>
        `;
        containerMinisterio.appendChild(div);
    });

    // --- FUNÇÃO: ADICIONAR PARTE DA VIDA CRISTÃ ---
    btnAddVida.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "card-dinamico bloco-vida-item";
        div.innerHTML = `
            <button type="button" class="btn-remover-parte" onclick="this.parentElement.remove()">❌ Remover</button>
            <div class="form-group">
                <label>Título/Descrição da Parte:</label>
                <input type="text" class="vida-parte" placeholder="Ex: Necessidades da Congregação (15 min.)" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Dirigente / Designado:</label>
                    <input type="text" class="vida-dirigente" placeholder="Nome do irmão" required>
                </div>
                <div class="form-group">
                    <label>Leitor (Se houver):</label>
                    <input type="text" class="vida-leitor" placeholder="Nome do leitor (se houver)">
                </div>
            </div>
        `;
        containerVida.appendChild(div);
    });

    // --- 3. LÓGICA DE CAPTURA E ENVIO DOS DADOS (SUBMIT) ---
    formReuniao.addEventListener("submit", (e) => {
        e.preventDefault();

        const dataId = inputData.value;

        const listaMinisterio = [];
        const itensMinisterio = document.querySelectorAll(".bloco-ministerio-item");
        itensMinisterio.forEach((item) => {
            listaMinisterio.push({
                parte: item.querySelector(".min-parte").value,
                principal_estudante: item.querySelector(".min-p-estudante").value || "",
                principal_ajudante: item.querySelector(".min-p-ajudante").value || "",
                salaB_estudante: item.querySelector(".min-b-estudante").value || "",
                salaB_ajudante: item.querySelector(".min-b-ajudante").value || ""
            });
        });

        const listaVida = [];
        const itensVida = document.querySelectorAll(".bloco-vida-item");
        itensVida.forEach((item) => {
            listaVida.push({
                parte: item.querySelector(".vida-parte").value,
                dirigente: item.querySelector(".vida-dirigente").value || "",
                leitor: item.querySelector(".vida-leitor").value || ""
            });
        });

        const dadosReuniao = {
            data: dataId,
            leituraSemana: document.getElementById("leitura-semana").value,
            presidente: document.getElementById("presidente").value,
            oracaoInicial: document.getElementById("oracao-inicial").value,
            conselheiroSalaB: document.getElementById("conselheiro-sala-b").value || "",
            tesouros: {
                discurso10min: {
                    tema: document.getElementById("tesouros-discurso-tema").value,
                    designado: document.getElementById("tesouros-discurso-designado").value
                },
                joias10min: {
                    tema: document.getElementById("tesouros-joias-tema").value,
                    designado: document.getElementById("tesouros-joias-designado").value
                },
                leituraBiblia_salaPrincipal: document.getElementById("leitura-principal").value,
                leituraBiblia_salaB: document.getElementById("leitura-sala-b").value || ""
            },
            facaSeuMelhor: listaMinisterio,
            nossaVida: listaVida,
            oracaoFinal: document.getElementById("oracao-final").value
        };

// Substitua a parte final do set().then().catch() por essa estrutura:
        db.collection("reunioes_meio_semana").doc(dataId).set(dadosReuniao)
            .then(() => {
                // Exibe o modal customizado de Sucesso
                mostrarAlertaCustomizado(
                    "✔", 
                    "Sucesso!", 
                    "A programação da semana foi salva com sucesso."
                );
                
                formReuniao.reset();
                containerMinisterio.innerHTML = "";
                containerVida.innerHTML = "";
            })
            .catch((error) => {
                console.error("Erro ao salvar os dados: ", error);
                // Exibe o modal customizado de Erro
                mostrarAlertaCustomizado(
                    "❌", 
                    "Ops, algo deu errado", 
                    "Não foi possível salvar os dados. Verifique o console do navegador."
                );
            });
    });
    // --- FUNÇÃO PARA EXIBIR E FECHAR O MODAL ---
    const modal = document.getElementById("modal-alerta");
    const btnFecharModal = document.getElementById("btn-fechar-modal");

    function mostrarAlertaCustomizado(icone, titulo, mensagem) {
        document.getElementById("modal-titulo").innerText = titulo;
        document.getElementById("modal-mensagem").innerText = mensagem;
        // Altera o emoji dinamicamente (🎉 para sucesso, ❌ para erro)
        modal.querySelector(".modal-icone").innerText = icone; 
        
        modal.classList.add("mostrar");
    }

    // Fecha o modal ao clicar no botão "Entendido"
    btnFecharModal.addEventListener("click", () => {
        modal.classList.remove("mostrar");
    });


    // --- CÓDIGO DE ACESSIBILIDADE (ZOOM) PARA O ADM ---
    const btnDiminuir = document.getElementById("btn-diminuir");
    const btnNormal = document.getElementById("btn-normal");
    const btnAumentar = document.getElementById("btn-aumentar");

    let nivelAtual = 0;

    const todasAsClasses = [
        "zoom-minus-3", "zoom-minus-2", "zoom-minus-1",
        "zoom-plus-1", "zoom-plus-2", "zoom-plus-3"
    ];

    function atualizarZoom() {
        document.body.classList.remove(...todasAsClasses);

        if (nivelAtual > 0) {
            document.body.classList.add(`zoom-plus-${nivelAtual}`);
        } else if (nivelAtual < 0) {
            document.body.classList.add(`zoom-minus-${Math.abs(nivelAtual)}`);
        }
        console.log("Zoom ADM aplicado:", nivelAtual);
    }

    if (btnDiminuir && btnNormal && btnAumentar) {
        btnAumentar.addEventListener("click", () => {
            if (nivelAtual < 3) {
                nivelAtual++;
                atualizarZoom();
            }
        });

        btnDiminuir.addEventListener("click", () => {
            if (nivelAtual > -3) {
                nivelAtual--;
                atualizarZoom();
            }
        });

        btnNormal.addEventListener("click", () => {
            nivelAtual = 0;
            atualizarZoom();
        });
    }
// FIM DO CÓDIGO DE ZOOM
});

