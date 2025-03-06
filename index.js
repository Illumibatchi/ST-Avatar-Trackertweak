// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function updateOrCreateZoomedAvatar(imgSrc) {
    // Check if the zoomed_avatar div already exists
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');

    if (zoomedAvatarDiv) {
        // Update existing image sources
        let zoomedImage = zoomedAvatarDiv.querySelector('.zoomed_avatar_img');
        if (zoomedImage) {
            zoomedImage.setAttribute('src', imgSrc);
            zoomedImage.setAttribute('data-izoomify-url', imgSrc);
        }
        // Update the 'forchar' and 'id' attributes of the div and control bar
        zoomedAvatarDiv.setAttribute('forchar', imgSrc);
        zoomedAvatarDiv.setAttribute('id', `zoomFor_${imgSrc}`);
        let dragGrabber = zoomedAvatarDiv.querySelector('.drag-grabber');
        if (dragGrabber) {
            dragGrabber.setAttribute('id', `zoomFor_${imgSrc}header`);
        }
    } else {
        // Create the HTML structure if it doesn't exist
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

function getLastMessage() {
    // Get all elements with the 'last_mes' class and choose the final one.
    const messages = document.querySelectorAll('.last_mes');
    return messages.length ? messages[messages.length - 1] : null;
}

function DefaultZoom() {
    // Use a slight delay to ensure the new message has been fully rendered
    setTimeout(() => {
        const lastMessage = getLastMessage();
        if (!lastMessage) {
            console.error('No last message found.');
            return;
        }
    
        const isUser = lastMessage.getAttribute('is_user');
        if (isUser === "true") {
            const selectedAvatar = document.querySelector('.avatar-container.selected');
            if (selectedAvatar) {
                const imgElement = selectedAvatar.querySelector('img');
                if (imgElement) {
                    const imgSrc = imgElement.getAttribute('src');
                    if (imgSrc) {
                        updateOrCreateZoomedAvatar(imgSrc);
                        ensureZoomedAvatarExists(imgSrc);
                    } else {
                        console.error('User avatar image source was null.');
                    }
                } else {
                    console.error('User avatar image element was null.');
                }
            } else {
                console.error('No selected user avatar container found.');
            }
        } else if (isUser === "false") {
            const charName = lastMessage.getAttribute('ch_name');
            if (charName) {
                const imgSrc = `/characters/${charName}.png`;
                try {
                    updateOrCreateZoomedAvatar(imgSrc);
                    ensureZoomedAvatarExists(imgSrc);
                } catch (e) {
                    console.error('Failed to update character Zoomed Avatar image.', e);
                }
            } else {
                console.error('Character Name not Found.');
            }
        } else {
            console.error('Invalid is_user attribute on last message.');
        }
    }, 50); // 50ms delay should suffice; adjust if needed
}

// Use the DefaultZoom function for all relevant events.
eventSource.on('generation_started', DefaultZoom);
eventSource.on('generation_ended', DefaultZoom);
eventSource.on('chat_id_changed', DefaultZoom);
