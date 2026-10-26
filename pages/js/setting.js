const currentUser = LCAMemoryStorage.getItem('user');
if (!currentUser) {
  window.location.href = '../login.html';
}

function initSettings() {
  if (!LCAMemoryStorage.getItem('darkMode')) LCAMemoryStorage.setItem('darkMode', 'true');
  if (!LCAMemoryStorage.getItem('notifications')) LCAMemoryStorage.setItem('notifications', 'true');
  if (!LCAMemoryStorage.getItem('musicEnabled')) LCAMemoryStorage.setItem('musicEnabled', 'true');
  if (!LCAMemoryStorage.getItem('soundEnabled')) LCAMemoryStorage.setItem('soundEnabled', 'true');
  if (!LCAMemoryStorage.getItem('volume')) LCAMemoryStorage.setItem('volume', '70');
  if (!LCAMemoryStorage.getItem('language')) LCAMemoryStorage.setItem('language', 'uk');
  if (!LCAMemoryStorage.getItem('userName')) LCAMemoryStorage.setItem('userName', currentUser || 'Користувач');
  if (!LCAMemoryStorage.getItem('userAvatar')) LCAMemoryStorage.setItem('userAvatar', LCAMemoryStorage.getItem('currentAvatar') || '👨‍🎓');
  if (!LCAMemoryStorage.getItem('currentAvatar')) LCAMemoryStorage.setItem('currentAvatar', LCAMemoryStorage.getItem('userAvatar') || '👨‍🎓');
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
  const darkMode = LCAMemoryStorage.getItem('darkMode') === 'true';
  document.getElementById('darkModeToggle').classList.toggle('active', darkMode);
  document.getElementById('notificationsToggle').classList.toggle('active', LCAMemoryStorage.getItem('notifications') === 'true');
  document.getElementById('musicToggle').classList.toggle('active', LCAMemoryStorage.getItem('musicEnabled') === 'true');
  document.getElementById('soundToggle').classList.toggle('active', LCAMemoryStorage.getItem('soundEnabled') === 'true');
  document.getElementById('volumeSlider').value = LCAMemoryStorage.getItem('volume');
  document.getElementById('languageSelect').value = LCAMemoryStorage.getItem('language');
  const currentName = LCAMemoryStorage.getItem('userName');
  const currentAvatar = LCAMemoryStorage.getItem('currentAvatar') || LCAMemoryStorage.getItem('userAvatar');
  document.getElementById('currentUserName').innerText = currentName;
  document.getElementById('currentAvatar').innerText = currentAvatar;
  document.getElementById('currentAvatarMini').innerText = currentAvatar;
  LCAMemoryStorage.setItem('userAvatar', currentAvatar);
  document.body.style.filter = darkMode ? 'none' : 'saturate(.92) brightness(1.05)';
}

function showNameModal() {
  document.getElementById('newNameInput').value = LCAMemoryStorage.getItem('userName');
  document.getElementById('nameModal').style.display = 'flex';
}
function saveName() {
  const value = document.getElementById('newNameInput').value.trim();
  if (!value || value.length > 20) { showNotification('Введіть ім\'я від 1 до 20 символів'); return; }
  LCAMemoryStorage.setItem('userName', value);
  document.getElementById('nameModal').style.display = 'none';
  applySettings();
  showNotification('Ім\'я оновлено');
}
function showAvatarModal() { document.getElementById('avatarModal').style.display = 'flex'; }
function selectAvatar(avatar) {
  LCAMemoryStorage.setItem('userAvatar', avatar);
  LCAMemoryStorage.setItem('currentAvatar', avatar);
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
  LCAMemoryStorage.setItem('darkMode', 'true');
  LCAMemoryStorage.setItem('notifications', 'true');
  LCAMemoryStorage.setItem('musicEnabled', 'true');
  LCAMemoryStorage.setItem('soundEnabled', 'true');
  LCAMemoryStorage.setItem('volume', '70');
  LCAMemoryStorage.setItem('language', 'uk');
  applySettings();
  showNotification('Налаштування скинуто');
}
function clearCache() {
  LCAMemoryStorage.clear();
  initSettings();
  applySettings();
  showNotification('Кеш очищено');
}
function logout() { LCAMemoryStorage.removeItem('user'); window.location.href = '../login.html'; }
function setupToggles() {
  document.getElementById('darkModeItem').onclick = () => { LCAMemoryStorage.setItem('darkMode', String(!(LCAMemoryStorage.getItem('darkMode') === 'true'))); applySettings(); showNotification('Тему оновлено'); };
  document.getElementById('notificationsItem').onclick = () => { const next = !(LCAMemoryStorage.getItem('notifications') === 'true'); LCAMemoryStorage.setItem('notifications', String(next)); applySettings(); showNotification(next ? 'Сповіщення увімкнено' : 'Сповіщення вимкнено'); };
  document.getElementById('musicItem').onclick = () => { const next = !(LCAMemoryStorage.getItem('musicEnabled') === 'true'); LCAMemoryStorage.setItem('musicEnabled', String(next)); applySettings(); showNotification(next ? 'Музику увімкнено' : 'Музику вимкнено'); };
  document.getElementById('soundItem').onclick = () => { const next = !(LCAMemoryStorage.getItem('soundEnabled') === 'true'); LCAMemoryStorage.setItem('soundEnabled', String(next)); applySettings(); showNotification(next ? 'Звуки увімкнено' : 'Звуки вимкнено'); };
}
function setupOtherSettings() {
  document.getElementById('volumeSlider').oninput = (e) => { LCAMemoryStorage.setItem('volume', e.target.value); };
  document.getElementById('volumeSlider').onchange = () => showNotification('Гучність оновлено');
  document.getElementById('languageSelect').onchange = (e) => { LCAMemoryStorage.setItem('language', e.target.value); showNotification('Мову оновлено'); };
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
