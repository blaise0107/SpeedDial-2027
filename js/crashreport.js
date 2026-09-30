// Отправка отчётов об ошибках на Everhelper.pro/sdpreviews/crash.php удалена:
// хост недоступен, запросы падают с ошибками в сервисного работника и собирают
// лишние персональные данные (список установленных расширений и т.п.).

export default function collectAndSendReport(message) {
        try {
                console.warn('SpeedDial error (отправка отчётов отключена):', message && message.title);
        } catch (e) {
                // игнорировать
        }
}
