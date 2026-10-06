/*:
 * @plugindesc v1.0 Automatically wrap message and help text inside windows.
 * @author NUSV
 *
 * @param Message Windows
 * @type boolean
 * @default true
 *
 * @param Help Windows
 * @type boolean
 * @default true
 *
 * @param Other Windows
 * @type boolean
 * @default false
 *
 * @param Right Margin
 * @type number
 * @min 0
 * @default 6
 *
 * @help
 * Place below YEP_MessageCore and other window plugins.
 * Wraps Show Text, $gameMessage.add(), and Window_Help descriptions.
 * Manual newlines are preserved unless YEP's <WordWrap> tag is used.
 * Words move to the next line; oversized words split by character.
 * Message windows keep their normal pause/page behavior and face indent.
 * Escape codes and icons continue to use the installed text renderer.
 *
 * Other Windows applies to drawTextEx text, not single-line drawText labels.
 * Enable it only for custom windows with room for multiple lines.
 * This plugin does not resize help windows or selectable list rows.
 *
 * Script: window._nusvAutoTextWrap = true;  // opt in a custom window
 * Script: window._nusvAutoTextWrap = false; // opt out a window
 * Script: window._nusvAutoTextWrap = undefined; // restore defaults
 */

var Imported = Imported || {};
Imported.NUSV_AutoTextWrap = true;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_AutoTextWrap');
    var messages = parameters['Message Windows'] !== 'false';
    var help = parameters['Help Windows'] !== 'false';
    var others = parameters['Other Windows'] === 'true';
    var margin = Math.max(0, Number(parameters['Right Margin']) || 0);

    function enabled(window, state) {
        // Yanfly measures text by rendering below the bitmap. Never wrap it.
        if (!state || !window.contents || window._checkWordWrapMode ||
                state.y >= window.contents.height) return false;
        if (window._nusvAutoTextWrap !== undefined) {
            return !!window._nusvAutoTextWrap;
        }
        if (window instanceof Window_Message) return messages;
        if (window instanceof Window_Help) return help;
        return others;
    }

    function rightEdge(window) {
        return Math.max(0, window.contents.width - margin);
    }

    function nextWordWidth(window, state, index) {
        var width = 0;
        var text = state.text;
        while (index < text.length && !/[\s\x1b]/.test(text[index])) {
            width += window.textWidth(text[index++]);
        }
        return width;
    }

    function newLine(window, state) {
        // Insert a real newline so aliases, message pauses, and page breaks run.
        state.text = state.text.slice(0, state.index) + '\n' +
            state.text.slice(state.index);
        window.processNewLine(state);
    }

    var processCharacter = Window_Base.prototype.processCharacter;
    Window_Base.prototype.processCharacter = function(state) {
        if (enabled(this, state)) {
            var character = state.text[state.index];
            var edge = rightEdge(this);
            var left = state.left || 0;
            if (state.x > left && character !== '\n' &&
                    character !== '\f' && character !== '\x1b') {
                var width = this.textWidth(character);
                if (character === ' ' || character === '\t') {
                    var end = state.index;
                    while (/[ \t]/.test(state.text[end] || '\n')) end++;
                    var wordWidth = nextWordWidth(this, state, end);
                    if (wordWidth > 0 &&
                            state.x + width + wordWidth > edge) {
                        state.index = end;
                        newLine(this, state);
                        return;
                    }
                } else {
                    var previous = state.text[state.index - 1];
                    var startsWord = state.index === 0 || /\s/.test(previous);
                    var remainingWidth = startsWord ?
                        nextWordWidth(this, state, state.index) : width;
                    if (state.x + remainingWidth > edge) {
                        newLine(this, state);
                        return;
                    }
                }
            }
        }
        processCharacter.call(this, state);
    };

    var processDrawIcon = Window_Base.prototype.processDrawIcon;
    Window_Base.prototype.processDrawIcon = function(iconIndex, state) {
        if (enabled(this, state) && state.x > (state.left || 0) &&
                state.x + Window_Base._iconWidth + 4 > rightEdge(this)) {
            // The escape code has already been consumed; defer the icon until
            // the next update so a message page pause cannot erase it.
            state.text = state.text.slice(0, state.index) +
                '\x1bI[' + iconIndex + ']' + state.text.slice(state.index);
            newLine(this, state);
            return;
        }
        processDrawIcon.call(this, iconIndex, state);
    };

    if (Window_Base.prototype.checkWordWrap) {
        var checkWordWrap = Window_Base.prototype.checkWordWrap;
        Window_Base.prototype.checkWordWrap = function(state) {
            if (enabled(this, state)) return false;
            return checkWordWrap.call(this, state);
        };
    }
})();
