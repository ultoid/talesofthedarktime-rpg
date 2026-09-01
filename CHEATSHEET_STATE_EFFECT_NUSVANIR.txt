# 📜 MASTER CHEATSHEET: STATUS EFFECTS (STATES)
**Proyek Game:** *Tales of The Dark Time*  
**Engine:** RPG Maker MV  
**File Database:** `data/States.json`

> ✅ **Status Verifikasi:** Dokumen ini telah diverifikasi dan disinkronkan dengan `data/States.json` per **1 September 2026**. State ID sesuai urutan database RPG Maker MV (ID 0004 – 0023).

---

> ### 📌 CATATAN PENTING & RENCANA INTEGRASI PLUGIN YANFLY
> Seluruh state di bawah ini telah dikonfigurasi pada database default RPG Maker MV. Namun, untuk beberapa state yang memiliki mekanik kondisi dinamis (misal: *peluang 10% gagal aksi tiap turn*, *batal saat menyerang*, *kombo reaksi elemen*), disediakan **Notetag Resmi Yanfly (YEP - Buffs & States Core)** di setiap rincian state.
> 
> Saat plugin Yanfly diinstal nanti, Anda cukup menyalin kode di bagian **`[YANFLY NOTE TAG]`** ke dalam kotak **Note** masing-masing State di database RPG Maker MV agar perilakunya 100% presisi sesuai desain mekanik Anda!

---

## 📌 TABEL RINGKASAN MEKANIK 19 STATE (0004 – 0023)

| ID | Nama State | Tipe / Kategori | Durasi | Efek Utama (Vanilla + Yanfly) |
| :---: | :--- | :--- | :---: | :--- |
| **0004** | **Poison** | DoT (Damage over Time) | 3 ~ 5 Turn | HP berkurang **1/16 (-6.25%)** tiap turn. |
| **0005** | **Burn** | DoT + Debuff Ofensif | 3 ~ 5 Turn | HP berkurang **1/12 (-8.33%)** tiap turn & **ATK berkurang 50%**. |
| **0006** | **Bleed** | DoT + Anti-Heal | 3 ~ 5 Turn | HP berkurang **1/10 (-10%)** tiap turn & **Efek Heal/Regen (REC) -50%**. |
| **0007** | **Paralyze** | Debuff Speed + Kejang | 3 ~ 5 Turn | **Speed (AGI) -50%**, EVA -20%, & **10% peluang gagal bergerak per turn** *(Yanfly Notetag)*. |
| **0008** | **Sleep** | Hard CC | 1 ~ 5 Turn | **Tidak bisa bergerak (Cannot Move)**, Evasion 0%, **lepas 100% jika terkena damage**. |
| **0009** | **Confuse** | Mental CC | 2 ~ 4 Turn | **Menyerang rekan/acak**, 50% peluang lepas jika terkena damage. |
| **0010** | **Curse** | DoT Berat + All Debuff | 3 ~ 5 Turn | HP berkurang **1/8 (-12.5%)** tiap turn & **Semua Stat berkurang 25%** (*MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK*). |
| **0011** | **Stun** | Hard CC Singkat | 1 Turn | **Tidak bisa bergerak (Cannot Move)** selama 1 turn. |
| **0012** | **Chill** | Debuff + Sinergi Es | 3 ~ 5 Turn | **Speed (AGI) -25%**, Kerentanan Freeze **+50%**, **50% langsung Freeze jika dipukul skill Es** *(Yanfly Notetag)*. |
| **0013** | **Freeze** | Hard CC | 1 ~ 5 Turn | **Tidak bisa bergerak (Cannot Move)**, Evasion 0%, **lepas 10% jika terkena damage**. |
| **0014** | **Shadow State** | Buff Evasion & Stealth | 1 Action | **Kebal serangan fisik (EVA +100%, PDR 0%)**, Target Rate 0%, **lepas otomatis setelah user melancarkan serangan** *(Yanfly Notetag)*. |
| **0015** | **Blind** | Debuff Akurasi | 3 ~ 5 Turn | **Akurasi Serangan (Hit Rate) berkurang 75%**. |
| **0016** | **Fear** | Mental CC | 2 ~ 4 Turn | **ATK -25%, AGI -25%**, Target Rate -50%, & **50% peluang batal menyerang karena panik** *(Yanfly Notetag)*. |
| **0017** | **Silence** | Skill Lock (Magic) | 3 ~ 5 Turn | **Terkunci dari semua Sihir** (*Seal White Magic & Black Magic*). |
| **0018** | **Root** | Skill Lock (Fisik) | 2 ~ 3 Turn | **Terkunci dari Serangan Fisik** (*Seal Normal Attack & Skill Fisik*), EVA -100%. |
| **0019** | **Holy Veil** | Buff Pertahanan Sakral | 3 Turn | **Mengurangi semua damage masuk (Fisik & Magic) sebesar 50%**. |
| **0020** | **Vulnerable** | Debuff Pertahanan | 1 ~ 3 Turn | **DEF dan MDF berkurang 50%**. |
| **0021** | **Hunter's Mark** | Debuff Target Prioritas | 2 ~ 3 Turn | **Pasti terkena serangan berikutnya (EVA -100%)**, Target Rate +100%, **lepas setelah terkena damage**. |
| **0022** | **Haste** | Buff Kecepatan | 1 Turn | **Speed (AGI) meningkat sebesar 50%** (*AGI * 150%*). |
| **0023** | **Taunt** | Provoke / Enrage | 2 ~ 3 Turn | **Target Rate * 300%**, terkunci hanya bisa mengeluarkan serangan ke musuh. |

---

# 🛠️ RINCIAN LENGKAP SETIAP STATE (GUI & YANFLY NOTETAG)

---

### [0004] Poison
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Poison
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: HP Regeneration Rate - 6.25%** `(1/16 HP per turn)`
* **Messages:**
  * *Inflicted:* ` terkena Poison!`
  * *Persists:* ` menderita efek Poison!`
  * *Removed:* ` sembuh dari Poison!`
* **[YANFLY NOTE TAG]:** *(Opsional DoT presisi)*
  ```javascript
  <Custom Turn End Effect>
  var damage = Math.ceil(user.mhp / 16);
  user.gainHp(-damage);
  user.startDamagePopup();
  user.clearResult();
  if (user.isDead()) user.performCollapse();
  </Custom Turn End Effect>
  ```

---

### [0005] Burn
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Parameter: ATK * 50%**
  2. `Param` $\rightarrow$ **Ex-Parameter: HP Regeneration Rate - 8.33%** `(1/12 HP per turn)`
* **Messages:**
  * *Inflicted:* ` terkena Burn!`
  * *Persists:* ` terbakar oleh Burn!`
  * *Removed:* ` pulih dari Burn!`
* **[YANFLY NOTE TAG]:**
  ```javascript
  <Custom Turn End Effect>
  var damage = Math.ceil(user.mhp / 12);
  user.gainHp(-damage);
  user.startDamagePopup();
  user.clearResult();
  if (user.isDead()) user.performCollapse();
  </Custom Turn End Effect>
  ```

---

### [0006] Bleed
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: HP Regeneration Rate - 10%** `(1/10 HP per turn)`
  2. `Param` $\rightarrow$ **Sp-Parameter: Recovery Effect * 50%** `(Heal masuk berkurang 50%)`
* **Messages:**
  * *Inflicted:* ` mengalami Bleed!`
  * *Persists:* ` kehilangan darah akibat Bleed!`
  * *Removed:* ` pulih dari Bleed!`

---

### [0007] Paralyze
* **General Settings:**
  * `Restriction:` None | `Priority:` 55
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Paralyze
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Parameter: AGI * 50%**
  2. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate - 20%**
* **Messages:**
  * *Inflicted:* ` terkena Paralyze!`
  * *Persists:* ` lumpuh akibat Paralyze!`
  * *Removed:* ` sembuh dari Paralyze!`
* **[YANFLY NOTE TAG]:** *(Memicu 10% chance tidak bisa menyerang per turn)*
  ```javascript
  <Custom Turn Start Effect>
  if (Math.random() < 0.10) {
    user.addState(11); // Memicu Stun (ID 11) 1 turn
    BattleManager.addText(user.name() + " kejang akibat Paralyze dan tidak bisa bergerak!");
  }
  </Custom Turn Start Effect>
  ```

---

### [0008] Sleep
* **General Settings:**
  * `Restriction:` Cannot Move | `Priority:` 90
  * `[SV] Motion:` Sleep | `[SV] Overlay:` Sleep
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (1 ~ 5 Turns)
  * `Remove by Damage:` Checked $\rightarrow$ **100%**
  * `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate - 100%**
* **Messages:**
  * *Inflicted:* ` terkena Sleep!`
  * *Persists:* ` sedang dalam kondisi Sleep...`
  * *Removed:* ` terbangun dari Sleep!`

---

### [0009] Confuse
* **General Settings:**
  * `Restriction:` Attack an Ally | `Priority:` 75
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Confusion
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (2 ~ 4 Turns)
  * `Remove by Damage:` Checked $\rightarrow$ **50%**
  * `Remove at Battle End:` Checked
* **Traits (Vanilla):** *(None)*
* **Messages:**
  * *Inflicted:* ` terkena Confuse!`
  * *Persists:* ` berada dalam kondisi Confuse!`
  * *Removed:* ` pulih dari Confuse!`
* **[YANFLY NOTE TAG]:** *(10% peluang menyerang diri sendiri)*
  ```javascript
  <Custom Action Start Effect>
  if (Math.random() < 0.10) {
    user.forceAction(1, user.index());
  }
  </Custom Action Start Effect>
  ```

---

### [0010] Curse
* **General Settings:**
  * `Restriction:` None | `Priority:` 60
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Curse
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: HP Regeneration Rate - 12.5%** `(1/8 HP per turn)`
  2. `Param` $\rightarrow$ **Parameter: Max HP * 75%**
  3. `Param` $\rightarrow$ **Parameter: Max MP * 75%**
  4. `Param` $\rightarrow$ **Parameter: ATK * 75%**
  5. `Param` $\rightarrow$ **Parameter: DEF * 75%**
  6. `Param` $\rightarrow$ **Parameter: MAT * 75%**
  7. `Param` $\rightarrow$ **Parameter: MDF * 75%**
  8. `Param` $\rightarrow$ **Parameter: AGI * 75%**
  9. `Param` $\rightarrow$ **Parameter: LUK * 75%**
* **Messages:**
  * *Inflicted:* ` terkena Curse!`
  * *Persists:* ` tersiksa oleh Curse!`
  * *Removed:* ` terbebas dari Curse!`

---

### [0011] Stun
* **General Settings:**
  * `Restriction:` Cannot Move | `Priority:` 85
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Paralyze
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (1 ~ 1 Turn) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate - 100%**
* **Messages:**
  * *Inflicted:* ` terkena Stun!`
  * *Persists:* ` tidak dapat bergerak karena Stun!`
  * *Removed:* ` pulih dari Stun!`

---

### [0012] Chill
* **General Settings:**
  * `Restriction:` None | `Priority:` 45
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Parameter: AGI * 75%**
  2. `Rate` $\rightarrow$ **State Rate: Freeze (0013) * 150%**
  3. `Rate` $\rightarrow$ **Element Rate: Es (0007) * 125%**
* **Messages:**
  * *Inflicted:* ` terkena Chill!`
  * *Persists:* ` menggigil oleh Chill!`
  * *Removed:* ` pulih dari Chill!`
* **[YANFLY NOTE TAG]:** *(50% otomatis Freeze jika dipukul serangan elemen Es)*
  ```javascript
  <Custom React Effect>
  if (this.getItemElements().contains(7) && Math.random() < 0.50) {
    target.addState(13); // Freeze (ID 13)
    target.removeState(12); // Lepas Chill (ID 12)
  }
  </Custom React Effect>
  ```

---

### [0013] Freeze
* **General Settings:**
  * `Restriction:` Cannot Move | `Priority:` 85
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (1 ~ 5 Turns)
  * `Remove by Damage:` Checked $\rightarrow$ **10%**
  * `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate - 100%**
* **Messages:**
  * *Inflicted:* ` terkena Freeze!`
  * *Persists:* ` membeku dalam kondisi Freeze!`
  * *Removed:* ` mencair dan lepas dari Freeze!`

---

### [0014] Shadow State
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Normal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Action End (1 ~ 1 Turn) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 100%**
  2. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 0%** `(Kebal fisik)`
  3. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 0%** `(Musuh tidak dapat menargetkan)`
* **Messages:**
  * *Inflicted:* ` memasuki Shadow State!`
  * *Persists:* ` bersembunyi dalam Shadow State!`
  * *Removed:* ` keluar dari Shadow State!`
* **[YANFLY NOTE TAG]:** *(Lepas otomatis setelah user melancarkan serangan)*
  ```javascript
  <Custom Conclude Effect>
  if (this.isForOpponent()) {
    user.removeState(14); // Shadow State (ID 14)
  }
  </Custom Conclude Effect>
  ```

---

### [0015] Blind
* **General Settings:**
  * `Restriction:` None | `Priority:` 60
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Blind
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate - 75%**
* **Messages:**
  * *Inflicted:* ` terkena Blind!`
  * *Persists:* ` terganggu oleh Blind!`
  * *Removed:* ` sembuh dari Blind!`

---

### [0016] Fear
* **General Settings:**
  * `Restriction:` None | `Priority:` 65
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Fear
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (2 ~ 4 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Parameter: ATK * 75%**
  2. `Param` $\rightarrow$ **Parameter: AGI * 75%**
  3. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 50%**
* **Messages:**
  * *Inflicted:* ` terkena Fear!`
  * *Persists:* ` panik akibat Fear!`
  * *Removed:* ` terbebas dari Fear!`
* **[YANFLY NOTE TAG]:** *(50% chance membatalkan serangan karena ketakutan)*
  ```javascript
  <Custom Action Start Effect>
  if (Math.random() < 0.50) {
    user.clearActions();
    BattleManager.addText(user.name() + " terlalu takut untuk menyerang!");
  }
  </Custom Action Start Effect>
  ```

---

### [0017] Silence
* **General Settings:**
  * `Restriction:` None | `Priority:` 65
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Silence
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 5 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Skill` $\rightarrow$ **Seal Skill Type: White Magic (1)**
  2. `Skill` $\rightarrow$ **Seal Skill Type: Black Magic (2)**
* **Messages:**
  * *Inflicted:* ` terkena Silence!`
  * *Persists:* ` terkunci oleh Silence!`
  * *Removed:* ` bebas dari Silence!`

---

### [0018] Root
* **General Settings:**
  * `Restriction:` None | `Priority:` 65
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (2 ~ 3 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Skill` $\rightarrow$ **Seal Skill: Attack (0001)**
  2. `Skill` $\rightarrow$ **Seal Skill Type: Skill (3)** `(Skill Fisik)`
  3. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate - 100%**
* **Messages:**
  * *Inflicted:* ` terkena Root!`
  * *Persists:* ` terjerat oleh Root!`
  * *Removed:* ` bebas dari Root!`

---

### [0019] Holy Veil
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Normal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (3 ~ 3 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 50%**
  2. `Param` $\rightarrow$ **Sp-Parameter: Magical Damage Rate * 50%**
* **Messages:**
  * *Inflicted:* ` menerima perlindungan Holy Veil!`
  * *Persists:* ` dilindungi oleh Holy Veil!`
  * *Removed:* ` efek Holy Veil telah berakhir!`

---

### [0020] Vulnerable
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (1 ~ 3 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Parameter: DEF * 50%**
  2. `Param` $\rightarrow$ **Parameter: MDF * 50%**
* **Messages:**
  * *Inflicted:* ` terkena Vulnerable!`
  * *Persists:* ` berada dalam kondisi Vulnerable!`
  * *Removed:* ` pulih dari Vulnerable!`

---

### [0021] Hunter's Mark
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Normal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (2 ~ 3 Turns)
  * `Remove by Damage:` Checked $\rightarrow$ **100%** `(Lepas saat menerima serangan)`
  * `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate - 100%** `(Pasti terkena hit 100%)`
  2. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 200%**
* **Messages:**
  * *Inflicted:* ` ditandai dengan Hunter's Mark!`
  * *Persists:* ` menjadi target Hunter's Mark!`
  * *Removed:* ` efek Hunter's Mark telah hilang!`

---

### [0022] Haste
* **General Settings:**
  * `Restriction:` None | `Priority:` 50
  * `[SV] Motion:` Normal | `[SV] Overlay:` None
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (1 ~ 1 Turn) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Parameter: AGI * 150%** `(+50% Speed)`
* **Messages:**
  * *Inflicted:* ` mendapatkan efek Haste!`
  * *Persists:* ` bergerak cepat dengan Haste!`
  * *Removed:* ` efek Haste telah berakhir!`

---

### [0023] Taunt
* **General Settings:**
  * `Restriction:` Attack an Enemy | `Priority:` 70
  * `[SV] Motion:` Abnormal | `[SV] Overlay:` Rage
* **Removal Conditions:**
  * `Auto-removal Timing:` Turn End (2 ~ 3 Turns) | `Remove at Battle End:` Checked
* **Traits (Vanilla):**
  1. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 300%**
  2. `Skill` $\rightarrow$ **Seal Skill Type: White Magic (1)**
  3. `Skill` $\rightarrow$ **Seal Skill Type: Summon (4)**
  4. `Skill` $\rightarrow$ **Seal Skill Type: Ultimate (5)**
* **Messages:**
  * *Inflicted:* ` terkena Taunt!`
  * *Persists:* ` terprovokasi oleh Taunt!`
  * *Removed:* ` bebas dari efek Taunt!`
* **[YANFLY NOTE TAG]:** *(Menggunakan Taunt Core jika menginstal YEP_Taunt)*
  ```javascript
  <Physical Taunt>
  <Magical Taunt>
  ```

---
*Modul disusun untuk proyek game RPG Maker MV: **Tales of The Dark Time**.*
*Terakhir diverifikasi: **1 September 2026** — disinkronkan dengan `data/States.json`*
