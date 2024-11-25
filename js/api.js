let baseUrl = "";


function sendScore(telegramId, score) {
  var body = {score: score};
  fetch(baseUrl + '/api/user/' + telegramId, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });
}

function updateUserInfo(data) {
  console.log(data)
  fetch(baseUrl + '/api/user/' + data.id, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
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
