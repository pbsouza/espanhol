let reunioes = [];
let indiceAtual = 0;

// reuniao_meio_semana.js
async function carregarListaReunioes() {
  try {
    // 1. Descobrir a data de hoje e mover para a segunda-feira da semana atual
    const hoje = new Date();
    const diaDaSemana = hoje.getDay(); 
    const diferencaParaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
    
    const segundaAtual = new Date(hoje);
    segundaAtual.setDate(hoje.getDate() + diferencaParaSegunda);
    
    // 2. Calcular os limites: 5 semanas para trás (35 dias) e 4 semanas para frente (28 dias)
    const cincoSemanasAtras = new Date(segundaAtual);
    cincoSemanasAtras.setDate(segundaAtual.getDate() - 35);
    
    const quatroSemanasFrente = new Date(segundaAtual);
    quatroSemanasFrente.setDate(segundaAtual.getDate() + 28);
    
    // Converter para string no formato YYYY-MM-DD para filtrar os IDs dos documentos
    const chaveInicio = formatarDataItem(cincoSemanasAtras);
    const chaveFim = formatarDataItem(quatroSemanasFrente);

    console.log(`Buscando janela de reuniões entre: ${chaveInicio} e ${chaveFim}`);

    // 3. Consulta ao Firestore filtrando apenas o intervalo de 10 semanas (SDK v8 / Web antigo)
    const snapshot = await db
      .collection("reunioes_meio_semana")
      .where("__name__", ">=", chaveInicio)
      .where("__name__", "<=", chaveFim)
      .get();

    reunioes = [];

    snapshot.forEach((doc) => {
      reunioes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Garante que a lista fique em ordem cronológica (caso o Firestore mude a ordem física)
    reunioes.sort((a, b) => a.id.localeCompare(b.id));

    if (reunioes.length === 0) {
      console.log("Nenhuma reunião encontrada no período.");
      exibirMensagemErro("Nenhuma reunião agendada para este período.");
      return;
    }

    // 4. Rodar a blindagem para achar qual exibir
    determinarIndiceInicial();

    // 5. Exibe na tela
    carregarReuniaoAtual();

  } catch (error) {
    console.error("Erro ao carregar reuniões:", error);
    exibirMensagemErro("Erro ao conectar com o servidor.");
  }
}

function determinarIndiceInicial() {
  // Se o banco estiver bizarramente vazio, zera o índice por segurança
  if (reunioes.length === 0) {
    indiceAtual = 0;
    return;
  }

  const hoje = new Date();
  const hojeTexto = formatarDataItem(hoje);

  indiceAtual = -1;

  // 1. Tenta encontrar a primeira semana que seja igual ou maior que a data de hoje
  for (let i = 0; i < reunioes.length; i++) {
    if (reunioes[i].id >= hojeTexto) {
      indiceAtual = i;
      break; // Achou a semana correta ou a mais próxima no futuro, interrompe o loop
    }
  }

  // 2. SISTEMA DE DEFESA (Se o loop acima não encontrar nada)
  // Se não houver nenhuma semana futura ou atual (ex: registros incompletos),
  // ele pega o último registro disponível do passado para não quebrar a tela.
  if (indiceAtual === -1) {
    indiceAtual = reunioes.length - 1;
  }
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
  const btnAnterior = document.getElementById("btn-anterior");
  const btnProxima = document.getElementById("btn-proxima");

  if (btnAnterior) {
    btnAnterior.disabled = indiceAtual === 0;
  }

  if (btnProxima) {
    btnProxima.disabled = indiceAtual === reunioes.length - 1;
  }
}

function exibirTabelaReuniao(dados, dataId) {
  // Variável para controlar se a Sala B foi usada nesta semana
  let temSalaB = false;

  // Contador global de partes (as 3 primeiras já são fixas no bloco de Tesouros)
  let contadorPartes = 3; 

  // 1. Preenchimento do Bloco de Informações Gerais
  if (dataId) {
    const partes = dataId.split("-");
    const dataObjeto = new Date(partes[0], partes[1] - 1, partes[2]);
    const dataTexto = dataObjeto.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    document.getElementById("reuniao-semana").textContent = `${dataTexto}`;
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
        // Incrementa o contador para cada parte dinâmica do Ministério (começará em 4)
        contadorPartes++;

        const temEstudanteB = item.salaB_estudante && item.salaB_estudante.trim() !== "";
        if (temEstudanteB) {
          temSalaB = true;
        }

        htmlMin += `
          <div class="parte-card">
            <div class="col-descricao">${contadorPartes}. ${item.parte}</div>
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
        // Continua incrementando a partir de onde o Ministério parou (5, 6, 7...)
        contadorPartes++;

        htmlVid += `
          <div class="parte-card">
            <div class="col-descricao">${contadorPartes}. ${item.parte}</div>
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
    if (temSalaB && dados.conselheiroSalaB && dados.conselheiroSalaB.trim() !== "") {
      blocoConselheiro.style.display = "block";
    } else {
      blocoConselheiro.style.display = "none";
    }
  }
}


// Função auxiliar de proteção para o layout caso o banco falhe
function exibirMensagemErro(mensagem) {
  const containerGeral = document.getElementById("lista-partes-ministerio");
  if (containerGeral) {
    containerGeral.innerHTML = `
      <div style="border: 2px solid #ff4d4d; padding: 20px; text-align: center; background-color: #ffe6e6; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 1.1rem; font-weight: bold; color: #cc0000;">⚠️ ${mensagem}</span>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
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
    console.log("Nível de Zoom Atual:", nivelAtual);
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
});

function formatarDataItem(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function configurarNavegacao() {
  const btnAnterior = document.getElementById("btn-anterior");
  const btnProxima = document.getElementById("btn-proxima");
  const btnAtual = document.getElementById("btn-atual");

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

  if (btnAtual) {
    btnAtual.addEventListener("click", () => {
      // Recarrega a janela do Firebase e se posiciona novamente na semana corrente
      carregarListaReunioes();
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
