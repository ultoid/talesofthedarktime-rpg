/*:
 * @plugindesc v1.1 Fix vertical alignment for Minecraftia and Five Fonts at Freddy's GameFont.
 * @author NUSV
 *
 * @param Offset Ratio
 * @type number
 * @decimals 2
 * @default 0.75
 * @desc Downward baseline offset as a fraction of the font size.
 *
 * @help
 * Place below YEP plugins. Supports Minecraftia-Regular.ttf and
 * FiveFontsatFreddy's-Regular.ttf as GameFont in fonts/gamefont.css.
 * These fonts' visible glyphs sit
 * above the usual baseline; shifting them down centers them in MV rows.
 * Applies to GameFont only, including menus and message text.
 * Disable this plugin when switching to a font with a normal baseline.
 */
(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_GameFontBaseline');
    var ratio = Number(parameters['Offset Ratio'] || '0.75');
    if (!isFinite(ratio)) ratio = 0.75;

    var drawText = Bitmap.prototype.drawText;
    Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
        if (/(^|,)\s*["']?GameFont["']?\s*(,|$)/i.test(this.fontFace)) {
            y += Math.round(this.fontSize * ratio);
        }
        return drawText.call(this, text, x, y, maxWidth, lineHeight, align);
    };
})();
