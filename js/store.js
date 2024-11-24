let tg = window.Telegram.WebApp;

function getCurrentID() {
  return tg.initDataUnsafe.user.id;
}
