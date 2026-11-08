/**
 * NUSV Database Studio - Application Bootstrap & Event Listeners
 */

window.addEventListener('DOMContentLoaded', async () => {
    if (window.location.protocol === 'file:' || window.location.origin === 'null') {
        // If running directly from file://, probe local server to bypass CORS/Private Network restrictions
        const pingUrl = 'http://localhost:5050/api/ping.png?t=' + Date.now();
        const ping127Url = 'http://127.0.0.1:5050/api/ping.png?t=' + Date.now();
        let redirected = false;

        const tryRedirect = (url) => {
            if (redirected) return;
            redirected = true;
            showToast('Terhubung ke database server! Mengalihkan ke http://localhost:5050...', 'success');
            setTimeout(() => {
                window.location.href = url;
            }, 50);
        };

        const img = new Image();
        img.onload = () => tryRedirect('http://localhost:5050/');
        img.onerror = () => {
            const img2 = new Image();
            img2.onload = () => tryRedirect('http://127.0.0.1:5050/');
            img2.onerror = () => {
                showServerOfflineModal();
            };
            img2.src = ping127Url;
        };
        img.src = pingUrl;
        return;
    }

    if (typeof initStatSidebarState === 'function') {
        initStatSidebarState();
    }

    await reloadAllData();
});



document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[title]');
    const bar = document.getElementById('hoverInfoBar');
    const txt = document.getElementById('hoverInfoText');
    if (!bar || !txt) return;
    if (el && el.getAttribute('title')) {
        const title = el.getAttribute('title');
        let name = el.getAttribute('data-hover-name') || el.innerText || el.getAttribute('placeholder') || el.getAttribute('name') || '';
        name = name.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 40);

        // Ubah newline menjadi pemisah bersih &bull; untuk bar bawah
        const formattedTitle = escapeHtml(title).replace(/\r?\n/g, ' &bull; ');

        txt.innerHTML = `<i class="pai-lightbulb"></i> <strong style="color:#60a5fa;">${escapeHtml(name || 'Info')}:</strong> ${formattedTitle}`;
        bar.classList.add('visible');
    }
});


document.addEventListener('mouseout', (e) => {
    const toEl = e.relatedTarget ? e.relatedTarget.closest('[title]') : null;
    if (!toEl) {
        const bar = document.getElementById('hoverInfoBar');
        if (bar) bar.classList.remove('visible');
    }
});

// Helper to close any currently opened modals
function closeActiveModals() {
    let closed = false;
    if (typeof closeConfirmModal === 'function') {
        const cModal = document.getElementById('confirmModal');
        if (cModal && cModal.style.display && cModal.style.display !== 'none') {
            closeConfirmModal();
            closed = true;
        }
    }
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => {
        if (m.style.display && m.style.display !== 'none') {
            m.style.display = 'none';
            closed = true;
        }
    });
    const offlineBanner = document.getElementById('serverOfflineBanner');
    if (offlineBanner) {
        offlineBanner.remove();
        closed = true;
    }
    return closed;
}

function isAnyModalOpen() {
    const activeModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(
        m => m.style.display && m.style.display !== 'none'
    );
    return activeModals.length > 0 || !!document.getElementById('serverOfflineBanner');
}

// Global Keyboard Navigation & Shortcuts
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (closeActiveModals()) {
            e.preventDefault();
        }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || (document.activeElement && document.activeElement.isContentEditable);
        if (!isInput && !isAnyModalOpen()) {
            e.preventDefault();
            if (typeof selectAdjacentSidebarItem === 'function') {
                selectAdjacentSidebarItem(e.key === 'ArrowUp' ? -1 : 1);
            }
        }
    }
});

// Prevent accidental tab/browser close if there are unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (typeof State !== 'undefined' && State.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Perubahan data belum disimpan ke database project. Tinggalkan halaman?';
        return e.returnValue;
    }
});


// ==========================================
// GRAPHIC PREVIEW & VISUAL SHEET PICKER
// ==========================================
