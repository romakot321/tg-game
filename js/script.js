//Define globals
var canvas = document.getElementById('canvas');
var body = document.getElementsByTagName('body')[0];
var scoreElement = document.getElementById('score');
var timerElement = document.getElementById('timer');
var ctx = canvas.getContext('2d');
var score = 0;
var playerObject = new Object(100, 100, "black");
var timeleft = 60;
var prevTimestamp;

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

function rectObjsCollide(rect, solid=false) {
  for (let index = 0; index < objs.length; index++) {
    const element = objs[index];
    if (solid && !element.issolid) {
      continue;
    }
    if (element.iscollide(rect)) {
      return element;
    }
  }
  return null;
}

function canMove(direction) {
  switch (direction) {
    case 'r':
      if (playerObject.left + Object.step >= canvas.width) {
        return false;
      } else {
        let rect = new Rect(playerObject.x + Object.step, playerObject.y, playerObject.width, playerObject.height)
        let collideRect = rectObjsCollide(rect, true);
        if (collideRect !== null) {
          if (collideRect.iscollide(playerObject)) {
            return false;
          }
          return collideRect.left - playerObject.right;
        }
      }
      break;
    case 'l':
      if (playerObject.right - Object.step <= 0) {
        return false;
      } else {
        let rect = new Rect(playerObject.x - Object.step, playerObject.y, playerObject.width, playerObject.height)
        let collideRect = rectObjsCollide(rect, true);
        if (collideRect !== null) {
          if (collideRect.iscollide(playerObject)) {
            return false;
          }
          return playerObject.left - collideRect.right;
        }
      }
      break;
    case 'd':
      if (playerObject.top + Object.step >= canvas.height) {
        return false;
      } else {
        let rect = new Rect(playerObject.x, playerObject.y + Object.step, playerObject.width, playerObject.height)
        let collideRect = rectObjsCollide(rect, true);
        if (collideRect !== null) {
          if (collideRect.iscollide(playerObject)) {
            return false;
          }
          return collideRect.top - playerObject.bottom;
        }
      }
      break;
    case 'u':
      if (playerObject.bottom - Object.step <= 0) {
        return false;
      } else {
        let rect = new Rect(playerObject.x, playerObject.y - Object.step, playerObject.width, playerObject.height)
        let collideRect = rectObjsCollide(rect, true);
        if (collideRect !== null) {
          if (collideRect.iscollide(playerObject)) {
            return false;
          }
          return playerObject.top - collideRect.bottom;
        }
      }
      break;
  
    default:
      return false;
      break;
  }
  return null;
}

function move(direction) {
  let status = canMove(direction);
  if (status === false) { return; }
  if (status === null) {
    return playerObject.move(direction);
  }
  console.log(status);
  return playerObject.move(direction, Math.abs(status));
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
    if (timeleft <= 45 && timeleft % 5 == 0) {
      generateObstacle();
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
    getRandomInt(0, ctx.canvas.width - 100) ,
    getRandomInt(0, ctx.canvas.height - 100),
    "red",
    Object.step - 5,
    Object.step - 5,
    "circle"
  );
  if (timeleft < 20) {
    obj.velocityY = (-0.5 + Math.random() * 2);
    obj.velocityX = (-0.5 + Math.random() * 2);
  }
  window.objs.push(obj);
}

function generateObstacle() {
  console.log("genobs", timeleft)
  let attempts = 5;
  while (true) {
    let x = getRandomInt(0, ctx.canvas.width - Object.step);
    let y = getRandomInt(0, ctx.canvas.height - Object.step);
    var obj = new Object(
      x - x % Object.step,
      y - y % Object.step,
      "#a0a0a0",
      Object.step - 5,
      Object.step - 5,
      "fillrect"
    );
    if (!obj.iscollide(playerObject)) { break; }
    attempts--;
    if (attempts == 0) { return; }
  }
  window.objs.push(obj);
}

function update() {
  if (prevTimestamp === undefined) {
    prevTimestamp = performance.now()
  }
  let delta = 1 - (performance.now() - prevTimestamp) / 1000;
  playerObject.update(delta);

  if (timeleft <= 0) { return; }
  var founded = null;
  window.objs.forEach(element => {
    element.update(delta);
    if (element.isPopping) { return; }
    if (element.canBeRemoved) {
      objs = objs.filter(item => item !== element);
      generate();
      return;
    }
    if (element.distanceto(playerObject) <= element.radius * 2) {
      founded = element;
      return false;
    }
  });
  if (founded !== null) {
    addToScore(1);
    founded.pop();
  }
  prevTimestamp = performance.now();
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
