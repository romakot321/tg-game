window.onload = async () => {
  let usernameElement = document.getElementById("username");
  let scoreElement = document.getElementById("score");
  let usersContainer = document.getElementById("content");

  let user = await getCurrentUser();
  usernameElement.innerText = user.first_name + " " + user.last_name;
  scoreElement.innerText = "Score: " + user.score + "p";

  let users = await getUsers();
  users.forEach(user => {
    const userElement = document.createElement("div");
    userElement.className = "user-card";
    userElement.innerHTML = '<p class="username">' + user.first_name + " " + user.last_name + '</p><p class="score">' + user.score + 'p</p>';
    usersContainer.appendChild(userElement);
  });
}
