
const textos = {
    pt: {
        titulo: "Quadro de Anúncios - Congregação Espanhola de Linhares",
        meioSemana: "Reunião Meio de Semana",
        fimSemana: "Reunião Fim de Semana",
        limpeza: "Limpeza do Salão",
        campo: "Testemunho Publico",
        grupos: "Grupos",
        admin: "Acessar como administrador",
        tituloMeioSemana: "Reunião do Meio de Semana",
        funcao: "Função / Parte",
        designado: "Designado",
        ajudante: "Ajudante",
        voltar: "← Voltar ao Quadro",
        proximosEventos: "Próximos Eventos",
        data: "Data",
        local: "Local"
    },

    es: {
        titulo: "Tablero de Anuncios - Congregación Española de Linhares",
        meioSemana: "Reunión de Entre Semana",
        fimSemana: "Reunión de Fin de Semana",
        limpeza: "Limpieza del Salón",
        campo: "Predicación con Carritos",
        grupos: "Grupos",
        admin: "Acceder como administrador",
        tituloMeioSemana: "Reunión de Entre Semana",
        funcao: "Función / Parte",
        designado: "Asignado",
        ajudante: "Ayudante",
        voltar: "← Volver al Tablero",
        proximosEventos: "Próximos Eventos",
        data: "Fecha",
        local: "Lugar"
    }
};

function definirTexto(id, texto) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function mudarIdioma(idioma) {

    definirTexto("titulo", textos[idioma].titulo);
    definirTexto("tituloEventos", textos[idioma].proximosEventos);
    definirTexto("linkMeioSemana", textos[idioma].meioSemana);
    definirTexto("linkFimSemana", textos[idioma].fimSemana);
    definirTexto("linkLimpeza", textos[idioma].limpeza);
    definirTexto("linkCampo", textos[idioma].campo);
    definirTexto("linkGrupos", textos[idioma].grupos);
    definirTexto("linkAdmin", textos[idioma].admin);
    definirTexto("btnVoltar", textos[idioma].voltar);
    definirTexto("tituloPagina", textos[idioma].tituloMeioSemana);
    definirTexto("thFuncao", textos[idioma].funcao);
    definirTexto("thDesignado", textos[idioma].designado);
    definirTexto("thAjudante", textos[idioma].ajudante);


    document.documentElement.lang =
        idioma === "es" ? "es" : "pt-BR";

    localStorage.setItem("idioma", idioma);
}

document.addEventListener("DOMContentLoaded", () => {

    const idiomaSalvo =
        localStorage.getItem("idioma") || "pt";

    mudarIdioma(idiomaSalvo);
    atualizarBotoesIdioma(idiomaSalvo);

    const btnPT = document.getElementById("btnPT");
    const btnES = document.getElementById("btnES");

    if (btnPT) {
        btnPT.addEventListener("click", () => {
            mudarIdioma("pt");
            atualizarBotoesIdioma("pt");
            
            // Redesenha os eventos da memória com o idioma PT
            if (typeof renderizarEventos === "function") {
                renderizarEventos();
            }
        });
    }

    if (btnES) {
        btnES.addEventListener("click", () => {
            mudarIdioma("es");
            atualizarBotoesIdioma("es");
            
            // Redesenha os eventos da memória com o idioma ES
            if (typeof renderizarEventos === "function") {
                renderizarEventos();
            }
        });
    }
});

function atualizarBotoesIdioma(idioma) {

    const btnPT = document.getElementById("btnPT");
    const btnES = document.getElementById("btnES");

    if (!btnPT || !btnES) return;

    btnPT.classList.remove("ativo");
    btnES.classList.remove("ativo");

    if (idioma === "pt") {
        btnPT.classList.add("ativo");
    } else {
        btnES.classList.add("ativo");
    }
}

