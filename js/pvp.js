var socket = undefined;
var enemyScoreElement = document.getElementById("enemy-score");
var enemyScore = 0;

var enemyObject = new Object(100, 100, "green");

function update() {
  if (socket === undefined) { return; }
  if (timeleft <= 0) { return; }
  if (prevTimestamp === undefined) {
    prevTimestamp = performance.now()
  }
  let delta = 1 - (performance.now() - prevTimestamp) / 1000;
  playerObject.update(delta);

  var founded = null;
  window.objs.forEach(element => {
    element.update(delta);
    if (element.isPopping) { return; }
    if (element.color !== "red" && element.color !== "#eee") { return; }
    if (element.canBeRemoved) {
      window.objs = window.objs.filter(item => item !== element);
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
    let body = {event: "score", data: {value: 1, time_left: timeleft, x: founded.x, y: founded.y}};
    socket.send(JSON.stringify(body));
  }
  prevTimestamp = performance.now();
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

function onMessage(data) {
  data = JSON.parse(data);
  console.log(data);
  if (data.event === "start") {
    window.objs.push(window.enemyObject);
    init();
  } else if (data.event === "move") {
    enemyObject.move(data.data.direction);
    draw(window.canvas, window.ctx);
  } else if (data.event === "score") {
    enemyScore += data.data.value;
    console.log(enemyScore);
    enemyScoreElement.innerText = "Enemy score: " + enemyScore;
  } else if (data.event === "end") {
    finishGame()
  }
}

function start() {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams.get('enemyId'));
  window.socket = new WebSocket(window.baseUrl + "/api/pvp/create/" + getCurrentID() + "/" + urlParams.get('enemyId'));
  window.socket.addEventListener("open", (event) => {
    socket.send(JSON.stringify({event: "init", data: {"screen_width": window.canvas.width, "screen_height": window.canvas.height}}))
  });

  window.socket.addEventListener("message", (event) => {
    onMessage(event.data);
  });

  window.ctx.font = "40px sans-serif";
  window.ctx.fillText("Wait for enemy connect...", 5, window.canvas.height / 2);
}

window.start = start;
