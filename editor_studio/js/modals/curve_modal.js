/**
 * NUSV Database Studio - Modal Controller: modals/curve_modal.js
 */

function openClassParamsCurveModal(paramId) {
    const cls = State.classes[State.selectedIndex] || getActiveItem();
    if (!cls) return;
    cls.params = cls.params || [];
    document.getElementById('classCurveParamSelect').value = paramId !== undefined ? paramId : 0;
    onClassCurveParamSelectChange();
    openModal('classParamsCurveModal');
}



function onClassCurveParamSelectChange() {
    const paramId = parseInt(document.getElementById('classCurveParamSelect').value, 10);
    const cls = State.classes[State.selectedIndex] || getActiveItem();
    if (!cls || !cls.params || !cls.params[paramId]) return;
    const row = cls.params[paramId];
    document.getElementById('classCurveVal1').value = row[1] || (paramId === 0 ? 450 : paramId === 1 ? 100 : 25);
    document.getElementById('classCurveVal99').value = row[99] || (paramId === 0 ? 6500 : paramId === 1 ? 1200 : 350);
}



function applyClassParamsCurve() {
    const paramId = parseInt(document.getElementById('classCurveParamSelect').value, 10);
    const curveType = document.getElementById('classCurveTypeSelect').value;
    const val1 = parseInt(document.getElementById('classCurveVal1').value, 10) || 10;
    const val99 = parseInt(document.getElementById('classCurveVal99').value, 10) || 100;
    const cls = State.classes[State.selectedIndex] || getActiveItem();
    if (!cls) return;
    cls.params = cls.params || [];
    cls.params[paramId] = [0];

    for (let lv = 1; lv <= 99; lv++) {
        const val = calculateCurveValue(lv, val1, val99, curveType);
        cls.params[paramId].push(val);
    }

    closeModal('classParamsCurveModal');
    setUnsaved(true);
    renderEditor();
    showToast(`Kurva parameter ${PARAM_DEFS[paramId].code} berhasil digenerate untuk Lv 1 - 99!`);
}



function calculateCurveValue(level, val1, val99, type) {
    if (level === 1) return val1;
    if (level === 99) return val99;
    const progress = (level - 1) / 98; // 0 to 1
    let factor = progress;
    if (type === 'normal') factor = Math.pow(progress, 1.25);
    else if (type === 'fast') factor = Math.sqrt(progress);
    else if (type === 'slow') factor = Math.pow(progress, 1.8);
    return Math.round(val1 + (val99 - val1) * factor);
}
