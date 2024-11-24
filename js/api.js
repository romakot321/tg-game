let baseUrl = "";


function sendScore(telegramId, score) {
  var body = {telegram_id: telegramId, score: score};
  fetch(baseUrl + '/api/user', {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
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
