   // Variáveis Globais
   let canvas, ctx;
   let heroi, inimigo, cenario, explosaoHImage, explosaoVImage;
   let xHeroi, yHeroi, xInimigo, yInimigo;
   let tirosHeroi = [], tirosInimigo = [];
   let explosoes = [];
   let yCenario1, yCenario2;
   let velocidadeCenario = 4;
   let vocêPerdeu = false;
   let VocêGanhou = false;

   // Função de Inicialização do Jogo
   function iniciarJogo() {
    // Configuração do Canvas e Contexto
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Carregamento de Imagens
    heroi = new Image();
    heroi.src = 'img/heroi.jpg';

    inimigo = new Image();
    inimigo.src = 'img/inimigo.jpg';

    cenario = new Image();
    cenario.src = 'img/cenario.jpg';

    explosaoHImage = new Image();
    explosaoHImage.src = 'img/explosaoH.jpg';

    explosaoVImage = new Image();
    explosaoVImage.src = 'img/explosaoV.png';

    // Configuração Inicial dos Objetos Após Carregamento das Imagens
    heroi.onload = function() {
        xHeroi = canvas.width / 2 - heroi.width / 2;
        yHeroi = canvas.height - 150;
        desenhar();
    }

    inimigo.onload = function() {
        xInimigo = Math.random() * (canvas.width - 80);
        yInimigo = 50;
        desenhar();
    }

    cenario.onload = function() {
        yCenario1 = 0;
        yCenario2 = -canvas.height;
        desenhar();
    }

    // Eventos de Teclado e Intervalos para Movimento e Tiro
    document.addEventListener('keydown', movimentar);
    setInterval(movimentarInimigo, 500);
    setInterval(atirarInimigo, 2000);
    setInterval(desenhar, 20);
   }

   // Função de Desenho de Todos os Elementos no Canvas
   function desenhar() {
    // Se o jogo acabou, não desenha mais
    if (vocêPerdeu || VocêGanhou) return;

    // Limpa o Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o Cenário com Rolagem
    ctx.drawImage(cenario, 0, yCenario1, canvas.width, canvas.height);
    ctx.drawImage(cenario, 0, yCenario2, canvas.width, canvas.height);
    yCenario1 += velocidadeCenario;
    yCenario2 += velocidadeCenario;

    if (yCenario1 >= canvas.height) {
        yCenario1 = -canvas.height;
    }
    if (yCenario2 >= canvas.height) {
        yCenario2 = -canvas.height;
    }

    // Desenha o Herói e o Inimigo
    ctx.drawImage(heroi, xHeroi, yHeroi, 100, 80);
    ctx.drawImage(inimigo, xInimigo, yInimigo, 80, 80);

    // Desenha e Move os Tiros do Herói
    tirosHeroi.forEach((tiro, index) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(tiro.x, tiro.y, 8, 7);
        tiro.y -= 6;

        if (tiro.y < 0) {
            tirosHeroi.splice(index, 1);
        } else if (colisao(tiro, xInimigo, yInimigo, 80, 80)) {
            explosoes.push({ x: xInimigo, y: yInimigo, tempo: 0, tipo: 'H' });
            tirosHeroi.splice(index, 1);
            reposicionarInimigo();
            mostrarVocêGanhou();
        }
    });

    // Desenha e Move os Tiros do Inimigo
    tirosInimigo.forEach((tiro, index) => {
        ctx.fillStyle = '#7018AB';
        ctx.fillRect(tiro.x, tiro.y, 8, 9);
        tiro.y += 6;

        if (tiro.y > canvas.height) {
            tirosInimigo.splice(index, 1);
        } else if (colisao(tiro, xHeroi, yHeroi, 80, 80)) {
            explosoes.push({ x: xHeroi, y: yHeroi, tempo: 0, tipo: 'V' });
            tirosInimigo.splice(index, 1);
            mostrarvocêPerdeu();
        }
    });

    // Desenha Explosões
    explosoes.forEach((explosao, index) => {
        let frame = Math.floor(explosao.tempo / 5);
        let imagemExplosao = explosao.tipo === 'H' ? explosaoHImage : explosaoVImage;
        ctx.drawImage(imagemExplosao, frame * 50, 0, 50, 50, explosao.x, explosao.y, 80, 80);
        explosao.tempo += 1;
        if (explosao.tempo > 20) {
            explosoes.splice(index, 1);
        }
    });

    // Verifica Colisão entre Herói e Inimigo
    if (colisao({ x: xHeroi, y: yHeroi, width: 80, height: 80 }, xInimigo, yInimigo, 80, 80)) {
        explosoes.push({ x: xHeroi, y: yHeroi, tempo: 0, tipo: 'V' });
        explosoes.push({ x: xInimigo, y: yInimigo, tempo: 0, tipo: 'H' });
        mostrarvocêPerdeu();
    }
   }

   // Função para Movimentação do Herói com o Teclado
   function movimentar(evento) {
    if (vocêPerdeu || VocêGanhou) return;

    switch (evento.key) {
        case 'ArrowLeft':
            xHeroi = Math.max(0, xHeroi - 50);
            break;
        case 'ArrowRight':
            xHeroi = Math.min(canvas.width - 80, xHeroi + 50);
            break;
        case ' ':
            atirarHeroi();
            break;
    }
    desenhar();
   }

   // Função para Movimentação Aleatória do Inimigo
   function movimentarInimigo() {
    if (vocêPerdeu || VocêGanhou) return;

    let direcao = Math.floor(Math.random() * 3);
    switch (direcao) {
        case 0:
            xInimigo = Math.max(150, xInimigo - 50);
            break;
        case 1:
            xInimigo = Math.min(canvas.width - 80, xInimigo + 50);
            break;
        case 2:
    }
    desenhar();
   }

   // Função para Tiros do Herói
   function atirarHeroi() {
    let tiro = { x: xHeroi + 35, y: yHeroi - 10 };
    tirosHeroi.push(tiro);
   }

   // Função para Tiros do Inimigo
   function atirarInimigo() {
    let tiro = { x: xInimigo + 35, y: yInimigo + 80 };
    tirosInimigo.push(tiro);
   }

   // Função para Verificar Colisão
   function colisao(tiro, x, y, largura, altura) {
    return tiro.x > x && tiro.x < x + largura && tiro.y > y && tiro.y < y + altura;
   }

   // Função para Reposicionar o Inimigo Após Colisão
   function reposicionarInimigo() {
    yInimigo = 0;
   }

   // Função para Mostrar Mensagem de "Você Perdeu"
   function mostrarvocêPerdeu() {
    vocêPerdeu = true;
    document.getElementById('GameOverContainer').style.display = 'block';
   }

   // Função para Mostrar Mensagem de "Você Ganhou"
   function mostrarVocêGanhou() {
    VocêGanhou = true;
    document.getElementById('VocêGanhouContainer').style.display = 'block';
   }

   // Função para Reiniciar o Jogo
   function reiniciarJogo() {
    vocêPerdeu = false;
    VocêGanhou = false;
    document.getElementById('GameOverContainer').style.display = 'none';
    document.getElementById('VocêGanhouContainer').style.display = 'none';

    xHeroi = canvas.width / 2 - heroi.width / 2;
    yHeroi = canvas.height - 100;
    xInimigo = Math.random();
    yInimigo = 50;

    tirosHeroi = [];
    }