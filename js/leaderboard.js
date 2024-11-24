window.onload = async () => {
  let usernameElement = document.getElementById("username");
  let scoreElement = document.getElementById("score");
  let usersContainer = document.getElementById("content");

  let user = await getCurrentUser();
  usernameElement.innerText = "User #" + user.telegram_id;
  scoreElement.innerText = "Score: " + user.score + "p";

  let users = await getUsers();
  users.forEach(user => {
    const userElement = document.createElement("div");
    userElement.className = "user-card";
    userElement.innerHTML = '<p class="username">User #' + user.telegram_id + '</p><p class="score">' + user.score + 'p</p>';
    usersContainer.appendChild(userElement);
  });
}
