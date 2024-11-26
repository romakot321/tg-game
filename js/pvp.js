var socket = undefined;
var enemyScoreElement = document.getElementById("enemy-score");
var enemyScore = 0;

var enemyObject = null;

function update() {
  if (socket === undefined) { return; }
  if (prevTimestamp === undefined) {
    prevTimestamp = performance.now()
  }
  let delta = 1 - (performance.now() - prevTimestamp) / 1000;
  checkObjectInterract(playerObject);
  playerObject.update(delta);

  if (timeleft <= 0) { return; }
  window.objs.forEach(element => {
    element.update(delta);
    if (element.color === Object.enemyColor) { return; }
    checkObjectInterract(element);
  });
  prevTimestamp = performance.now();
}

function checkObjectCollect(obj) {
  if (obj.color == Object.playerColor) { return; }
  if (obj.distanceto(playerObject) <= obj.radius * 2) {
    addToScore(1);
    let body = {event: "remove", data: {x: obj.x, y: obj.y}};
    socket.send(JSON.stringify(body));
    obj.pop();
  }
}

function generate() { return; }

function addToScore(val) {
  score += val;
  scoreElement.innerText = "Score: " + score;
  let body = {event: "score", data: {value: val, time_left: timeleft}};
  socket.send(JSON.stringify(body));
}

function move(direction) {
  if (socket === undefined) { return; }
  let status = canMove(direction);
  if (status === false) { return; }
  if (status === null) {
    playerObject.move(direction);
  } else {
    playerObject.move(direction, Math.abs(status));
  }
  let body = {event: "move", data: {direction: direction}};
  socket.send(JSON.stringify(body));
}

function finishGame() {
  let text = "";
  if (enemyScore > score) {
    text = "Enemy win.";
  } else if (score > enemyScore) {
    text = "You win!";
  } else {
    text = "хопхейлалалей";
  }
  timerElement.innerText = text;
  timeleft = 0;
}

function replaceObjects(data) {
  let newObjs = [];
  data.forEach(obj => {
    let color = "red";
    let geometry = "circle";
    if (obj.type == "coin") {
      color = "red";
      geometry = "circle";
    }
    newObjs.push(new Object(obj.x, obj.y, color, Object.step - 5, Object.step - 5, geometry))
  });
  newObjs.push(enemyObject);
  console.log(data, newObjs);
  window.objs = newObjs;
}

function onMessage(data) {
  data = JSON.parse(data);
  console.log(data);
  if (data.event === "start") {
    Object.step = data.data.object_step;
    Object.ticksToLive = Infinity;
    enemyObject = new Object(100, 100, Object.enemyColor);
    window.playerObject = new Object(100, 100, Object.playerColor);
    replaceObjects(data.data.objects)
    init(false);
  } else if (data.event === "move") {
    enemyObject.move(data.data.direction);
    draw(window.canvas, window.ctx);
  } else if (data.event === "score") {
    enemyScore += data.data.value;
    console.log(enemyScore);
    enemyScoreElement.innerText = "Enemy score: " + enemyScore;
  } else if (data.event === "end") {
    finishGame()
  } else if (data.event === "objects") {
    replaceObjects(data.data.objects)
  }
}

function start() {
  const urlParams = new URLSearchParams(window.location.search);
  resizeCtxCanvas(ctx);
  window.socket = new WebSocket(window.baseUrl + "/api/pvp/create/" + getCurrentID() + "/" + urlParams.get('enemyId'));
  window.socket.addEventListener("open", (event) => {
    socket.send(JSON.stringify({event: "init", data: {"screen_width": window.canvas.width, "screen_height": window.canvas.height}}))
  });

  window.socket.addEventListener("message", (event) => {
    onMessage(event.data);
  });

  window.ctx.font = "1rem sans-serif";
  window.ctx.fillText("Wait for enemy", 5, window.canvas.height / 2);
}

window.start = start;
