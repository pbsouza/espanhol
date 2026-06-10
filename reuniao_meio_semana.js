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
  // Variável para controlar se a Sala B foi usada nesta semana
  let temSalaB = false;

  // 1. Preenchimento do Bloco de Informações Gerais
  if (dataId) {
    const partes = dataId.split("-");
    const dataObjeto = new Date(partes[0], partes[1] - 1, partes[2]);
    const dataTexto = dataObjeto.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    document.getElementById("reuniao-semana").textContent = `📅 Semana de ${dataTexto}`;
  }
  
  document.getElementById("reuniao-leitura").textContent = (dados.leituraSemana || 'Semana').toLowerCase();
  document.getElementById("reuniao-presidente").textContent = dados.presidente || '';
  document.getElementById("reuniao-cantico-inicial").textContent = dados.canticoInicial || 'Não definido';
  document.getElementById("reuniao-oracao-inicial").textContent = dados.oracaoInicial || 'Não definida';
  document.getElementById("reuniao-conselheiro-b").textContent = dados.conselheiroSalaB || '';

  // 2. Preenchimento do Bloco Fixo: Tesouros
  if (dados.tesouros) {
    document.getElementById("tesouro-tema-1").textContent = dados.tesouros.discurso10min.tema || '';
    document.getElementById("tesouro-orador-1").textContent = dados.tesouros.discurso10min.designated || dados.tesouros.discurso10min.designado || '';
    
    document.getElementById("tesouro-tema-2").textContent = dados.tesouros.joias10min.tema || '';
    document.getElementById("tesouro-orador-2").textContent = dados.tesouros.joias10min.designated || dados.tesouros.joias10min.designado || '';
    
    document.getElementById("leitura-principal").textContent = dados.tesouros.leituraBiblia_salaPrincipal || '';
    
    // Verifica se há leitor na Sala B
    const leitorB = dados.tesouros.leituraBiblia_salaB;
    const caixaLeituraB = document.getElementById("leitura-b-box");
    if (leitorB && leitorB.trim() !== "") {
      document.getElementById("leitura-b").textContent = leitorB;
      caixaLeituraB.style.display = "block";
      temSalaB = true;
    } else {
      caixaLeituraB.style.display = "none";
    }
  }

  // 3. Preenchimento Dinâmico: Faça Seu Melhor no Ministério
  const containerMinisterio = document.getElementById("lista-partes-ministerio");
  if (containerMinisterio) {
    let htmlMin = "";
    if (dados.facaSeuMelhor && Array.isArray(dados.facaSeuMelhor)) {
      dados.facaSeuMelhor.forEach((item) => {
        // Verifica se há estudantes escalados na Sala B para esta parte específica
        const temEstudanteB = item.salaB_estudante && item.salaB_estudante.trim() !== "";
        if (temEstudanteB) {
          temSalaB = true;
        }

        htmlMin += `
          <div class="parte-card">
            <div class="col-descricao">${item.parte}</div>
            <div class="col-salas">
              <div class="sala-box sala-principal">
                <strong>Salão Principal:</strong> ${item.principal_estudante} ${item.principal_ajudante ? 'e ' + item.principal_ajudante : ''}
              </div>
              <div class="sala-box sala-b" style="display: ${temEstudanteB ? 'block' : 'none'};">
                <strong>Sala B:</strong> ${item.salaB_estudante} ${item.salaB_ajudante ? 'e ' + item.salaB_ajudante : ''}
              </div>
            </div>
          </div>
        `;
      });
    }
    containerMinisterio.innerHTML = htmlMin;
  }

  // 4. Preenchimento Misto: Nossa Vida Cristã
  const containerVida = document.getElementById("lista-partes-vida");
  if (containerVida) {
    let htmlVid = "";

    if (dados.partesVida && dados.partesVida.length > 0) {
      dados.partesVida.forEach((item) => {
        htmlVid += `
          <div class="parte-card">
            <div class="col-descricao">${item.parte}</div>
            <div class="col-salas">
              <div class="sala-box sala-principal"><strong>Orador:</strong> ${item.orador}</div>
            </div>
          </div>
        `;
      });
    }

    if (dados.estudoDirigente && dados.estudoDirigente.trim() !== "") {
      htmlVid += `
        <div class="parte-card" style="border-left: 4px solid #00a8ff; background-color: #f7fbfe;">
          <div class="col-descricao">Estudo Bíblico de Congregação</div>
          <div class="col-salas">
            <div class="sala-box sala-principal" style="border-left-color: #00a8ff;">
              <strong>Dirigente:</strong> ${dados.estudoDirigente} <br>
              <strong>Leitor:</strong> ${dados.estudoLeitor || 'Não designado'}
            </div>
          </div>
        </div>
      `;
    }

    containerVida.innerHTML = htmlVid;
  }

  // 5. Preenchimento do Encerramento Fixo
  document.getElementById("reuniao-cantico-final").textContent = dados.canticoFinal || 'Não definido';
  document.getElementById("reuniao-oracao-final").textContent = dados.oracaoFinal || 'Não definida';

  // 6. Controle do Bloco do Conselheiro da Sala B no topo
  const blocoConselheiro = document.getElementById("bloco-conselheiro-b");
  if (blocoConselheiro) {
    // Só exibe o conselheiro se a Sala B tiver sido usada em alguma parte da semana
    if (temSalaB && dados.conselheiroSalaB && dados.conselheiroSalaB.trim() !== "") {
      blocoConselheiro.style.display = "block";
    } else {
      blocoConselheiro.style.display = "none";
    }
  }
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
  const btnAnterior = document.getElementById("btn-anterior");
  const btnProxima = document.getElementById("btn-proxima");
  const btnAtual = document.getElementById("btn-atual"); // Captura o novo botão

  if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
      if (indiceAtual > 0) {
        indiceAtual--;
        carregarReuniaoAtual();
      }
    });
  }

  if (btnProxima) {
    btnProxima.addEventListener("click", () => {
      if (indiceAtual < reunioes.length - 1) {
        indiceAtual++;
        carregarReuniaoAtual();
      }
    });
  }

  // Lógica do novo botão "Semana Atual"
  if (btnAtual) {
    btnAtual.addEventListener("click", () => {
      // Executa a função que varre o array e descobre o índice da semana atual
      determinarIndiceInicial(); 
      // Atualiza a tela com a reunião correta
      carregarReuniaoAtual();
    });
  }
}

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    configurarNavegacao();

    await carregarListaReunioes();

  }
);