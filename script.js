const linkPegarListaQuizzes = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes';
const UserQuizzesListaIds = [1, 2, 3];
const PerguntasParaResponder = [];
let score = 0;
let quizzIniciado;


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
    const quizzId = elemento.getAttribute('quizzId');
    let linkQuizzId = `https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizzId}`;
    axios.get(linkQuizzId)
        .then((response) => {
            quizzIniciado = response.data;
            if (document.querySelector(".Tela2").classList.contains("escondido")) {
                trocarTela(".Tela1", ".Tela2");
            }
            renderizarQuizzSelecionado(quizzIniciado);
            window.scrollTo(0, 0);
        });

}

function renderizarQuizzSelecionado(quizz) {
    const paginaQuizzSelecionado = document.querySelector(".Tela2");
    let stringHTML =
        `<div class="imagemQuizzSelecionado">  
            <img  src="${quizz.image}"/>
            <p>${quizz.title}</p>
         </div>
            `;

    for (let i = 0; i < quizz.questions.length; i++) {
        const question = quizz.questions[i];
        PerguntasParaResponder.push(i);
        stringHTML += `<div class="caixaPergunta ${"pergunta" + i}" pergunta=${i}>
            <div class="textoPergunta">
            <p>${question.title}</p>
         </div>
        <div class="caixaOpcoes">`;
        embaralhaLista(question.answers);
        for (let j = 0; j < question.answers.length; j++) {
            const resposta = question.answers[j];
            stringHTML += `
            <div class="opcao ${resposta.isCorrectAnswer}" onclick="selecionaOpcao(this)">
                <img class="imagemOpcao" src="${resposta.image}"/>
                <div class="legendaOpcao">
                    ${resposta.text}
                </div>
            </div>`;
        }
        stringHTML += `</div> <!--fecha caixaOpcoes  --> `;
        stringHTML += `</div> <!--fecha caixaPergunta -->`;
    }

    for (let i = 0; i < quizz.levels.length; i++) {
        const level = quizz.levels[i];
        // pendente: falta ver como fazer essa parte dos levels

    }
    stringHTML += `
                <div class="quizzFinalizado escondido">
                    <div class="resultadoQuizz">
                        <p>resultado do quizz</p>
                    </div>
                    <div class="descricaoResultado">
                        <div class="imagemResultado">imagem</div>
                        <div class="textoResultado">texto do resultado</div>
                    </div>
                </div>
                <button class="reiniciarQuizz" onclick="reiniciarQuizz()">Reiniciar Quizz</button>
                <div onclick="voltarHome()" class="voltarHome"> Voltar para Home</div>
                </div>`;
    paginaQuizzSelecionado.innerHTML = stringHTML;
}
function selecionaOpcao(elemento) {
    // pego o pai da opcão que é uma caixaOpcoes e adiciono class opcaoFeita pra formatar os filhos dessa caixa
    const caixaOpcoes = elemento.parentNode.parentNode;
    let perguntaIndex = caixaOpcoes.getAttribute("pergunta");
    if (!caixaOpcoes.classList.contains("CaixaOpcaoFeita")) {
        caixaOpcoes.classList.add("CaixaOpcaoFeita");
        const opcao = elemento;
        opcao.classList.add("selecionado");
        // aumenta o score
        if(opcao.classList.contains("true")){score++}

        // Após 2 segundos de respondida, deve-se scrollar a página para a próxima pergunta
        // removo da lista de Perguntas pra Responder a pergunta que foi respondida
        let index = PerguntasParaResponder.indexOf(Number(perguntaIndex));
        if (index > -1) { // only splice array when item is found
            PerguntasParaResponder.splice(index, 1); // 2nd parameter means remove one item only
        }
        if (PerguntasParaResponder.length > 0) {
            let seletorProximapergunta = ".caixaPergunta.pergunta" + PerguntasParaResponder[0];
            let proximaPergunta = document.querySelector(seletorProximapergunta);
            setTimeout(() => proximaPergunta.scrollIntoView(), 2000);

        } else {
            // aqui respondeu todas as perguntas deve exibir o resultado final
            let scorePorcentagem = score/quizzIniciado.questions.length
            console.log(scorePorcentagem)
            let levelAtingido = quizzIniciado.levels[0];
            for (let level = quizzIniciado.levels.length-1; level >= 0; level--) {
                console.log(quizzIniciado.levels[level])
                const minScore = quizzIniciado.levels[level].minValue;
                if (scorePorcentagem*100 >= minScore){
                    levelAtingido = quizzIniciado.levels[level]
                    break
                }
            }
            
            setTimeout(()=>{
                const divResultado = document.querySelector(".quizzFinalizado")
                divResultado.innerHTML = renderizarResultado(levelAtingido,scorePorcentagem)
                divResultado.classList.remove("escondido")
                divResultado.scrollIntoView()
            },2000)

        }
    }
}

function renderizarResultado(levelAtingido,scorePorcentagem){
    console.log(levelAtingido)
    console.log(scorePorcentagem)

    return `
                <div class="resultadoQuizz">
                    <p>${Math.floor(scorePorcentagem*100)}% de acerto: ${levelAtingido.title}</p>
                </div>
                <div class="descricaoResultado">
                    <img class="imagemResultado" src="${levelAtingido.image}"/>
                    <div class="textoResultado">${levelAtingido.text}</div>
                </div>
            `
}

function voltarHome() {
    trocarTela(".Tela1", ".Tela2");

}

function embaralhaLista(lista) {
    function comparador() {
        return Math.random() - 0.5;
    }
    lista.sort(comparador); // Após esta linha, a lista estará embaralhada
}

//função que faz o usuário retornar ao topo da página quando decide reiniciar o quizz
function reiniciarQuizz() {
    const botao = document.querySelector('button');
    botao = addEventListener("click", function () {
        window.scrollTo(0, 0);
    });
}

