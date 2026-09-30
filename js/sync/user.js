/**
 * Модуль учётной записи EverSync выпилён (сервис закрыт).
 * No-op заглушка: «премиум» недоступен, поиск всегда включён локально.
 */
export const userStorageKey = 'sync.user-info';
export const userStorageConfigs = {
enableSearch: 'sync.user-config__search-enable',
};

class UserInfoSync {
constructor() {}
init() {}
getIsPremiumUser() {
return false;
}
getIsSearchEnable() {
return true;
}
setIsSearchEnable() {}
updateUserConfigs() {}
setUserInfo() {}
getUserInfo() {
return null;
}
}

export default UserInfoSync;
