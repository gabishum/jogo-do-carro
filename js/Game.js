class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    //propriedade que indica se o jogador está se movendo
    this.movendo = false;

  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }

  //pegar carros no final
  pegarVencedores(){
    var carrosRef = database.ref("vencedores");
    carrosRef.on("value", data=>{
      player.rank = data.val();
    })
  }

  //atualizar carros no final

  updateVencedores(quant){
    database.ref("/").update({
      vencedores:quant
    })
  }

  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    powerCoins = new Group();

    obstacles = new Group();

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    // Adicionar sprite de combustível no jogo
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adicionar sprite de moeda no jogo
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    //Adicionar sprite de obstáculo no jogo
    this.addSprites(
      obstacles,
      obstaclesPositions.length,
      obstacle1Image,
      0.04,
      obstaclesPositions
    );
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      //C41 //SA
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reiniciar o Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Placar");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    this.pegarVencedores()
    Player.getPlayersInfo();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderboard();

      //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        index = index + 1;
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.coletarCombustivel(index);
          this.coletarMoedas(index);

          //alterar a posição da câmera na direção y
          camera.position.y = cars[index - 1].position.y;
        }
      }

      //manipulando eventos de teclado
      this.handlePlayerControls();

      var linhaChegada = height*6-100;
      if(player.positionY>linhaChegada){
        gameState=2;
        player.rank++;
        player.update();
        this.updateVencedores(player.rank);
        this.mostrarRank()
      }

      }
       
      //exibir o combustível
      this.mostrarComb();
      

      drawSprites();
      
    }
  


  mostrarComb(){ 
    push();
    image(fuelImage,  width/2 -130, height - player.positionY - 150, 20, 20 );
    fill("white");
    rect(width/2 -100, height - player.positionY -150, 160, 20 );
    fill("green");
    rect(width/2 -100, height - player.positionY -150, player.fuel , 20 );
    pop();

  }


  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Essa etiqueta é usada para exibir quatro espaços.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {

    if (keyIsDown(UP_ARROW)) {
      player.positionY += 10;
      player.update();
      //indicar o computador que o player se move
      this.movendo = true ;

    }
 
    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
    }
  }




  

  coletarCombustivel(index) {
    //detecta a colisão entre o carro e o combustível
    cars[index - 1].overlap(fuels, function(carro, comb) {
    comb.remove();
    //definir o combustivel para 160
    player.fuel = 160;
    player.update();
     
    });

    //se o player estiver se movendo e o combustível for maior que 0
    //então reduzir o combustível
    if (this.movendo == true && player.fuel >0){
      player.fuel -=0.7;
      player.update();

    }


    //se o combustivel for menor que 0, então o estado de jogo é 2 e o jogo acaba.
    if ( player.fuel <0 ){
      gameState = 2;
      this.gameOver();

    }

    
  }

  coletarMoedas(index) {
    cars[index - 1].overlap(powerCoins, function(collector, collected) {
      player.score += 21;
      player.update();
      collected.remove();
    });
  }

  mostrarRank() {
    swal({
      title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver(){
    swal({
      title: `Fim de jogo!`,
      text: "Oopss você perdeu a corrida",
      imageUrl: "https://i.postimg.cc/V5ydXyqj/deslike.png",
      imageSize: "100x100",
      confirmButtonText:"Obrigado por Jogar"

    })
  }
}
