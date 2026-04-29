import { MdArrowOutward } from "react-icons/md";
import { useSettings } from "../../hooks";

const FALLBACK = {
  contact_tg: "https://t.me/BZoneStoreBot",
  contact_vk: "https://vk.com/write-209962380",
  contact_phone: "+79999999999",
};

export default function Contacts() {
  const { data: settings } = useSettings();

  const tg = settings?.contact_tg || FALLBACK.contact_tg;
  const vk = settings?.contact_vk || FALLBACK.contact_vk;
  const phone = settings?.contact_phone || FALLBACK.contact_phone;

  const contacts = [
    {
      name: "ВКонтакте",
      link: vk,
      src: "/images/contacts/vk.png",
    },
    {
      name: "Телеграм",
      link: tg,
      src: "/images/contacts/telegram.png",
    },
    {
      name: "Телефон",
      link: `tel:${phone}`,
      src: "/images/contacts/phone.png",
      isPhone: true,
    },
  ];

  const handlePhoneClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    phoneLink: string
  ) => {
    e.preventDefault();
    const phoneNumber = phoneLink.replace("tel:", "");
    window.open(`tel:${phoneNumber}`);
    setTimeout(() => {
      window.location.href = `tel:${phoneNumber}`;
    }, 100);
  };

  return (
    <div className="p-4">
      <h1 className="text-[16px] font-display mb-4 font-thin">
        Свяжитесь с нами
      </h1>
      <div className="grid grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <a
            target="_blank"
            key={contact.name}
            href={contact.link}
            onClick={
              contact.isPhone
                ? (e) => handlePhoneClick(e, contact.link)
                : undefined
            }
            className="relative flex items-center justify-center gap-2 rounded-xl bg-[#161616] py-4"
          >
            <MdArrowOutward
              color="#ffff00"
              className=" w-[20px] h-[20px] absolute right-[5px] top-[5px]"
            />
            <img
              src={contact.src}
              alt={contact.name}
              className="h-[50px] aspect-square"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
