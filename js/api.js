let baseUrl = "";


function sendScore(telegramId, score) {
  var body = {score: score};
  fetch(baseUrl + '/api/user/' + telegramId, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });
}

function updateUserInfo(info) {
  fetch(baseUrl + '/api/user/' + info.id, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(info)
  });
}

async function getCurrentUser() {
  let response = await fetch(baseUrl + '/api/user/' + getCurrentID(), {
    method: "GET"
  });
  return await response.json();
}

async function getUsers() {
  let response = await fetch(baseUrl + '/api/user/', {
    method: "GET"
  });
  return await response.json();
}
