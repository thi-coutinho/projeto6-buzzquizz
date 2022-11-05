const linkPegarListaQuizzes = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes';
const UserQuizzesListaIds = [1,2,3];

function pegarUserQuizzes() {
    // thi: ainda não testei a parte de pegar o que foi criado porque depende de coisas não implementadas ainda
    let content = localStorage.getItem('listaUserQuizzes');
    if (content) {
        let listaIds = JSON.parse(content);
        for (let Id = 0; Id < listaIds.length; Id++) {
            const quizz = listaIds[Id];
            UserQuizzesListaIds.push(quizz);
        }
    }
    renderizarListaUserQuizzes();
}

// Pegar a lista de quizzes no api e renderizar na tela 1
let promise = axios.get(linkPegarListaQuizzes);
promise.then(renderizarListaQuizzes);
promise.catch(console.log);
pegarUserQuizzes();

function renderizarListaUserQuizzes() {
    if (UserQuizzesListaIds.length > 0) {
        const divListaQuizzUser = document.querySelector(".quizzUser");
        divListaQuizzUser.innerHTML = "";
        for (let i = 0; i < UserQuizzesListaIds.length; i++) {
            const quizzId = UserQuizzesListaIds[i];
            let linkQuizzId = `https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizzId}`;
            axios.get(linkQuizzId)
                .then((response) => {
                    let quizz = response.data;
                    divListaQuizzUser.innerHTML += divQuizz(quizz.title, quizz.image, quizz.id);
                });
        }
        trocarTela(".quizzExistenteUsuario", ".quizzUsuario");
    }

}

function trocarTela(seletorTelaEsconder, SeletorTelaMostrar) {
    const telaEsconder = document.querySelector(seletorTelaEsconder);
    const telaMostrar = document.querySelector(SeletorTelaMostrar);
    telaEsconder.classList.toggle("escondido");
    telaMostrar.classList.toggle("escondido");
}

function renderizarListaQuizzes(response) {
    let data = response.data;
    const ListaDivQuizz = document.querySelector(".quizzesDisponiveis");
    ListaDivQuizz.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
        const quizz = data[i];
        ListaDivQuizz.innerHTML += divQuizz(quizz.title, quizz.image, quizz.id);
    }


}

function divQuizz(titulo, urlImagem, quizzId) {
    let style = `background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 64.58%, #000000 100%),url(${urlImagem});
                 background-size: 100%;`;
    return `<div onclick="iniciarQuizz(this)" quizzId="${quizzId}" class="quizz">         
                <div class="imagemQuiz" style='${style}'></div>
                <div class="nomeQuizz">${titulo}</div>
            </div>`;
}

function iniciarQuizz(elemento) {
    console.log("iniciou quizz")
    const quizzId = elemento.getAttribute('quizzId');
    console.log(quizzId)
    let linkQuizzId = `https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizzId}`;
    axios.get(linkQuizzId)
        .then((response) => {
            console.log("apr respondeu")
            let quizz = response.data;
            trocarTela(".Tela1", ".paginaQuizzSelecionado");
            renderizarQuizzSelecionado(quizz);
        });

}

function renderizarQuizzSelecionado(quizz) {
    const paginaQuizzSelecionado = document.querySelector(".paginaQuizzSelecionado")
    let stringHTML =
        `<div class="imagemQuizzSelecionado">
            <img class="imagemQuizzSelecionado" src="${quizz.image}"/>
            <p>${quizz.title}</p>
        </div>`;

    for (let i = 0; i < quizz.questions.length; i++) {
        const question = quizz.questions[i];
        stringHTML += `<div class="caixaPergunta">
        <div class="textoPergunta">
            <p>${question.title}</p>
        </div>
        <div class="caixaOpcoes">`;
        embaralhaLista(question.answers)
        for (let j = 0; j < question.answers.length; j++) {
            const resposta = question.answers[j];
            stringHTML += `
            <div class="opcao" ehcorreta="${resposta.isCorrectAnswer}">
                <div class="imagemOpcao">
                    <img src="${resposta.image}"/>
                </div>
                <div class="legendaOpcao">
                    ${resposta.text}
                </div>
            </div>`
        }
        stringHTML += `</div> <!--fecha caixaOpcoes  --> `
        stringHTML += `</div> <!--fecha caixaPergunta -->`
    }
    
    for (let i = 0; i < quizz.levels.length; i++) {
        const level = quizz.levels[i];
        // pendente: falta ver como fazer essa parte dos levels
        
    }
    stringHTML += `
                <div class="quizzFinalizado">
                    <div class="resultadoQuizz">
                        <p>resultado do quizz</p>
                    </div>
                    <div class="descricaoResultado">
                        <div class="imagemResultado">imagem</div>
                        <div class="textoResultado">texto do resultado</div>
                    </div>
                </div>
                <button class="reiniciarQuizz">Reiniciar Quizz</button>
                <div class="voltarHome"> Voltar para Home</div>
                </div>`
    paginaQuizzSelecionado.innerHTML = stringHTML
    console.log(stringHTML)
}

function embaralhaLista(lista) {
    function comparador() {
        return Math.random() - 0.5;
    }
    lista.sort(comparador); // Após esta linha, a lista estará embaralhada
}