// reuniao_meio_semana.js
function carregarDadosReuniao() {
  db.collection("reunioes_meio_semana").doc("2026-06-08").get()
    .then((doc) => {
      if (doc.exists) {
        const dados = doc.data();
        console.log("Dados da reunião:", dados);
        
        // Aqui vamos chamar a função para construir a tabela na tela
        exibirTabelaReuniao(dados, doc.id);
      } else {
        console.log("Nenhuma reunião encontrada para esta data.");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
    });
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
  let htmlVida = `
    <div class="secao-bloco">
      <div class="secao-cabecalho bg-vida">🐑 NOSSA VIDA CRISTÃ</div>
  `;

  if (dados.nossaVida && Array.isArray(dados.nossaVida)) {
    dados.nossaVida.forEach((item) => {
      htmlVida += `
        <div class="parte-card">
          <div class="col-descricao">${item.parte}</div>
          <div class="col-salas">
      `;

      if (item.dirigente || item.leitor) {
        htmlVida += `
          <div class="sala-box sala-principal">
            <strong>Dirigente:</strong> ${item.dirigente || ''} &nbsp;|&nbsp; <strong>Leitor:</strong> ${item.leitor || ''}
          </div>
        `;
      } else if (item.designado) {
        htmlVida += `
          <div class="sala-box sala-principal">
            ${item.designado}
          </div>
        `;
      }

      htmlVida += `
          </div>
        </div>
      `;
    });
  }

  // Adiciona uma linha para a Oração Final no término do bloco da Vida Cristã
  htmlVida += `
      <div class="parte-card" style="border-top: 1px dashed #ccc; margin-top: 10px; padding-top: 10px;">
        
        <div class="col-salas">
          <div class="sala-box sala-principal">
            <strong>Oração Final:</strong> ${dados.oracaoFinal || 'Não definida'}
          </div>
        </div>
      </div>
  `;

  htmlVida += `</div>`;   

  // Injeta todas as partes no HTML
  container.innerHTML = htmlGeral + htmlTesouros + htmlMinisterio + htmlVida;
}