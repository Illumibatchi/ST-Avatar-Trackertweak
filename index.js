// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function updateOrCreateZoomedAvatar(imgSrc) {
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');
    const charName = imgSrc?.startsWith('/characters/') 
        ? imgSrc.split('/').pop().replace('.png', '') 
        : null;

    if (zoomedAvatarDiv) {
        let zoomedImage = zoomedAvatarDiv.querySelector('.zoomed_avatar_img');
        if (zoomedImage && imgSrc) {
            zoomedImage.src = imgSrc;
            zoomedImage.dataset.izoomifyUrl = imgSrc;
        }
        zoomedAvatarDiv.setAttribute('forchar', charName || 'User');
        zoomedAvatarDiv.id = `zoomFor_${charName || 'User'}`;
        
        let dragGrabber = zoomedAvatarDiv.querySelector('.drag-grabber');
        if (dragGrabber) {
            dragGrabber.id = `zoomFor_${charName || 'User'}header`;
        }
    } else if (imgSrc) {
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
        if (!document.querySelector('.zoomed_avatar.draggable') && imgSrc) {
            updateOrCreateZoomedAvatar(imgSrc);
        }
    });

    zoomedAvatarObserver.observe(document.body, { childList: true, subtree: true });
}

function getLastMessageAvatar() {
    const lastMessage = document.querySelector('.last_mes');
    if (!lastMessage) return null;

    // Try to find avatar directly in the message
    const messageAvatar = lastMessage.querySelector('.avatar img');
    if (messageAvatar) {
        return messageAvatar.src;
    }

    const isUser = lastMessage.getAttribute('is_user')
