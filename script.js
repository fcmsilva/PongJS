//para ter o link para parar
var playing = false;
//lista de teclas a serem pressionadas
var keysPressed = {};
//
var frameRate = 16;
//o cosseno máximo para o ângulo, para a bola não ir muito vertical
var maxCos = 0.23;
//
var fast_mode = true;
//
var ai_mode = true;
//
var demo=true;
//
//adicionar as teclas pressionadas ao keysPressed
function start_ai(){
  resetObjects();
  updateAllSettings();
  updateScore();
  playing=true;
  demo=false;
  playing=true;
  ai_mode=true;
  document.getElementById("game-start").style.display="none";
  document.getElementById("start-over").style.display="block";
}
function start_user(){
  resetObjects();
  updateAllSettings();
  updateScore();
  playing=true;
  demo=false;
  ai_mode=false;
  document.getElementById("game-start").style.display="none";
  document.getElementById("start-over").style.display="block";
}



window.addEventListener("keydown", function(a) {
  keysPressed[a.keyCode] = true;
}, true);
//remove as teclas pressionadas ao keysPressed
window.addEventListener("keyup", function(a) {
  keysPressed[a.keyCode] = false;
}, true);

//função que será aplicada nos objects para atualizar as definições
function updateObjectSettings() {
  for (var variable in this.itemsToUpdate) {
    var property = this.itemsToUpdate[variable];
    if (typeof(property) == "string") {
      document.getElementById(this.id).style[property] = this[variable] + "px";
    } else {
      for (var i = 0; i < property.length; i++) {
        var prop = property[i];
        document.getElementById(this.id).style[prop] = this[variable] + "px";
      }
    }
  };
}
//-----------------------------------------------
//------------------------------------CONSTRUCTORS-------------------------------------

//Pad constructor--------------------------------
function padCreator(id) {
  this.itemsToUpdate = {
    "y": "top",
    "height": "height",
    "width": "width",
  };
  this.id = id;
  this.y = 200;
  this.speed = (fast_mode ? 6 : 4);
  this.height = 120;
  this.width = 20;
  this.score = 0;
  this.updatePosition = function() {
    //update só da posição
    document.getElementById(id).style.top = this.y + "px";
  }
  this.move = function(direction) {
    if((this.y - this.speed)>0 && direction=="up"){
      this.y-=this.speed;
    } else if (direction=="up") {this.y = 0;}
    if((this.y + this.speed+this.height)<max_y && direction=="down"){
      this.y+=this.speed;
    } else if(direction=="down") {this.y = max_y-this.height};
    this.updatePosition();
  }
  this.won = function() {
    this.score += 1;
    updateScore(this.id);
    newGame(this.id);
  }
}
//-----------------------------------------------

//Container Constructor--------------------------
function containerCreator() {
  this.itemsToUpdate = {
    "width": "width",
    "height": "height"
  };
  this.id = "container";
  this.width = window.innerWidth;
  this.height = window.innerHeight;
};
//-----------------------------------------------

//Ball Constructor-------------------------------
function ballCreator() {
  this.id = "ball";
  this.itemsToUpdate = {
    "x": "left",
    "y": "top",
    "size": ["width", "height"],
  };
  this.x = 200;
  this.y = 200;
  /*baseSpeed é a velocidade do cosseno, 
  para quando atiras um angulo agudo não demorarar muito tempo*/
  this.baseSpeed = 8;
  this.speed = 8;
  this.size = 20;
  this.angle = (1.8);
  this.vector = {
    "x": 5.663118960624631,
    "y": -4.1144967660473135
  };
  this.setAngle = function(newAngle) {
    this.angle = newAngle;
    if (!fast_mode) {
      this.vector.x = this.speed * (Math.cos(newAngle * Math.PI));
      this.vector.y = this.speed * (Math.sin(newAngle * Math.PI));
    } else {
      var angle_cos = Math.cos(newAngle * Math.PI);
      var angle_sin = Math.sin(newAngle * Math.PI);
      this.vector.x = (angle_cos > 0 ? this.speed : -(this.speed));
      this.vector.y = ((this.vector.x) / (angle_cos)) * angle_sin;
    }
  }
  this.move = function() {
    this.x += this.vector.x;
    this.y -= this.vector.y;
    document.getElementById(this.id).style.top = this.y + "px";
    document.getElementById(this.id).style.left = this.x + "px";
  }
}
//----------------------------------------------
//------------------------------END OF CONSTRUCTORS------------------------------------

//adiciona a função update aos objetos----------
containerCreator.prototype.update = updateObjectSettings;
ballCreator.prototype.update = updateObjectSettings;
padCreator.prototype.update = updateObjectSettings;
//---------------------------------------------

//-----CRIAR OBJETOS/RESET---------
var container,ball,leftPad,rightPad;
function resetObjects(){
//container, campo de jogo
container = new containerCreator;
//ball
ball = new ballCreator;
//pads
leftPad = new padCreator("leftPad");
rightPad = new padCreator("rightPad");
}
resetObjects();
//-----FIM CRIAR OBJETOS----
//passa as definições nos objetos para o css
function updateAllSettings() {
  //efetua as definições dos objetos
  container.update();
  leftPad.update();
  rightPad.update();
  ball.update();
}
//coloca as definições inicias para se começar o jogo
updateAllSettings();

//atualiza a pontuação (duh)
function updateScore() {
  document.getElementById("score-left").innerHTML = leftPad.score;
  document.getElementById("score-right").innerHTML = rightPad.score;
}

//Quando alguém marca ponto...-------------------------
function newGame(winner) {
  /*ball.x = 200;
  ball.update();*/
  if(winner=="leftPad"){
    ball.x=leftPad.width+10;
    ball.y= rightPad.y+(Math.floor(150*Math.random()));
    ball.setAngle(1.8);
  } else{
    ball.x=max_x-ball.size-rightPad.width-10;
    ball.y= leftPad.y+(Math.floor(150*Math.random()));
    ball.setAngle(0.8);
  }
  ball.update();
}
//-----------------------------------------------------
//dá mais jeito escrever
var max_x = container.width;
var max_y = container.height;

/*Cálculo da reflexão da bola------------------------------------------
o pad é como uma elipse quando calculas os angulos---------------------*/
function getReflectionAngle(ballAngle, distance, pad) {
  //distance = valor entre 0 e 1, 0 topo, 1 base do pad
  //pad = pad do qual ressalta
  var padLocation = (distance) / (pad.height);
  console.log("PD: " + padLocation);
  //função da normal dos pads consoante a distância ao topo
  var padNormal = ((-0.3 * padLocation) + 0.15);
  //refleção se tocar no pad no centro
  var baseReflection = -ballAngle + 1;
  /*reflexão tendo em conta a posição em relação ao pad
  se for o rightPad a função tem de ser invertida
  */
  var padReflection = baseReflection + (pad.id == "leftPad" ? padNormal : -(padNormal));
  /*se o cosseno for inferior ao maxCos usas a baseReflection em vez da pad
  para evitar que o ângulo fique muito agudo
  */
  if ((pad.id == "leftPad" && Math.cos(padReflection * Math.PI) <= maxCos) || (pad.id == "rightPad" && Math.cos(padReflection * Math.PI) >= -(maxCos))) {
    //se o angulo e mt agudo ou nao inverte sentido
    console.log("OVER, replace:" + (-ballAngle + 1));
    return baseReflection;
    //como no centro
  } else {
    return padReflection;
  }
}
//--------------------------------------------------------------------------
//-------------------------------------FUNÇÃO PRINCIPAL------------------------------
//a cada 20 ms corre esta função
function frameUpdate() {
  //up - left
  if(!demo){
  if (keysPressed[87] && leftPad.y - leftPad.speed >= 0) {
    leftPad.move("up");
  }
  //dwn - left
  if (keysPressed[83] && leftPad.y <= (max_y - leftPad.height - leftPad.speed)) {
    leftPad.move("down");
  }
  } else if(ball.vector.x < 0){
    //---------AI----------
    if(ball.y+(0)<leftPad.y+(leftPad.height/2)){
      leftPad.move("up");
    } else if(ball.y+ball.vector.y>leftPad.y+(rightPad.height/2)){
      leftPad.move("down");
    }
    //---------AI----------
  }
  if (!ai_mode) {
    //---------USER----------
    //up - right
    if (keysPressed[38] && rightPad.y - rightPad.speed >= 0) {
      rightPad.move("up");
    }
    //dwn - right
    if (keysPressed[40] && rightPad.y <= (max_y - rightPad.height - leftPad.speed)) {
      rightPad.move("down");
    }
    //---------USER----------
  } else if(ball.vector.x > 0){
    //---------AI----------
    if(ball.y+(0)<rightPad.y+(rightPad.height/2)){
      rightPad.move("up");
    } else if(ball.y+ball.vector.y>rightPad.y+(rightPad.height/2)){
      rightPad.move("down");
    }
    //---------AI----------
  }
  

  /*detetar se a bola bate em cima ou baixo
    a operação da esq. para baixo e da dir para cima
    */
  if ((ball.y - ball.vector.y + ball.size) > max_y || ball.y < ball.vector.y) {
    //reflexão da bola
    ball.setAngle(-(ball.angle));
    console.log("top: " + ball.angle);
  }
  //left hit detection - posição da bola
  if (ball.x + ball.vector.x < leftPad.width) {
    //distancia do topo da bola ao topo do pad, entre -tamanho da bola e tamanho do pad
    var distanceToPad = ball.y - leftPad.y;
    if (distanceToPad <= leftPad.height && distanceToPad >= (-ball.size)) {
      var reflectionAngle = getReflectionAngle(ball.angle, distanceToPad, leftPad);
      //ball.setAngle(-(ball.angle) + 1);
      ball.setAngle(reflectionAngle);
    } else {
      //o valor é de quem ganha a ronda
      rightPad.won();
    }
  }
  //right hit detection
  if (ball.x + (ball.vector.x) + ball.size + rightPad.width > max_x) {
    var distanceToPad = ball.y - rightPad.y;
    if ((distanceToPad) <= rightPad.height && (distanceToPad) >= (-ball.size)) {
      console.log("before ba: " + ball.angle);
      var reflectionAngle = getReflectionAngle(ball.angle, distanceToPad, rightPad);
      //ball.setAngle(-(ball.angle) + 1);
      ball.setAngle(reflectionAngle);
      console.log("balx: " + ball.x);
      ball.move();
    } else {
      //o valor é de quem ganha a ronda
      leftPad.won();
    }
  }

  ball.move();
  if (playing || demo) {
    setTimeout(frameUpdate, frameRate);
  }
}
//-------------------------------------FUNÇÃO PRINCIPAL------------------------------
//corre pela primeira vez;
frameUpdate();