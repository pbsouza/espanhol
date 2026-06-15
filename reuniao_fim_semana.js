document.addEventListener("DOMContentLoaded", () => {
    const colecaoFS = "reunioes_fim_semana";
    
    // Referências do HTML
    const containerMes = document.getElementById("container-reunioes-mes");
    const txtMesAno = document.getElementById("exibicao-mes-ano");
    const btnAnterior = document.getElementById("btn-mes-anterior");
    const btnAtual = document.getElementById("btn-mes-atual");
    const btnProximo = document.getElementById("btn-mes-proximo");

    // Âncoras de datas baseadas no dia de hoje
    const hoje = new Date();
    let mesFoco = new Date(hoje.getFullYear(), hoje.getMonth(), 1); // Mês que o usuário está olhando na tela
    const mesAtualReal = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Banco de dados local (Cache temporário para evitar novas leituras no Firebase)
    let cacheReunioes = [];

    // 1. FUNÇÃO CRÍTICA: Busca no Firebase apenas o intervalo permitido (-1 mês até +3 meses)
    async function baixarDadosDoFirebase() {
        // Calcula o primeiro dia do mês passado (-1)
        const dataInicio = new Date(mesAtualReal.getFullYear(), mesAtualReal.getMonth() - 1, 1);
        const strInicio = dataInicio.toISOString().split('T')[0];

        // Calcula o último dia do terceiro mês para frente (+3)
        const dataFim = new Date(mesAtualReal.getFullYear(), mesAtualReal.getMonth() + 4, 0); // O dia '0' do mês subsequente pega o último dia do anterior
        const strFim = dataFim.toISOString().split('T')[0];

        try {
            console.log(`[Firebase] Carregando registros estritamente entre ${strInicio} e ${strFim} para economizar dados.`);
            
            // Faz a query limitando por intervalo de IDs (que são as datas textuais YYYY-MM-DD)
            const snapshot = await db.collection(colecaoFS)
                .where("data", ">=", strInicio)
                .where("data", "<=", strFim)
                .get();

            cacheReunioes = [];
            snapshot.forEach(doc => {
                cacheReunioes.push(doc.data());
            });

            // Com os dados salvos localmente, renderiza o mês atual na tela
            renderizarMesAtual();

        } catch (error) {
            console.error("Erro ao baixar dados do Firebase:", error);
            if(containerMes) containerMes.innerHTML = "<p style='color:red; text-align:center;'>Erro ao carregar a programação.</p>";
        }
    }

    // 2. FUNÇÃO VISUAL: Monta a tela com a data formatada exatamente como "14 de Junho"
    function renderizarMesAtual() {
        if (!containerMes) return;
        containerMes.innerHTML = "";

        // Obtém o nome do mês e ano (Ex: "junho de 2026")
        let nomeMesAno = mesFoco.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        // Deixa apenas a primeira letra do mês em maiúscula (Ex: "Junho de 2026")
        nomeMesAno = nomeMesAno.charAt(0).toUpperCase() + nomeMesAno.slice(1);
        
        if (txtMesAno) txtMesAno.innerText = nomeMesAno;

        gerenciarLimitesBotoes();

        const anoFoco = mesFoco.getFullYear();
        const mesFocoNum = mesFoco.getMonth(); // 0 a 11

        // Filtra as reuniões que pertencem apenas ao ano e mês selecionados
        const reunioesDoMes = cacheReunioes.filter(reuniao => {
            const partes = reuniao.data.split('-');
            return parseInt(partes[0]) === anoFoco && (parseInt(partes[1]) - 1) === mesFocoNum;
        });

        // Ordena por data crescente
        reunioesDoMes.sort((a, b) => a.data.localeCompare(b.data));

        if (reunioesDoMes.length === 0) {
            containerMes.innerHTML = `<p style="text-align: center; color: var(--cor-principal); padding: 20px; font-weight: bold;">Nenhuma programação cadastrada para este mês.</p>`;
            return;
        }

        // Desenha os cards na tela utilizando as classes do seu CSS
        reunioesDoMes.forEach(dados => {
            const partes = dados.data.split('-');
            const dataObjeto = new Date(partes[0], partes[1] - 1, partes[2]);
            
            // 1. Pega apenas o dia numérico (Ex: 14)
            const diaNumerico = dataObjeto.getDate();
            // 2. Pega apenas o nome do mês por extenso (Ex: "junho")
            let mesExtenso = dataObjeto.toLocaleDateString('pt-BR', { month: 'long' });
            // 3. Garante que a primeira letra do mês fica maiúscula (Ex: "Junho")
            mesExtenso = mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1);

            // 4. Monta a string final exatamente como pretendido: "14 de Junho"
            const dataFormatada = `${diaNumerico} de ${mesExtenso}`;

            // Configuração para Semana de Visita
            let blocoVisitaCabecalho = "";
            let blocoLeitorSentinela = `<div class="bloco-item-sub"><strong>Leitor:</strong> <span>${dados.leitorSentinela || "Não designado"}</span></div>`;
            let cardVisitaConclusao = "";

            if (dados.ehVisitaSuperintendente) {
                blocoVisitaCabecalho = `<div style="background: var(--cor-secundaria); padding: 6px 10px; border-radius: 4px; margin-top: 8px; font-weight: bold; color: var(--cor-principal); font-size: 0.95em;">✨ Semana da Visita do Superintendente de Circuito</div>`;
                blocoLeitorSentinela = ""; // Esconde o leitor na visita
                cardVisitaConclusao = `
                    <div class="bloco-item" style="border-top: 1px dashed var(--cor-secundaria); margin-top: 10px; padding-top: 10px;">
                        <span class="bloco-item-titulo" style="color: var(--cor-principal); font-weight: bold; padding: 0; background: none; margin-bottom: 4px; display: block;">👔 Conclusão da Visita</span>
                        <div class="bloco-item-sub"><strong>Tema:</strong> <span style="font-style: italic; font-weight: bold;">${dados.discursoFinalVisita || "Não informado"}</span></div>
                        <div class="bloco-item-sub" style="margin-top: 2px;"><strong>Orador:</strong> Superintendente de Circuito</div>
                    </div>`;
            }

            // Estrutura HTML usando o seu style.css e aplicando "em" inline para o Zoom funcionar perfeitamente
            const cardSemanaHTML = `
                <div class="secao-bloco" style="margin-bottom: 25px; font-size: 1em;">
                    
                    <div class="secao-cabecalho" style="background-color: var(--cor-principal); color: var(--texto-claro); padding: 15px; display: flex; flex-direction: column; gap: 4px; font-size: 1em;">
                        <div style="font-weight: bold; font-size: 1.15em; letter-spacing: 0.5px;">${dataFormatada}</div>
                        
                        <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.3); width: 100%; margin: 6px 0;">
                        
                        <div style="font-size: 1em;"><strong>👨‍💼 Presidente:</strong> <span>${dados.presidente || "Não designado"}</span></div>
                        ${blocoVisitaCabecalho}
                    </div>

                    <div style="padding: 15px; display: flex; flex-direction: column; gap: 14px; font-size: 1em;">
                        
                        <div class="bloco-item" style="border-left: 3px solid var(--cor-secundaria); padding-left: 10px;">
                            <span class="bloco-item-titulo" style="color: var(--cor-principal); font-weight: bold; padding: 0; background: none; margin-bottom: 4px; display: block; font-size: 1.05em;">🎤 Discurso Público</span>
                            <div class="bloco-item-sub"><strong>Tema:</strong> <span style="font-style: italic; color: #333;">${dados.temaDiscurso || "Não informado"}</span></div>
                            <div class="bloco-item-sub" style="margin-top: 2px;"><strong>Orador:</strong> <span>${dados.orador || "Não designado"}</span> ${dados.congregacaoOrador ? `<span style="color: #666;">(${dados.congregacaoOrador})</span>` : ''}</div>
                        </div>

                        <div class="bloco-item" style="border-top: 1px dashed var(--borda); padding-top: 12px; border-left: 3px solid var(--cor-clara); padding-left: 10px;">
                            <span class="bloco-item-titulo" style="color: var(--cor-principal); font-weight: bold; padding: 0; background: none; margin-bottom: 4px; display: block; font-size: 1.05em;">📖 Estudo de A Sentinela</span>
                            ${blocoLeitorSentinela}
                        </div>
                        
                        ${cardVisitaConclusao}
                    </div>
                </div>
            `;
            containerMes.innerHTML += cardSemanaHTML;
        });
    }

    // 3. FUNÇÃO DE TRAVA: Impede cliques fora do escopo (-1 mês e +3 meses)
    function gerenciarLimitesBotoes() {
        // Distância em meses entre o mês exibido e o mês atual real
        const diferencaMeses = (mesFoco.getFullYear() - mesAtualReal.getFullYear()) * 12 + (mesFoco.getMonth() - mesAtualReal.getMonth());

        // Limite para trás: -1 mês
        if (btnAnterior) {
            btnAnterior.disabled = (diferencaMeses <= -1);
            btnAnterior.style.opacity = (diferencaMeses <= -1) ? "0.3" : "1";
            btnAnterior.style.cursor = (diferencaMeses <= -1) ? "not-allowed" : "pointer";
        }

        // Limite para frente: +3 meses
        if (btnProximo) {
            btnProximo.disabled = (diferencaMeses >= 3);
            btnProximo.style.opacity = (diferencaMeses >= 3) ? "0.3" : "1";
            btnProximo.style.cursor = (diferencaMeses >= 3) ? "not-allowed" : "pointer";
        }
    }

    // --- EVENTOS DE CLIQUE DOS BOTÕES (Navegam localmente sem gastar requisições) ---
    if (btnAnterior) {
        btnAnterior.addEventListener("click", () => {
            mesFoco.setMonth(mesFoco.getMonth() - 1);
            renderizarMesAtual();
        });
    }

    if (btnAtual) {
        btnAtual.addEventListener("click", () => {
            mesFoco = new Date(mesAtualReal);
            renderizarMesAtual();
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener("click", () => {
            mesFoco.setMonth(mesFoco.getMonth() + 1);
            renderizarMesAtual();
        });
    }

    // Inicialização Única
    baixarDadosDoFirebase();

    // --- LÓGICA DE ACESSIBILIDADE DE FONTE ---
    const btnDiminuir = document.getElementById('btn-diminuir');
    const btnNormal = document.getElementById('btn-normal');
    const btnAumentar = document.getElementById('btn-aumentar');

    if (btnDiminuir && btnNormal && btnAumentar) {
        let tamanhoAtual = parseInt(localStorage.getItem('fontSizeView')) || 100;
        document.body.style.fontSize = tamanhoAtual + '%';

        btnDiminuir.addEventListener('click', () => {
            tamanhoAtual = Math.max(70, tamanhoAtual - 10);
            document.body.style.fontSize = tamanhoAtual + '%';
            localStorage.setItem('fontSizeView', tamanhoAtual);
        });

        btnNormal.addEventListener('click', () => {
            tamanhoAtual = 100;
            document.body.style.fontSize = tamanhoAtual + '%';
            localStorage.setItem('fontSizeView', tamanhoAtual);
        });

        btnAumentar.addEventListener('click', () => {
            tamanhoAtual = Math.min(140, tamanhoAtual + 10);
            document.body.style.fontSize = tamanhoAtual + '%';
            localStorage.setItem('fontSizeView', tamanhoAtual);
        });
    }

    // --- LÓGICA DO MENU HAMBÚRGUER (COM TRAVA DE TAMANHO COMPACTO) ---
    const btnHamburguer = document.getElementById('btn-hamburguer');
    const menuOpcoes = document.getElementById('menu-opcoes');

    if (btnHamburguer && menuOpcoes) {
        menuOpcoes.style.display = 'none';

        btnHamburguer.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (menuOpcoes.style.display === 'none') {
                menuOpcoes.style.display = 'block';
                btnHamburguer.innerHTML = '✕'; // Usa o X fino e elegante
                // Trava o tamanho compacto inline para o zoom não distorcer
                btnHamburguer.style.setProperty('font-size', '1.1rem', 'important');
            } else {
                menuOpcoes.style.display = 'none';
                btnHamburguer.innerHTML = '☰';
                btnHamburguer.style.setProperty('font-size', '1.1rem', 'important');
            }
        });

        menuOpcoes.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', () => {
            menuOpcoes.style.display = 'none';
            btnHamburguer.innerHTML = '☰';
            btnHamburguer.style.setProperty('font-size', '1.1rem', 'important');
        });
    }

});