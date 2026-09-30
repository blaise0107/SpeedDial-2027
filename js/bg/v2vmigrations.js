import {Utils} from '../utils.js';
// импортировать StorageSD из «../storage.js»;

function runMigrations(lastV, currentV) {
	console.log("Run migrations. lastver:", lastV, "currentver:", currentV);

	const migrations = [];
	const countRunned = 0;
	const numLastV = parseInt(String(lastV).split('.').join(''));

	if (numLastV < 7811) {
		migrations.push(function () {
			StorageSD.turnOffAutoUpdateGlobally(()=>{});
		});
	}

	migrations.push(function () {
		console.log("Migrations process completed, runned", countRunned, "migrations");
		// принудительное обновление быстрого набора
		chrome.runtime.sendMessage({
			action: "forceRebuild",
		});
	});

	Utils.Async.chain(migrations);
}

export default runMigrations;