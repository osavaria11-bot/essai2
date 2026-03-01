const button = document.getElementById('testButton');
const result = document.getElementById('result');

button.addEventListener('click', () => {
  const now = new Date().toLocaleTimeString('fr-FR');
  result.textContent = `✅ Test réussi à ${now}`;
});
