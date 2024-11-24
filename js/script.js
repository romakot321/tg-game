//Define globals
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var playerX = 30;
var playerY = 30;

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
    if (touchendX < touchstartX) {
      move('l');
    }

    if (touchendX > touchstartX) {
      move('r');
    }

    if (touchendY < touchstartY) {
      move('u');
    }

    if (touchendY > touchstartY) {
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

resizeCtxCanvas(ctx);
draw();

function move(direction) {
  switch (direction) {
    case 'r':
      playerX += 10;
      break;

    case 'l':
      playerX -= 10;
      break;

    case 'u':
      playerY -= 10;
      break;

    case 'd':
      playerY += 10;
      break;
  
    default:
      break;
  }
  draw();
}


function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.beginPath();
  ctx.rect(playerX, playerY, 50, 50);
  ctx.stroke();
}
