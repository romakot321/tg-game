window.onload = async () => {
  let usernameElement = document.getElementById("username");
  let scoreElement = document.getElementById("score");
  let avatarElement = document.getElementById("user-logo");
  let usersContainer = document.getElementById("content");

  let user = await getCurrentUser();
  usernameElement.innerText = user.first_name + " " + user.last_name;
  scoreElement.innerText = "Score: " + user.score + "p";
  avatarElement.src = user.photo_url;

  let users = await getUsers();
  users.forEach(user => {
    const userElement = document.createElement("div");
    userElement.className = "user-card";
    userElement.innerHTML = '<img src="' + user.photo_url + '" alt="user" class="user-logo"><p class="username">' + user.first_name + " " + user.last_name + '</p><p class="score">' + user.score + 'p</p>';
    userElement.addEventListener('click', function (userId) {
      return () => {
        window.parent.postMessage(['open-pvp', userId], '*');
      }
    }(user.telegram_id));
    usersContainer.appendChild(userElement);
  });
}
