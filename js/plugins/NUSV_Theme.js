/*:
 * @plugindesc Shared dark-and-gold window theme for menus, messages, and battle.
 * @author NUSV
 *
 * @help
 * Applies the main menu's dark panels and warm borders to standard game windows.
 * Windows that draw their own contents retain their own layout and indicators.
 */
(function() {
    'use strict';

    Window.prototype._refreshBack = function() {
        var margin = this._margin;
        var width = Math.max(0, this._width - margin * 2);
        var height = Math.max(0, this._height - margin * 2);
        var bitmap = new Bitmap(width, height);
        this._windowBackSprite.bitmap = bitmap;
        this._windowBackSprite.setFrame(0, 0, width, height);
        this._windowBackSprite.move(margin, margin);
        if (width && height) bitmap.fillRect(0, 0, width, height, '#12100f');
    };

    Window.prototype._refreshFrame = function() {
        var width = Math.max(0, this._width);
        var height = Math.max(0, this._height);
        var bitmap = new Bitmap(width, height);
        this._windowFrameSprite.bitmap = bitmap;
        this._windowFrameSprite.setFrame(0, 0, width, height);
        if (width && height) {
            bitmap.fillRect(0, 0, width, 1, '#a28b68');
            bitmap.fillRect(0, height - 1, width, 1, '#8f7a5e');
            bitmap.fillRect(0, 0, 1, height, '#8f7a5e');
            bitmap.fillRect(width - 1, 0, 1, height, '#8f7a5e');
        }
    };

    Window.prototype._refreshCursor = function() {
        var pad = this._padding;
        var x = this._cursorRect.x + pad - this.origin.x;
        var y = this._cursorRect.y + pad - this.origin.y;
        var left = Math.max(x, pad);
        var top = Math.max(y, pad);
        var right = Math.min(x + this._cursorRect.width, this._width - pad);
        var bottom = Math.min(y + this._cursorRect.height, this._height - pad);
        var width = Math.max(0, right - left);
        var height = Math.max(0, bottom - top);
        var bitmap = new Bitmap(width, height);
        this._windowCursorSprite.bitmap = bitmap;
        this._windowCursorSprite.setFrame(0, 0, width, height);
        this._windowCursorSprite.move(left, top);
        if (width && height) {
            bitmap.fillRect(0, 0, width, height, 'rgba(162, 139, 104, 0.24)');
            bitmap.fillRect(0, 0, width, 2, '#c4ae88');
            bitmap.fillRect(0, height - 2, width, 2, '#8f7a5e');
        }
    };

    Window_Base.prototype.normalColor = function() { return '#f0e8d9'; };
    Window_Base.prototype.systemColor = function() { return '#c4ae88'; };
    Window_Base.prototype.gaugeBackColor = function() { return '#302a25'; };
})();
