const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');

const greetings = {
    en: {
        greetingMorning: "Good morning, trader",
        greetingAfternoon: "Good afternoon, trader",
        greetingEvening: "Good evening, trader"
    },
    ar: {
        greetingMorning: "صباح الخير، أيها المتداول",
        greetingAfternoon: "طاب مساؤك، أيها المتداول",
        greetingEvening: "مساء الخير، أيها المتداول"
    },
    ary: {
        greetingMorning: "صباح الخير، أيها المتداول",
        greetingAfternoon: "مساء الخير، أيها المتداول",
        greetingEvening: "مساء الخير، أيها المتداول"
    },
    es: {
        greetingMorning: "Buenos días, trader",
        greetingAfternoon: "Buenas tardes, trader",
        greetingEvening: "Buenas noches, trader"
    },
    ru: {
        greetingMorning: "Доброе утро, трейдер",
        greetingAfternoon: "Добрый день, трейдер",
        greetingEvening: "Добрый вечер, трейдер"
    },
    zh: {
        greetingMorning: "早上好，交易员",
        greetingAfternoon: "下午好，交易员",
        greetingEvening: "晚上好，交易员"
    },
    vi: {
        greetingMorning: "Chào buổi sáng, nhà giao dịch",
        greetingAfternoon: "Chào buổi chiều, nhà giao dịch",
        greetingEvening: "Chào buổi tối, nhà giao dịch"
    },
    id: {
        greetingMorning: "Selamat pagi, trader",
        greetingAfternoon: "Selamat siang, trader",
        greetingEvening: "Selamat malam, trader"
    },
    fil: {
        greetingMorning: "Magandang umaga, trader",
        greetingAfternoon: "Magandang hapon, trader",
        greetingEvening: "Magandang gabi, trader"
    }
};

for (const [lang, translations] of Object.entries(greetings)) {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!json.strategyStudio) json.strategyStudio = {};
        Object.assign(json.strategyStudio, translations);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
        console.log(`Updated ${lang}.json successfully.`);
    }
}
