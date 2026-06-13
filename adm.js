// 🔥 SEGURANÇA: Verifica se o utilizador está logado antes de liberar o banco
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Se não houver utilizador logado, chuta para o login
        window.location.href = "login.html";
    }
});


// 2. AGUARDA O CARREGAMENTO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {

    // --- VÍNCULO DIRETO EM TEMPO REAL: LEITURA DA SEMANA -> TÍTULO DAS JOIAS ---
    const inputLeituraSemana = document.getElementById("leitura-semana");
    const inputJoiasOculto = document.getElementById("tesouros-joias-tema");
    const textoDinamicoJoias = document.getElementById("texto-dinamico-joias");

    if (inputLeituraSemana && inputJoiasOculto && textoDinamicoJoias) {
        inputLeituraSemana.addEventListener("input", () => {
            const valor = inputLeituraSemana.value.trim().toUpperCase();
            inputJoiasOculto.value = valor; // Salva o valor idêntico no input oculto para o Firebase
            textoDinamicoJoias.innerText = valor ? ` - ${valor}` : ""; // Atualiza o visual "Jóias Espirituais - Jeremias 4-6"
        });
    }
    
    const containerMinisterio = document.getElementById("container-ministerio-partes");
    const btnAddMinisterio = document.getElementById("btn-add-ministerio");
    const containerVida = document.getElementById("container-vida-partes");
    const btnAddVida = document.getElementById("btn-add-vida");
    const btnAddVisitaSuper = document.getElementById("btn-add-visita-super"); 
    const formReuniao = document.getElementById("form-reuniao");
    const inputData = document.getElementById("id-semana");

    // --- FUNÇÃO PRIVADA: ATUALIZA A NUMERAÇÃO DE FORMA SEQUENCIAL ---
    function atualizarNumeracaoFormulario() {
        let contador = 3;

        // 1. Varre e numera os itens do Ministério
        const itensMinisterio = containerMinisterio.querySelectorAll(".bloco-ministerio-item");
        itensMinisterio.forEach((item) => {
            contador++;
            const label = item.querySelector(".label-num-dinamica");
            if (label) {
                label.innerText = `Parte ${contador} - Título/Descrição:`;
            }
        });

        // 2. Varre e continua a numeração nos itens da Vida Cristã
        const itensVida = containerVida.querySelectorAll(".bloco-vida-item");
        itensVida.forEach((item) => {
            contador++;
            const label = item.querySelector(".label-num-dinamica");
            if (label) {
                label.innerText = `Parte ${contador} - Título/Descrição:`;
            }
        });

        // 3. Incrementa e aplica o número no bloco fixo do Estudo Bíblico da Congregação
        contador++;
        const tituloEstudo = document.querySelector(".bloco-estudo-fixo h4");
        if (tituloEstudo) {
            tituloEstudo.innerText = `📖 ${contador}. Estudo Bíblico da Congregação`;
        }
    }


    // --- FUNÇÃO: CARREGAR DADOS AO MUDAR A DATA ---
    inputData.addEventListener("change", () => {
        const dataId = inputData.value;
        if (!dataId) return;

        containerMinisterio.innerHTML = "";
        containerVida.innerHTML = "";

        db.collection("reunioes_meio_semana").doc(dataId).get()
            .then((doc) => {
                if (doc.exists) {
                    const dados = doc.data();
                    
                    const leituraSmn = dados.leituraSemana || "";
                    document.getElementById("leitura-semana").value = leituraSmn;

                    document.getElementById("cantico-inicial").value = dados.canticoInicial || "";
                    document.getElementById("cantico-final").value = dados.canticoFinal || "";
                    document.getElementById("presidente").value = dados.presidente || "";
                    document.getElementById("oracao-inicial").value = dados.oracaoInicial || "";
                    document.getElementById("conselheiro-sala-b").value = dados.conselheiroSalaB || "";
                    document.getElementById("oracao-final").value = dados.oracaoFinal || "";
                    
                    document.getElementById("tesouros-discurso-tema").value = dados.tesouros?.discurso10min?.tema || "";
                    document.getElementById("tesouros-discurso-designado").value = dados.tesouros?.discurso10min?.designado || dados.tesouros?.discurso10min?.designated || "";
                    document.getElementById("leitura-principal").value = dados.tesouros?.leituraBiblia_salaPrincipal || "";
                    document.getElementById("leitura-sala-b").value = dados.tesouros?.leituraBiblia_salaB || "";
                    document.getElementById("estudo-dirigente").value = dados.estudoDirigente || "";
                    document.getElementById("estudo-leitor").value = dados.estudoLeitor || "";

                    // Garante o preenchimento do tema oculto e do texto dinâmico ao ler do Firebase
                    const temaJoiasSalvo = dados.tesouros?.joias10min?.tema || leituraSmn;
                    if (inputJoiasOculto) inputJoiasOculto.value = temaJoiasSalvo;
                    if (textoDinamicoJoias) {
                        textoDinamicoJoias.innerText = temaJoiasSalvo ? ` - ${temaJoiasSalvo}` : "";
                    }
                    
                    document.getElementById("tesouros-joias-designado").value = dados.tesouros?.joias10min?.designado || dados.tesouros?.joias10min?.designated || "";

                    // Preenche dinamicamente as partes do Ministério
                    if (dados.facaSeuMelhor && Array.isArray(dados.facaSeuMelhor)) {
                        dados.facaSeuMelhor.forEach(item => {
                            adicionarBlocoMinisterioDirect(); 
                            const ultimoBloco = containerMinisterio.lastElementChild;
                            
                            ultimoBloco.querySelector(".min-parte").value = item.parte || "";
                            ultimoBloco.querySelector(".min-p-estudante").value = item.principal_estudante || "";
                            ultimoBloco.querySelector(".min-p-ajudante").value = item.principal_ajudante || "";
                            ultimoBloco.querySelector(".min-b-estudante").value = item.salaB_estudante || "";
                            ultimoBloco.querySelector(".min-b-ajudante").value = item.salaB_ajudante || "";
                        });
                    }

                    // Preenche dinamicamente as partes da Vida Cristã
                    if (dados.partesVida && Array.isArray(dados.partesVida)) {
                        dados.partesVida.forEach((item) => {
                            adicionarBlocoVidaDirect(); 
                            const ultimoBloco = containerVida.lastElementChild;
                            ultimoBloco.querySelector(".vida-parte").value = item.parte || "";
                            ultimoBloco.querySelector(".vida-orador").value = item.orador || "";
                        });
                    }
                    
                    atualizarNumeracaoFormulario();
                    console.log("Dados carregados para edição!");
                } else {
                    console.log("Nova semana. Formulário pronto para preenchimento.");
                    if (textoDinamicoJoias) textoDinamicoJoias.innerText = "";
                    if (inputJoiasOculto) inputJoiasOculto.value = "";
                    atualizarNumeracaoFormulario();
                }
            })
            .catch(error => console.error("Erro ao carregar dados para o ADM:", error));
    });

    function adicionarBlocoMinisterioDirect() {
        const div = document.createElement("div");
        div.className = "card-dinamico bloco-ministerio-item";
        div.style = "border-left: 4px solid #f1c40f; padding: 15px; margin-bottom: 20px; background: #fffdf3; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
        
        div.innerHTML = `
            <div class="form-group" style="margin-bottom: 12px;">
                <label class="label-num-dinamica" style="font-weight: bold; color: #b78a00;">Parte - Título/Descrição:</label>
                <input type="text" class="min-parte" placeholder="Ex: Inicie Conversas (4 min.)" required style="width: 100%; box-sizing: border-box;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
                <label>Salão Principal — Estudante:</label>
                <input type="text" class="min-p-estudante" placeholder="Nome do estudante" required style="width: 100%; box-sizing: border-box;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
                <label>Salão Principal — Ajudante:</label>
                <input type="text" class="min-p-ajudante" placeholder="Ajudante (se houver)" style="width: 100%; box-sizing: border-box;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
                <label>Sala B — Estudante:</label>
                <input type="text" class="min-b-estudante" placeholder="Estudante (se houver)" style="width: 100%; box-sizing: border-box;">
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <label>Sala B — Ajudante:</label>
                <input type="text" class="min-b-ajudante" placeholder="Ajudante (se houver)" style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="text-align: right;">
                <button type="button" class="btn-remover-parte" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ❌ Remover Esta Parte
                </button>
            </div>
        `;

        div.querySelector(".btn-remover-parte").addEventListener("click", () => {
            div.remove();
            atualizarNumeracaoFormulario();
        });

        containerMinisterio.appendChild(div);
    }

    function adicionarBlocoVidaDirect() {
        const div = document.createElement("div");
        div.className = "card-dinamico bloco-vida-item";
        div.style = "border-left: 4px solid #e67e22; padding: 15px; margin-bottom: 20px; background: #fffcf9; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
        
        div.innerHTML = `
            <div class="form-group" style="margin-bottom: 12px;">
                <label class="label-num-dinamica" style="font-weight: bold; color: #d35400;">Parte - Título/Descrição:</label>
                <input type="text" class="vida-parte" placeholder="Ex: Necessidades da Congregação (15 min.)" required style="width: 100%; box-sizing: border-box;">
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <label>Orador:</label>
                <input type="text" class="vida-orador" placeholder="Nome do orador designado" required style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="text-align: right;">
                <button type="button" class="btn-remover-parte" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ❌ Remover Esta Parte
                </button>
            </div>
        `;

        div.querySelector(".btn-remover-parte").addEventListener("click", () => {
            div.remove();
            atualizarNumeracaoFormulario();
        });

        containerVida.appendChild(div);
    }

    btnAddMinisterio.addEventListener("click", () => {
        adicionarBlocoMinisterioDirect();
        atualizarNumeracaoFormulario();
    });

    btnAddVida.addEventListener("click", () => {
        adicionarBlocoVidaDirect();
        atualizarNumeracaoFormulario();
    });

    if (btnAddVisitaSuper) {
        btnAddVisitaSuper.addEventListener("click", () => {
            adicionarBlocoVidaDirect();
            const ultimoBloco = containerVida.lastElementChild;
            
            ultimoBloco.querySelector(".vida-parte").value = "Discurso do Superintendente de Circuito (30 min.)";
            ultimoBloco.querySelector(".vida-orador").value = "Superintendente de Circuito";
            
            ultimoBloco.style.borderLeft = "4px solid #9b59b6";
            ultimoBloco.style.background = "#fcf9fe";
            
            atualizarNumeracaoFormulario();
        });
    }

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

        const partesVidaDinamicas = [];
        document.querySelectorAll(".bloco-vida-item").forEach((bloco) => {
            partesVidaDinamicas.push({
                parte: bloco.querySelector(".vida-parte").value,
                orador: bloco.querySelector(".vida-orador").value
            });
        });

        const dadosReuniao = {
            data: dataId,
            canticoInicial: document.getElementById("cantico-inicial").value, 
            canticoFinal: document.getElementById("cantico-final").value,
            leituraSemana: document.getElementById("leitura-semana").value,
            presidente: document.getElementById("presidente").value,
            oracaoInicial: document.getElementById("oracao-inicial").value,
            conselheiroSalaB: document.getElementById("conselheiro-sala-b").value || "",
            estudoDirigente: document.getElementById("estudo-dirigente").value || "",
            estudoLeitor: document.getElementById("estudo-leitor").value || "",

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
            partesVida: partesVidaDinamicas,
            oracaoFinal: document.getElementById("oracao-final").value
        };

        db.collection("reunioes_meio_semana").doc(dataId).set(dadosReuniao)
            .then(() => {
                mostrarAlertaCustomizado("✔", "Sucesso!", "A programação da semana foi salva com sucesso.");
                formReuniao.reset();
                containerMinisterio.innerHTML = "";
                containerVida.innerHTML = "";
                if (textoDinamicoJoias) textoDinamicoJoias.innerText = "";
                
                // 🔥 CORREÇÃO: Força o recálculo imediato da numeração após limpar os blocos da tela
                atualizarNumeracaoFormulario();
            })
            .catch((error) => {
                console.error("Erro ao salvar os dados: ", error);
                mostrarAlertaCustomizado("❌", "Ops, algo deu errado", "Não foi possível salvar os dados.");
            });
    });

    const modal = document.getElementById("modal-alerta");
    const btnFecharModal = document.getElementById("btn-fechar-modal");

    function mostrarAlertaCustomizado(icone, titulo, mensagem) {
        document.getElementById("modal-titulo").innerText = titulo;
        document.getElementById("modal-mensagem").innerText = mensagem;
        modal.querySelector(".modal-icone").innerText = icone; 
        modal.classList.add("mostrar");
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener("click", () => {
            modal.classList.remove("mostrar");
        });
    }

    // --- CÓDIGO DE ACESSIBILIDADE (ZOOM) ---
    const btnDiminuir = document.getElementById("btn-diminuir");
    const btnNormal = document.getElementById("btn-normal");
    const btnAumentar = document.getElementById("btn-aumentar");

    let nivelAtual = 0;
    const todasAsClasses = ["zoom-minus-3", "zoom-minus-2", "zoom-minus-1", "zoom-plus-1", "zoom-plus-2", "zoom-plus-3"];

    function atualizarZoom() {
        document.body.classList.remove(...todasAsClasses);
        if (nivelAtual > 0) document.body.classList.add(`zoom-plus-${nivelAtual}`);
        else if (nivelAtual < 0) document.body.classList.add(`zoom-minus-${Math.abs(nivelAtual)}`);
    }

    if (btnDiminuir && btnNormal && btnAumentar) {
        btnAumentar.addEventListener("click", () => { if (nivelAtual < 3) { nivelAtual++; atualizarZoom(); } });
        btnDiminuir.addEventListener("click", () => { if (nivelAtual > -3) { nivelAtual--; atualizarZoom(); } });
        btnNormal.addEventListener("click", () => { nivelAtual = 0; atualizarZoom(); });
    }
});