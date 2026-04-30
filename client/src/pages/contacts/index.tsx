import { FaArrowRightLong } from "react-icons/fa6";
import { useSettings } from "../../hooks";

const FALLBACK = {
  contact_tg: "https://t.me/BZoneStoreBot",
  contact_phone: "+7(968)700-94-84",
  contact_email: "manager@b-zone.store",
  contact_site: "https://b-zone.store/",
};

// Достаём имя из URL для отображения, чтобы не показывать длинную ссылку.
const tgHandleFromUrl = (url: string) => {
  const m = url.match(/t\.me\/([A-Za-z0-9_]+)/i);
  return m ? `@${m[1]}` : url;
};

const siteHostFromUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.host + u.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
};

// Для tel:-ссылок Telegram WebApp иногда требует пинком переоткрыть.
const openPhone = (
  e: React.MouseEvent<HTMLAnchorElement>,
  raw: string
) => {
  e.preventDefault();
  const phoneNumber = raw.replace(/[^\d+]/g, "");
  window.open(`tel:${phoneNumber}`);
  setTimeout(() => {
    window.location.href = `tel:${phoneNumber}`;
  }, 100);
};

type Row = {
  emoji: string;
  label: string;
  display: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export default function Contacts() {
  const { data: settings } = useSettings();

  const phone = settings?.contact_phone || FALLBACK.contact_phone;
  const email = settings?.contact_email || FALLBACK.contact_email;
  const tg = settings?.contact_tg || FALLBACK.contact_tg;
  const site = settings?.contact_site || FALLBACK.contact_site;

  const rows: Row[] = [
    {
      emoji: "📞",
      label: "Телефон",
      display: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
      onClick: (e) => openPhone(e, phone),
    },
    {
      emoji: "📧",
      label: "Email",
      display: email,
      href: `mailto:${email}`,
    },
    {
      emoji: "💬",
      label: "Telegram",
      display: tgHandleFromUrl(tg),
      href: tg,
    },
    {
      emoji: "🌐",
      label: "Сайт",
      display: siteHostFromUrl(site),
      href: site,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-[16px] font-display mb-4 font-thin">
        Наши контакты
      </h1>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <a
            key={row.label}
            href={row.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={row.onClick}
            className="flex items-center gap-3 rounded-xl bg-[#161616] px-4 py-3 hover:bg-[#1d1d1d] transition-colors"
          >
            <div className="text-[26px] leading-none">{row.emoji}</div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-primary text-gray-500 uppercase tracking-wider">
                {row.label}
              </span>
              <span className="text-[14px] font-display text-white truncate">
                {row.display}
              </span>
            </div>
            <FaArrowRightLong className="text-[#ffff00] flex-shrink-0" size={16} />
          </a>
        ))}
      </div>
    </div>
  );
}
