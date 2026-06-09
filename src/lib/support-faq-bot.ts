export type SupportLocale = "pl" | "ru" | "uk" | "en";

type FaqEntry = {
  keywords: string[];
  answer: Record<SupportLocale, string>;
};

const FAQ: FaqEntry[] = [
  {
    keywords: [
      "собрать", "сборк", "конструктор", "builder", "pc build", "комплектующ",
      "zbudowa", "konfigurator", "skład", "зібрати", "конструктор",
    ],
    answer: {
      ru: "Откройте конструктор на главной — выберите комплектующие, мы проверим совместимость и покажем цену. Затем оставьте заявку.",
      uk: "Відкрийте конструктор на головній — оберіть комплектуючі, ми перевіримо сумісність і покажемо ціну. Потім залиште заявку.",
      en: "Open the builder on the homepage — pick parts, we check compatibility and show the price. Then submit your request.",
      pl: "Otwórz konfigurator na stronie głównej — wybierz podzespoły, sprawdzimy kompatybilność i cenę. Potem złóż zamówienie.",
    },
  },
  {
    keywords: [
      "trade-in", "trade in", "трейд", "обмен", "купон", "старое", "б/у",
      "wymian", "kupon", "обмін",
    ],
    answer: {
      ru: "Trade-In — сдайте старое железо, получите купон на скидку при заказе новой сборки. Оценка за пару минут на странице Trade-In.",
      uk: "Trade-In — здайте старе залізо, отримайте купон на знижку при замовленні нової збірки. Оцінка за кілька хвилин на сторінці Trade-In.",
      en: "Trade-In lets you trade old hardware for a discount coupon on a new build. Get an estimate in minutes on the Trade-In page.",
      pl: "Trade-In — oddaj stare podzespoły, otrzymaj kupon rabatowy na nowy PC. Wycena w kilka minut na stronie Trade-In.",
    },
  },
  {
    keywords: [
      "рассроч", "installment", "кредит", "платеж", "месяц", "rata", "raty",
      "розстроч", "splata",
    ],
    answer: {
      ru: "Рассрочка доступна на готовые сборки и заказы — до 12 месяцев. Сумма и условия показываются при оформлении.",
      uk: "Розстрочка доступна на готові збірки та замовлення — до 12 місяців. Сума та умови показуються при оформленні.",
      en: "Installments are available on ready builds and orders — up to 12 months. Terms are shown at checkout.",
      pl: "Raty dostępne na gotowe zestawy i zamówienia — do 12 miesięcy. Warunki widoczne przy składaniu zamówienia.",
    },
  },
  {
    keywords: [
      "конструктор", "builder", "где собрать", "gdzie", "де конструктор", "where",
    ],
    answer: {
      ru: "Конструктор — на главной странице, кнопка «Собрать ПК» или раздел #builder.",
      uk: "Конструктор — на головній сторінці, кнопка «Зібрати ПК» або розділ #builder.",
      en: "The builder is on the homepage — «Build PC» button or the #builder section.",
      pl: "Konfigurator jest na stronie głównej — przycisk «Zbuduj PC» lub sekcja #builder.",
    },
  },
  {
    keywords: [
      "заявк", "оставить", "связ", "контакт", "менеджер", "zamów", "order", "замов",
      "contact", "kontakt",
    ],
    answer: {
      ru: "Оставьте заявку в конструкторе или в форме заказа внизу страницы. Укажите имя и телефон — менеджер свяжется с вами.",
      uk: "Залиште заявку в конструкторі або у формі замовлення внизу сторінки. Вкажіть ім'я та телефон — менеджер зв'яжеться з вами.",
      en: "Submit a request in the builder or the order form at the bottom. Add your name and phone — a manager will contact you.",
      pl: "Złóż zamówienie w konfiguratorze lub w formularzu na dole strony. Podaj imię i telefon — skontaktujemy się.",
    },
  },
  {
    keywords: [
      "готов", "в продаж", "shop", "sklep", "готовий", "ready", "for sale",
    ],
    answer: {
      ru: "Готовые сборки — в разделе «В продаже» на главной. Можно настроить комплектующие и оформить заказ.",
      uk: "Готові збірки — у розділі «В продажу» на головній. Можна налаштувати комплектуючі та оформити замовлення.",
      en: "Ready builds are in the «For sale» section on the homepage. You can customize parts and place an order.",
      pl: "Gotowe zestawy — w sekcji «W sprzedaży» na stronie głównej. Możesz dostosować podzespoły i zamówić.",
    },
  },
  {
    keywords: [
      "сервис", "ремонт", "гарант", "service", "warranty", "napraw", "сервіс",
    ],
    answer: {
      ru: "По вопросам сервиса и гарантии оставьте сообщение здесь с темой «Сервис» — мы передадим специалисту.",
      uk: "З питань сервісу та гарантії залиште повідомлення тут з темою «Сервіс» — ми передамо спеціалісту.",
      en: "For service and warranty questions, leave a message here with topic «Service» — we'll forward it to our team.",
      pl: "W sprawach serwisu i gwarancji zostaw wiadomość z tematem «Serwis» — przekażemy specjaliście.",
    },
  },
];

const FALLBACK: Record<SupportLocale, string> = {
  ru: "Оставьте контакты — менеджер свяжется с вами.",
  uk: "Залиште контакти — менеджер зв'яжеться з вами.",
  en: "Leave your contacts — a manager will get back to you.",
  pl: "Zostaw kontakt — menedżer się odezwie.",
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
