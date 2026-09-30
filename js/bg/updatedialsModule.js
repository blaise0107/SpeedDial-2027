import { Utils } from '../utils.js';
import ServerDialsModule from './serverdialsModule.js';
import Broadcaster from '../_external/broadcaster.js';
import { DIALS_TRASH_KEY, GROUPS_TRASH_KEY, defaultGroupGlobalIDs } from '../constants.js';
import { userStorageKey } from '../sync/user.js';

class UpdateDials {
	fvdSpeedDial;

	constructor(fvdSpeedDial) {
		this.fvdSpeedDial = fvdSpeedDial;
	}

	update() {
		const fvdSpeedDial = this.fvdSpeedDial;
		const dialsCreated = [];
		const currentUserInfo = fvdSpeedDial.localStorage.getItem(userStorageKey);
		const currentUserId = currentUserInfo?.user?.user_id;

		const allowedGroups = Object.values(defaultGroupGlobalIDs).filter((globalID) => globalID !== defaultGroupGlobalIDs.popular);
		const allowedGroupIds = [];
		let excludeGlobalIds = [];
		let allowedExitingDials = [];
		let serverDials = [];
		let dbExistingDials = [];
		const serverDialsModule = new ServerDialsModule(fvdSpeedDial);


		Utils.Async.chain([
			function (next) {
				for (const groupId of allowedGroups) {
					fvdSpeedDial.StorageSD.groupIdByGlobalId(groupId, (id) => {
						if (id) {
							allowedGroupIds.push(id);
						}
					});
				}

				next();
			},
			// получение разрешенных групповых вызовов и предотвращение их исключения
			function (next) {
				fvdSpeedDial.StorageSD.listDials(null, null, null, (_existingDials) => {
					dbExistingDials = _existingDials;
					allowedExitingDials = _existingDials?.filter((d) => allowedGroupIds.includes(d.group_id)) || [];

					const dialsToFetchIds = allowedExitingDials.map((d) => d.global_id);

					const dialsToExcludeIds = serverDialsModule.getExcludeDialsGlobalIds();

					excludeGlobalIds = dialsToExcludeIds?.filter((d) => !dialsToFetchIds.includes(d));
					next();
				});
			},
			// Синхронизировать локальные группы/звонки с корзиной
			function (next) {
				// Группы удаляют глобальные идентификаторы
				const removedGroupsTrash = fvdSpeedDial.Prefs.get(GROUPS_TRASH_KEY, {});
				const currentUserRemovedGroups = removedGroupsTrash[currentUserId] || [];
				// Набирает мусорные глобальные идентификаторы
				const removedDialsTrash = fvdSpeedDial.Prefs.get(DIALS_TRASH_KEY, {});
				const currentUserRemovedDials = removedDialsTrash[currentUserId] || [];

				fvdSpeedDial.StorageSD.groupsList(function (groups) {
					const localGroupsGlobalIDs = groups?.map((group) => group.global_id);
					// eslint-disable-next-line max-len
					const newGroupsTrash = currentUserRemovedGroups.filter((globalId) => !localGroupsGlobalIDs.includes(globalId) && !['recommend', 'sponsoredst'].includes(globalId));
					fvdSpeedDial.Prefs.set(GROUPS_TRASH_KEY, {
						...removedGroupsTrash,
						[currentUserId]: newGroupsTrash,
					});

				});

				fvdSpeedDial.StorageSD.listDials(null, null, null, (_existingDials) => {
					const localDialsGlobalIDs = _existingDials?.map((d) => d.global_id);
					const newDialsTrash = currentUserRemovedDials.filter((globalId) => !localDialsGlobalIDs.includes(globalId));
					fvdSpeedDial.Prefs.set(DIALS_TRASH_KEY, {
						...removedDialsTrash,
						[currentUserId]: newDialsTrash,
					});
				});

				next();
			},
			// получение разрешенных групповых номеров
			function (next) {
				serverDialsModule.fetch(
					{
						userType: 'new',
					},
					function (err, dials) {
						if (err) {
							serverDials = [];
						} else {
							serverDials = dials;
						}

						next();
					},
					excludeGlobalIds,
					true // True to ignor browser history check
				);
			},
			// обновлять только групповые наборы по умолчанию, спонсируемые и рекомендуемые
			function (next) {
				serverDials = serverDials.filter((dial) => allowedGroups.includes(dial.group_globalId));
				next();
			},
			// игнорирование удаленных пользователем групп
			/**function (next) {
				serverDials = serverDials.filter((dial) => !removedGroups.includes(dial.group_globalId));
				next();
			},*/
			// игнорирование удаленных пользователем циферблатов
			function (next) {
				// Набирает мусорные глобальные идентификаторы
				const removedDialsTrash = fvdSpeedDial.Prefs.get(DIALS_TRASH_KEY, {});
				const currentUserRemovedDials = removedDialsTrash[currentUserId] || [];
				serverDials = serverDials.filter((dial) => !currentUserRemovedDials.includes(dial.global_id));
				next();
			},
			// Удалить группы по пользовательскому мусору при входе/выходе
			function (next) {
				// Группы удаляют глобальные идентификаторы
				const removedGroupsTrash = fvdSpeedDial.Prefs.get(GROUPS_TRASH_KEY, {});
				const currentUserRemovedGroups = removedGroupsTrash[currentUserId] || [];

				const groupsRemoveProcess = (groupGlobalId, done) => {
					if (!serverDials.some((dial) => dial.group_globalId === groupGlobalId)) {
						fvdSpeedDial.StorageSD.groupDeleteByGlobalID(groupGlobalId, done);
					}
				};

				if (currentUserRemovedGroups?.length) {
					Utils.Async.arrayProcess(currentUserRemovedGroups, groupsRemoveProcess, next);
				} else {
					next();
				}

			},
			// Удаление циферблатов по серверу
			function (next) {
				const dialsToRemove = [];

				for (const dial of allowedExitingDials) {
					if (
						!serverDials.some((d) => d.global_id === dial.global_id)
						&& dial.global_id.length <= 14
					) {
						dialsToRemove.push(dial);
					}
				}

				const removeDial = function (dialData, done) {
					fvdSpeedDial.StorageSD.deleteDial(dialData.id, () => {
						chrome.runtime.sendMessage({
							action: 'forceRebuild',
						});

						done();
					});
				};

				Utils.Async.arrayProcess(dialsToRemove, removeDial, next);
			},
			// добавление и обновление циферблатов
			function (next) {
				const processDial = function (dialData, done) {
					const dialExists = allowedExitingDials.find((d) => d.global_id === dialData.global_id);

					dialData.get_screen_method = dialData.thumb_source_type !== 'url' ? 'auto' : 'custom';

					if (dialData.previewUrl && !dialData.thumb_url) {
						dialData.thumb_url = dialData.previewUrl;
						//набираемых данных.thumb = набираемых данных.previewUrl;
						dialData.get_screen_method = 'custom';
						dialData.thumb_source_type = 'url';
					}

					// добавление циферблата, если он не существует
					if (!dialExists) {
						fvdSpeedDial.StorageSD.addDial(dialData, function (res) {
							if (res) {
								dialData.id = res.id;
								dialsCreated.push(dialData);
							}

							if (dialData.thumb_source_type === 'url') {
								fvdSpeedDial.ThumbMaker.getImageDataPath(
									{
										imgUrl: dialData.thumb_url,
										screenWidth: 364,
									},
									function (dataUrl, thumbSize) {
										fvdSpeedDial.StorageSD.updateDial(
											res.id,
											{
												thumb: dataUrl,
												thumb_width: Math.round(thumbSize.width),
												thumb_height: Math.round(thumbSize.height),
											},
											function () {
												chrome.runtime.sendMessage({
													action: 'forceRebuild',
												});
											}
										);
									}
								);
							}

							done();
						});
					} else {
						// редактирование циферблата, если существует
						if ([defaultGroupGlobalIDs.sponsoredst, defaultGroupGlobalIDs.recommend].includes(dialData.group_globalId)) {
							fvdSpeedDial.ThumbMaker.getImageDataPath(
								{
									imgUrl: dialData.thumb_url,
									screenWidth: 364,
								},
								function (dataUrl, thumbSize) {
									fvdSpeedDial.StorageSD.updateDial(
										dialExists.id,
										{
											...dialData,
											preview_style: dialExists?.preview_style || dialData?.preview_style,
											thumb: dataUrl,
											thumb_width: Math.round(thumbSize.width),
											thumb_height: Math.round(thumbSize.height),
										},
										function () {
											chrome.runtime.sendMessage({
												action: 'forceRebuild',
											});
										}
									);
								}
							);
						}

						done();
					}
				};

				Utils.Async.arrayProcess(serverDials, processDial, next);
			},
			function () {
				Broadcaster.sendMessage({
					action: 'defaultDialsCreated',
					dials: dialsCreated,
				});
			},
		]);
	}
}

export default UpdateDials;
