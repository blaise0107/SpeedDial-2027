// скрипт вкладки для скрытого захвата, отправки и получения данных из фоновой вкладки

const HiddenCaptureQueue = {
	capture: function (params, callback) {
		chrome.runtime.sendMessage({
			action: "hiddencapture:queue",
			wantResponse: !!callback,
		}, function (res) {
			if (callback) {
				callback(res);
			}
		});
	},
	empty: function () {
		chrome.runtime.sendMessage({
			action: "hiddencapture:empty",
		}, function () {});
	},
};

export default HiddenCaptureQueue;