// @ts-ignore
const { eventSource } = SillyTavern.getContext();

function UserZoom() {
    console.log('[DEBUG] Starting UserZoom');
    
    // 1. Try direct avatar element
    let imgElement = document.querySelector('#user_avatar img');
    console.log('[DEBUG] Direct avatar element:', imgElement);

    // 2. Try message-based detection
    if (!imgElement) {
        const lastUserMessage = document.querySelector('.mes[is_user="true"]:last-child');
        if (lastUserMessage) {
            imgElement = lastUserMessage.querySelector('.avatar img');
            console.log('[DEBUG] Message-based avatar:', imgElement);
        }
    }

    // 3. Try profile button
    if (!imgElement) {
        const profileButton = document.querySelector('[data-id="profile-button"] img');
        console.log('[DEBUG] Profile button avatar:', profileButton);
        imgElement = profileButton;
    }

    let imgSrc = null;
    if (imgElement && imgElement.src) {
        imgSrc = imgElement.src;
        console.log('[DEBUG] Found avatar src:', imgSrc);
    } else {
        console.warn('[DEBUG] Using fallback avatar');
        imgSrc = `/user.png?t=${Date.now()}`;
    }

    // Force refresh the zoomed avatar
    const zoomedImage = document.querySelector('.zoomed_avatar_img');
    if (zoomedImage) {
        zoomedImage.src = '';
        zoomedImage.src = imgSrc;
        console.log('[DEBUG] Forced image reload');
    }
    
    updateOrCreateZoomedAvatar(imgSrc);
    ensureZoomedAvatarExists(imgSrc);
}

// Enhanced event listeners
eventSource.on('user_submitted', () => {
    console.log('[DEBUG] user_submitted event received');
    setTimeout(() => {
        console.log('[DEBUG] Executing delayed UserZoom');
        UserZoom();
    }, 500);
});

// Mutation Observer for dynamic UI updates
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            Array.from(mutation.addedNodes).forEach(node => {
                if (node.classList && node.classList.contains('mes')) {
                    console.log('[DEBUG] New message detected');
                    UserZoom();
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
