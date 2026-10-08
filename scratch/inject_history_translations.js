const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');

const historyTranslations = {
    en: {
        history: "History",
        chatHistory: "Chat History",
        noHistory: "No previous chats found",
        noHistoryDesc: "Your strategy conversations and models will appear here.",
        searchHistory: "Search chats...",
        deleteChat: "Delete chat",
        startChat: "Start a New Chat",
        newChat: "New Chat"
    },
    ar: {
        history: "السجل",
        chatHistory: "سجل المحادثات",
        noHistory: "لم يتم العثور على محادثات سابقة",
        noHistoryDesc: "ستظهر محادثاتك ونماذج استراتيجياتك السابقة هنا.",
        searchHistory: "البحث في المحادثات...",
        deleteChat: "حذف المحادثة",
        startChat: "بدء محادثة جديدة",
        newChat: "محادثة جديدة"
    },
    ary: {
        history: "السجل",
        chatHistory: "سجل المحادثات",
        noHistory: "ماكاينش محادثات سابقة",
        noHistoryDesc: "المحادثات والنماذج ديال الاستراتيجيات غادي يظهروا هنا.",
        searchHistory: "بحث فالمحادثات...",
        deleteChat: "مسح المحادثة",
        startChat: "بدا محادثة جديدة",
        newChat: "محادثة جديدة"
    },
    es: {
        history: "Historial",
        chatHistory: "Historial de Chat",
        noHistory: "No se encontraron chats anteriores",
        noHistoryDesc: "Tus conversaciones y modelos de estrategia aparecerán aquí.",
        searchHistory: "Buscar chats...",
        deleteChat: "Eliminar chat",
        startChat: "Iniciar un nuevo chat",
        newChat: "Nuevo chat"
    },
    ru: {
        history: "История",
        chatHistory: "История чатов",
        noHistory: "Предыдущие чаты не найдены",
        noHistoryDesc: "Ваши диалоги по стратегиям и модели будут отображаться здесь.",
        searchHistory: "Поиск чатов...",
        deleteChat: "Удалить чат",
        startChat: "Начать новый чат",
        newChat: "Новый чат"
    },
    zh: {
        history: "历史记录",
        chatHistory: "聊天历史",
        noHistory: "未找到之前的聊天记录",
        noHistoryDesc: "您的策略对话与模型将显示在此处。",
        searchHistory: "搜索聊天...",
        deleteChat: "删除聊天",
        startChat: "发起新对话",
        newChat: "新建对话"
    },
    vi: {
        history: "Lịch sử",
        chatHistory: "Lịch sử trò chuyện",
        noHistory: "Không tìm thấy đoạn trò chuyện nào",
        noHistoryDesc: "Các cuộc hội thoại chiến lược của bạn sẽ xuất hiện ở đây.",
        searchHistory: "Tìm kiếm đoạn chat...",
        deleteChat: "Xóa đoạn chat",
        startChat: "Bắt đầu cuộc trò chuyện mới",
        newChat: "Cuộc trò chuyện mới"
    },
    id: {
        history: "Riwayat",
        chatHistory: "Riwayat Obrolan",
        noHistory: "Tidak ada obrolan sebelumnya",
        noHistoryDesc: "Percakapan dan model strategi Anda akan muncul di sini.",
        searchHistory: "Cari obrolan...",
        deleteChat: "Hapus obrolan",
        startChat: "Mulai Obrolan Baru",
        newChat: "Obrolan Baru"
    },
    fil: {
        history: "Kasaysayan",
        chatHistory: "Kasaysayan ng Chat",
        noHistory: "Walang nahanap na nakaraang chat",
        noHistoryDesc: "Lalabas dito ang iyong mga pag-uusap sa estratehiya at mga modelo.",
        searchHistory: "Maghanap ng chat...",
        deleteChat: "Burahin ang chat",
        startChat: "Magsimula ng Bagong Chat",
        newChat: "Bagong Chat"
    }
};

for (const [lang, translations] of Object.entries(historyTranslations)) {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!json.strategyStudio) json.strategyStudio = {};
        Object.assign(json.strategyStudio, translations);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
        console.log(`Updated ${lang}.json with history translations.`);
    }
}
