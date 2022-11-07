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
    return `<div onclick="iniciarQuizz(this)" quizzId="${quizzId}" class="cadaQuizz">         
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
            const opcao = question.answers[j];
            stringHTML += `
            <div class="opcao ${opcao.isCorrectAnswer}" onclick="selecionaOpcao(this)">
                <img class="imagemOpcao" src="${opcao.image}"/>
                <div class="legendaOpcao">
                    ${opcao.text}
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
        if (opcao.classList.contains("true")) { score++; }

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
            let scorePorcentagem = score / quizzIniciado.questions.length;
            score = 0;
            let levelAtingido = quizzIniciado.levels[0];
            for (let level = quizzIniciado.levels.length - 1; level >= 0; level--) {
                const minScore = quizzIniciado.levels[level].minValue;
                if (scorePorcentagem * 100 >= minScore) {
                    levelAtingido = quizzIniciado.levels[level];
                    break;
                }
            }

            setTimeout(() => {
                const divResultado = document.querySelector(".quizzFinalizado");
                divResultado.innerHTML = renderizarResultado(levelAtingido, scorePorcentagem);
                divResultado.classList.remove("escondido");
                divResultado.scrollIntoView();
            }, 2000);

        }
    }
}

function renderizarResultado(levelAtingido, scorePorcentagem) {
    return `
                <div class="resultadoQuizz">
                    <p>${Math.floor(scorePorcentagem * 100)}% de acerto: ${levelAtingido.title}</p>
                </div>
                <div class="descricaoResultado">
                    <img class="imagemResultado" src="${levelAtingido.image}"/>
                    <div class="textoResultado">${levelAtingido.text}</div>
                </div>
            `;
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
    renderizarQuizzSelecionado(quizzIniciado)
    window.scrollTo(0, 0);
    
}

// função da criação do quizz

let quizz = {
    title: "",
    image: "",
    questions: [
        {
            title: "",
            color: "",
            answers: [
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: true
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                }
            ]
        },
        {
            title: "",
            color: "",
            answers: [
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: true
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                }
            ]
        },
        {
            title: "",
            color: "",
            answers: [
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: true
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                },
                {
                    text: "",
                    image: "",
                    isCorrectAnswer: false
                }
            ]
        }
    ],
    levels: [
        {
            title: "",
            image: "",
            text: "",
            minValue: 0
        },
        {
            title: "",
            image: "",
            text: "",
            minValue: 0
        },
        {
            title: "",
            image: "",
            text: "",
            minValue: 0
        }
    ]
}

// seleciona o formulario da tela inicial
const comeco_form = document.querySelector('#comeco-form')
// seleciona o formulario da tela de perguntas
const perguntas_form = document.querySelector('#perguntas-form');
// seleciona o formulario da tela de niveis
const niveis_form = document.querySelector('#niveis-form');
// seleciona o formulario da tela final
const fim_form = document.querySelector('#fim-form');

// Evento de rota para pagina de perguntas
comeco_form.addEventListener('submit', (e) => {
    //esconda a primeira tela e mostra a tela de perguntas
    comeco_form.classList.toggle('elemento-invisivel');
    perguntas_form.classList.toggle('elemento-invisivel');

    const titulo_quizz = document.querySelector('#titulo-do-quizz').value;

    const url_imagem_quizz = document.querySelector('#url-imagem-quizz').value;

    quizz.title = titulo_quizz;
    quizz.image = url_imagem_quizz;

    console.log(quizz.questions);

    e.preventDefault();
})

// evento de rota para paginas de niveis
perguntas_form.addEventListener('submit', (e) => {

    let texto_perguntas = document.querySelectorAll('.texto-pergunta');
    let cor_perguntas = document.querySelectorAll('.cor-fundo');
    let respostas_corretas = document.querySelectorAll('.resposta-correta');
    let url_imagem_correta = document.querySelectorAll('.url-imagem-correta');
    let respostas_incorretas_1 = document.querySelectorAll('.resposta-incorreta-1');
    let url_imagens_incorretas_1 = document.querySelectorAll('.url-imagem-incorreta-1');
    let respostas_incorretas_2 = document.querySelectorAll('.resposta-incorreta-2');
    let url_imagens_incorretas_2 = document.querySelectorAll('.url-imagem-incorreta-2');
    let respostas_incorretas_3 = document.querySelectorAll('.resposta-incorreta-3');
    let url_imagens_incorretas_3 = document.querySelectorAll('.url-imagem-incorreta-3');


    // titulos
    for (let index = 0; index < cor_perguntas.length; index++) {
        quizz.questions[index].title = texto_perguntas[index].value
    }

    // cores
    for (let index = 0; index < cor_perguntas.length; index++) {
        quizz.questions[index].color = cor_perguntas[index].value
    }

    // respostas correta
    for (let index = 0; index < respostas_corretas.length; index++) {
        quizz.questions[index].answers[0].text = respostas_corretas[index].value
        quizz.questions[index].answers[0].image = url_imagem_correta[index].value
        quizz.questions[index].answers[0].isCorrectAnswer = 'true'
    }

    // resposta incorreta 1
    for (let index = 0; index < respostas_incorretas_1.length; index++) {
        quizz.questions[index].answers[1].text = respostas_incorretas_1[index].value
        quizz.questions[index].answers[1].image = url_imagens_incorretas_1[index].value
    }

    // resposta incorreta 2
    for (let index = 0; index < respostas_incorretas_2.length; index++) {
        quizz.questions[index].answers[2].text = respostas_incorretas_2[index].value
        quizz.questions[index].answers[2].image = url_imagens_incorretas_2[index].value
    }

    // resposta incorreta 3
    for (let index = 0; index < respostas_incorretas_3.length; index++) {
        quizz.questions[index].answers[3].text = respostas_incorretas_3[index].value
        quizz.questions[index].answers[3].image = url_imagens_incorretas_3[index].value
    }

    // esconde a tela de perguntas e mostra a tela de niveis
    perguntas_form.classList.toggle('elemento-invisivel');
    niveis_form.classList.toggle('elemento-invisivel');
    e.preventDefault();

})

// evento de rota para pagina final
niveis_form.addEventListener('submit', (e) => {

    const titulo_nivel = document.querySelectorAll('.titulo-nivel');
    const url_imagem_nivel = document.querySelectorAll('.url-imagem-nivel');
    const descricao_nivel = document.querySelectorAll('.descricao-nivel');
    const acerto_minimo_nivel = document.querySelectorAll('.acerto-minimo-nivel');
    const quizz_titulo = document.querySelector('#titulo-quizz');
    const quizz_imagem = document.querySelector('#image-quizz');

    for (let index = 0; index < titulo_nivel.length; index++) {
        quizz.levels[index].title = titulo_nivel[index].value;
        quizz.levels[index].image = url_imagem_nivel[index].value;
        quizz.levels[index].text = descricao_nivel[index].value;
        quizz.levels[index].minValue = acerto_minimo_nivel[index].value;
    }


    quizz_titulo.textContent = quizz.title
    quizz_imagem.src = quizz.image;

    // APLICAR LOCAL STORAGE AQUI
    // localStorage.setItem

    // esconde a tela de niveis e mostra a ultima tela
    niveis_form.classList.toggle('elemento-invisivel');
    fim_form.classList.toggle('elemento-invisivel');
    e.preventDefault();
})

// seleciona os inputs de cores
let input_cor = document.querySelectorAll('.cor-fundo');

for (let index = 0; index < input_cor.length; index++) {
    input_cor[index].addEventListener('blur', validarInputCor);
}

// funcao para validar os inputs de cores
function validarInputCor() {
    if (this.value[0] != '#') {
        alert('não é uma cor!');
        this.value = '';
    } else
        if (this.value.length != 7) {
            alert(`Siga o padrão de cor hexa decimal: #000000`)
            this.value = '';
        }
}

// funcao para criar novas perguntas na tela de pergunta
function criarNovasPerguntas() {
    let container_pergunta_2 = document.querySelector('#container-pergunta-2');
    let container_pergunta_3 = document.querySelector('#container-pergunta-3');
    let icones = document.querySelectorAll('ion-icon')

    for (let index = 0; index < icones.length; index++) {
        icones[index].addEventListener('click', (e) => {
            if (icones[index].id == 'botao-nova-pergunta-2') {
                container_pergunta_2.classList.toggle('elemento-invisivel');
            } else {
                container_pergunta_3.classList.toggle('elemento-invisivel');
            }

            e.preventDefault();
        })
    }
}

// funcao para criar novos niveis da tela de niveis
function criarNovosNiveis() {
    let container_nivel_2 = document.querySelector('#container-nivel-2');
    let container_nivel_3 = document.querySelector('#container-nivel-3');
    let icones = document.querySelectorAll('ion-icon')

    for (let index = 0; index < icones.length; index++) {
        icones[index].addEventListener('click', (e) => {

            if (icones[index].id == 'botao-novo-nivel-2') {
                container_nivel_2.classList.toggle('elemento-invisivel');
            } else if (icones[index].id == 'botao-novo-nivel-3') {
                container_nivel_3.classList.toggle('elemento-invisivel');
            }

            e.preventDefault();
        })
    }
}

// funcao com rota de inicio aplciada no link da ultima tela
function irParaHome() {
    let inputs = document.querySelectorAll('input');

    inputs.forEach(element => {
        element.value = '';
    });

    fim_form.classList.toggle('elemento-invisivel');
    comeco_form.classList.toggle('elemento-invisivel');

}


criarNovasPerguntas();
criarNovosNiveis();
validarInputCor();
