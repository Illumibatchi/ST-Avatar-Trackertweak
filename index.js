// @ts-ignore
const { eventSource } = SillyTavern.getContext();

// 1. CORE FUNCTIONS FIRST
function updateOrCreateZoomedAvatar(imgSrc) {
    console.log('[DEBUG] Updating zoomed avatar with:', imgSrc);
    let zoomedAvatarDiv = document.querySelector('.zoomed_avatar.draggable');

    if (zoomedAvatarDiv) {
        let zoomedImage = zoomedAvatarDiv.querySelector('.zoomed_avatar_img');
        if (zoomedImage) {
            zoomedImage.src = imgSrc;
            zoomedImage.dataset.izoomifyUrl = imgSrc;
        }
        zoomedAvatarDiv.setAttribute('forchar', imgSrc);
        zoomedAvatarDiv.id = `zoomFor_${imgSrc}`;
    } else {
        zoomedAvatarDiv = document.createElement('div');
        zoomedAvatarDiv.className = 'zoomed_avatar draggable';
        zoomedAvatarDiv.innerHTML = `
            <div class="panelControlBar">
                <div class="drag-grabber"></div>
                <div class="dragClose"></div>
            </div>
            <div class="zoomed_avatar_container">
                <img class="zoomed_avatar_img" src="${imgSrc}" 
                     data-izoomify-url="${imgSrc}" 
                     alt="Zoomed Avatar">
            </div>
        `;
        document.body.appendChild(zoomedAvatarDiv);
    }
}

function ensureZoomedAvatarExists(imgSrc) {
    const observer = new MutationObserver(() => {
        if (!document.querySelector('.zoomed_avatar')) {
            updateOrCreateZoomedAvatar(imgSrc);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// 2. AVATAR DETECTION FUNCTIONS
function UserZoom() {
    console.log('[DEBUG] Executing UserZoom');
    let imgSrc = null;
    
    // Try different avatar locations
    const avatarSelectors = [
        '#user_avatar img',
        '.mes_user .avatar img',
        '[data-avatar="user"] img',
        '.avatar-container.selected:not([forchar]) img'
    ];

    for (const selector of avatarSelectors) {
        const img = document.querySelector(selector);
        if (img?.src) {
            imgSrc = img.src;
            break;
        }
    }

    if (!imgSrc) {
        console.warn('[DEBUG] Using fallback user avatar');
        imgSrc = '/user.png?' + Date.now();
    }

    updateOrCreateZoomedAvatar(imgSrc);
    ensureZoomedAvatarExists(imgSrc);
}

// 3. EVENT HANDLERS
function initAvatarTracking() {
    // Core events
    eventSource.on('user_submitted', () => {
        console.log('[DEBUG] User submitted message');
        setTimeout(UserZoom, 300);
    });

    eventSource.on('generation_started', () => {
        console.log('[DEBUG] Generation started');
        // Your existing CharZoom logic here
    });

    // Mutation observer for dynamic content
    new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                UserZoom();
            }
        });
    }).observe(document.getElementById('chat'), {
        childList: true,
        subtree: true
    });
}

// 4. INITIALIZATION
initAvatarTracking();
