// Inicializa o serviço de autenticação do Firebase
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");
    const txtEmail = document.getElementById("login-email");
    const txtSenha = document.getElementById("login-senha");
    const msgErro = document.getElementById("erro-login");

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault(); // Impede a página de recarregar

        const email = txtEmail.value.trim();
        const senha = txtSenha.value;

        // Esconde mensagens de erro anteriores
        msgErro.style.display = "none";

        // Tenta fazer login no Firebase
        auth.signInWithEmailAndPassword(email, senha)
            .then((userCredential) => {
                // Login com sucesso! Redireciona para a página do ADM
                window.location.href = "adm.html";
            })
            .catch((error) => {
                // Se der erro, exibe na tela para o utilizador
                msgErro.style.display = "block";
                console.error("Erro de login:", error.code);
                
                if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                    msgErro.innerText = "❌ E-mail ou senha incorretos.";
                } else if (error.code === "auth/invalid-email") {
                    msgErro.innerText = "❌ Formato de e-mail inválido.";
                } else {
                    msgErro.innerText = "❌ Ocorreu um erro ao tentar entrar. Tente novamente.";
                }
            });
    });
});