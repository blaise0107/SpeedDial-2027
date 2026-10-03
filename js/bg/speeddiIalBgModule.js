const SpeedDialBgModule = function (fvdSpeedDial) {
	this.fvdSpeedDial = fvdSpeedDial;
	// ВНИМАНИЕ: здесь было `fvdSpeedDial.ContextMenu = this;` — этот модуль
	// перезаписывал экземпляр контекстного меню, созданный в worker.js. После этого
	// fvdSpeedDial.ContextMenu.init()/sheduleRebuild() падали (у SpeedDialBgModule нет
	// таких методов), слушатель chrome.contextMenus.onClicked не навешивался, и
	// контекстное меню «пропадало» на всех вкладках.
};

SpeedDialBgModule.prototype = {
	_cellsSizeRatio: 1.6,
	_cellsSizes: {
		big: 364,
		medium: 210,
		small: 150,
	},
	getMaxCellWidth: function () {
		let max = 0;

		for (const k in this._cellsSizes) {
			const size = this._cellsSizes[k];

			if (size > max) {
				max = size;
			}
		}

		return max;
	},
};

export default SpeedDialBgModule;
