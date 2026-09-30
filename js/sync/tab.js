/**
 * Модуль синхронизации с EverSync выпилён (сервис закрыт, расширение заброшено).
 * Оставлена no-op заглушка, чтобы не переписывать десятки вызовов в storage/dialogs/menu.
 * Все изменения хранятся только локально; для переноса настроек используйте локальный бэкап
 * (страница «Резервные копии» в настройках: экспорт/импорт JSON-файла).
 */

// ---- Локальный бэкап: скачивание и выбор файла без сторонних сервисов ----

// Скачивает данные бэкапа в JSON-файл через chrome.downloads (доступен из фоновой страницы)
function downloadBackupJson(dataObject, fileName) {
	const jsonStr = JSON.stringify(dataObject);
	const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);

	if (typeof chrome !== 'undefined' && chrome.downloads && chrome.downloads.download) {
		chrome.downloads.download(
			{
				url: url,
				filename: fileName || 'speeddial-backup.json',
				saveAs: true,
			},
			function (id) {
				if (chrome.runtime.lastError || typeof id === 'undefined') {
					// запасной вариант — обычная ссылка
					fallbackDownload(url, fileName || 'speeddial-backup.json');
				}
			}
		);
		return;
	}

	fallbackDownload(url, fileName || 'speeddial-backup.json');
}

function fallbackDownload(url, fileName) {
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		a.remove();
	}, 1000);
}

// Открывает системный диалог выбора файла и читает содержимое как текст
function pickAndReadFile(cb) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'application/json,.json,text/plain';

	input.addEventListener('change', function () {
		const file = input.files && input.files[0];

		if (!file) {
			cb(null);
			return;
		}

		const reader = new FileReader();
		reader.onload = function () {
			cb(String(reader.result));
		};
		reader.onerror = function () {
			cb(null);
		};
		reader.readAsText(file);
	});

	input.click();
}

const Sync = {
	downloadBackup: function (dataObject, fileName) {
		downloadBackupJson(dataObject, fileName);
	},
	pickBackupFile: function (cb) {
		pickAndReadFile(cb);
	},
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
