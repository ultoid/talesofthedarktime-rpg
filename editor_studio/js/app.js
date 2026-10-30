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

        txt.innerHTML = `💡 <strong style="color:#60a5fa;">${escapeHtml(name || 'Info')}:</strong> ${formattedTitle}`;
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


// ==========================================
// GRAPHIC PREVIEW & VISUAL SHEET PICKER
// ==========================================
