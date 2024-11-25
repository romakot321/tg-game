function getCurrentID() {
  return window.Telegram.WebApp.initDataUnsafe.user.id;
}

function getCurrentUserInfo() {
  return window.Telegram.WebApp.initDataUnsafe.user;
}
