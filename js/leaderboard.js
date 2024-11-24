async function requestCurrentUser() {
  let response = await fetch('/api/user/' + getCurrentID(), {
    method: "GET"
  });
  return await response.json();
}

async function requestUsers() {
  let response = await fetch('/api/user/', {
    method: "GET"
  });
  return await response.json();
}


window.onload = async () => {
  let usernameElement = document.getElementById("username");
  let scoreElement = document.getElementById("score");
  let usersContainer = document.getElementById("content");

  let user = await requestCurrentUser();
  usernameElement.innerText = "User #" + user.telegram_id;
  scoreElement.innerText = "Score: " + user.score + "p";

  let users = await requestUsers();
  users.forEach(user => {
    const userElement = document.createElement("div");
    userElement.className = "user-card";
    userElement.innerHTML = '<p class="username">User #' + user.telegram_id + '</p><p class="score">' + user.score + 'p</p>';
    usersContainer.appendChild(userElement);
  });
}
