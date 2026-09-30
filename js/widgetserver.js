// /* Управление списком виджетов */
//
// экспортировать новую функцию по умолчанию () {
//
// 	константные виджеты = {};
// 	константная личность = это;
//
// 	/* внешний интерфейс */
// 	this.getAll = функция (){
//
// 		константный результат = [];
//
// 		for(const id в виджетах){
// 			const виджет = self.getById(id);
//
// 			результат.push(виджет);
// 		}
//
// 		вернуть результат;
// 	};
//
// 	this.getById = функция (идентификатор) {
// 		если( !виджеты[id] ){
// 			вернуть ноль;
// 		}
//
// 		const виджет = fvdSpeedDial.Utils.clone(виджеты[id]);
//
// 		виджет.id = идентификатор;
//
// 		вернуть виджет;
// 	};
//
// 	this.remove = функция (id){
// 		//_removeWidgetFromList(id);
// 		//chrome.management.uninstall(id);
//
// 		chrome.management.setEnabled(id, false);
// 	};
//
// 	функция _setupListeners(){
//
// 		chrome.runtime.onMessageExternal.addListener(функция (сообщение, отправитель) {
//
// 			если(сообщение && сообщение.действие){
//
// 				переключатель(сообщение.действие){
//
// 					случай «fvdSpeedDial:Widgets:Widget:setWidgetInfo»:
//
// 						if( !widgets[ sender.id ] ){
// 							_addWidgetToList(sender.id, message.body);
// 						}
// 						еще {
// 							_updateWidgetInList(sender.id, message.body);
// 						}
//
// 						перерыв;
//
// 				}
//
// 			}
//
// 		} );
//
// 		chrome.management.onUninstalled.addListener(функция (addonId){
// 			если(виджеты[addonId]){
// 				_removeWidgetFromList(addonId);
// 			}
// 		} );
// 		chrome.management.onDisabled.addListener(функция (дополнение){
// 			если(виджеты[addon.id]){
// 				_removeWidgetFromList(addon.id);
// 			}
// 		} );
//
// 		Broadcaster.onMessage.addListener(функция (msg, отправитель, sendResponse) {
// 			переключатель (msg.action) {
// 				случай «виджеты:setallpositions»:
// 					fvdSpeedDial.WidgetServer.WidgetPositions.setAllWidgetPositions( msg.positions );
// 					перерыв;
// 				случай «виджеты:getposition»:
// 					вар pos = fvdSpeedDial.WidgetServer.WidgetPositions.getWidgetPosition(msg.id);
//
// 					sendResponse (поз.);
// 					вернуть истину;
// 					перерыв;
// 				случай «виджеты: удалить»:
// 					fvdSpeedDial.WidgetServer.remove(msg.id);
// 					перерыв;
// 				случай "виджеты: getall":
// 					вар виджеты = fvdSpeedDial.WidgetServer.getAll();
//
// 					widgets.forEach(функция (w) {
// 						w.position = fvdSpeedDial.WidgetServer.WidgetPositions.getWidgetPosition(w.id);
// 					});
// 					sendResponse (виджеты);
// 					вернуть истину;
// 					перерыв;
// 			}
// 		});
//
// 	}
//
// 	функция _addWidgetToList (идентификатор, информация) {
// 		если(info.apiv != 2) {
// 			// поддерживаются только виджеты версии 2
// 			возврат;
// 		}
//
// 		виджеты [id] = информация;
// 		fvdSpeedDial.WidgetServer.WidgetPositions.setWidgetPosition(id, 0);
// 		fvdSpeedDial.WidgetServer.WidgetPositions.fixPositions(id);
// 		Broadcaster.sendMessage({
// 			действие: «виджеты:добавлено»,
// 			идентификатор: идентификатор,
// 		});
// 	}
//
// 	функция _updateWidgetInList (идентификатор, информация) {
// 		если(info.apiv != 2) {
// 			// поддерживаются только виджеты версии 2
// 			возврат;
// 		}
//
// 		виджеты [id] = информация;
// 		Broadcaster.sendMessage({
// 			действие: «виджеты:обновлено»,
// 			идентификатор: идентификатор,
// 		});
// 	}
//
// 	функция _removeWidgetFromList (идентификатор) {
// 		если(виджеты[id]){
// 			удалить виджеты[id];
// 			fvdSpeedDial.WidgetServer.WidgetPositions.removePosition(id);
// 			Broadcaster.sendMessage({
// 				действие: «Виджеты: удалены»,
// 				идентификатор: идентификатор,
// 			});
// 		}
// 	}
//
// 	функция _sendIsWidgetRequest(addonId){
// 		chrome.runtime.sendMessage(addonId, {
// 			действие: "fvdSpeedDial:Widgets:Server:isWidget",
// 		} );
//
// 	}
//
// 	функция _scanAllAddons(){
//
// 		chrome.management.getAll(функция (дополнения){
//
// 			addons.forEach(функция (дополнение){
// 				_sendIsWidgetRequest(addon.id);
// 			} );
//
// 		} );
//
// 	}
//
// 	функция инициализации(){
//
// 		_setupListeners();
// 		_scanAllAddons();
//
// 	}
//
// 	window.addEventListener("загрузка", функция (){
//
// 		инициализация();
//
// 	}, ложь);
//
// }();
//
// fvdSpeedDial.WidgetServer.WidgetPositions = новая функция () {
//
// 	функция _getWidgetPositionsList(){
//
// 		пусть список = {};
//
// 		попробуй {
// 			list = JSON.parse(localStorage["widget_positions"]);
// 		}
// 		поймать( бывший ){
//
// 		}
//
// 		список возврата;
//
// 	}
//
// 	функция _setWidgetPositionsList (список) {
// 		localStorage[ "widget_positions"] = JSON.stringify(список);
// 	}
//
// 	функция _removeWidgetsPosition(виджетId){
//
// 		константный список = _getWidgetPositionsList();
//
// 		удалить список [идентификатор виджета];
//
// 		_setWidgetPositionsList(список);
//
// 		_fixWidgetPositionsList();
//
// 	}
//
// 	функция _fixWidgetPositionsList(){
//
// 		константный список = _getWidgetPositionsList();
// 		константные элементы = [];
//
// 		for(const id в списке){
// 			items.push({
// 				идентификатор: идентификатор,
// 				позиция: список[id],
// 			});
// 		}
//
// 		items.sort(функция (a, b){
// 			вернуть a.position - b.position;
// 		} );
//
// 		const newList = {};
//
// 		for( пусть я = 0; я != items.length; i++){
// 			newList[ items[i].id] = я + 1;
// 		}
//
// 		_setWidgetPositionsList (новый список);
//
// 	}
//
// 	функция _nextWidgetPosition(){
//
// 		пусть макс = 0;
// 		константный список = _getWidgetPositionsList();
//
// 		for(const k в списке){
// 			если (список [к] > макс) {
// 				Макс = список [к];
// 			}
// 		}
//
// 		вернуть максимум + 1;
//
// 	}
//
// 	this.getWidgetPosition = функция (виджетId) {
//
// 		константный список = _getWidgetPositionsList();
//
// 		если( !list[idgetId] ){
// 			список[widgetId] = _nextWidgetPosition();
// 			_setWidgetPositionsList(список);
// 		}
//
// 		список возврата [widgetId];
//
// 	};
//
// 	this.setWidgetPosition = функция (виджетId, позиция) {
// 		константный список = _getWidgetPositionsList();
//
// 		список [виджетId] = позиция;
// 		_setWidgetPositionsList(список);
// 	};
//
// 	this.setAllWidgetPositions = функция (данные) {
// 		_setWidgetPositionsList(данные);
// 		_fixWidgetPositionsList();
// 	};
//
// 	this.fixPositions = функция (){
// 		_fixWidgetPositionsList();
// 	};
//
// 	this.resetPositionList = функция (){
// 		_setWidgetPositionsList({});
// 	};
//
// 	this.removePosition = функция (виджетId) {
// 		_removeWidgetsPosition(идентификатор виджета);
// 	};
//
// }();
