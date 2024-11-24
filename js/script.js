//Define globals
var canvas = document.getElementById('canvas');
var scoreElement = document.getElementById('score');
var ctx = canvas.getContext('2d');
var playerX = 50;
var playerY = 50;
var score = 0;

var objs = [];

canvas.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}, false);

canvas.addEventListener('touchend', function (event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
}, false);


function handleGesture() {
    if (touchendX < touchstartX && Math.abs(touchstartY - touchendY) < 40) {
      move('l');
    }
    else if (touchendX > touchstartX && Math.abs(touchstartY - touchendY) < 40) {
      move('r');
    }
    else if (touchendY < touchstartY) {
      move('u');
    }
    else if (touchendY > touchstartY) {
      move('d');
    }

    if (touchendY === touchstartY) {
      console.log('Tap');
    }
}


function resizeCtxCanvas(ctx) {
  const { width, height } = ctx.canvas.getBoundingClientRect();
  console.log(width, height);
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function addToScore(val) {
  score += val;
  scoreElement.innerText = "Score: " + score;
}

const app = window.Telegram.WebApp;
app.ready()
app.disableVerticalSwipes();

resizeCtxCanvas(ctx);
generate();
generate();
draw();

function move(direction) {
  switch (direction) {
    case 'r':
      playerX += 50;
      break;

    case 'l':
      playerX -= 50;
      break;

    case 'u':
      playerY -= 50;
      break;

    case 'd':
      playerY += 50;
      break;
  
    default:
      break;
  }
  draw();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generate() {
  var obj = {
    x: getRandomInt(0, ctx.canvas.width - 100),
    y: getRandomInt(0, ctx.canvas.height - 100)
  }
  objs.push(obj);
}

function update() {
  objs.forEach(element => {
    if (element.x <= playerX && playerX <= element.x + 100 && element.y <= playerY && playerY <= element.y + 100) {
      objs = objs.filter(item => item !== element);
      addToScore(1);
      generate();
      draw();
      console.log("Score:", score)
    }
  });
}


function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.rect(playerX, playerY, 50, 50);
  ctx.stroke();

  ctx.strokeStyle = "red";
  objs.forEach(element => {
    ctx.beginPath();
    ctx.rect(element.x, element.y, 100, 100);
    ctx.stroke();
  });

  update();
}
