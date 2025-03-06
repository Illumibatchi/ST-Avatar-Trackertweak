// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function updateOrCreateZoomedAvatar(imgSrc) {
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');
    const charName = imgSrc.split('/').pop().split('.')[0];

    if (zoomedAvatarDiv) {
        zoomedAvatarDiv.querySelector('.zoomed_avatar_img').src = imgSrc;
        zoomedAvatarDiv.setAttribute('forchar', charName);
        return;
    }

    zoomedAvatarDiv = document.createElement('div');
    zoomedAvatarDiv.className = 'zoomed_avatar draggable';
    zoomedAvatarDiv.setAttribute('forchar', charName);
    zoomedAvatarDiv.innerHTML = `
        <div class="panelControlBar flex-container">
            <div class="fa-fw fa-solid fa-grip drag-grabber"></div>
            <div class="fa-fw fa-solid fa-circle-xmark dragClose"></div>
        </div>
        <div class="zoomed_avatar_container">
            <img class="zoomed_avatar_img" src="${imgSrc}" data-izoomify-url="${imgSrc}" data-izoomify-magnify="1.8" data-izoomify-duration="300">
        </div>
    `;
    document.body.appendChild(zoomedAvatarDiv);
}

// Track avatar source and observer
let currentAvatarSource = null;
let zoomedAvatarObserver = null;

function ensureZoomedAvatarExists() {
    if (zoomedAvatarObserver) zoomedAvatarObserver.disconnect();
    
    zoomedAvatarObserver = new MutationObserver(() => {
        if (!document.querySelector('.zoomed_avatar.draggable') && currentAvatarSource) {
            updateOrCreateZoomedAvatar(currentAvatarSource);
        }
    });
    zoomedAvatarObserver.observe(document.body, { childList: true, subtree: true });
}

function getActiveCharacter() {
    // Try group chat selector first
    const groupChar = document.querySelector('.char-button.selected [data-character-name]');
    if (groupChar) return groupChar.getAttribute('data-character-name');
    
    // Try single character chat
    const singleChar = document.querySelector('#char_name');
    if (singleChar) return singleChar.textContent.trim();
    
    // Fallback to last message
    const lastCharMsg = document.querySelector('.last_mes[is_user="false"]');
    return lastCharMsg?.getAttribute('ch_name');
}

function updateAvatar() {
    const activeCharacter = getActiveCharacter();
    const imgSrc = activeCharacter ? `/characters/${activeCharacter}.png` : getSelectedUserAvatar();
    
    if (!imgSrc) return;
    currentAvatarSource = imgSrc;
    updateOrCreateZoomedAvatar(imgSrc);
    ensureZoomedAvatarExists();
}

function getSelectedUserAvatar() {
    return document.querySelector('.avatar-container.selected img')?.src;
}

// Event handlers
eventSource.on('generation_started', () => {
    const character = getActiveCharacter();
    if (character) updateAvatar();
});

eventSource.on(['generation_ended', 'chat_id_changed'], () => {
    const userAvatar = getSelectedUserAvatar();
    if (userAvatar) {
        currentAvatarSource = userAvatar;
        updateOrCreateZoomedAvatar(userAvatar);
    }
});

// Initial setup
document.addEventListener('click', (e) => {
    if (e.target.closest('.char-button')) setTimeout(updateAvatar, 100);
});
