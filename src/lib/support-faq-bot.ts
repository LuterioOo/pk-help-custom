export type SupportLocale = "pl" | "ru" | "uk" | "en";

type FaqEntry = {
  keywords: string[];
  answer: Record<SupportLocale, string>;
};

const FAQ: FaqEntry[] = [
  {
    keywords: [
      "собрать",
      "сборк",
      "конструктор",
      "комплект",
      "подобрать",
      "builder",
      "pc build",
      "zbudowa",
      "konfigurator",
      "sklad",
      "skład",
      "зібрати",
      "збірк",
    ],
    answer: {
      ru: "Лучший путь: нажмите «Собрать ПК», выберите комплектующие в конструкторе, а сайт проверит совместимость и покажет итог. Если не уверены в деталях, напишите бюджет и задачи, я подскажу с чего начать.",
      uk: "Найкращий шлях: натисніть «Зібрати ПК», оберіть комплектуючі в конструкторі, а сайт перевірить сумісність і покаже підсумок. Якщо не впевнені, напишіть бюджет і задачі.",
      en: "Best path: open the builder, pick parts, and the site will check compatibility and show the total. If you are unsure, send your budget and tasks and I will guide you.",
      pl: "Najlepiej: otwórz konfigurator, wybierz podzespoły, a strona sprawdzi kompatybilność i pokaże cenę. Jeśli nie wiesz od czego zacząć, podaj budżet i zastosowanie.",
    },
  },
  {
    keywords: ["trade-in", "trade in", "трейд", "обмен", "купон", "старое", "б/у", "wymian", "kupon", "обмін"],
    answer: {
      ru: "Trade-In работает так: вы описываете старое железо, получаете предварительный купон, а финальную сумму подтверждаем после диагностики. Купон можно применить к новой сборке.",
      uk: "Trade-In працює так: ви описуєте старе залізо, отримуєте попередній купон, а фінальну суму підтверджуємо після діагностики. Купон можна застосувати до нової збірки.",
      en: "Trade-In works like this: describe your old hardware, get a preliminary coupon, then we confirm the final value after diagnostics. The coupon can be used for a new build.",
      pl: "Trade-In działa tak: opisujesz stary sprzęt, dostajesz wstępny kupon, a finalną kwotę potwierdzamy po diagnostyce. Kupon można użyć przy nowym PC.",
    },
  },
  {
    keywords: ["рассроч", "кредит", "платеж", "месяц", "installment", "rata", "raty", "розстроч", "splata", "spłata"],
    answer: {
      ru: "Рассрочку считаем ориентировочно на 12 месяцев прямо в карточках и конструкторе. Точные условия менеджер подтвердит при оформлении заявки.",
      uk: "Розстрочку рахуємо орієнтовно на 12 місяців у картках і конструкторі. Точні умови менеджер підтвердить під час оформлення заявки.",
      en: "Installments are estimated for 12 months in cards and the builder. Exact terms are confirmed by a manager when you submit the request.",
      pl: "Raty liczymy orientacyjnie na 12 miesięcy w kartach i konfiguratorze. Dokładne warunki potwierdzi menedżer przy zgłoszeniu.",
    },
  },
  {
    keywords: ["готов", "в продаж", "налич", "shop", "ready", "for sale", "sklep", "gotow", "готовий"],
    answer: {
      ru: "Готовые ПК смотрите в блоке «В продажу». Их можно сразу спросить у менеджера или загрузить как пресет в конструктор и поменять детали под себя.",
      uk: "Готові ПК дивіться в блоці «В продажу». Їх можна одразу запитати в менеджера або завантажити як пресет у конструктор і змінити деталі.",
      en: "Ready PCs are in the “For sale” section. You can ask about one directly or load it into the builder and customize parts.",
      pl: "Gotowe PC są w sekcji “W sprzedaży”. Możesz zapytać o wybrany zestaw albo wczytać go do konfiguratora i zmienić części.",
    },
  },
  {
    keywords: ["доставка", "европа", "польша", "город", "delivery", "ship", "wysyl", "wysył", "dostaw", "доставка"],
    answer: {
      ru: "Доставка доступна по Польше и Европе. Напишите город и желаемую сборку, менеджер уточнит срок, упаковку и стоимость доставки.",
      uk: "Доставка доступна Польщею та Європою. Напишіть місто й бажану збірку, менеджер уточнить термін, пакування та вартість.",
      en: "Delivery is available across Poland and Europe. Send your city and desired build, and a manager will confirm timing, packaging, and cost.",
      pl: "Dostawa dostępna w Polsce i Europie. Podaj miasto oraz wybrany zestaw, a menedżer potwierdzi termin, pakowanie i koszt.",
    },
  },
  {
    keywords: ["гарант", "сервис", "ремонт", "service", "warranty", "napraw", "serwis", "сервіс"],
    answer: {
      ru: "По гарантии и сервису оставьте сообщение с темой «Сервис». Лучше сразу добавить номер заказа, модель ПК и что именно происходит.",
      uk: "Щодо гарантії та сервісу залиште повідомлення з темою «Сервіс». Краще одразу додати номер замовлення, модель ПК і що саме відбувається.",
      en: "For warranty or service, leave a message with the “Service” topic. Add the order number, PC model, and what is happening.",
      pl: "W sprawach gwarancji i serwisu zostaw wiadomość z tematem “Serwis”. Dodaj numer zamówienia, model PC i opis problemu.",
    },
  },
  {
    keywords: ["заявк", "остав", "контакт", "менеджер", "связ", "order", "contact", "kontakt", "zamow", "zamów", "замов"],
    answer: {
      ru: "Чтобы менеджер быстро ответил, оставьте сообщение, имя и телефон или Telegram. Если уже выбрали сборку, укажите бюджет и задачи: игры, работа, монтаж, стриминг.",
      uk: "Щоб менеджер швидко відповів, залиште повідомлення, ім'я та телефон або Telegram. Якщо вже обрали збірку, вкажіть бюджет і задачі.",
      en: "For a quick manager reply, leave your message, name, and phone or Telegram. If you already chose a build, add budget and tasks.",
      pl: "Aby menedżer szybko odpisał, zostaw wiadomość, imię oraz telefon lub Telegram. Jeśli masz wybrany zestaw, dodaj budżet i zastosowanie.",
    },
  },
];

const FALLBACK: Record<SupportLocale, string> = {
  ru: "Я могу подсказать по сборке, Trade-In, рассрочке, доставке и сервису. Напишите задачу и бюджет, либо оставьте контакты, чтобы менеджер ответил точнее.",
  uk: "Я можу підказати щодо збірки, Trade-In, розстрочки, доставки й сервісу. Напишіть задачу та бюджет або залиште контакти.",
  en: "I can help with builds, Trade-In, installments, delivery, and service. Send your task and budget, or leave contacts for a manager.",
  pl: "Pomogę z konfiguracją, Trade-In, ratami, dostawą i serwisem. Podaj zastosowanie i budżet albo zostaw kontakt do menedżera.",
};

export function getFaqReply(text: string, locale: SupportLocale): string {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return FALLBACK[locale];

  for (const entry of FAQ) {
    if (entry.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return entry.answer[locale];
    }
  }

  return FALLBACK[locale];
}
