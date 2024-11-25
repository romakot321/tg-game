var socket = undefined;
var enemyScoreElement = document.getElementById("enemy-score");
var enemyScore = 0;

var enemyObject = new Object(100, 100, "green");

function update() {
  if (socket === undefined) { return; }
  playerObject.update();

  if (timeleft <= 0) { return; }
  var founded = null;
  window.objs.forEach(element => {
    if (element.color !== "red" && element.color !== "#eee") { return; }
    element.update();
    if (element.canBeRemoved) {
      window.objs = window.objs.filter(item => item !== element);
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
    let body = {event: "score", data: {value: 1}};
    socket.send(JSON.stringify(body));
  }
}

function move(direction) {
  if (socket === undefined) { return; }
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
  let body = {event: "move", data: {direction: direction}};
  socket.send(JSON.stringify(body));
}

function onMessage(data) {
  data = JSON.parse(data);
  console.log(data);
  if (data.event === "start") {
    window.objs.push(window.enemyObject);
    console.log(window.objs);
    init();
    console.log(window.objs);
  } else if (data.event === "move") {
    enemyObject.move(data.data.direction);
    draw(window.canvas, window.ctx);
  } else if (data.event === "score") {
    enemyScore += data.data.value;
    console.log(enemyScore);
    enemyScoreElement.innerText = "Enemy score: " + enemyScore;
  }
}

function start() {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams.get('enemyId'));
  window.socket = new WebSocket("ws://127.0.0.1:9021/api/pvp/create/" + getCurrentID() + "/" + urlParams.get('enemyId'));
  window.socket.addEventListener("open", (event) => {
    console.log("Connection opened")
  });

  window.socket.addEventListener("message", (event) => {
    onMessage(event.data);
  });

  window.ctx.font = "40px sans-serif";
  window.ctx.fillText("Wait for enemy connect...", 5, window.canvas.height / 2);
}

window.start = start;
