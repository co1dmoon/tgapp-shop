import { MdArrowOutward } from "react-icons/md";

export default function Contacts() {
  const contacts = [
    {
      name: "ВКонтакте",
      link: "https://vk.com/example",
      src: "/images/contacts/vk.png",
    },
    {
      name: "WhatsApp",
      link: "https://wa.me/example",
      src: "/images/contacts/whatsapp.png",
    },
    {
      name: "Телеграм",
      link: "https://t.me/example",
      src: "/images/contacts/telegram.png",
    },
    {
      name: "Телефон",
      link: "tel:+79999999999",
      src: "/images/contacts/phone.png",
      isPhone: true,
    },
  ];

  const handlePhoneClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    phoneLink: string
  ) => {
    e.preventDefault();

    // Для iOS в Telegram WebApp
    const phoneNumber = phoneLink.replace("tel:", "");

    // Попытка открыть через несколько способов для максимальной совместимости
    window.open(`tel:${phoneNumber}`);

    // Запасной вариант - попытка использовать location
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
