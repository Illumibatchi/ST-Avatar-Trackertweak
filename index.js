// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function updateOrCreateZoomedAvatar(imgSrc) {
    // Check if the zoomed_avatar div already exists
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');

    if (zoomedAvatarDiv) {
        // If it exists, update the image sources
        let zoomedImage = zoomedAvatarDiv.querySelector('.zoomed_avatar_img');
        if (zoomedImage) {
            zoomedImage.setAttribute('src', imgSrc);
            zoomedImage.setAttribute('data-izoomify-url', imgSrc);
        }
        // Also update the 'forchar' and 'id' attributes of the div and control bar
        zoomedAvatarDiv.setAttribute('forchar', imgSrc);
        zoomedAvatarDiv.setAttribute('id', `zoomFor_${imgSrc}`);
        let dragGrabber = zoomedAvatarDiv.querySelector('.drag-grabber');
        if (dragGrabber) {
            dragGrabber.setAttribute('id', `zoomFor_${imgSrc}header`);
        }
    } else {
        // If it doesn't exist, create the HTML structure and append it to the body
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

        // Append the new div to the body
        document.body.appendChild(zoomedAvatarDiv);
    }
}

let zoomedAvatarObserver = null;
// Function to re-add the zoomed_avatar if it gets removed
function ensureZoomedAvatarExists(imgSrc) {
    // Disconnect any existing observer
    if (zoomedAvatarObserver) {
        zoomedAvatarObserver.disconnect();
    }

    // Create a new observer
    zoomedAvatarObserver = new MutationObserver(() => {
        if (!document.querySelector('.zoomed_avatar.draggable')) {
            updateOrCreateZoomedAvatar(imgSrc);
        }
    });

    // Start observing the body for changes
    zoomedAvatarObserver.observe(document.body, { childList: true, subtree: true });
}

function DefaultZoom() {
    // Find the last message in the chat
    const lastMessage = document.querySelector('.last_mes');
    if (!lastMessage) {
        console.error('No last message found.');
        return;
    }

    // Check who submitted the message using the is_user attribute
    const isUser = lastMessage.getAttribute('is_user');
    if (isUser === "true") {
        // Use the user's avatar from the selected container
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
        // Use the character's avatar based on the character name attribute
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
}

// Update event listeners to trigger DefaultZoom, ensuring the zoomed avatar
// always reflects the last submitted message (whether by user or character)
eventSource.on('generation_started', DefaultZoom);
eventSource.on('generation_ended', DefaultZoom);
eventSource.on('chat_id_changed', DefaultZoom);
