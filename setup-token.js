// Скрипт для локальной настройки токена Telegram бота
// Запустите: node setup-token.js

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Введите токен вашего Telegram бота: ', (botToken) => {
    rl.question('Введите ваш Chat ID: ', (chatId) => {
        const mainJsPath = './js/main.js';
        let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Заменяем плейсхолдеры на реальные значения
        mainJsContent = mainJsContent.replace(
            "window.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN'",
            `'${botToken}'`
        );
        mainJsContent = mainJsContent.replace(
            "window.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID'",
            `'${chatId}'`
        );
        
        fs.writeFileSync(mainJsPath, mainJsContent);
        
        console.log('✅ Токен и Chat ID успешно настроены!');
        console.log('⚠️  НЕ КОММИТЬТЕ ЭТОТ ФАЙЛ С ТОКЕНОМ В GIT!');
        rl.close();
    });
});
