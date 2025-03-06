// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function updateOrCreateZoomedAvatar(imgSrc) {
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');
    const charName = imgSrc.startsWith('/characters/') 
        ? imgSrc.split('/').pop().replace('.png', '') 
        : null;

    if (zoomedAvatarDiv) {
        let zoomedImage = zoomedAvatarDiv.querySelector('.zoomed_avatar_img');
        if (zoomedImage) {
            zoomedImage.src = imgSrc;
            zoomedImage.dataset.izoomifyUrl = imgSrc;
        }
        zoomedAvatarDiv.setAttribute('forchar', charName || 'User');
        zoomedAvatarDiv.id = `zoomFor_${charName || 'User'}`;
        
        let dragGrabber = zoomedAvatarDiv.querySelector('.drag-grabber');
        if (dragGrabber) {
            dragGrabber.id = `zoomFor_${charName || 'User'}header`;
        }
    } else {
        zoomedAvatarDiv = document.createElement('div');
        zoomedAvatarDiv.className = 'zoomed_avatar draggable';
        zoomedAvatarDiv.setAttribute('forchar', charName || 'User');
        zoomedAvatarDiv.id = `zoomFor_${charName || 'User'}`;
        zoomedAvatarDiv.style.display = 'flex';

        zoomedAvatarDiv.innerHTML = `
            <div class="panelControlBar flex-container">
                <div class="fa-fw fa-solid fa-grip drag-grabber" id="zoomFor_${charName || 'User'}header"></div>
                <div class="fa-fw fa-solid fa-circle-xmark dragClose" id="closeZoom"></div>
            </div>
            <div class="zoomed_avatar_container">
                <img class="zoomed_avatar_img" src="${imgSrc}" data-izoomify-url="${imgSrc}" data-izoomify-magnify="1.8" data-izoomify-duration="300" alt="">
            </div>
        `;

        document.body.appendChild(zoomedAvatarDiv);
    }
}

let zoomedAvatarObserver = null;
function ensureZoomedAvatarExists(imgSrc) {
    if (zoomedAvatarObserver) zoomedAvatarObserver.disconnect();

    zoomedAvatarObserver = new MutationObserver(() => {
        if (!document.querySelector('.zoomed_avatar.draggable')) {
            updateOrCreateZoomedAvatar(imgSrc);
        }
    });

    zoomedAvatarObserver.observe(document.body, { childList: true, subtree: true });
}

function getLastMessageAvatar() {
    const lastMessage = document.querySelector('.last_mes');
    if (!lastMessage) {
        console.error('No messages found');
        return null;
    }

    const isUser = lastMessage.getAttribute('is_user') === 'true';
    
    if (isUser) {
        const avatarContainer = document.querySelector('.avatar-container.selected');
        const img = avatarContainer?.querySelector('img');
        return img?.src || null;
    }
    
    const charName = lastMessage.getAttribute('ch_name');
    return charName ? `/characters/${charName}.png` : null;
}

function updateZoomFromLastMessage() {
    const imgSrc = getLastMessageAvatar();
    if (!imgSrc) return;

    updateOrCreateZoomedAvatar(imgSrc);
    ensureZoomedAvatarExists(imgSrc);
}

// Update on relevant events
eventSource.on('generation_started', updateZoomFromLastMessage);
eventSource.on('generation_ended', updateZoomFromLastMessage);
eventSource.on('chat_id_changed', updateZoomFromLastMessage);
eventSource.on('message_swiped', updateZoomFromLastMessage);

// Initial update when script loads
updateZoomFromLastMessage();
