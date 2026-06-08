let reunioes = [];
let indiceAtual = 0;

// reuniao_meio_semana.js
async function carregarListaReunioes() {

  try {

    const snapshot = await db
      .collection("reunioes_meio_semana")
      .orderBy("data")
      .get();

    reunioes = [];

    snapshot.forEach((doc) => {

      reunioes.push({
        id: doc.id,
        ...doc.data()
      });

    });

    if (reunioes.length === 0) {

      console.log("Nenhuma reunião encontrada.");
      return;

    }

    determinarIndiceInicial();

    carregarReuniaoAtual();

  } catch (error) {

    console.error(
      "Erro ao carregar reuniões:",
      error
    );

  }

}

function determinarIndiceInicial() {

  const hoje = new Date();

  const hojeTexto = formatarDataItem(hoje);

  indiceAtual = 0;

  for (let i = 0; i < reunioes.length; i++) {

    if (reunioes[i].id >= hojeTexto) {

      indiceAtual = i;
      return;

    }

  }

  indiceAtual = reunioes.length - 1;

}

function carregarReuniaoAtual() {

  if (
    indiceAtual < 0 ||
    indiceAtual >= reunioes.length
  ) {
    return;
  }

  const reuniao = reunioes[indiceAtual];

  exibirTabelaReuniao(
    reuniao,
    reuniao.id
  );

  atualizarBotoesNavegacao();

}

function atualizarBotoesNavegacao() {

  const btnAnterior =
    document.getElementById("btn-anterior");

  const btnProxima =
    document.getElementById("btn-proxima");

  if (btnAnterior) {

    btnAnterior.disabled =
      indiceAtual === 0;

  }

  if (btnProxima) {

    btnProxima.disabled =
      indiceAtual === reunioes.length - 1;

  }

}

function exibirTabelaReuniao(dados, dataId) {
  const container = document.getElementById("container-reuniao");
  if (!container) return;

  container.innerHTML = "";

  // Tratamento para exibir o dia e o mês por extenso
  let dataTexto = "";
  if (dataId) {
    const partes = dataId.split("-"); // Divide "2026-06-08" em ["2026", "06", "08"]
    const dataObjeto = new Date(partes[0], partes[1] - 1, partes[2]);
    
    // Formata para: "08 de junho"
    dataTexto = dataObjeto.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }) + " — ";
  }

  // 1. Bloco de Informações Gerais (Data no topo, Leitura e Presidente abaixo)
  let htmlGeral = `
    <div class="secao-bloco" style="border-top: 4px solid #d1b2e0;">
      <div class="secao-cabecalho" style="background-color: #d1b2e0; color: #000; display: flex; flex-direction: column; gap: 5px; align-items: flex-start;">
        <!-- Data centralizada e em letras maiúsculas -->
        <div style="font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; width: 100%; margin-bottom: 5px;">
          📅 Semana de ${dataTexto.replace(" — ", "")}
        </div>
          <div style="font-size: 1.1rem; text-transform: capitalize; font-weight: bold;">📖 ${(dados.leituraSemana || 'Semana').toLowerCase()}</div>
        <div style="font-size: 1rem;">👤 Presidente: ${dados.presidente || ''}</div>
      </div>
      <div style="padding: 12px 15px; background-color: #f1e5f5; display: flex; flex-direction: column; gap: 8px;">
        <div><strong>🎵 Cântico Inicial:</strong> ${dados.canticoInicial || 'Não definido'}</div>
        <div><strong>Oração Inicial:</strong> ${dados.oracaoInicial || 'Não definida'}</div>
        <div><strong>Conselheiro da Sala B:</strong> ${dados.conselheiroSalaB || ''}</div>
      </div>
    </div>
  `;

  // 2. Bloco: Tesouros da Palavra de Deus (Sem horário)
  let htmlTesouros = `
    <div class="secao-bloco">
      <div class="secao-cabecalho bg-tesouros">💎 TESOUROS DA PALAVRA DE DEUS</div>
      
      <div class="parte-card">
        <div class="col-descricao">1. ${dados.tesouros.discurso10min.tema}</div>
        <div class="col-salas">
          <div class="sala-box sala-principal">${dados.tesouros.discurso10min.designated || dados.tesouros.discurso10min.designado}</div>
        </div>
      </div>

      <div class="parte-card">
        <div class="col-descricao">2. Joias Espirituais: ${dados.tesouros.joias10min.tema}</div>
        <div class="col-salas">
          <div class="sala-box sala-principal">${dados.tesouros.joias10min.designated || dados.tesouros.joias10min.designado}</div>
        </div>
      </div>

      <div class="parte-card">
        <div class="col-descricao">3. Leitura da Bíblia (4 min.)</div>
        <div class="col-salas">
          <div class="sala-box sala-principal"><strong>Salão Principal:</strong> ${dados.tesouros.leituraBiblia_salaPrincipal}</div>
          <div class="sala-box sala-b"><strong>Sala B:</strong> ${dados.tesouros.leituraBiblia_salaB}</div>
        </div>
      </div>
    </div>
  `;

  // 3. Bloco: Faça Seu Melhor no Ministério (Geração Dinâmica)
  let htmlMinisterio = `
    <div class="secao-bloco">
      <div class="secao-cabecalho bg-ministerio">🌾 FAÇA SEU MELHOR NO MINISTÉRIO</div>
  `;

  if (dados.facaSeuMelhor && Array.isArray(dados.facaSeuMelhor)) {
    dados.facaSeuMelhor.forEach((item) => {
      htmlMinisterio += `
        <div class="parte-card">
          <div class="col-descricao">${item.parte}</div>
          <div class="col-salas">
            <div class="sala-box sala-principal">
              <strong>Salão Principal:</strong> ${item.principal_estudante} e ${item.principal_ajudante}
            </div>
            <div class="sala-box sala-b">
              <strong>Sala B:</strong> ${item.salaB_estudante} e ${item.salaB_ajudante}
            </div>
          </div>
        </div>
      `;
    });
  }
  htmlMinisterio += `</div>`; 

  // 4. Bloco: Nossa Vida Cristã (Geração Dinâmica)
let htmlVida = 
  <div class="secao-bloco">
  `<h3 class="secao-cabecalho bg-vida" style="border-top-left-radius: 8px; border-top-right-radius: 8px;">🐑 Nossa Vida Cristã</h3>`;

  // 1. Renderiza primeiro as partes variáveis (ex: Necessidades Locais)
  if (dados.partesVida && dados.partesVida.length > 0) {
      dados.partesVida.forEach((item) => {
          htmlVida += `
              <div class="parte-card">
                <div class="parte-titulo"><strong>${item.parte}</strong></div>
                <div class="col-salas">
                  <div class="sala-box sala-principal">
                    <strong>Orador:</strong> ${item.orador}
                  </div>
                </div>
              </div>
          `;
      });
  }

  // 2. O ESTUDO BÍBLICO FIXO (SÓ APARECE SE FOR PREENCHIDO!)
  // Se 'dados.estudoDirigente' estiver vazio ou não existir, o sistema pula esse bloco
  if (dados.estudoDirigente && dados.estudoDirigente.trim() !== "") {
      htmlVida += `
          <div class="parte-card" style="border-left: 4px solid #00a8ff; background-color: #f7fbfe;">
            <div class="parte-titulo"><strong>Estudo Bíblico de Congregação</strong></div>
            <div class="col-salas">
              <div class="sala-box sala-principal">
                <strong>Dirigente:</strong> ${dados.estudoDirigente} <br>
                <strong>Leitor:</strong> ${dados.estudoLeitor || 'Não designado'}
              </div>
            </div>
          </div>
      `;
  }

  // 3. Renderiza o Cântico Final e Oração Final no fechamento da seção
  htmlVida += `
      <div class="parte-card" style="border-top: 1px dashed #ccc; margin-top: 10px; padding-top: 10px;">
        <div class="col-salas">
          <div class="sala-box sala-principal" style="display: flex; flex-direction: column; gap: 5px;">
            <div><strong>🎵 Cântico Final:</strong> ${dados.canticoFinal || 'Não definido'}</div>
            <div><strong>Oração Final:</strong> ${dados.oracaoFinal || 'Não definida'}</div>
          </div>
        </div>
      </div>
  `;


  htmlVida += `</div>`;   

  // Injeta todas as partes no HTML
  container.innerHTML = htmlGeral + htmlTesouros + htmlMinisterio + htmlVida;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnDiminuir = document.getElementById("btn-diminuir");
  const btnNormal = document.getElementById("btn-normal");
  const btnAumentar = document.getElementById("btn-aumentar");

  // Nível 0 é o padrão. Vai de -3 (mínimo) até +3 (máximo)
  let nivelAtual = 0;

  // Lista de todas as classes de zoom possíveis para facilitar a limpeza
  const todasAsClasses = [
    "zoom-minus-3", "zoom-minus-2", "zoom-minus-1",
    "zoom-plus-1", "zoom-plus-2", "zoom-plus-3"
  ];

  // Função interna para aplicar a classe correta no body
  function atualizarZoom() {
    // 1. Remove todas as classes de zoom existentes no body
    document.body.classList.remove(...todasAsClasses);

    // 2. Aplica a classe correspondente ao nível atual
    if (nivelAtual > 0) {
      document.body.classList.add(`zoom-plus-${nivelAtual}`);
    } else if (nivelAtual < 0) {
      document.body.classList.add(`zoom-minus-${Math.abs(nivelAtual)}`); // Math.abs transforma -1 em 1
    }
    
    console.log("Nível de Zoom Atual:", nivelAtual);
  }

  if (btnDiminuir && btnNormal && btnAumentar) {
    
    // Botão A+ (Aumentar até 3 vezes)
    btnAumentar.addEventListener("click", () => {
      if (nivelAtual < 3) {
        nivelAtual++;
        atualizarZoom();
      }
    });

    // Botão A- (Diminuir até 3 vezes)
    btnDiminuir.addEventListener("click", () => {
      if (nivelAtual > -3) {
        nivelAtual--;
        atualizarZoom();
      }
    });

    // Botão A (Reseta direto para o padrão)
    btnNormal.addEventListener("click", () => {
      nivelAtual = 0;
      atualizarZoom();
    });
  }
});

function formatarDataItem(data) {

  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;

}

function configurarNavegacao() {

  const btnAnterior =
    document.getElementById("btn-anterior");

  const btnProxima =
    document.getElementById("btn-proxima");

  if (btnAnterior) {

    btnAnterior.addEventListener(
      "click",
      () => {

        if (indiceAtual > 0) {

          indiceAtual--;

          carregarReuniaoAtual();

        }

      }
    );

  }

  if (btnProxima) {

    btnProxima.addEventListener(
      "click",
      () => {

        if (
          indiceAtual <
          reunioes.length - 1
        ) {

          indiceAtual++;

          carregarReuniaoAtual();

        }

      }
    );

  }

}

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    configurarNavegacao();

    await carregarListaReunioes();

  }
);
