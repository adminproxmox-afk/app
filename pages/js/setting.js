const currentUser = localStorage.getItem('user');
if (!currentUser) {
  window.location.href = '../login.html';
}

function initSettings() {
  if (!localStorage.getItem('darkMode')) localStorage.setItem('darkMode', 'true');
  if (!localStorage.getItem('notifications')) localStorage.setItem('notifications', 'true');
  if (!localStorage.getItem('musicEnabled')) localStorage.setItem('musicEnabled', 'true');
  if (!localStorage.getItem('soundEnabled')) localStorage.setItem('soundEnabled', 'true');
  if (!localStorage.getItem('volume')) localStorage.setItem('volume', '70');
  if (!localStorage.getItem('language')) localStorage.setItem('language', 'uk');
  if (!localStorage.getItem('userName')) localStorage.setItem('userName', currentUser || 'Користувач');
  if (!localStorage.getItem('userAvatar')) localStorage.setItem('userAvatar', localStorage.getItem('currentAvatar') || '👨‍🎓');
  if (!localStorage.getItem('currentAvatar')) localStorage.setItem('currentAvatar', localStorage.getItem('userAvatar') || '👨‍🎓');
}

let toastTimer;
function showNotification(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function applySettings() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  document.getElementById('darkModeToggle').classList.toggle('active', darkMode);
  document.getElementById('notificationsToggle').classList.toggle('active', localStorage.getItem('notifications') === 'true');
  document.getElementById('musicToggle').classList.toggle('active', localStorage.getItem('musicEnabled') === 'true');
  document.getElementById('soundToggle').classList.toggle('active', localStorage.getItem('soundEnabled') === 'true');
  document.getElementById('volumeSlider').value = localStorage.getItem('volume');
  document.getElementById('languageSelect').value = localStorage.getItem('language');
  const currentName = localStorage.getItem('userName');
  const currentAvatar = localStorage.getItem('currentAvatar') || localStorage.getItem('userAvatar');
  document.getElementById('currentUserName').innerText = currentName;
  document.getElementById('currentAvatar').innerText = currentAvatar;
  document.getElementById('currentAvatarMini').innerText = currentAvatar;
  localStorage.setItem('userAvatar', currentAvatar);
  document.body.style.filter = darkMode ? 'none' : 'saturate(.92) brightness(1.05)';
}

function showNameModal() {
  document.getElementById('newNameInput').value = localStorage.getItem('userName');
  document.getElementById('nameModal').style.display = 'flex';
}
function saveName() {
  const value = document.getElementById('newNameInput').value.trim();
  if (!value || value.length > 20) { showNotification('Введіть ім\'я від 1 до 20 символів'); return; }
  localStorage.setItem('userName', value);
  document.getElementById('nameModal').style.display = 'none';
  applySettings();
  showNotification('Ім\'я оновлено');
}
function showAvatarModal() { document.getElementById('avatarModal').style.display = 'flex'; }
function selectAvatar(avatar) {
  localStorage.setItem('userAvatar', avatar);
  localStorage.setItem('currentAvatar', avatar);
  document.getElementById('avatarModal').style.display = 'none';
  applySettings();
  showNotification('Аватар змінено');
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmTitle').innerText = title;
  document.getElementById('confirmMessage').innerText = message;
  modal.style.display = 'flex';
  const confirmBtn = document.getElementById('confirmActionBtn');
  const cancelBtn = document.getElementById('cancelConfirmBtn');
  const confirmHandler = () => { cleanup(); onConfirm(); };
  const cancelHandler = () => cleanup();
  function cleanup() {
    modal.style.display = 'none';
    confirmBtn.removeEventListener('click', confirmHandler);
    cancelBtn.removeEventListener('click', cancelHandler);
  }
  confirmBtn.addEventListener('click', confirmHandler);
  cancelBtn.addEventListener('click', cancelHandler);
}
function resetSettings() {
  localStorage.setItem('darkMode', 'true');
  localStorage.setItem('notifications', 'true');
  localStorage.setItem('musicEnabled', 'true');
  localStorage.setItem('soundEnabled', 'true');
  localStorage.setItem('volume', '70');
  localStorage.setItem('language', 'uk');
  applySettings();
  showNotification('Налаштування скинуто');
}
function clearCache() {
  const keep = ['user', 'userName', 'userAvatar', 'userCoins', 'currentAvatar'];
  Object.keys(localStorage).forEach((key) => { if (!keep.includes(key)) localStorage.removeItem(key); });
  initSettings();
  applySettings();
  showNotification('Кеш очищено');
}
function logout() { localStorage.removeItem('user'); window.location.href = '../login.html'; }
function setupToggles() {
  document.getElementById('darkModeItem').onclick = () => { localStorage.setItem('darkMode', String(!(localStorage.getItem('darkMode') === 'true'))); applySettings(); showNotification('Тему оновлено'); };
  document.getElementById('notificationsItem').onclick = () => { const next = !(localStorage.getItem('notifications') === 'true'); localStorage.setItem('notifications', String(next)); applySettings(); showNotification(next ? 'Сповіщення увімкнено' : 'Сповіщення вимкнено'); };
  document.getElementById('musicItem').onclick = () => { const next = !(localStorage.getItem('musicEnabled') === 'true'); localStorage.setItem('musicEnabled', String(next)); applySettings(); showNotification(next ? 'Музику увімкнено' : 'Музику вимкнено'); };
  document.getElementById('soundItem').onclick = () => { const next = !(localStorage.getItem('soundEnabled') === 'true'); localStorage.setItem('soundEnabled', String(next)); applySettings(); showNotification(next ? 'Звуки увімкнено' : 'Звуки вимкнено'); };
}
function setupOtherSettings() {
  document.getElementById('volumeSlider').oninput = (e) => { localStorage.setItem('volume', e.target.value); };
  document.getElementById('volumeSlider').onchange = () => showNotification('Гучність оновлено');
  document.getElementById('languageSelect').onchange = (e) => { localStorage.setItem('language', e.target.value); showNotification('Мову оновлено'); };
}
function initBottomNav() {
  document.querySelectorAll('.bottom-nav__item').forEach((item) => item.addEventListener('click', () => {
    const navType = item.dataset.nav;
    document.querySelectorAll('.bottom-nav__item').forEach((el) => el.classList.remove('active'));
    item.classList.add('active');
    if (navType === 'home') window.location.href = '../index.html';
    if (navType === 'profile') window.location.href = 'character.html';
    if (navType === 'shop') window.location.href = 'shop.html';
    if (navType === 'settings') window.location.href = 'setting.html';
  }));
}

document.getElementById('backBtn').addEventListener('click', () => window.location.href = '../index.html');
document.getElementById('logoutBtn').addEventListener('click', () => showConfirmModal('Вихід', 'Ви впевнені, що хочете вийти?', logout));
document.getElementById('resetDefaultsBtn').addEventListener('click', () => showConfirmModal('Скидання', 'Скинути всі налаштування до стандартних?', resetSettings));
document.getElementById('clearDataItem').addEventListener('click', () => showConfirmModal('Очищення кешу', 'Видалити всі тимчасові дані?', clearCache));
document.getElementById('changeNameItem').addEventListener('click', showNameModal);
document.getElementById('changeAvatarItem').addEventListener('click', showAvatarModal);
document.getElementById('aboutItem').addEventListener('click', () => showNotification('Версія 2.0.0 | Навчальні ігри'));
document.getElementById('privacyItem').addEventListener('click', () => showNotification('Дані зберігаються локально на цьому пристрої'));
document.getElementById('changePasswordItem').addEventListener('click', () => showNotification('Для зміни пароля зверніться до підтримки'));
document.getElementById('saveNameBtn').addEventListener('click', saveName);
document.getElementById('cancelNameModal').addEventListener('click', () => closeModal('nameModal'));
document.getElementById('closeAvatarModal').addEventListener('click', () => closeModal('avatarModal'));
document.querySelectorAll('.avatar-pick').forEach((button) => button.addEventListener('click', () => selectAvatar(button.dataset.avatar)));
window.addEventListener('click', (event) => { if (event.target.classList.contains('modal')) event.target.style.display = 'none'; });

initSettings();
applySettings();
setupToggles();
setupOtherSettings();
initBottomNav();
