function getCurrentID() {
  if (window.localrun !== undefined) {
    return window.localrun;
  }
  return window.Telegram.WebApp.initDataUnsafe.user.id;
}

function getCurrentUserInfo() {
  return window.Telegram.WebApp.initDataUnsafe.user;
}
