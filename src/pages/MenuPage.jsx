/**
 * MenuPage.jsx — Production-Ready Restaurant Menu
 * Frontend-only Telegram order integration
 * Barcha ma'lumotlar ../data/menuData dan import qilinadi
 */

import { asosiyMenu, barMenu } from "../data/menuData";
import {
  useState, useMemo, useRef, useEffect, useCallback,
  memo, useReducer,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  TELEGRAM CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TG = {
  food: {
    token:  "8518803010:AAET7XeNo3mHaPH3NRhrnaO7AjDcJTX0Fos",
    chatId: "6290796444",
  },
  bar: {
    token:  "8901302980:AAGDR69P77LtrZbP81o5TKzK3QzQFQuPhrY",
    chatId: "6290796444",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  TELEGRAM YUBORISH
// ─────────────────────────────────────────────────────────────────────────────
async function sendToTelegram({ type, cartItems, total, customer, orderId }) {
  const cfg = TG[type] || TG.food;

  const name      = customer?.name  || "Noma'lum";
  const phone     = customer?.phone || "Noma'lum";
  const items     = Array.isArray(cartItems) ? cartItems : [];
  const safeTotal = typeof total === "number" && !isNaN(total) ? total : 0;
  const note      = customer?.note || "—";
  const dtype     = customer?.deliveryType === "yetkazish"
    ? "🛵 Yetkazish"
    : `🪑 Stol: ${customer?.stol || "—"}`;

  const itemLines = items
    .map((i) => `• ${i?.nomi || "?"} × ${i?.qty || 1} = ${((i?.narx || 0) * (i?.qty || 1)).toLocaleString("uz-UZ")} so'm`)
    .join("\n");

  const text =
    `🧾 *YANGI BUYURTMA* — #${orderId}\n` +
    `📋 Tur: ${type === "bar" ? "🍹 Bar" : "🍽️ Asosiy"}\n` +
    `⏰ Vaqt: ${new Date().toLocaleString("uz-UZ")}\n` +
    `──────────────────\n` +
    `${itemLines || "— taom yo'q —"}\n` +
    `──────────────────\n` +
    `💰 *Jami: ${safeTotal.toLocaleString("uz-UZ")} so'm*\n\n` +
    `👤 Ism: ${name}\n` +
    `📞 Telefon: ${phone}\n` +
    `📍 ${dtype}\n` +
    `📝 Izoh: ${note}`;

  const url = `https://api.telegram.org/bot${cfg.token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    cfg.chatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  const result = await res.json();
  if (!result.ok) {
    throw new Error(`Telegram API xatosi: ${result.description || "Noma'lum xato"}`);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILLAR
// ─────────────────────────────────────────────────────────────────────────────
const LANG = {
  uz: {
    asosiy: "Asosiy menu", bar: "Bar", kategoriyalar: "Kategoriyalar",
    qidirish: "Taom / ichimlik qidirish...",
    standart: "Standart", narx_asc: "Narx ↑", narx_desc: "Narx ↓", reyting_sort: "Reyting",
    topilmadi: "Hech narsa topilmadi", filtr_tozala: "Filtrni tozalash",
    mahsulot: "ta", som: "so'm", narx_kelish: "Kelishiladi",
    savatga: "Qo'shish", bosh_sahifa: "Bosh sahifa",
    kkal: "kkal", glutensiz: "Glutensiz",
    ommabop: "🔥 Top", vegetarian: "🥗 Veg", diet: "💪 Diet",
    vegan: "🌱 Vegan", spicy: "🌶️ Achchiq", seafood: "🦐 Dengiz",
    savat: "Savat", savat_bosh: "Savat bo'sh", savat_bosh_tavsif: "Biror taom qo'shing",
    jami: "Jami", buyurtma: "Buyurtma berish", tozala: "Tozalash",
    yoqtirganlar: "Yoqtirilganlar", yoqtirilgan_bosh: "Hech narsa yoqtirilmagan",
    narx_filter: "Narx oralig'i",
    order_title: "Buyurtmani rasmiylashtirish",
    isim: "Ismingiz *", telefon: "Telefon *", izoh: "Izoh (ixtiyoriy)",
    stol: "Stol raqami", yetkazish: "Yetkazish",
    yuborish: "Buyurtma yuborish", bekor: "Bekor qilish",
    muvaffaqiyat: "Buyurtmangiz qabul qilindi! 🎉",
    xato: "Xatolik yuz berdi. Qayta urining.",
    validatsiya_isim: "Ism kiritish majburiy",
    validatsiya_tel: "Telefon raqam noto'g'ri (9-15 raqam)",
    validatsiya_bosh: "Savat bo'sh",
    yuborilmoqda: "Yuborilmoqda...",
    buyurtma_turi: "Buyurtma turi",
  },
  ru: {
    asosiy: "Меню", bar: "Бар", kategoriyalar: "Категории",
    qidirish: "Поиск блюда или напитка...",
    standart: "По умолч.", narx_asc: "Цена ↑", narx_desc: "Цена ↓", reyting_sort: "Рейтинг",
    topilmadi: "Ничего не найдено", filtr_tozala: "Сбросить фильтры",
    mahsulot: "поз.", som: "сум", narx_kelish: "По договору",
    savatga: "В корзину", bosh_sahifa: "Главная",
    kkal: "ккал", glutensiz: "Без глютена",
    ommabop: "🔥 Топ", vegetarian: "🥗 Вег", diet: "💪 Диета",
    vegan: "🌱 Веган", spicy: "🌶️ Острое", seafood: "🦐 Море",
    savat: "Корзина", savat_bosh: "Корзина пуста", savat_bosh_tavsif: "Добавьте что-нибудь",
    jami: "Итого", buyurtma: "Оформить заказ", tozala: "Очистить",
    yoqtirganlar: "Избранное", yoqtirilgan_bosh: "Ничего не добавлено",
    narx_filter: "Диапазон цен",
    order_title: "Оформление заказа",
    isim: "Ваше имя *", telefon: "Телефон *", izoh: "Комментарий (необяз.)",
    stol: "Номер стола", yetkazish: "Доставка",
    yuborish: "Отправить заказ", bekor: "Отмена",
    muvaffaqiyat: "Заказ принят! 🎉",
    xato: "Произошла ошибка. Попробуйте снова.",
    validatsiya_isim: "Введите имя",
    validatsiya_tel: "Неверный номер телефона",
    validatsiya_bosh: "Корзина пуста",
    yuborilmoqda: "Отправляется...",
    buyurtma_turi: "Тип заказа",
  },
  en: {
    asosiy: "Menu", bar: "Bar", kategoriyalar: "Categories",
    qidirish: "Search food or drinks...",
    standart: "Default", narx_asc: "Price ↑", narx_desc: "Price ↓", reyting_sort: "Rating",
    topilmadi: "Nothing found", filtr_tozala: "Clear filters",
    mahsulot: "items", som: "sum", narx_kelish: "Price on request",
    savatga: "Add", bosh_sahifa: "Home",
    kkal: "kcal", glutensiz: "Gluten-free",
    ommabop: "🔥 Top", vegetarian: "🥗 Veg", diet: "💪 Diet",
    vegan: "🌱 Vegan", spicy: "🌶️ Spicy", seafood: "🦐 Seafood",
    savat: "Cart", savat_bosh: "Cart is empty", savat_bosh_tavsif: "Add something delicious",
    jami: "Total", buyurtma: "Place order", tozala: "Clear",
    yoqtirganlar: "Favorites", yoqtirilgan_bosh: "No favorites yet",
    narx_filter: "Price range",
    order_title: "Place Your Order",
    isim: "Your name *", telefon: "Phone *", izoh: "Comment (optional)",
    stol: "Table number", yetkazish: "Delivery",
    yuborish: "Submit order", bekor: "Cancel",
    muvaffaqiyat: "Order accepted! 🎉",
    xato: "Something went wrong. Please try again.",
    validatsiya_isim: "Name is required",
    validatsiya_tel: "Invalid phone number",
    validatsiya_bosh: "Cart is empty",
    yuborilmoqda: "Sending...",
    buyurtma_turi: "Order type",
  },
};

const ALL_TAGS = ["ommabop", "vegetarian", "diet", "vegan", "spicy", "seafood"];

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmtPrice(n, t) {
  if (n == null || isNaN(n)) return t.narx_kelish;
  return Number(n).toLocaleString("uz-UZ") + " " + t.som;
}

function generateOrderId() {
  return (
    "ORD-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CART REDUCER
// ─────────────────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const ex = state.find((i) => i.id === action.item.id);
      if (ex) return state.map((i) => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "INC":    return state.map((i) => i.id === action.id ? { ...i, qty: i.qty + 1 } : i);
    case "DEC":    return state.map((i) => i.id === action.id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0);
    case "REMOVE": return state.filter((i) => i.id !== action.id);
    case "CLEAR":  return [];
    default:       return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CUSTOM HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function useDebounce(value, delay = 300) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
.mp*,.mp*::before,.mp*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
.mp button{font-family:inherit;cursor:pointer;border:none}
.mp input,.mp select,.mp textarea{font-family:inherit}
.mp{font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;background:#080e1c;color:#e2e8f0;min-height:100vh;position:relative;overflow-x:hidden}

/* topbar */
.mp-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #1a2540;background:rgba(8,14,28,.96);position:sticky;top:0;z-index:200;backdrop-filter:blur(16px);gap:12px}
.mp-brand{font-size:19px;font-weight:900;letter-spacing:-.03em;background:linear-gradient(135deg,#F59E0B,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;flex-shrink:0}
.mp-topbar-right{display:flex;align-items:center;gap:8px}
.mp-lang-btn{background:transparent;border:1.5px solid #1e293b;color:#64748b;font-size:11px;font-weight:700;padding:5px 10px;border-radius:8px;transition:all .15s;letter-spacing:.06em;min-width:38px;min-height:34px}
.mp-lang-btn:hover{border-color:#F59E0B;color:#F59E0B}
.mp-lang-btn.active{background:#F59E0B;border-color:#F59E0B;color:#080e1c}
.mp-icon-btn{position:relative;width:42px;height:42px;border-radius:12px;background:#0f1e35;border:1.5px solid #1e2d4a;color:#94a3b8;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .18s}
.mp-icon-btn:hover{border-color:#F59E0B;color:#F59E0B}
.mp-icon-btn.active{background:rgba(245,158,11,.15);border-color:#F59E0B;color:#F59E0B}
.mp-badge-count{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:800;min-width:18px;height:18px;border-radius:9px;padding:0 4px;display:flex;align-items:center;justify-content:center;border:2px solid #080e1c;animation:mp-pop .25s cubic-bezier(.34,1.56,.64,1)}
@keyframes mp-pop{0%{transform:scale(0)}100%{transform:scale(1)}}

/* tabs */
.mp-tabs{display:flex;border-bottom:1px solid #1a2540;background:#080e1c;position:sticky;top:57px;z-index:190}
.mp-tab{flex:1;max-width:240px;background:transparent;color:#64748b;font-size:14px;font-weight:600;padding:13px 20px;display:flex;align-items:center;justify-content:center;gap:8px;border-bottom:3px solid transparent;transition:all .2s}
.mp-tab:hover{color:#cbd5e1}
.mp-tab.active{color:#F59E0B;border-bottom-color:#F59E0B}

/* breadcrumb */
.mp-bc{font-size:12px;color:#3d5170;display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:9px 20px;border-bottom:1px solid #111d33;background:#080e1c}
.mp-bc-sep{color:#2d3e5a}
.mp-bc-cur{color:#F59E0B;font-weight:600}

/* layout */
.mp-layout{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 130px)}

/* sidebar */
.mp-sidebar{background:#0c1425;border-right:1px solid #1a2540;position:sticky;top:130px;height:calc(100vh - 130px);overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:#1e2d4a transparent}
.mp-sidebar::-webkit-scrollbar{width:3px}
.mp-sidebar::-webkit-scrollbar-thumb{background:#1e2d4a;border-radius:2px}
.mp-sidebar-label{font-size:10px;font-weight:800;letter-spacing:.12em;color:#2d3e5a;text-transform:uppercase;padding:18px 16px 10px}
.mp-cat-list{list-style:none;padding:0 8px 24px}
.mp-cat-btn{width:100%;background:transparent;border-left:3px solid transparent;color:#94a3b8;font-size:13px;font-weight:500;padding:10px 14px;border-radius:0 8px 8px 0;display:flex;align-items:center;gap:10px;transition:all .15s;text-align:left;margin-bottom:2px;min-height:44px}
.mp-cat-btn:hover{background:#1a2540;color:#e2e8f0}
.mp-cat-btn.active{background:linear-gradient(90deg,rgba(245,158,11,.18),rgba(245,158,11,.04));color:#F59E0B;border-left-color:#F59E0B}
.mp-cat-icon{font-size:17px;flex-shrink:0}
.mp-cat-name{flex:1;line-height:1.2}
.mp-cat-count{font-size:11px;font-weight:700;background:#1a2540;color:#475569;padding:2px 8px;border-radius:20px;flex-shrink:0;min-width:26px;text-align:center}
.mp-cat-btn.active .mp-cat-count{background:rgba(245,158,11,.2);color:#F59E0B}

/* content */
.mp-content{padding:20px 20px 80px;overflow-y:auto;max-height:calc(100vh - 130px);scrollbar-width:thin;scrollbar-color:#1e2d4a transparent}
.mp-content::-webkit-scrollbar{width:5px}
.mp-content::-webkit-scrollbar-thumb{background:#1e2d4a;border-radius:3px}

/* cat header */
.mp-cat-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.mp-cat-header-left{display:flex;align-items:center;gap:14px;flex:1;min-width:200px}
.mp-cat-emoji{font-size:38px;line-height:1;flex-shrink:0}
.mp-cat-title{font-size:22px;font-weight:800;color:#f1f5f9;line-height:1.2}
.mp-cat-desc{font-size:13px;color:#64748b;margin-top:3px}
.mp-cat-badge{background:#1a2540;color:#475569;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;white-space:nowrap;flex-shrink:0}
.mp-note{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.22);border-radius:10px;padding:12px 16px;font-size:13px;color:#fbbf24;margin-bottom:16px;line-height:1.6}

/* filterbar */
.mp-filterbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 0;border-top:1px solid #1a2540;border-bottom:1px solid #1a2540;margin-bottom:20px}
.mp-search-wrap{position:relative;flex:1;min-width:180px}
.mp-search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;opacity:.5}
.mp-search{width:100%;background:#0f1e35;border:1.5px solid #1e2d4a;color:#e2e8f0;font-size:14px;padding:10px 38px;border-radius:10px;outline:none;transition:border-color .15s;min-height:44px}
.mp-search::placeholder{color:#3d5170}
.mp-search:focus{border-color:#F59E0B}
.mp-search-x{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:#1a2540;color:#64748b;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .15s}
.mp-search-x:hover{background:#263a5a;color:#e2e8f0}
.mp-tags-scroll{display:flex;gap:7px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex:1;min-width:0;padding-bottom:2px}
.mp-tags-scroll::-webkit-scrollbar{display:none}
.mp-tag{background:#0f1e35;border:1.5px solid #1e2d4a;color:#94a3b8;font-size:12px;font-weight:600;padding:8px 14px;border-radius:20px;white-space:nowrap;transition:all .15s;min-height:36px;display:flex;align-items:center}
.mp-tag:hover{border-color:#F59E0B;color:#F59E0B}
.mp-tag.active{background:rgba(245,158,11,.15);border-color:#F59E0B;color:#F59E0B}
.mp-sort{background:#0f1e35;border:1.5px solid #1e2d4a;color:#94a3b8;font-size:13px;padding:10px 12px;border-radius:10px;outline:none;transition:border-color .15s;min-height:44px;cursor:pointer;flex-shrink:0}
.mp-sort:hover,.mp-sort:focus{border-color:#F59E0B;color:#e2e8f0}
.mp-sort option{background:#0f1e35}
.mp-price-filter{display:flex;align-items:center;gap:8px;flex-shrink:0;background:#0f1e35;border:1.5px solid #1e2d4a;border-radius:10px;padding:6px 12px;min-height:44px}
.mp-price-filter span{font-size:11px;color:#64748b;white-space:nowrap}
.mp-price-filter input[type=range]{-webkit-appearance:none;width:80px;height:3px;background:linear-gradient(to right,#F59E0B var(--pct,100%),#1e2d4a var(--pct,100%));border-radius:2px;outline:none;cursor:pointer}
.mp-price-filter input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;background:#F59E0B;border-radius:50%;border:2px solid #080e1c}

/* grid */
.mp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}

/* card */
.mp-card{background:#0c1425;border:1.5px solid #1a2540;border-radius:16px;overflow:hidden;transition:transform .22s,border-color .22s,box-shadow .22s;display:flex;flex-direction:column;animation:mp-fadein .3s ease both}
@keyframes mp-fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.mp-card:hover{transform:translateY(-4px);border-color:rgba(245,158,11,.4);box-shadow:0 12px 32px rgba(0,0,0,.45)}
.mp-card-img-wrap{position:relative;aspect-ratio:16/10;overflow:hidden;background:#111d33}
.mp-card-img{width:100%;height:100%;object-fit:cover;transition:transform .4s;display:block}
.mp-card:hover .mp-card-img{transform:scale(1.07)}
.mp-card-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:52px;background:linear-gradient(135deg,#0f1e35,#1a2540)}
.mp-badges{position:absolute;top:10px;left:10px;display:flex;flex-direction:column;gap:5px}
.mp-badge{font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;letter-spacing:.04em;backdrop-filter:blur(6px)}
.mp-badge-hot{background:rgba(245,158,11,.92);color:#080e1c}
.mp-badge-diet{background:rgba(34,197,94,.85);color:#080e1c}
.mp-badge-veg{background:rgba(16,185,129,.85);color:#080e1c}
.mp-badge-hot2{background:rgba(239,68,68,.85);color:#fff}
.mp-wish{position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:50%;background:rgba(8,14,28,.78);border:1.5px solid #1e2d4a;color:#64748b;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(6px)}
.mp-wish:hover{color:#ef4444;border-color:#ef4444}
.mp-wish.on{color:#ef4444;border-color:#ef4444;background:rgba(239,68,68,.2)}
.mp-wish:active{transform:scale(1.25)}
.mp-card-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:8px;flex:1}
.mp-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.mp-rating{display:flex;align-items:center;gap:4px}
.mp-star{color:#F59E0B;font-size:13px}
.mp-rating-val{font-size:13px;font-weight:700;color:#fbbf24}
.mp-weight{font-size:11px;font-weight:600;color:#475569;background:#1a2540;padding:3px 8px;border-radius:8px}
.mp-card-name{font-size:15px;font-weight:700;color:#f1f5f9;line-height:1.3}
.mp-card-desc{font-size:12px;color:#64748b;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mp-chips{display:flex;flex-wrap:wrap;gap:5px}
.mp-chip{font-size:11px;background:#111d33;color:#64748b;padding:3px 9px;border-radius:8px}
.mp-card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px;border-top:1px solid #1a2540;gap:8px}
.mp-price{font-size:17px;font-weight:800;color:#F59E0B;line-height:1}
.mp-add{min-width:44px;height:44px;padding:0 14px;border-radius:22px;background:#F59E0B;color:#080e1c;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .18s;flex-shrink:0;white-space:nowrap}
.mp-add:hover{background:#fbbf24;transform:scale(1.06)}
.mp-add:active{transform:scale(.96)}
.mp-add.done{background:#22c55e}

/* skeleton */
.mp-skeleton{background:linear-gradient(90deg,#0f1e35 25%,#1a2540 50%,#0f1e35 75%);background-size:200% 100%;animation:mp-shimmer 1.4s infinite;border-radius:8px}
@keyframes mp-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.mp-skel-card{background:#0c1425;border:1.5px solid #1a2540;border-radius:16px;overflow:hidden}
.mp-skel-img{aspect-ratio:16/10}
.mp-skel-body{padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.mp-skel-line{height:12px;border-radius:6px}

/* empty */
.mp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:80px 20px;color:#3d5170;text-align:center}
.mp-empty-ico{font-size:60px;opacity:.5}
.mp-empty-txt{font-size:17px;font-weight:600;color:#4a6080}
.mp-empty-btn{background:#0f1e35;border:1.5px solid #1e2d4a;color:#94a3b8;font-size:13px;font-weight:600;padding:10px 22px;border-radius:10px;transition:all .15s;min-height:44px}
.mp-empty-btn:hover{border-color:#F59E0B;color:#F59E0B}

/* cart overlay & panel */
.mp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:500;backdrop-filter:blur(4px);animation:mp-fade-in .2s ease}
@keyframes mp-fade-in{from{opacity:0}to{opacity:1}}
.mp-panel{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);background:#0c1425;border-left:1px solid #1a2540;z-index:501;display:flex;flex-direction:column;animation:mp-slide-in .28s cubic-bezier(.32,.72,0,1)}
@keyframes mp-slide-in{from{transform:translateX(100%)}to{transform:none}}
.mp-panel-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #1a2540}
.mp-panel-title{font-size:17px;font-weight:800;color:#f1f5f9}
.mp-panel-close{width:36px;height:36px;border-radius:10px;background:#1a2540;color:#94a3b8;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s}
.mp-panel-close:hover{background:#263a5a;color:#e2e8f0}
.mp-panel-items{flex:1;overflow-y:auto;padding:12px 20px;scrollbar-width:thin;scrollbar-color:#1e2d4a transparent}
.mp-panel-items::-webkit-scrollbar{width:3px}
.mp-panel-items::-webkit-scrollbar-thumb{background:#1e2d4a;border-radius:2px}
.mp-cart-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #111d33;animation:mp-fadein .2s ease}
.mp-item-emoji{font-size:24px;flex-shrink:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:#111d33;border-radius:10px}
.mp-item-info{flex:1;min-width:0}
.mp-item-name{font-size:13px;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-item-price{font-size:12px;color:#F59E0B;font-weight:700;margin-top:2px}
.mp-cart-qty{display:flex;align-items:center;gap:8px;flex-shrink:0}
.mp-qty-btn{width:30px;height:30px;border-radius:8px;background:#1a2540;color:#94a3b8;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .15s}
.mp-qty-btn:hover{background:#263a5a;color:#e2e8f0}
.mp-qty-val{font-size:14px;font-weight:700;color:#f1f5f9;min-width:20px;text-align:center}
.mp-cart-del{color:#ef4444;font-size:18px;padding:4px 8px;transition:all .15s;border-radius:6px;background:transparent;border:none;cursor:pointer}
.mp-cart-del:hover{background:rgba(239,68,68,.15)}
.mp-panel-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;color:#3d5170;text-align:center;padding:40px}
.mp-panel-empty-ico{font-size:64px;opacity:.4}
.mp-panel-empty-txt{font-size:16px;font-weight:600;color:#4a6080}
.mp-cart-footer{padding:16px 20px;border-top:1px solid #1a2540;display:flex;flex-direction:column;gap:12px}
.mp-cart-total{display:flex;align-items:center;justify-content:space-between}
.mp-cart-total-label{font-size:14px;color:#94a3b8;font-weight:600}
.mp-cart-total-val{font-size:22px;font-weight:900;color:#F59E0B}
.mp-cart-actions{display:flex;gap:8px}
.mp-btn-clear{flex:1;background:#1a2540;color:#94a3b8;font-size:13px;font-weight:700;padding:12px;border-radius:12px;transition:all .15s;border:none;cursor:pointer}
.mp-btn-clear:hover{background:#263a5a;color:#e2e8f0}
.mp-btn-order{flex:2;background:#F59E0B;color:#080e1c;font-size:14px;font-weight:800;padding:13px;border-radius:12px;transition:all .18s;border:none;cursor:pointer}
.mp-btn-order:hover{background:#fbbf24;transform:scale(1.02)}
.mp-btn-order:active{transform:scale(.98)}
.mp-fav-add{background:#F59E0B;color:#080e1c;font-size:12px;font-weight:800;padding:8px 14px;border-radius:10px;flex-shrink:0;transition:all .15s;border:none;cursor:pointer}
.mp-fav-add:hover{background:#fbbf24}
.mp-fav-heart{color:#ef4444;font-size:18px;padding:4px 8px;transition:all .15s;border-radius:6px;background:transparent;border:none;cursor:pointer}
.mp-fav-heart:hover{background:rgba(239,68,68,.15)}

/* modal */
.mp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:600;backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;animation:mp-fade-in .2s ease}
@media(min-width:640px){.mp-modal-overlay{align-items:center}}
.mp-modal{width:100%;max-width:520px;background:#0c1425;border:1px solid #1a2540;border-radius:20px 20px 0 0;padding:24px 24px 32px;max-height:90vh;overflow-y:auto;animation:mp-modal-in .3s cubic-bezier(.32,.72,0,1)}
@media(min-width:640px){.mp-modal{border-radius:20px;margin:20px}}
@keyframes mp-modal-in{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
.mp-modal-title{font-size:20px;font-weight:800;color:#f1f5f9;margin-bottom:20px}
.mp-modal-summary{background:#111d33;border-radius:12px;padding:14px;margin-bottom:20px;font-size:13px;color:#94a3b8;max-height:160px;overflow-y:auto;line-height:1.8}
.mp-form-group{margin-bottom:14px}
.mp-form-label{font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;display:block;letter-spacing:.04em;text-transform:uppercase}
.mp-form-input{width:100%;background:#111d33;border:1.5px solid #1e2d4a;color:#e2e8f0;font-size:14px;padding:11px 14px;border-radius:10px;outline:none;transition:border-color .15s;min-height:44px}
.mp-form-input:focus{border-color:#F59E0B}
.mp-form-input::placeholder{color:#3d5170}
.mp-form-input.err{border-color:#ef4444}
.mp-form-err{font-size:11px;color:#ef4444;margin-top:4px}
.mp-dtype-row{display:flex;gap:8px}
.mp-dtype-btn{flex:1;padding:10px;border-radius:10px;background:#111d33;border:1.5px solid #1e2d4a;color:#94a3b8;font-size:13px;font-weight:600;transition:all .15s;cursor:pointer}
.mp-dtype-btn.active{background:rgba(245,158,11,.15);border-color:#F59E0B;color:#F59E0B}
.mp-modal-actions{display:flex;gap:10px;margin-top:20px}
.mp-btn-cancel{flex:1;background:#1a2540;color:#94a3b8;font-size:14px;font-weight:700;padding:14px;border-radius:12px;transition:all .15s;border:none;cursor:pointer}
.mp-btn-cancel:hover{background:#263a5a}
.mp-btn-submit{flex:2;background:#F59E0B;color:#080e1c;font-size:14px;font-weight:800;padding:14px;border-radius:12px;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer}
.mp-btn-submit:hover:not(:disabled){background:#fbbf24;transform:scale(1.02)}
.mp-btn-submit:disabled{opacity:.7;cursor:not-allowed}

/* toasts */
.mp-toasts{position:fixed;bottom:24px;right:24px;z-index:700;display:flex;flex-direction:column;gap:10px;pointer-events:none}
.mp-toast{display:flex;align-items:center;gap:10px;background:#1a2540;border:1px solid #263a5a;border-radius:12px;padding:12px 16px;font-size:14px;font-weight:600;color:#e2e8f0;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:mp-toast-in .3s cubic-bezier(.32,.72,0,1);pointer-events:all;max-width:320px}
@keyframes mp-toast-in{from{transform:translateX(120%);opacity:0}to{transform:none;opacity:1}}
.mp-toast.success{border-left:4px solid #22c55e}
.mp-toast.error{border-left:4px solid #ef4444}
.mp-toast.info{border-left:4px solid #F59E0B}
.mp-toast-ico{font-size:18px;flex-shrink:0}
.mp-toast-close{background:none;color:#475569;font-size:16px;padding:0 4px;margin-left:auto;border:none;cursor:pointer}
.mp-toast-close:hover{color:#94a3b8}

/* responsive */
@media(max-width:1000px){
  .mp-layout{grid-template-columns:1fr}
  .mp-sidebar{position:static;top:auto;height:auto;border-right:none;border-bottom:1px solid #1a2540;background:#080e1c}
  .mp-sidebar-label{display:none}
  .mp-cat-list{display:flex;gap:8px;padding:10px 14px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .mp-cat-list::-webkit-scrollbar{display:none}
  .mp-cat-btn{flex-direction:column;align-items:center;min-width:72px;padding:10px 8px;border-radius:12px;gap:5px;border-left:none!important;border-bottom:2.5px solid transparent;text-align:center;flex-shrink:0}
  .mp-cat-btn.active{border-bottom-color:#F59E0B;background:rgba(245,158,11,.1)}
  .mp-cat-name{font-size:10px}
  .mp-cat-count{display:none}
  .mp-content{max-height:none;padding:16px 14px 80px}
}
@media(max-width:600px){
  .mp-grid{grid-template-columns:1fr;gap:12px}
  .mp-topbar{padding:10px 14px}
  .mp-brand{font-size:16px}
  .mp-card-desc{display:none}
  .mp-chips{display:none}
  .mp-toasts{bottom:16px;right:16px;left:16px}
  .mp-toast{max-width:100%}
}
@media(min-width:601px) and (max-width:860px){.mp-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1001px) and (max-width:1280px){.mp-layout{grid-template-columns:200px 1fr}}
@media(min-width:1600px){.mp-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}}
@media(prefers-reduced-motion:reduce){.mp *,.mp *::before,.mp *::after{transition-duration:.01ms!important;animation-duration:.01ms!important}}
.mp button:focus-visible,.mp input:focus-visible,.mp select:focus-visible{outline:2px solid #F59E0B;outline-offset:2px}
`;

let _injected = false;
function injectCSS() {
  if (_injected || typeof document === "undefined") return;
  const el = document.getElementById("mp-v4-css") || document.createElement("style");
  el.id = "mp-v4-css";
  el.textContent = CSS;
  document.head.appendChild(el);
  _injected = true;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="mp-skel-card">
      <div className="mp-skel-img mp-skeleton" />
      <div className="mp-skel-body">
        <div className="mp-skeleton mp-skel-line" style={{ width: "60%" }} />
        <div className="mp-skeleton mp-skel-line" style={{ width: "90%" }} />
        <div className="mp-skeleton mp-skel-line" style={{ width: "70%" }} />
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  FOOD CARD
// ─────────────────────────────────────────────────────────────────────────────
const FoodCard = memo(function FoodCard({ item, isBar, onAddToCart, onToggleWish, wishlisted, t }) {
  const [imgErr, setImgErr] = useState(false);
  const [added, setAdded]   = useState(false);

  const handleAdd = useCallback(() => {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }, [item, onAddToCart]);

  const hasImg = item.rasm && !imgErr;

  return (
    <article className="mp-card" role="listitem">
      <div className="mp-card-img-wrap">
        {hasImg ? (
          <img
            src={item.rasm}
            alt={item.nomi}
            className="mp-card-img"
            onError={() => setImgErr(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="mp-card-ph" aria-hidden="true">
            {isBar ? "🍹" : "🍽️"}
          </div>
        )}
        <div className="mp-badges">
          {item.ommabop                        && <span className="mp-badge mp-badge-hot">🔥 TOP</span>}
          {item.teglar?.includes("diet")       && <span className="mp-badge mp-badge-diet">💪 DIET</span>}
          {item.teglar?.includes("vegetarian") && <span className="mp-badge mp-badge-veg">🌿 VEG</span>}
          {item.teglar?.includes("spicy")      && <span className="mp-badge mp-badge-hot2">🌶️</span>}
        </div>
        <button
          className={`mp-wish${wishlisted ? " on" : ""}`}
          onClick={() => onToggleWish(item)}
          aria-label={wishlisted ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
          aria-pressed={wishlisted}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </div>
      <div className="mp-card-body">
        <div className="mp-card-top">
          <div className="mp-rating">
            <span className="mp-star" aria-hidden="true">★</span>
            <span className="mp-rating-val">{item.reyting?.toFixed(1) ?? "—"}</span>
          </div>
          {(item.vazn || item.hajm) && (
            <span className="mp-weight">{item.vazn || item.hajm}</span>
          )}
        </div>
        <h3 className="mp-card-name">{item.nomi}</h3>
        {item.tavsif && <p className="mp-card-desc">{item.tavsif}</p>}
        <div className="mp-chips">
          {item.kaloriya != null && (
            <span className="mp-chip">🔥 {item.kaloriya} {t.kkal}</span>
          )}
          {item.kafeyn && <span className="mp-chip">☕ {item.kafeyn}</span>}
          {item.teglar?.includes("gluten-free") && (
            <span className="mp-chip">🌾 {t.glutensiz}</span>
          )}
        </div>
        <div className="mp-card-footer">
          <div className="mp-price">{fmtPrice(item.narx, t)}</div>
          <button
            className={`mp-add${added ? " done" : ""}`}
            onClick={handleAdd}
            aria-label={t.savatga}
            disabled={added}
          >
            {added ? "✓" : `+ ${t.savatga}`}
          </button>
        </div>
      </div>
    </article>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = memo(function Sidebar({ categories, activeCatId, onSelect, t }) {
  return (
    <aside className="mp-sidebar" aria-label={t.kategoriyalar}>
      <div className="mp-sidebar-label">{t.kategoriyalar}</div>
      <ul className="mp-cat-list" role="listbox" aria-label={t.kategoriyalar}>
        {categories.map((cat) => {
          const active = cat.id === activeCatId;
          return (
            <li key={cat.id} role="option" aria-selected={active}>
              <button
                className={`mp-cat-btn${active ? " active" : ""}`}
                onClick={() => onSelect(cat.id)}
              >
                <span className="mp-cat-icon" aria-hidden="true">{cat.icon}</span>
                <span className="mp-cat-name">{cat.nomi}</span>
                <span className="mp-cat-count">{cat.mahsulotlar.length}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────
const FilterBar = memo(function FilterBar({
  search, onSearch, activeTag, onTag, sortBy, onSort, maxPrice, onMaxPrice, globalMax, t,
}) {
  const inputRef = useRef(null);
  const pct = globalMax > 0 ? Math.round((maxPrice / globalMax) * 100) : 100;

  return (
    <div className="mp-filterbar">
      <div className="mp-search-wrap">
        <span className="mp-search-ico" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          className="mp-search"
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t.qidirish}
          aria-label="Qidirish"
          autoComplete="off"
        />
        {search && (
          <button
            className="mp-search-x"
            onClick={() => { onSearch(""); inputRef.current?.focus(); }}
            aria-label="Tozalash"
          >
            ✕
          </button>
        )}
      </div>
      <div className="mp-tags-scroll" role="group" aria-label="Filtrlar">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            className={`mp-tag${activeTag === tag ? " active" : ""}`}
            onClick={() => onTag(tag)}
            aria-pressed={activeTag === tag}
          >
            {t[tag]}
          </button>
        ))}
      </div>
      <select
        className="mp-sort"
        value={sortBy}
        onChange={(e) => onSort(e.target.value)}
        aria-label="Saralash"
      >
        <option value="default">{t.standart}</option>
        <option value="narx_asc">{t.narx_asc}</option>
        <option value="narx_desc">{t.narx_desc}</option>
        <option value="reyting">{t.reyting_sort}</option>
      </select>
      {globalMax > 0 && (
        <div className="mp-price-filter">
          <span>≤{Math.round(maxPrice / 1000)}K</span>
          <input
            type="range"
            min={0}
            max={globalMax}
            step={1000}
            value={maxPrice}
            onChange={(e) => onMaxPrice(+e.target.value)}
            aria-label={t.narx_filter}
            style={{ "--pct": pct + "%" }}
          />
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  CART PANEL
// ─────────────────────────────────────────────────────────────────────────────
const CartPanel = memo(function CartPanel({ cart, dispatch, onOrder, onClose, t }) {
  const total = useMemo(
    () => cart.reduce((s, i) => s + (i.narx || 0) * i.qty, 0),
    [cart]
  );

  return (
    <>
      <div className="mp-overlay" onClick={onClose} aria-hidden="true" />
      <section className="mp-panel" role="dialog" aria-modal="true" aria-label={t.savat}>
        <div className="mp-panel-head">
          <h2 className="mp-panel-title">🛒 {t.savat}</h2>
          <button className="mp-panel-close" onClick={onClose} aria-label="Yopish">✕</button>
        </div>
        <div className="mp-panel-items">
          {cart.length === 0 ? (
            <div className="mp-panel-empty">
              <div className="mp-panel-empty-ico">🛒</div>
              <div className="mp-panel-empty-txt">{t.savat_bosh}</div>
              <p style={{ fontSize: 13, color: "#3d5170", marginTop: 4 }}>
                {t.savat_bosh_tavsif}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="mp-cart-item">
                <div className="mp-item-emoji">
                  {item.hajm ? "🍹" : "🍽️"}
                </div>
                <div className="mp-item-info">
                  <div className="mp-item-name">{item.nomi}</div>
                  <div className="mp-item-price">{fmtPrice(item.narx, t)}</div>
                </div>
                <div className="mp-cart-qty">
                  <button
                    className="mp-qty-btn"
                    onClick={() => dispatch({ type: "DEC", id: item.id })}
                    aria-label="Kamaytirish"
                  >
                    −
                  </button>
                  <span className="mp-qty-val">{item.qty}</span>
                  <button
                    className="mp-qty-btn"
                    onClick={() => dispatch({ type: "INC", id: item.id })}
                    aria-label="Ko'paytirish"
                  >
                    +
                  </button>
                </div>
                <button
                  className="mp-cart-del"
                  onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                  aria-label="O'chirish"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="mp-cart-footer">
            <div className="mp-cart-total">
              <span className="mp-cart-total-label">{t.jami}:</span>
              <span className="mp-cart-total-val">{fmtPrice(total, t)}</span>
            </div>
            <div className="mp-cart-actions">
              <button className="mp-btn-clear" onClick={() => dispatch({ type: "CLEAR" })}>
                {t.tozala}
              </button>
              <button className="mp-btn-order" onClick={onOrder}>
                {t.buyurtma}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  FAVORITES PANEL
// ─────────────────────────────────────────────────────────────────────────────
const FavPanel = memo(function FavPanel({ allItems, wishIds, onToggleWish, onAddToCart, onClose, t }) {
  const favItems = useMemo(
    () => allItems.filter((i) => wishIds.includes(i.id)),
    [allItems, wishIds]
  );

  return (
    <>
      <div className="mp-overlay" onClick={onClose} aria-hidden="true" />
      <section className="mp-panel" role="dialog" aria-modal="true" aria-label={t.yoqtirganlar}>
        <div className="mp-panel-head">
          <h2 className="mp-panel-title">♥ {t.yoqtirganlar}</h2>
          <button className="mp-panel-close" onClick={onClose} aria-label="Yopish">✕</button>
        </div>
        <div className="mp-panel-items">
          {favItems.length === 0 ? (
            <div className="mp-panel-empty">
              <div className="mp-panel-empty-ico">♡</div>
              <div className="mp-panel-empty-txt">{t.yoqtirilgan_bosh}</div>
            </div>
          ) : (
            favItems.map((item) => (
              <div key={item.id} className="mp-cart-item">
                <div className="mp-item-emoji">
                  {item.hajm ? "🍹" : "🍽️"}
                </div>
                <div className="mp-item-info">
                  <div className="mp-item-name">{item.nomi}</div>
                  <div className="mp-item-price">{fmtPrice(item.narx, t)}</div>
                </div>
                <button className="mp-fav-add" onClick={() => onAddToCart(item)}>
                  {t.savatga}
                </button>
                <button
                  className="mp-fav-heart"
                  onClick={() => onToggleWish(item)}
                  aria-label="Olib tashlash"
                >
                  ♥
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  ORDER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function OrderModal({ cart, isBar, onClose, onSuccess, t }) {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [stol,    setStol]    = useState("");
  const [note,    setNote]    = useState("");
  const [dtype,   setDtype]   = useState("stol");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => cart.reduce((s, i) => s + (i.narx || 0) * (i.qty || 1), 0),
    [cart]
  );

  const validate = () => {
    const e = {};
    if (!name.trim())                                    e.name  = t.validatsiya_isim;
    if (!/^\+?[\d\s\-()]{9,15}$/.test(phone.trim()))    e.phone = t.validatsiya_tel;
    if (!cart || cart.length === 0)                      e.cart  = t.validatsiya_bosh;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const orderId  = generateOrderId();
    const customer = {
      name:         name.trim(),
      phone:        phone.trim(),
      stol:         stol.trim() || "—",
      note:         note.trim() || "—",
      deliveryType: dtype,
    };

    try {
      await sendToTelegram({
        type:      isBar ? "bar" : "food",
        cartItems: cart,
        total,
        customer,
        orderId,
      });
      onSuccess(orderId);
    } catch (err) {
      setErrors({ submit: `${t.xato} (${err.message})` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t.order_title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mp-modal">
        <h2 className="mp-modal-title">📋 {t.order_title}</h2>

        {/* Buyurtma xulasasi */}
        <div className="mp-modal-summary">
          {cart.map((i) => (
            <div key={i.id}>
              • {i.nomi} × {i.qty || 1} — {fmtPrice((i.narx || 0) * (i.qty || 1), t)}
            </div>
          ))}
          <div style={{ marginTop: 10, fontWeight: 800, color: "#F59E0B", fontSize: 15 }}>
            {t.jami}: {fmtPrice(total, t)}
          </div>
        </div>

        {/* Ism */}
        <div className="mp-form-group">
          <label className="mp-form-label">{t.isim}</label>
          <input
            className={`mp-form-input${errors.name ? " err" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alijon Toshmatov"
            autoComplete="name"
          />
          {errors.name && <div className="mp-form-err">{errors.name}</div>}
        </div>

        {/* Telefon */}
        <div className="mp-form-group">
          <label className="mp-form-label">{t.telefon}</label>
          <input
            className={`mp-form-input${errors.phone ? " err" : ""}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Planshet raqami"
            type="number"
            autoComplete="tel"
          />
          {errors.phone && <div className="mp-form-err">{errors.phone}</div>}
        </div>

        {/* Buyurtma turi */}
        <div className="mp-form-group">
          <label className="mp-form-label">{t.buyurtma_turi}</label>
          <div className="mp-dtype-row">
            <button
              className={`mp-dtype-btn${dtype === "stol" ? " active" : ""}`}
              onClick={() => setDtype("stol")}
            >
              🪑 {t.stol}
            </button>
            <button
              className={`mp-dtype-btn${dtype === "yetkazish" ? " active" : ""}`}
              onClick={() => setDtype("yetkazish")}
            >
              🛵 {t.yetkazish}
            </button>
          </div>
        </div>

        {/* Stol raqami */}
        {dtype === "stol" && (
          <div className="mp-form-group">
            <label className="mp-form-label">{t.stol}</label>
            <input
              className="mp-form-input"
              value={stol}
              onChange={(e) => setStol(e.target.value)}
              placeholder="1"
              type="number"
              min="1"
            />
          </div>
        )}

        {/* Izoh */}
        <div className="mp-form-group">
          <label className="mp-form-label">{t.izoh}</label>
          <textarea
            className="mp-form-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Qo'shimcha xohishlar..."
            rows={3}
            style={{ resize: "vertical", minHeight: 72 }}
          />
        </div>

        {/* Xatolar */}
        {errors.cart   && <div className="mp-form-err" style={{ marginBottom: 10 }}>⚠️ {errors.cart}</div>}
        {errors.submit && <div className="mp-form-err" style={{ marginBottom: 10 }}>⚠️ {errors.submit}</div>}

        {/* Tugmalar */}
        <div className="mp-modal-actions">
          <button className="mp-btn-cancel" onClick={onClose} disabled={loading}>
            {t.bekor}
          </button>
          <button className="mp-btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? `⏳ ${t.yuborilmoqda}` : `🚀 ${t.yuborish}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOAST CONTAINER
// ─────────────────────────────────────────────────────────────────────────────
const ToastContainer = memo(function ToastContainer({ toasts, onRemove }) {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div className="mp-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`mp-toast ${toast.type}`} role="alert">
          <span className="mp-toast-ico">{icons[toast.type] || "ℹ️"}</span>
          <span>{toast.msg}</span>
          <button
            className="mp-toast-close"
            onClick={() => onRemove(toast.id)}
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MenuPage() {
  injectCSS();

  const [lang,      setLang]      = useState("uz");
  const [tab,       setTab]       = useState("asosiy");
  const [catId,     setCatId]     = useState(() => asosiyMenu[0]?.id || "");
  const [rawSearch, setRawSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [sortBy,    setSortBy]    = useState("default");
  const [maxPrice,  setMaxPrice]  = useState(Infinity);
  const [showCart,  setShowCart]  = useState(false);
  const [showFav,   setShowFav]   = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const contentRef                = useRef(null);

  const [wishIds, setWishIds] = useLocalState("mp_wish_v1", []);
  const [cart, dispatch]      = useReducer(cartReducer, [], () => {
    try {
      const s = localStorage.getItem("mp_cart_v1");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Persist cart
  useEffect(() => {
    try { localStorage.setItem("mp_cart_v1", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const { toasts, add: addToast, remove: removeToast } = useToast();
  const search = useDebounce(rawSearch, 280);
  const t      = LANG[lang] || LANG.uz;
  const menu   = tab === "asosiy" ? asosiyMenu : barMenu;

  // Skeleton on tab/cat change
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, [tab, catId]);

  // Hash sync
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash;
      if (h === "#bar")  setTab("bar");
      if (h === "#menu") setTab("asosiy");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Reset on tab change
  useEffect(() => {
    const firstId = menu[0]?.id || "";
    setCatId(firstId);
    setRawSearch("");
    setActiveTag(null);
    setSortBy("default");
    setMaxPrice(Infinity);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Scroll top on cat change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [catId, tab]);

  // ESC to close panels
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        setShowCart(false);
        setShowFav(false);
        setShowOrder(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const activeCat = useMemo(
    () => menu.find((c) => c.id === catId) || menu[0] || null,
    [menu, catId]
  );

  const globalMax = useMemo(() => {
    if (!activeCat) return 0;
    const prices = activeCat.mahsulotlar
      .map((m) => m.narx || 0)
      .filter((n) => n > 0);
    return prices.length ? Math.max(...prices) : 0;
  }, [activeCat]);

  useEffect(() => { setMaxPrice(Infinity); }, [activeCat]);

  const items = useMemo(() => {
    if (!activeCat) return [];
    let list = [...activeCat.mahsulotlar];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) => m.nomi?.toLowerCase().includes(q) || m.tavsif?.toLowerCase().includes(q)
      );
    }
    if (activeTag === "ommabop") list = list.filter((m) => m.ommabop);
    else if (activeTag)          list = list.filter((m) => m.teglar?.includes(activeTag));
    if (maxPrice !== Infinity)   list = list.filter((m) => (m.narx || 0) <= maxPrice);
    if (sortBy === "narx_asc")   list = [...list].sort((a, b) => (a.narx || 0) - (b.narx || 0));
    if (sortBy === "narx_desc")  list = [...list].sort((a, b) => (b.narx || 0) - (a.narx || 0));
    if (sortBy === "reyting")    list = [...list].sort((a, b) => (b.reyting || 0) - (a.reyting || 0));
    return list;
  }, [activeCat, search, activeTag, sortBy, maxPrice]);

  const allItems  = useMemo(() => menu.flatMap((c) => c.mahsulotlar), [menu]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + (i.qty || 0), 0), [cart]);

  const handleCat = useCallback((id) => {
    setCatId(id);
    setRawSearch("");
    setActiveTag(null);
    setSortBy("default");
    setMaxPrice(Infinity);
  }, []);

  const handleTag = useCallback(
    (id) => setActiveTag((p) => (p === id ? null : id)),
    []
  );

  const clearFilters = useCallback(() => {
    setRawSearch("");
    setActiveTag(null);
    setSortBy("default");
    setMaxPrice(Infinity);
  }, []);

  const handleAddToCart = useCallback((item) => {
    if (!item?.id) return;
    dispatch({ type: "ADD", item });
    addToast(`🛒 ${item.nomi} savatga qo'shildi`, "success");
  }, [addToast]);

  const handleToggleWish = useCallback((item) => {
    if (!item?.id) return;
    setWishIds((prev) => {
      const has = prev.includes(item.id);
      addToast(
        has ? `💔 ${item.nomi} olib tashlandi` : `♥ ${item.nomi} sevimlilarga qo'shildi`,
        has ? "info" : "success"
      );
      return has ? prev.filter((id) => id !== item.id) : [...prev, item.id];
    });
  }, [setWishIds, addToast]);

  const handleOrderSuccess = useCallback((orderId) => {
    dispatch({ type: "CLEAR" });
    setShowOrder(false);
    setShowCart(false);
    addToast(`${t.muvaffaqiyat} #${orderId}`, "success");
  }, [addToast, t]);

  const isBar = tab === "bar";

  return (
    <div id="menu" className="mp">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="mp-topbar">
        <div className="mp-brand">🌿 Amazoniya</div>
        <div className="mp-topbar-right">
          {["uz", "ru", "en"].map((l) => (
            <button
              key={l}
              className={`mp-lang-btn${lang === l ? " active" : ""}`}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
          <button
            className={`mp-icon-btn${showFav ? " active" : ""}`}
            onClick={() => { setShowFav((v) => !v); setShowCart(false); }}
            aria-label={t.yoqtirganlar}
            title={t.yoqtirganlar}
          >
            ♡
            {wishIds.length > 0 && (
              <span className="mp-badge-count">{wishIds.length}</span>
            )}
          </button>
          <button
            className={`mp-icon-btn${showCart ? " active" : ""}`}
            onClick={() => { setShowCart((v) => !v); setShowFav(false); }}
            aria-label={t.savat}
            title={t.savat}
          >
            🛒
            {cartCount > 0 && (
              <span className="mp-badge-count">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <nav className="mp-tabs" role="tablist" aria-label="Menu bo'limlari">
        {[
          { id: "asosiy", label: t.asosiy, icon: "🍽️" },
          { id: "bar",    label: t.bar,    icon: "🍹" },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            className={`mp-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
            aria-selected={tab === id}
            role="tab"
          >
            <span aria-hidden="true">{icon}</span> {label}
          </button>
        ))}
      </nav>

      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav className="mp-bc" aria-label="Joylashuv">
        <span>{t.bosh_sahifa}</span>
        <span className="mp-bc-sep" aria-hidden="true">›</span>
        <span>{isBar ? t.bar : t.asosiy}</span>
        {activeCat && (
          <>
            <span className="mp-bc-sep" aria-hidden="true">›</span>
            <span className="mp-bc-cur">{activeCat.nomi}</span>
          </>
        )}
      </nav>

      {/* ── Layout ──────────────────────────────────────────── */}
      <div className="mp-layout">
        <Sidebar
          categories={menu}
          activeCatId={catId}
          onSelect={handleCat}
          t={t}
        />

        <main
          className="mp-content"
          ref={contentRef}
          id="main-content"
          tabIndex={-1}
        >
          {/* Category header */}
          {activeCat && (
            <div className="mp-cat-header">
              <div className="mp-cat-header-left">
                <span className="mp-cat-emoji" aria-hidden="true">{activeCat.icon}</span>
                <div>
                  <h1 className="mp-cat-title">{activeCat.nomi}</h1>
                  {activeCat.tavsif && (
                    <p className="mp-cat-desc">{activeCat.tavsif}</p>
                  )}
                </div>
              </div>
              <span className="mp-cat-badge">
                {activeCat.mahsulotlar.length} {t.mahsulot}
              </span>
            </div>
          )}

          {/* Eslatma (zakaz kategoriyasi) */}
          {activeCat?.eslatma && (
            <div className="mp-note">{activeCat.eslatma}</div>
          )}

          {/* Filter bar */}
          <FilterBar
            search={rawSearch}
            onSearch={setRawSearch}
            activeTag={activeTag}
            onTag={handleTag}
            sortBy={sortBy}
            onSort={setSortBy}
            maxPrice={maxPrice === Infinity ? globalMax : maxPrice}
            onMaxPrice={setMaxPrice}
            globalMax={globalMax}
            t={t}
          />

          {/* Grid */}
          {loading ? (
            <div className="mp-grid" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty-ico">🔍</div>
              <div className="mp-empty-txt">{t.topilmadi}</div>
              <button className="mp-empty-btn" onClick={clearFilters}>
                {t.filtr_tozala}
              </button>
            </div>
          ) : (
            <div className="mp-grid" role="list">
              {items.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  isBar={isBar}
                  onAddToCart={handleAddToCart}
                  onToggleWish={handleToggleWish}
                  wishlisted={wishIds.includes(item.id)}
                  t={t}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Panels ──────────────────────────────────────────── */}
      {showCart && (
        <CartPanel
          cart={cart}
          dispatch={dispatch}
          onOrder={() => { setShowCart(false); setShowOrder(true); }}
          onClose={() => setShowCart(false)}
          t={t}
        />
      )}

      {showFav && (
        <FavPanel
          allItems={allItems}
          wishIds={wishIds}
          onToggleWish={handleToggleWish}
          onAddToCart={handleAddToCart}
          onClose={() => setShowFav(false)}
          t={t}
        />
      )}

      {showOrder && (
        <OrderModal
          cart={cart}
          isBar={isBar}
          onClose={() => setShowOrder(false)}
          onSuccess={handleOrderSuccess}
          t={t}
        />
      )}

      {/* ── Toasts ──────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}