//Define globals
var canvas = document.getElementById('canvas');
var body = document.getElementsByTagName('body')[0];
var scoreElement = document.getElementById('score');
var timerElement = document.getElementById('timer');
var ctx = canvas.getContext('2d');
var score = 0;
var playerObject = new Object(100, 100, "black");
var timeleft = 60;

var objs = [];

const app = window.Telegram.WebApp;
app.expand();
app.ready();
app.disableVerticalSwipes();
document.body.style.overflowY = 'hidden'
document.body.style.marginTop = `1px`
document.body.style.height = window.innerHeight + 1 + "px"
document.body.style.paddingBottom = `1px`
window.scrollTo(0, 1);

body.addEventListener('touchstart', function (event) {
    event.preventDefault();
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}, { passive: false });

body.addEventListener('touchend', function (event) {
    event.preventDefault();
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
}, { passive: false });

body.addEventListener('keypress', (event) => {
    switch (event.key) {
      case "d":
        move('r');
        break;
      case "a":
        move('l');
        break;
      case "s":
        move('d');
        break;
      case "w":
        move('u');
        break;
    
      default:
        break;
    }
}, { passive: false });

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
  ctx.canvas.width = width - width % Object.step;
  ctx.canvas.height = height - height % Object.step;
  console.log(ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function addToScore(val) {
  score += val;
  scoreElement.innerText = "Score: " + score;
}

function move(direction) {
  switch (direction) {
    case 'r':
      if (playerObject.left + Object.step >= canvas.width) {
        return;
      }
      break;
    case 'l':
      if (playerObject.right - Object.step <= 0) {
        return;
      }
      break;
    case 'd':
      if (playerObject.top + Object.step >= canvas.height) {
        return;
      }
      break;
    case 'u':
      if (playerObject.bottom - Object.step <= 0) {
        return;
      }
      break;
  
    default:
      break;
  }
  playerObject.move(direction);
}

function timer(){
  var timer = setInterval(function(){
    var seconds = timeleft % 60;
    var minutes = Math.floor(timeleft/60);
    if (seconds < 10) { seconds = "0" + seconds; }
    timerElement.innerHTML = 'Time left: ' + minutes + ":" + seconds;
    timeleft--;
    if (timeleft < 0) {
      finishGame();
      clearInterval(timer);
    }
    if (timeleft == 30) {
      generate();
    }
  }, 1000);
}

function finishGame() {
  timerElement.innerHTML = "Game end";
  sendScore(getCurrentID(), score);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generate() {
  var obj = new Object(
    getRandomInt(0, ctx.canvas.width - 100),
    getRandomInt(0, ctx.canvas.height - 100),
    "red",
    45,
    45
  );
  objs.push(obj);
}

function update() {
  playerObject.update();

  if (timeleft <= 0) { return; }
  var founded = null;
  objs.forEach(element => {
    element.update();
    if (element.canBeRemoved) {
      objs = objs.filter(item => item !== element);
      generate();
      return;
    }
    if (element.iscollide(playerObject)) {
      founded = element;
      return false;
    }
  });
  if (founded !== null) {
    addToScore(1);
    founded.pop();
  }
}

function draw(canvas, ctx) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (timeleft <= 0) {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    return;
  }

  playerObject.draw(ctx);
  objs.forEach(element => {
    element.update();
    element.draw(ctx);
  });

  update();
}

function toLeaderboard() {
  location.href = "leaderboard.html";
}

function init() {
  updateUserInfo(getCurrentUserInfo());
  resizeCtxCanvas(ctx);
  generate();
  generate();

  tick(canvas, ctx);
  timer();
}

var tick = function(canvas, ctx) {
    draw(canvas, ctx);
    requestAnimationFrame(function() {
        tick(canvas, ctx);
    });
}

init()
