function sendScore(telegramId, score) {
  var body = {telegram_id: telegramId, score: score};
  fetch('/api/user', {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });
}
