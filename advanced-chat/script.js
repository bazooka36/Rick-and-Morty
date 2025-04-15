/**
 * TAMERCHIT CHAT - script.js
 * ВЕРСИЯ СО ВСЕМИ ИСПРАВЛЕНИЯМИ, ВКЛЮЧАЯ СТАТУСЫ СООБЩЕНИЙ (ГАЛОЧКИ)
 */

// --- Пример данных ---
const users = [
    { id: 1, name: "John Doe", username: "johndoe", phone: "+1234567890", avatar: "JD", photo: "https://picsum.photos/seed/johndoe/200/200", lastSeen: "last seen today at 12:30", online: false, bio: "Software developer and coffee enthusiast ☕", sharedMedia: { photos: 12, videos: 3, files: 5, music: 2 } },
    { id: 2, name: "Alice Smith", username: "alicesmith", phone: "+1987654321", avatar: "AS", photo: "https://picsum.photos/seed/alice/200/200", lastSeen: "online", online: true, bio: "Digital marketer and travel lover ✈️", sharedMedia: { photos: 24, videos: 7, files: 3, music: 0 } },
    { id: 3, name: "Bob Johnson", username: "bobjohnson", phone: "+1122334455", avatar: "BJ", photo: null, lastSeen: "last seen yesterday at 18:45", online: false, bio: "Photographer capturing moments 📷", sharedMedia: { photos: 56, videos: 12, files: 2, music: 4 } },
    { id: 4, name: "Emma Wilson", username: "emmawilson", phone: "+5566778899", avatar: "EW", photo: "https://picsum.photos/seed/emma/200/200", lastSeen: "online", online: true, bio: "Music producer and DJ 🎧", sharedMedia: { photos: 8, videos: 4, files: 1, music: 15 } },
    { id: 5, name: "Michael Brown", username: "michaelbrown", phone: "+4433221100", avatar: "MB", photo: null, lastSeen: "last seen 2 hours ago", online: false, bio: "Fitness trainer and nutrition coach 💪", sharedMedia: { photos: 18, videos: 6, files: 4, music: 3 } }
];

// Добавляем начальные статусы к существующим сообщениям "me" для демонстрации
const initialMessages = {
    1: [
        { id: Date.now() - 50000, sender: 1, type: "text", text: "Hey there!", time: "12:30", isMe: false },
        { id: Date.now() - 40000, sender: "me", type: "text", text: "Hi! How are you?", time: "12:32", isMe: true, status: 'read' }, // Пример статуса
        { id: Date.now() - 30000, sender: 1, type: "text", text: "I'm good, thanks for asking. How about you?", time: "12:33", isMe: false },
        { id: Date.now() - 20000, sender: "me", type: "text", text: "Doing well! Just working on this new project.", time: "12:35", isMe: true, status: 'delivered' }, // Пример статуса
        { id: Date.now() - 10000, sender: 1, type: "text", text: "That sounds interesting. What's it about?", time: "12:36", isMe: false }
    ],
    2: [
        { id: Date.now() - 60000, sender: 2, type: "text", text: "Hello!", time: "10:15", isMe: false },
        { id: Date.now() - 55000, sender: "me", type: "text", text: "Hi! Are we still meeting tomorrow?", time: "10:20", isMe: true, status: 'read' },
        { id: Date.now() - 50000, sender: 2, type: "text", text: "Yes, at 2pm at the coffee shop", time: "10:21", isMe: false }
    ],
    3: [
        { id: Date.now() - 70000, sender: 3, type: "text", text: "Did you see the game last night?", time: "09:00", isMe: false },
        { id: Date.now() - 65000, sender: "me", type: "text", text: "No, I missed it. What happened?", time: "09:05", isMe: true, status: 'sent' }, // Пример статуса
        { id: Date.now() - 60000, sender: 3, type: "photo", content: "https://picsum.photos/300/200?random=1", time: "09:06", isMe: false }
    ],
    4: [
        { id: Date.now() - 80000, sender: 4, type: "text", text: "Can you send me those files we discussed?", time: "14:10", isMe: false },
        { id: Date.now() - 75000, sender: "me", type: "file", content: "#", filename: "Project_Plan.pdf", filesize: "2.4 MB", time: "14:15", isMe: true, status: 'read' }
    ],
    5: [
        { id: Date.now() - 90000, sender: 5, type: "text", text: "Thanks for your help yesterday!", time: "08:30", isMe: false },
        { id: Date.now() - 85000, sender: "me", type: "text", text: "No problem at all!", time: "08:35", isMe: true, status: 'read' },
        { id: Date.now() - 80000, sender: 5, type: "music", content: "#", title: "Summer Vibes", artist: "Chill Band", duration: "3:45", time: "08:36", isMe: false }
    ]
};
// Используем копию для работы, чтобы не менять исходные данные напрямую при перезагрузке (если не используем localStorage)
const messages = JSON.parse(JSON.stringify(initialMessages));

// --- Состояние приложения ---
let currentUser = null;
let currentChat = null; // ID собеседника
let isRecording = false;
let isCalling = false;
let isVideoCall = false;
let mediaRecorder;
let audioChunks = [];
let callInterval;
let callDuration = 0;
let currentFileUpload = null;
let currentCallStream = null;

// --- DOM Элементы ---
const appContainer = document.getElementById('app-container');
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const contactsList = document.getElementById('contacts-list');
const chatView = document.getElementById('chat-view');
const chatHeader = document.getElementById('chat-header');
const contactAvatar = document.getElementById('contact-avatar');
const contactName = document.getElementById('contact-name');
const contactStatus = document.getElementById('contact-status');
const messagesContainer = document.getElementById('messages-container');
const messageInputArea = document.getElementById('message-input-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const voiceMessageBtn = document.getElementById('voice-message-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const newChatModal = document.getElementById('new-chat-modal');
const closeNewChat = document.getElementById('close-new-chat');
const searchUserInput = document.getElementById('search-user-input');
const searchResults = document.getElementById('search-results');
const voiceRecorderIndicator = document.getElementById('voice-recorder');
const stopRecordingBtn = document.getElementById('stop-recording');
const voiceCallBtn = document.getElementById('voice-call-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const callInterface = document.getElementById('call-interface');
const voiceCallInfo = document.getElementById('voice-call-info');
const voiceCallAvatar = document.getElementById('voice-call-avatar');
const voiceCallName = document.getElementById('voice-call-name');
const endCallBtn = document.getElementById('end-call');
const muteCallBtn = document.getElementById('mute-call');
const videoToggleBtn = document.getElementById('video-toggle');
const switchCameraBtn = document.getElementById('switch-camera');
const callStatusEl = document.getElementById('call-status');
const remoteVideoEl = document.getElementById('remote-video');
const localVideoEl = document.getElementById('local-video');
const burgerMenuBtn = document.getElementById('burger-menu-btn');
const settingsMenu = document.getElementById('settings-menu');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const profilePreview = document.getElementById('profile-preview');
const profileInitials = document.getElementById('profile-initials');
const profilePhotoInput = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profilePhone = document.getElementById('profile-phone');
const logoutBtn = document.getElementById('logout-btn');
const registerAvatarPreview = document.getElementById('register-avatar-preview');
const registerAvatarInitials = document.getElementById('register-avatar-initials');
const registerAvatarInput = document.getElementById('register-avatar-input');
const registerNameInput = document.getElementById('register-name');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const closeEditProfile = document.getElementById('close-edit-profile');
const cancelEditProfile = document.getElementById('cancel-edit-profile');
const saveProfileBtn = document.getElementById('save-profile');
const editProfilePreview = document.getElementById('edit-profile-preview');
const editProfileInitials = document.getElementById('edit-profile-initials');
const editProfilePhotoInput = document.getElementById('edit-profile-photo');
const editNameInput = document.getElementById('edit-name');
const editUsernameInput = document.getElementById('edit-username');
const editBioInput = document.getElementById('edit-bio');
const attachBtn = document.getElementById('attach-btn');
const attachMenu = document.getElementById('attach-menu');
const sendPhotoBtn = document.getElementById('send-photo-btn');
const sendFileBtn = document.getElementById('send-file-btn');
const sendMusicBtn = document.getElementById('send-music-btn');
const filePreviewContainer = document.getElementById('file-preview-container');
const filePreviewContent = document.getElementById('file-preview-content');
const cancelFileUploadBtn = document.getElementById('cancel-file-upload');
const sendFileConfirmBtn = document.getElementById('send-file-confirm');
const userDetailsModal = document.getElementById('user-details-modal');
const closeUserDetailsBtn = document.getElementById('close-user-details');
const photoInput = document.getElementById('photo-input');
const fileInput = document.getElementById('file-input');
const musicInput = document.getElementById('music-input');

// --- Обработчики событий ---

// Вкладки Авторизации
loginTab.addEventListener('click', () => switchTab('login'));
registerTab.addEventListener('click', () => switchTab('register'));

function switchTab(tabName) {
    // ... (код переключения вкладок без изменений) ...
     if (tabName === 'login') {
        loginTab.classList.add('text-blue-600', 'dark:text-blue-400', 'border-blue-500', 'dark:border-blue-400');
        loginTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        registerTab.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        registerTab.classList.remove('text-blue-600', 'dark:text-blue-400', 'border-blue-500', 'dark:border-blue-400');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('text-blue-600', 'dark:text-blue-400', 'border-blue-500', 'dark:border-blue-400');
        registerTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        loginTab.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        loginTab.classList.remove('text-blue-600', 'dark:text-blue-400', 'border-blue-500', 'dark:border-blue-400');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

// Логин
loginForm.addEventListener('submit', (e) => {
    // ... (код логина без изменений) ...
     e.preventDefault();
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    if (phone && password) {
        let foundUser = users.find(u => u.phone === phone);
        if (!foundUser) {
             console.warn("Login simulation: User not found by phone, creating default user.");
             foundUser = { id: "me", name: "Demo User", username: "demouser", phone: phone, avatar: "DU", photo: null, bio: "Just logged in!" };
        } else {
             foundUser = {...foundUser, id: "me"};
        }
        currentUser = foundUser;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadContacts();
        updateProfileInfo();
        messageInput.value = '';
        chatView.classList.add('hidden');
        console.log("Login successful:", currentUser.name);
    } else {
        alert("Please enter phone number and password.");
    }
});

// Регистрация
registerForm.addEventListener('submit', (e) => {
    // ... (код регистрации без изменений) ...
     e.preventDefault();
    const name = registerNameInput.value.trim();
    const username = document.getElementById('register-username').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value; // Keep password as is
    const bio = document.getElementById('register-bio').value.trim();
    const avatarFile = registerAvatarInput.files[0]; // Get the selected file
    if (name && username && phone && password) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const photoDataUrl = event.target.result;
            currentUser = {
                id: "me",
                name: name,
                username: username,
                phone: phone,
                avatar: name.split(' ').map(n => n[0]).join('').toUpperCase() || '?',
                photo: photoDataUrl,
                bio: bio || "Just joined!",
                sharedMedia: { photos: 0, videos: 0, files: 0, music: 0 }
            };
             if (!users.some(u => u.username === username || u.phone === phone)) {
                 users.push({...currentUser, id: Date.now() });
             }
            console.log("Registration successful:", currentUser.name);
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loadContacts();
            updateProfileInfo();
            messageInput.value = '';
            chatView.classList.add('hidden');
        };
        if (avatarFile && avatarFile.type.startsWith('image/')) {
            reader.readAsDataURL(avatarFile);
        } else {
            reader.onload({ target: { result: null } });
        }
    } else {
        alert("Please fill in all required fields (*).");
    }
});

// Модалка Нового чата
newChatBtn.addEventListener('click', () => {
    // ... (код открытия модалки нового чата без изменений) ...
    searchUserInput.value = '';
    searchResults.innerHTML = '<div class="p-4 text-center text-gray-500 dark:text-gray-400">Search for users to start chatting.</div>';
    newChatModal.classList.remove('hidden');
    searchUserInput.focus();
});
closeNewChat.addEventListener('click', () => {
    newChatModal.classList.add('hidden');
});

// Поиск пользователя для Нового чата
searchUserInput.addEventListener('input', (e) => {
    // ... (код поиска без изменений) ...
     const query = e.target.value.toLowerCase().trim();
    if (query.length > 0 && currentUser) {
        const results = users.filter(user =>
            user.id !== currentUser.id &&
            (user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query))
        );
        displaySearchResults(results);
    } else {
        searchResults.innerHTML = '<div class="p-4 text-center text-gray-500 dark:text-gray-400">Search for users to start chatting.</div>';
    }
});

// Ввод и Отправка Сообщения
messageInput.addEventListener('input', toggleSendOrMic);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
sendBtn.addEventListener('click', sendMessage);

function toggleSendOrMic() {
    if (messageInput.value.trim().length > 0) {
        sendBtn.classList.remove('hidden');
        voiceMessageBtn.classList.add('hidden');
    } else {
        sendBtn.classList.add('hidden');
        voiceMessageBtn.classList.remove('hidden');
    }
}


// Запись Голосового Сообщения
voiceMessageBtn.addEventListener('mousedown', startRecording);
voiceMessageBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
document.addEventListener('mouseup', stopRecordingVoice);
document.addEventListener('touchend', stopRecordingVoice);
stopRecordingBtn.addEventListener('click', stopRecordingVoice);


// Голосовые/Видео Звонки
voiceCallBtn.addEventListener('click', () => startCall(false));
videoCallBtn.addEventListener('click', () => startCall(true));
endCallBtn.addEventListener('click', endCurrentCall);
muteCallBtn.addEventListener('click', toggleMute);
videoToggleBtn.addEventListener('click', toggleVideo);
switchCameraBtn.addEventListener('click', switchCameraFn);


// Меню Настроек
burgerMenuBtn.addEventListener('click', () => { settingsMenu.classList.add('open'); });
closeSettingsBtn.addEventListener('click', () => { settingsMenu.classList.remove('open'); });

// Выход
logoutBtn.addEventListener('click', () => {
    // ... (код выхода без изменений) ...
     currentUser = null;
    currentChat = null;
    if (isCalling) { endCurrentCall(); }
    if (isRecording) { stopRecordingVoice(true); }
    appContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    chatView.classList.add('hidden');
    settingsMenu.classList.remove('open');
    contactsList.innerHTML = '';
    messagesContainer.innerHTML = '';
    loginForm.reset();
    registerForm.reset();
    registerAvatarPreview.style.backgroundImage = 'none';
    registerAvatarInitials.textContent = '?';
    document.getElementById('login-phone').value = '';
    document.getElementById('login-password').value = '';
    console.log("Logged out.");
});


// Загрузка Фото Профиля (Настройки)
profilePhotoInput.addEventListener('change', (e) => {
    handlePhotoSelection(e, profilePreview, profileInitials, (imageUrl) => {
        console.log("Profile photo preview updated.");
    });
});

// Загрузка Аватара (Регистрация)
registerAvatarInput.addEventListener('change', (e) => {
    handlePhotoSelection(e, registerAvatarPreview, registerAvatarInitials, (imageUrl) => {
        console.log("Registration avatar preview updated.");
    });
});

// Хелпер для Выбора Фото и Превью
function handlePhotoSelection(event, previewElement, initialsElement, callback) {
    // ... (код хелпера без изменений) ...
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            if (previewElement) {
                previewElement.style.backgroundImage = `url(${imageUrl})`;
            }
            if (initialsElement) {
                initialsElement.textContent = '';
            }
            if (callback) callback(imageUrl);
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert("Please select a valid image file.");
        event.target.value = '';
    }
}


// Модалка Редактирования Профиля
editProfileBtn.addEventListener('click', () => {
    // ... (код открытия модалки редактирования без изменений) ...
     if (!currentUser) return;
    editNameInput.value = currentUser.name;
    editUsernameInput.value = currentUser.username;
    editBioInput.value = currentUser.bio || '';
    editProfileInitials.textContent = '';
    editProfilePreview.style.backgroundImage = 'none';
    if (currentUser.photo) {
        editProfilePreview.style.backgroundImage = `url(${currentUser.photo})`;
    } else {
        editProfileInitials.textContent = currentUser.avatar;
    }
    editProfilePhotoInput.value = '';
    editProfileModal.classList.remove('hidden');
    settingsMenu.classList.remove('open');
});
closeEditProfile.addEventListener('click', () => editProfileModal.classList.add('hidden'));
cancelEditProfile.addEventListener('click', () => editProfileModal.classList.add('hidden'));

// Сохранение Изменений Профиля
saveProfileBtn.addEventListener('click', () => {
    // ... (код сохранения профиля без изменений) ...
    if (!currentUser) return;
    const newName = editNameInput.value.trim();
    const newUsername = editUsernameInput.value.trim();
    const newBio = editBioInput.value.trim();
    if (!newName || !newUsername) {
        alert("Name and Username cannot be empty.");
        return;
    }
    currentUser.name = newName;
    currentUser.username = newUsername;
    currentUser.bio = newBio;
    currentUser.avatar = newName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const file = editProfilePhotoInput.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentUser.photo = event.target.result;
            updateProfileInfo();
            editProfileModal.classList.add('hidden');
            console.log("Profile updated with new photo.");
        };
        reader.readAsDataURL(file);
    } else {
        updateProfileInfo();
        editProfileModal.classList.add('hidden');
        console.log("Profile updated (no photo change).");
    }
});

// Превью при Редактировании Фото Профиля
editProfilePhotoInput.addEventListener('change', (e) => {
    handlePhotoSelection(e, editProfilePreview, editProfileInitials);
});


// Меню Вложений
attachBtn.addEventListener('click', (e) => { /* ... */ e.stopPropagation(); attachMenu.classList.toggle('hidden'); });
document.addEventListener('click', (e) => { if (!attachBtn.contains(e.target) && !attachMenu.contains(e.target)) { attachMenu.classList.add('hidden'); }});
sendPhotoBtn.addEventListener('click', () => { photoInput.click(); attachMenu.classList.add('hidden'); });
sendFileBtn.addEventListener('click', () => { fileInput.click(); attachMenu.classList.add('hidden'); });
sendMusicBtn.addEventListener('click', () => { musicInput.click(); attachMenu.classList.add('hidden'); });


// Обработка Выбора Файлов для Отправки
photoInput.addEventListener('change', (e) => handleAttachmentSelection(e, 'photo'));
fileInput.addEventListener('change', (e) => handleAttachmentSelection(e, 'file'));
musicInput.addEventListener('change', (e) => handleAttachmentSelection(e, 'music'));

function handleAttachmentSelection(event, type) {
    // ... (код выбора вложения без изменений) ...
    const file = event.target.files[0];
    if (!file) return;
    if (type === 'photo' && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please select an image or video file.');
        event.target.value = ''; return;
    }
    if (type === 'music' && !file.type.startsWith('audio/')) {
        alert('Please select an audio file.');
        event.target.value = ''; return;
    }
    currentFileUpload = { type: type, file: file };
    filePreviewContent.innerHTML = '';
    let previewElement;
    if (type === 'photo') {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement = document.createElement('img');
                previewElement.src = e.target.result;
                previewElement.classList.add('max-w-xs', 'max-h-32', 'object-contain', 'rounded', 'file-preview');
                filePreviewContent.appendChild(previewElement);
            };
            reader.readAsDataURL(file);
        } else {
            previewElement = createGenericFilePreview(file, 'fa-video', 'text-purple-500');
             filePreviewContent.appendChild(previewElement);
        }
    } else if (type === 'file') {
        previewElement = createGenericFilePreview(file, 'fa-file', 'text-blue-500');
         filePreviewContent.appendChild(previewElement);
    } else if (type === 'music') {
        previewElement = createGenericFilePreview(file, 'fa-music', 'text-red-500');
         filePreviewContent.appendChild(previewElement);
    }
    filePreviewContainer.classList.remove('hidden');
    messageInputArea.classList.add('hidden');
    event.target.value = '';
}

function createGenericFilePreview(file, iconClass, iconColor) {
    // ... (код создания превью файла без изменений) ...
     const previewDiv = document.createElement('div');
    previewDiv.classList.add('flex', 'items-center', 'p-2', 'gap-2', 'file-preview');
    previewDiv.innerHTML = `
        <i class="fas ${iconClass} ${iconColor} fa-lg fa-fw"></i>
        <div class="flex flex-col text-sm overflow-hidden">
            <div class="font-semibold truncate max-w-[200px] dark:text-gray-200">${file.name}</div>
            <div class="text-gray-600 dark:text-gray-400">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
    `;
    return previewDiv;
}

// Кнопки в Превью Загрузки Файла
cancelFileUploadBtn.addEventListener('click', () => {
    filePreviewContainer.classList.add('hidden');
    messageInputArea.classList.remove('hidden');
    currentFileUpload = null;
});

// --- ИСПРАВЛЕННАЯ Отправка Файла ---
sendFileConfirmBtn.addEventListener('click', () => {
    if (currentFileUpload && currentChat) {
        const objectURL = URL.createObjectURL(currentFileUpload.file);

        const message = {
            id: Date.now(),
            sender: "me",
            type: currentFileUpload.type,
            content: objectURL,
            filename: currentFileUpload.file.name,
            filesize: `${(currentFileUpload.file.size / 1024 / 1024).toFixed(2)} MB`,
            title: currentFileUpload.type === 'music' ? currentFileUpload.file.name : undefined,
            artist: currentFileUpload.type === 'music' ? 'Unknown Artist' : undefined,
            duration: currentFileUpload.type === 'music' ? '?:??' : undefined,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: 'sent' // <-- ДОБАВЛЕН СТАТУС
        };

        addAndSaveMessage(message);
        simulateStatusUpdate(message.id, currentChat); // <-- ДОБАВЛЕН ВЫЗОВ СИМУЛЯЦИИ

        // Reset UI
        filePreviewContainer.classList.add('hidden');
        messageInputArea.classList.remove('hidden');
        currentFileUpload = null;

    } else if (!currentChat) {
        alert("Please select a chat to send the file.");
    }
});

// Модалка Деталей Пользователя
closeUserDetailsBtn.addEventListener('click', () => {
    userDetailsModal.classList.add('hidden');
});


// --- Основные Функции ---

// Загрузка Списка Контактов
function loadContacts() {
    // ... (код загрузки контактов без изменений) ...
    contactsList.innerHTML = '';
    if (!currentUser) return;
    const sortedUsers = [...users].sort((a, b) => {
        if (a.id === 'me') return 1;
        if (b.id === 'me') return -1;
        return a.name.localeCompare(b.name);
    });
    sortedUsers.forEach(user => {
        if (user.id === currentUser.id) return;
        const contactDiv = document.createElement('div');
        contactDiv.classList.add('flex', 'items-center', 'p-3', 'cursor-pointer', 'hover:bg-gray-100', 'dark:hover:bg-gray-700', 'transition-colors', 'duration-150', 'sidebar-hideable');
        contactDiv.dataset.userId = user.id;
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('w-10', 'h-10', 'rounded-full', 'bg-blue-500', 'flex', 'items-center', 'justify-center', 'text-white', 'font-bold', 'mr-3', 'flex-shrink-0', 'sidebar-icon-center');
        if (user.photo) {
            avatarDiv.style.backgroundImage = `url(${user.photo})`;
            avatarDiv.style.backgroundSize = 'cover';
            avatarDiv.style.backgroundPosition = 'center';
            avatarDiv.textContent = '';
        } else {
            avatarDiv.textContent = user.avatar || '?';
        }
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('flex-grow', 'overflow-hidden', 'sidebar-hideable');
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('font-semibold', 'text-gray-800', 'dark:text-gray-200', 'truncate');
        nameDiv.textContent = user.name;
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('text-xs', 'text-gray-500', 'dark:text-gray-400', 'truncate');
        statusDiv.textContent = user.online ? 'online' : user.lastSeen;
        if (user.online) {
            statusDiv.classList.add('text-blue-500', 'dark:text-blue-400');
        }
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(statusDiv);
        contactDiv.appendChild(avatarDiv);
        contactDiv.appendChild(infoDiv);
        contactDiv.addEventListener('click', () => {
            selectChat(user.id);
        });
        contactsList.appendChild(contactDiv);
    });
}

// Выбор чата
function selectChat(userId) {
    // ... (код выбора чата без изменений) ...
     if (currentChat === userId) return;
     currentChat = userId;
     document.querySelectorAll('#contacts-list > div').forEach(el => {
         if (el.dataset.userId == userId) {
             el.classList.add('bg-gray-200', 'dark:bg-gray-600');
         } else {
             el.classList.remove('bg-gray-200', 'dark:bg-gray-600');
         }
     });
     chatView.classList.remove('hidden');
     loadMessages(userId);
     updateChatHeader(userId);
     messageInput.value = '';
     toggleSendOrMic();
     messageInput.focus();
}


// Загрузка сообщений для чата
function loadMessages(chatId) {
    messagesContainer.innerHTML = '';
    const chatMessages = messages[chatId] || [];
    if (chatMessages.length === 0) {
        messagesContainer.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 py-10 px-4">No messages yet. Say hello!</div>`;
    } else {
        chatMessages.forEach(msg => addMessage(msg, false)); // Используем существующий статус при загрузке
         messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// --- ИСПРАВЛЕННАЯ Функция добавления сообщения в DOM ---
function addMessage(message, animate = true) {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper', 'flex', message.isMe ? 'justify-end' : 'justify-start');
    messageWrapper.dataset.messageId = message.id; // <-- ДОБАВЛЕН ID

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-content', 'py-2', 'px-3', 'rounded-lg', 'max-w-xs', 'md:max-w-md', 'lg:max-w-lg', 'relative', 'mb-1');

    // Установка фона
    if (message.isMe) {
        messageDiv.classList.add('bg-blue-500', 'dark:bg-blue-600', 'text-white');
    } else {
        messageDiv.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
    }
    // Убираем паддинг для медиа
    if (['photo', 'video'].includes(message.type)) {
         messageDiv.classList.add('media-message');
         messageDiv.classList.remove('p-3', 'py-2', 'px-3');
    }

    // Отрисовка контента сообщения
    switch (message.type) {
        case 'text':
            messageDiv.textContent = message.text; // Используем textContent
            break;
        case 'photo':
            const img = document.createElement('img');
            img.src = message.content;
            img.alt = "Photo";
            img.classList.add('media-preview', 'cursor-pointer');
            img.onload = () => scrollToBottomIfNeeded(animate);
            messageDiv.appendChild(img);
            break;
        case 'video':
             const vid = document.createElement('video');
             vid.src = message.content;
             vid.controls = true;
             vid.classList.add('media-preview');
             vid.onloadeddata = () => scrollToBottomIfNeeded(animate);
             messageDiv.appendChild(vid);
             break;
        case 'file':
            messageDiv.classList.add('flex', 'items-center', 'gap-2', 'cursor-pointer');
            messageDiv.innerHTML = `
                <i class="fas fa-file fa-lg fa-fw flex-shrink-0 ${message.isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}"></i>
                <div class="flex flex-col text-sm overflow-hidden"> <div class="font-semibold truncate">${message.filename}</div> <div class="${message.isMe ? 'text-blue-200' : 'text-gray-600 dark:text-gray-400'}">${message.filesize}</div> </div>`;
            break;
        case 'music':
            messageDiv.classList.add('flex', 'items-center', 'gap-2', 'cursor-pointer');
            messageDiv.innerHTML = `
                <i class="fas fa-music fa-lg fa-fw flex-shrink-0 ${message.isMe ? 'text-blue-100' : 'text-blue-500 dark:text-blue-400'}"></i>
                <div class="flex flex-col text-sm overflow-hidden"> <div class="font-semibold truncate">${message.title || message.filename}</div> <div class="${message.isMe ? 'text-blue-200' : 'text-gray-600 dark:text-gray-400'}"> ${message.artist || ''} ${message.artist && message.duration ? ' - ' : ''} ${message.duration || message.filesize} </div> </div>`;
            break;
        case 'voice':
            messageDiv.classList.add('flex', 'items-center', 'gap-2');
            const audio = document.createElement('audio');
            audio.src = message.content;
            audio.controls = true;
            audio.classList.add('w-full', 'h-8');
            messageDiv.appendChild(audio);
            messageDiv.classList.remove('p-3', 'py-2', 'px-3');
            messageDiv.classList.add('py-1', 'px-2');
            break;
        default:
            messageDiv.textContent = `Unsupported type: ${message.type}`;
    }

    // --- НАЧАЛО ИСПРАВЛЕННОГО БЛОКА ВРЕМЕНИ/СТАТУСА ---
    const timeStatusWrapper = document.createElement('div');
    timeStatusWrapper.classList.add('time-status-wrapper'); // Используем класс из CSS

    const timeSpan = document.createElement('span'); // Используем span для времени
    timeSpan.textContent = message.time;
    timeStatusWrapper.appendChild(timeSpan); // Добавляем время в контейнер

    // Добавляем галочки ТОЛЬКО для своих сообщений (isMe)
    if (message.isMe) {
        const statusSpan = document.createElement('span');
        statusSpan.classList.add('message-status-ticks');
        statusSpan.dataset.messageId = message.id; // Добавляем ID и сюда для удобства
        // Устанавливаем НАЧАЛЬНЫЙ статус при добавлении сообщения
        updateTicks(statusSpan, message.status || 'sent'); // Используем статус из сообщения или 'sent' по умолчанию
        timeStatusWrapper.appendChild(statusSpan); // Добавляем галочки в контейнер
    }

    messageDiv.appendChild(timeStatusWrapper); // Добавляем контейнер времени/статуса в блок сообщения
    // --- КОНЕЦ ИСПРАВЛЕННОГО БЛОКА ВРЕМЕНИ/СТАТУСА ---

    messageWrapper.appendChild(messageDiv);
    messagesContainer.appendChild(messageWrapper);

    scrollToBottomIfNeeded(animate);
}


// Хелпер для прокрутки вниз
function scrollToBottomIfNeeded(smooth = true) {
    // ... (код прокрутки без изменений) ...
    const scrollOptions = { top: messagesContainer.scrollHeight };
     if (smooth) {
         scrollOptions.behavior = 'smooth';
     }
     messagesContainer.scrollTo(scrollOptions);
}

// --- ИСПРАВЛЕННАЯ Отправка текстового сообщения ---
function sendMessage() {
    const text = messageInput.value.trim();
    if (text && currentChat) {
        const message = {
            id: Date.now(),
            sender: "me",
            type: "text",
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: 'sent' // <-- ДОБАВЛЕН СТАТУС
        };
        addAndSaveMessage(message);
        simulateStatusUpdate(message.id, currentChat); // <-- ДОБАВЛЕН ВЫЗОВ СИМУЛЯЦИИ
        messageInput.value = ''; // Очистка
        toggleSendOrMic(); // Переключить кнопку
        messageInput.focus();
    }
}

// Добавление сообщения в DOM и сохранение
function addAndSaveMessage(message) {
    // ... (код без изменений) ...
     if (!currentChat) return;
    addMessage(message);
    if (!messages[currentChat]) {
        messages[currentChat] = [];
    }
    messages[currentChat].push(message);
}


// Обновление Шапки Чата
function updateChatHeader(userId) {
    // ... (Код для обновления шапки и добавления обработчика для модалки деталей пользователя - БЕЗ ИЗМЕНЕНИЙ по сравнению с последней версией) ...
    const chatUser = users.find(u => u.id === userId);
    if (chatUser) {
        const avatarElement = document.getElementById('contact-avatar');
        const nameElement = document.getElementById('contact-name');
        const statusElement = document.getElementById('contact-status');
        nameElement.textContent = chatUser.name;
        statusElement.textContent = chatUser.online ? 'online' : chatUser.lastSeen;
        statusElement.classList.toggle('text-blue-500', chatUser.online);
        statusElement.classList.toggle('dark:text-blue-400', chatUser.online);
        avatarElement.innerHTML = '';
        avatarElement.style.backgroundImage = 'none';
        avatarElement.classList.remove('bg-blue-500');
        if (chatUser.photo) {
            avatarElement.style.backgroundImage = `url(${chatUser.photo})`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
        } else {
            avatarElement.textContent = chatUser.avatar || '?';
             avatarElement.classList.add('bg-blue-500');
        }

        const avatarClickHandler = () => {
            const modal = document.getElementById('user-details-modal');
            const modalAvatarEl = document.getElementById('user-details-avatar');
            const modalNameEl = document.getElementById('user-details-name');
            const modalUsernameEl = document.getElementById('user-details-username');
            const modalPhoneEl = document.getElementById('user-details-phone');
            const modalBioEl = document.getElementById('user-details-bio');
            const photosCountEl = document.getElementById('shared-photos-count');
            const videosCountEl = document.getElementById('shared-videos-count');
            const filesCountEl = document.getElementById('shared-files-count');
            const musicCountEl = document.getElementById('shared-music-count');

             if (!chatUser) { console.error("Chat user data is missing for modal."); return; }

            modalNameEl.textContent = chatUser.name || 'Unknown Name';
            modalUsernameEl.textContent = chatUser.username ? `@${chatUser.username}` : 'No username';
            modalPhoneEl.textContent = chatUser.phone || 'No phone number';
            modalBioEl.textContent = chatUser.bio || 'No bio available.';
            modalAvatarEl.innerHTML = '';
            modalAvatarEl.style.backgroundImage = 'none';
            modalAvatarEl.classList.remove('bg-blue-500', 'bg-gray-300', 'dark:bg-gray-600');
            const userForPhoto = users.find(u => u.id === chatUser.id);
            const photoUrl = userForPhoto?.photo;
            if (photoUrl) {
                modalAvatarEl.style.backgroundImage = `url(${photoUrl})`;
                modalAvatarEl.style.backgroundSize = 'cover';
                modalAvatarEl.style.backgroundPosition = 'center';
            } else {
                modalAvatarEl.textContent = chatUser.avatar || '?';
                modalAvatarEl.classList.add('bg-blue-500');
            }
            const media = userForPhoto?.sharedMedia;
            if (media) {
                if (photosCountEl) photosCountEl.textContent = media.photos || 0;
                if (videosCountEl) videosCountEl.textContent = media.videos || 0;
                if (filesCountEl) filesCountEl.textContent = media.files || 0;
                if (musicCountEl) musicCountEl.textContent = media.music || 0;
            } else {
                if (photosCountEl) photosCountEl.textContent = 0;
                if (videosCountEl) videosCountEl.textContent = 0;
                if (filesCountEl) filesCountEl.textContent = 0;
                if (musicCountEl) musicCountEl.textContent = 0;
            }
            modal.classList.remove('hidden');
        };

        if (avatarElement._clickHandler) {
             avatarElement.removeEventListener('click', avatarElement._clickHandler);
        }
         avatarElement.addEventListener('click', avatarClickHandler);
         avatarElement._clickHandler = avatarClickHandler;

        chatHeader.classList.remove('hidden');
    } else {
        chatHeader.classList.add('hidden');
    }
}


// Обновление Информации Профиля в Настройках
function updateProfileInfo() {
    // ... (код без изменений) ...
    if (!currentUser) return;
    profileName.textContent = currentUser.name;
    profilePhone.textContent = currentUser.phone;
    profileInitials.textContent = '';
    profilePreview.style.backgroundImage = 'none';
    if (currentUser.photo) {
        profilePreview.style.backgroundImage = `url(${currentUser.photo})`;
    } else {
        profileInitials.textContent = currentUser.avatar;
         profilePreview.classList.add('bg-gray-300', 'dark:bg-gray-600');
    }
}

// Запись Голосового Сообщения
function startRecording() { /* ... */ } // Без изменений
function stopRecordingVoice(cancelled = false) { /* ... */ } // Без изменений

// Звонки
function startCall(isVideo) { /* ... */ } // Без изменений
function endCurrentCall() { /* ... */ } // Без изменений
function toggleMute() { /* ... */ } // Без изменений
function toggleVideo() { /* ... */ } // Без изменений
function switchCameraFn() { /* ... */ } // Без изменений

// Отображение Результатов Поиска
function displaySearchResults(results) { /* ... */ } // Без изменений

// --- НОВЫЕ ФУНКЦИИ ДЛЯ СТАТУСОВ --- Добавьте их в конец файла, если их нет

/**
 * Обновляет иконки и цвет галочек статуса.
 */
function updateTicks(statusSpan, status) {
    if (!statusSpan) return;
    let ticksHTML = '';
    let ticksClass = '';
    switch (status) {
        case 'sent':
            ticksHTML = '<i class="fas fa-check"></i>'; // Одна галочка
            ticksClass = 'ticks-sent';
            break;
        case 'delivered':
            ticksHTML = '<i class="fas fa-check-double"></i>'; // Две галочки
            ticksClass = 'ticks-delivered';
            break;
        case 'read':
            ticksHTML = '<i class="fas fa-check-double"></i>'; // Две галочки
            ticksClass = 'ticks-read'; // Другой цвет (белый)
            break;
        default:
            ticksHTML = '';
            ticksClass = '';
    }
    statusSpan.innerHTML = ticksHTML;
    statusSpan.classList.remove('ticks-sent', 'ticks-delivered', 'ticks-read');
    if (ticksClass) {
        statusSpan.classList.add(ticksClass);
    }
}

/**
 * Симулирует обновление статуса сообщения (sent -> delivered -> read).
 */
function simulateStatusUpdate(messageId, chatId) {
    if (!chatId || !messageId) return;
    console.log(`Simulating status for msg ${messageId} in chat ${chatId}`); // Лог для отладки

    // 1. Симуляция доставки
    const deliveryTimeout = setTimeout(() => {
        if (!messages[chatId]) return;
        const msgIndex = messages[chatId]?.findIndex(m => m.id === messageId);

        if (msgIndex > -1 && messages[chatId][msgIndex].status === 'sent') {
            messages[chatId][msgIndex].status = 'delivered';
            const statusSpan = document.querySelector(`.message-status-ticks[data-message-id="${messageId}"]`);
            if (statusSpan) {
                updateTicks(statusSpan, 'delivered');
                console.log(`Message ${messageId} status updated to delivered.`); // Лог
            } else {
                 console.warn(`Status span not found for msg ${messageId} to set delivered.`); // Варнинг, если не нашли
            }

            // 2. Симуляция прочтения
            const readTimeout = setTimeout(() => {
                if (!messages[chatId]) return;
                const currentMsgIndex = messages[chatId]?.findIndex(m => m.id === messageId);

                // Читаем только если статус delivered и ЭТОТ ЖЕ чат открыт
                if (currentMsgIndex > -1 && messages[chatId][currentMsgIndex].status === 'delivered' && currentChat === chatId) {
                     messages[chatId][currentMsgIndex].status = 'read';
                     const currentStatusSpan = document.querySelector(`.message-status-ticks[data-message-id="${messageId}"]`);
                     if (currentStatusSpan) {
                         updateTicks(currentStatusSpan, 'read');
                         console.log(`Message ${messageId} status updated to read.`); // Лог
                     } else {
                          console.warn(`Status span not found for msg ${messageId} to set read.`); // Варнинг
                     }
                } else {
                     // Лог, если не стали обновлять на read
                     // console.log(`Skipped read update for msg ${messageId}. Current status: ${messages[chatId]?.[currentMsgIndex]?.status}, currentChat: ${currentChat}, messageChatId: ${chatId}`);
                }
            }, 3000 + Math.random() * 2000); // 3-5 сек задержка

        } else {
             // Лог, если сообщение не найдено или уже не 'sent'
             // console.log(`Skipped delivery update for msg ${messageId}. Found index: ${msgIndex}, current status: ${messages[chatId]?.[msgIndex]?.status}`);
        }
    }, 1000 + Math.random() * 1000); // 1-2 сек задержка
}


// --- Инициализация приложения ---
function initializeApp() {
    // ... (код инициализации без изменений) ...
     console.log("Initializing App...");
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    chatView.classList.add('hidden');
    settingsMenu.classList.remove('open');
    callInterface.classList.add('hidden');
    userDetailsModal.classList.add('hidden');
    newChatModal.classList.add('hidden');
    filePreviewContainer.classList.add('hidden');
    switchTab('login');
    toggleSendOrMic();
    console.log("App Initialized.");
}

// Запуск инициализации при загрузке скрипта
initializeApp();