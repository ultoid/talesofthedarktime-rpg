// Run with: node tests/auto-text-wrap.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({
    Window: function() {},
    PluginManager: { parameters: () => ({ 'Right Margin': '6' }) },
    Yanfly: { Message: {} }
});
vm.runInContext(fs.readFileSync(path.join(root, 'js/rpg_windows.js'), 'utf8'), context);
const yep = fs.readFileSync(path.join(root, 'js/plugins/YEP_MessageCore.js'), 'utf8');
// Exercise the installed Yanfly character renderer and wrap hook as well.
for (const name of ['processNormalCharacter', 'checkWordWrap', 'wordwrapWidth']) {
    const start = yep.indexOf('Window_Base.prototype.' + name + ' = function');
    const end = yep.indexOf('\n};', start) + 3;
    if (name === 'processNormalCharacter') {
        context.Yanfly.Message.Window_Base_processNormalCharacter =
            context.Window_Base.prototype.processNormalCharacter;
    }
    vm.runInContext(yep.slice(start, end), context);
}
vm.runInContext(fs.readFileSync(path.join(root, 'js/plugins/NUSV_AutoTextWrap.js'), 'utf8'), context);

function render(text, options = {}) {
    const type = options.type || 'Window_Message';
    const window = Object.create(context[type].prototype);
    const draws = [];
    let page = 0;
    window.contents = {
        width: options.width || 66, height: options.height || 1000,
        fontSize: 28,
        measureTextWidth: text => text.length * 10,
        drawText: (text, x, y) => draws.push({ text, x, y, page })
    };
    window.drawIcon = (icon, x, y) => draws.push({ text: '[icon]', x: x - 2, y: y - 2, page });
    window.startPause = () => { window.pause = true; };
    window.textColor = () => '#ffffff';
    window.textWidthExCheck = () => { throw new Error('Yanfly wrap should be bypassed'); };
    window._wordWrap = options.enabled !== false && !options.measure &&
        !(options.y >= 1000) && (type !== 'Window_Base' || options.enabled === true);
    window._checkWordWrapMode = !!options.measure;
    window._nusvAutoTextWrap = options.enabled;
    const left = options.left || 0;
    const state = { text, index: 0, x: left, y: options.y || 0, left, height: 36 };
    let steps = 0;
    while (state.index < state.text.length) {
        assert.ok(++steps < 10000, 'renderer must make progress');
        window.processCharacter(state);
        if (window.pause) {
            page++;
            state.x = left;
            state.y = 0;
            window.pause = false;
        }
    }
    return { draws, state, page };
}

function lines(result) {
    const groups = new Map();
    for (const draw of result.draws) {
        const key = draw.page + ':' + draw.y;
        groups.set(key, (groups.get(key) || '') + draw.text);
    }
    return [...groups.values()];
}

assert.deepEqual(lines(render('hello world')), ['hello', 'world']);
assert.deepEqual(lines(render('abcdefghijk')), ['abcdef', 'ghijk']);
assert.deepEqual(lines(render('one\ntwo')), ['one', 'two']);
assert.deepEqual(lines(render('hello   world')), ['hello', 'world']);
assert.deepEqual(lines(render('abcdefg', { left: 20 })), ['abcd', 'efg']);
assert.deepEqual(lines(render('abc\x1bC[2]defghi')), ['abcdef', 'ghi']);
assert.deepEqual(lines(render('hello world', { type: 'Window_Help' })), ['hello', 'world']);
assert.deepEqual(lines(render('hello world', { type: 'Window_Base' })), ['hello world']);
assert.deepEqual(lines(render('hello world', { type: 'Window_Base', enabled: true })), ['hello', 'world']);
// Default single-line windows and explicit opt-outs stay unchanged.
const plain = render('abcdefghijk', { enabled: false });
assert.deepEqual(lines(plain), ['abcdefghijk']);
assert.deepEqual(lines(render('abcdefghijk', { measure: true })), ['abcdefghijk']);
assert.deepEqual(lines(render('abcdefghijk', { y: 1000 })), ['abcdefghijk']);
const pages = render('hello world again', { height: 36 });
assert.deepEqual(lines(pages), ['hello', 'world', 'again']);
assert.equal(pages.page, 2);
const icons = render('abcde\x1bI[1]x', { height: 36 });
assert.deepEqual(lines(icons), ['abcde', '[icon]x']);
assert.equal(icons.page, 1);
assert.ok(icons.draws.every(draw => draw.x >= 0 && draw.x < 60));

const pluginsContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'js/plugins.js'), 'utf8'), pluginsContext);
assert.equal(pluginsContext.$plugins.at(-1).name, 'NUSV_AutoTextWrap');
assert.equal(pluginsContext.$plugins.at(-1).status, true);
console.log('Auto text wrap: 15 rendering cases and plugin registration passed.');
