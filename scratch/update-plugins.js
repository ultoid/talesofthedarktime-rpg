const fs = require('fs');
let code = fs.readFileSync('js/plugins.js', 'utf8');
code = code.replace(/"name":"NUSV_EquipRules"[^}]+}/, function(match) {
  return '"name":"NUSV_EquipRules","status":true,"description":"v1.1.0 NUSV Equip Rules - Dual Accessory and Universal Relic","parameters":{"Universal Slots":"6, 7"}}';
});
fs.writeFileSync('js/plugins.js', code);
console.log('Successfully updated plugins.js for NUSV_EquipRules');

