/**
 * NUSV Database Studio - Change Maximum Capacity Modal
 */

function openResizeModal() {
    const list = getActiveList();
    if (!list) return;
    const count = Math.max(0, list.length - 1);
    const nameEl = document.getElementById('resizeDatasetName');
    if (nameEl) nameEl.textContent = State.currentTab.toUpperCase();
    const input = document.getElementById('resizeNewCountInput');
    if (input) input.value = count;
    openModal('resizeModal');
}

function applyResizeFromModal() {
    const list = getActiveList();
    if (!list) return;
    const input = document.getElementById('resizeNewCountInput');
    const newCount = parseInt(input.value, 10);
    if (isNaN(newCount) || newCount < 1 || newCount > 2000) {
        showToast('Kapasitas harus antara 1 sampai 2000', 'warning');
        return;
    }
    const currentCount = list.length - 1;
    if (newCount === currentCount) {
        closeModal('resizeModal');
        return;
    }
    if (newCount < currentCount) {
        closeModal('resizeModal');
        showConfirmDialog({
            title: '⚠️ Konfirmasi Pemangkasan Kapasitas',
            message: `Apakah Anda yakin ingin memotong kapasitas ${State.currentTab} dari ${currentCount} menjadi ${newCount}?\n\nEntri dari #${newCount + 1} ke atas akan dihapus permanen dari memori database saat ini!`,
            confirmText: 'Ya, Pangkas Kapasitas',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                list.length = newCount + 1;
                if (State.selectedIndex > newCount) {
                    State.selectedIndex = newCount;
                }
                setUnsaved(true);
                renderSidebar();
                renderEditor();
                showToast(`Kapasitas ${State.currentTab} berhasil diubah menjadi ${newCount}!`, 'success');
            }
        });
        return;
    } else {
        while (list.length <= newCount) {
            const nextId = list.length;
            const template = createBlankEntry(State.currentTab, nextId);
            list.push(template);
        }
    }
    closeModal('resizeModal');
    setUnsaved(true);
    renderSidebar();
    renderEditor();
    showToast(`Kapasitas ${State.currentTab} berhasil diubah menjadi ${newCount}!`, 'success');
}
