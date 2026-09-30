// Google Analytics / geoloc.tempest.com отключены.
// Extension ID меняется при переустановке из магазина, поэтому GA-идентификаторы
// всё равно не работают; запросы к несуществующим хостам вызывают ошибки в логах.
const noop = async () => true;

class AnalyticsStub {
        async getUserInfo() {
                return { auth: false, user: null };
        }
        async getUserStatus() {
                return 'Free';
        }
        async getOrCreateClientId() {
                let { clientId } = await chrome.storage.local.get('clientId');
                if (!clientId) {
                        clientId = (self.crypto && self.crypto.randomUUID)
                                ? self.crypto.randomUUID()
                                : String(Date.now()) + Math.random().toString(36).slice(2);
                        await chrome.storage.local.set({ clientId });
                }
                return clientId;
        }
        async getOrCreateSessionId() {
                return 'disabled';
        }
        async fireEvent(name, params = {}) {
                return true;
        }
        fireInstallEvent() {
                return Promise.resolve(true);
        }
        fireUpdateEvent() {
                return Promise.resolve(true);
        }
        firePageview() {
                return Promise.resolve(true);
        }
        // Заглушка не содержала методов fire*Event — вызывающий код падал
        // с "Analytics.fireTabViewEvent is not a function". No-op-обёртки:
        fireTabViewEvent() {
                return Promise.resolve(true);
        }
        fireGroupVisitEvent() {
                return Promise.resolve(true);
        }
        fireDialClickEvent() {
                return Promise.resolve(true);
        }
        fireAddDialEvent() {
                return Promise.resolve(true);
        }
        fireRemoveDialEvent() {
                return Promise.resolve(true);
        }
        fireSearchEvent() {
                return Promise.resolve(true);
        }
}

const Analytics = new AnalyticsStub();
Analytics.sendEvent = noop;

export default Analytics;
export { noop as sendEvent };
