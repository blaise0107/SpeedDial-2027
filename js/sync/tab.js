/**
 * Модуль синхронизации с EverSync выпилён (сервис закрыт, расширение заброшено).
 * Оставлена no-op заглушка, чтобы не переписывать десятки вызовов в storage/dialogs/menu.
 * Все изменения хранятся только локально; для переноса настроек используйте локальный бэкап.
 */
const Sync = {
addDataToSync: function (params, cb) {
if (cb) cb();
},
removeSyncData: function (params, cb) {
if (cb) cb();
},
isActive: function (cb) {
if (cb) cb(false);
return false;
},
hasDataToSync: function (cb) {
if (cb) cb(false);
},
getAccountInfo: function (cb) {
if (cb) cb(null);
},
startSync: function (type, cb) {
if (cb) cb();
},
syncAddonOptionsUrl: function (cb) {
if (cb) cb('');
},
importFinished: function () {},
syncAddonExists: function (cb) {
if (cb) cb(false);
},
groupSyncChanged: function (groupId, cb) {
if (cb) cb();
},
};

export default Sync;
