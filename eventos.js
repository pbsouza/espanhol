// eventos.js

// Variável global para guardar os eventos na memória do navegador
let eventosSalvos = [];

// 1. Busca os eventos no Firebase APENAS UMA VEZ
function carregarEventos() {
  db.collection("eventos").get()
    .then((snapshot) => {
      eventosSalvos = []; // Limpa a lista antes de preencher
      snapshot.forEach((doc) => {
        eventosSalvos.push(doc.data());
      });
      
      // Depois de salvar tudo na memória, desenha na tela
      renderizarEventos();
    })
    .catch((error) => {
      console.error("Erro ao buscar eventos: ", error);
    });
}

// 2. Desenha os eventos que estão na memória na tela
function renderizarEventos() {
  const listaContainer = document.getElementById("listaEventos");
  if (!listaContainer) return;

  listaContainer.innerHTML = ""; // Limpa a tela antes de desenhar

  // Descobre o idioma ativo para esta renderização
  const idiomaAtivo = localStorage.getItem("idioma") || "pt";
  let palavraData = idiomaAtivo === "es" ? "Fecha" : "Data";
  let palavraLocal = idiomaAtivo === "es" ? "Lugar" : "Local";

  // Desenha cada evento que guardamos na variável global
  eventosSalvos.forEach((evento) => {
    const blocoEvento = `
      <div class="evento-item" style="margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
        <h4>📣 ${evento.titulo}</h4>
        <p><strong>📅 ${palavraData}:</strong> ${evento.data} às ${evento.horario}</p>
        <p><strong>📍 ${palavraLocal}:</strong> ${evento.local}</p>
        <p><em>${evento.descricao}</em></p>
      </div>
    `;
    listaContainer.innerHTML += blocoEvento;
  });
}

// Dispara a busca no Firebase apenas ao carregar a página pela primeira vez
document.addEventListener("DOMContentLoaded", () => {
  carregarEventos();
});