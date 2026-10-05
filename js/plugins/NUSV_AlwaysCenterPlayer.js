/*:
 * @plugindesc Kamera selalu mengikuti player, termasuk di tepi map (MV).
 * @author NUSV
 *
 * @help
 * NUSV_AlwaysCenterPlayer
 *
 * Aktifkan plugin ini melalui Plugin Manager.
 * Player tetap berada di pusat kamera tanpa memperbesar ukuran map.
 * Area di luar map dapat terlihat kosong atau menampilkan parallax.
 *
 * Plugin ini mengambil alih kamera saat bermain. Event Scroll Map dan
 * plugin kamera lain tidak cocok digunakan bersamaan dengan plugin ini.
 * Tidak ada plugin command atau parameter.
 */

(function() {
    "use strict";

    Game_Map.prototype.setDisplayPos = function(x, y) {
        this._displayX = this.isLoopHorizontal()
            ? x.mod(this.width()) : x;
        this._displayY = this.isLoopVertical()
            ? y.mod(this.height()) : y;
        this._parallaxX = x;
        this._parallaxY = y;
    };

    Game_Player.prototype.updateScroll = function() {
        this.center(this._realX, this._realY);
    };
})();
