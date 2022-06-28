const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];
var boatAnimation = [];
var boatSpritesheet,boatSpriteData;
var boatBrokenAnimation = [];
var boatBrokenSpritesheet,boatBrokenSpriteData;
var waterAnimation = [];
var waterSpritesheet,waterSpriteData;

var backgroundSound
var cannonExplosion
var cannonBallWater
var pirateLaugh

var score = 0;
var isGameOver = false;
var isLaugh = false;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");

  //carregando os arquivos
  boatSpriteData = loadJSON("./assets/boat/boat.json");
  boatSpritesheet = loadImage("./assets/boat/boat.png");
  boatBrokenSpriteData = loadJSON("./assets/boat/brokenBoat.json");
  boatBrokenSpritesheet = loadImage("./assets/boat/brokenBoat.png");
  waterSpritesheet = loadImage("./assets/waterSplash/waterSplash.png");
  waterSpriteData = loadJSON("./assets/waterSplash/waterSplash.json");

  backgroundSound = loadSound("./assets/background_music.mp3");
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");
  cannonBallWater = loadSound("./assets/cannon_water.mp3");
  pirateLaugh = loadSound("./assets/pirate_laugh.mp3");
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES)
  angle = 15

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);

  var boatFrames = boatSpriteData.frames
  for (let i = 0; i <boatFrames.length; i++) {
    var pos = boatFrames[i].position
    var img = boatSpritesheet.get(pos.x,pos.y,pos.w,pos.h)
    boatAnimation.push(img);
  }
  var brokenBoatFrames = boatBrokenSpriteData.frames
  for (let i = 0; i <brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position
    var img = boatBrokenSpritesheet.get(pos.x,pos.y,pos.w,pos.h)
    boatBrokenAnimation.push(img);
  }
  var waterFrames = waterSpriteData.frames
  for (let i = 0; i <waterFrames.length; i++) {
    var pos = waterFrames[i].position
    var img = waterSpritesheet.get(pos.x,pos.y,pos.w,pos.h)
    waterAnimation.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);

  if (!backgroundSound.isPlaying()) {
    backgroundSound.play();
    backgroundSound.setVolume(0.5);
    
  }

  Engine.update(engine);

  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();
}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        boats[i].remove(i);

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    if (ball.body.position.x >= width) {
      Matter.World.remove(world, balls[index].body);
        delete balls[index];
    }
    if (ball.body.position.y >= height - 50) {
      ball.remove(index);
      cannonBallWater.play();
      cannonBallWater.setVolume(0.03);
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(width, height - 100, 170, 170, position,boatAnimation);

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        });

        boats[i].display();
        boats[i].animate();
        var collision = Matter.SAT.collides(this.tower,boats[i].body)

        if(collision.collided && !boats[i].isBroken){
          isGameOver = true
          if(!isLaugh && !pirateLaugh.isPlaying()){
            pirateLaugh.play();
            isLaugh = true;
          }
          gameOver()
        }
      } 
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60,boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    balls[balls.length - 1].shoot();
    cannonExplosion.play();
  }
}

function gameOver() {
  swal({
    title: `Fim de Jogo!!!`,
     text: "Obrigada por jogar!!",
     imageUrl: "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
     imageSize: "150x150",
     confirmButtonText: "Jogar Novamente"
  },
  function(isConfirm) {
    if(isConfirm){
      location.reload()
  }   
  })
}
