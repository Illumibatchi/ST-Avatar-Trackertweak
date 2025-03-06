// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function updateOrCreateZoomedAvatar(imgSrc) {
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');

    if (zoomedAvatarDiv) {
        let zoomedImage = zoomedAvatarDiv.querySelector('.zoomed_avatar_img');
        if (zoomedImage) {
            zoomedImage.setAttribute('src', imgSrc);
            zoomedImage.setAttribute('data-izoomify-url', imgSrc);
        }
        zoomedAvatarDiv.setAttribute('forchar', imgSrc);
        zoomedAvatarDiv.setAttribute('id', `zoomFor_${imgSrc}`);
        let dragGrabber = zoomedAvatarDiv.querySelector('.drag-grabber');
        if (dragGrabber) {
            dragGrabber.setAttribute('id', `zoomFor_${imgSrc}header`);
        }
    } else {
        zoomedAvatarDiv = document.createElement('div');
        zoomedAvatarDiv.className = 'zoomed_avatar draggable';
        zoomedAvatarDiv.setAttribute('forchar', imgSrc);
        zoomedAvatarDiv.setAttribute('id', `zoomFor_${imgSrc}`);
        zoomedAvatarDiv.setAttribute('style', 'display: flex;');

        zoomedAvatarDiv.innerHTML = `
            <div class="panelControlBar flex-container">
                <div class="fa-fw fa-solid fa-grip drag-grabber" id="zoomFor_${imgSrc}header"></div>
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
    if (zoomedAvatarObserver) {
        zoomedAvatarObserver.disconnect();
    }

    zoomedAvatarObserver = new MutationObserver(() => {
        if (!document.querySelector('.zoomed_avatar.draggable')) {
            updateOrCreateZoomedAvatar(imgSrc);
        }
    });

    zoomedAvatarObserver.observe(document.body, { childList: true, subtree: true });
}

function updateAvatar() {
    const lastMessage = document.querySelector('.last_mes');
    if (lastMessage) {
        const isUser = lastMessage.getAttribute('is_user') === "true";
        isUser ? UserZoom() : CharZoom();
    } else {
        UserZoom();
    }
}

function UserZoom() {
    const selectedAvatar = document.querySelector('.avatar-container.selected, #user_avatar');
    const imgElement = selectedAvatar 
        ? selectedAvatar.querySelector('img')
        : document.querySelector('#user_avatar img');
    
    if (imgElement && imgElement.src) {
        const imgSrc = imgElement.src;
        console.log("UserZoom using image:", imgSrc);
        updateOrCreateZoomedAvatar(imgSrc);
        ensureZoomedAvatarExists(imgSrc);
    } else {
        console.log('Using fallback user avatar');
        updateOrCreateZoomedAvatar('/user.png');
    }
}

function CharZoom() {
    const lastCharMsg = document.querySelector('.last_mes[is_user="false"]');
    if (lastCharMsg) {
        const charName = lastCharMsg.getAttribute('ch_name');
        if (charName) {
            const imgSrc = `/characters/${charName}.png`;
            console.log("CharZoom using image:", imgSrc);
            updateOrCreateZoomedAvatar(imgSrc);
            ensureZoomedAvatarExists(imgSrc);
        }
    }
}

// Event handlers
eventSource.on('generation_started', () => {
    console.log("Generation started - showing character avatar");
    CharZoom();
});

eventSource.on('generation_ended', () => {
    console.log("Generation ended - updating avatar");
    updateAvatar();
});

eventSource.on('chat_id_changed', () => {
    console.log("Chat changed - updating avatar");
    updateAvatar();
});

eventSource.on('user_submitted', () => {
    console.log("User submitted event - showing user avatar");
    setTimeout(UserZoom, 100);
});

// Form submission fallback
const chatForm = document.querySelector('#send_form');
if (chatForm) {
    chatForm.addEventListener('submit', () => {
        console.log("Form submitted - showing user avatar");
        setTimeout(UserZoom, 100);
    });
}
