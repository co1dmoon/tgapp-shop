import { FaArrowRightLong } from "react-icons/fa6";
import { IoChevronBack } from "react-icons/io5";
import { CartButton, SmartImage } from "../../../components";
import {
  DeliveryIcon,
  SupportIcon,
  WarrantyIcon,
} from "../../../components/icons";
import { useProduct } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import { formatPrice, formatPriceWithTax } from "../../../utils/formatters";

export default function ProductDetails() {
  const { selectedProductId, setSelectedProductId } = useAppContext();

  const { data: product } = useProduct(selectedProductId ?? NaN);

  const specs = JSON.parse(product?.specs ?? "{}");
  const allList = Object.entries(specs);

  const cpuAndGpu = [specs['Видеокарта'], specs['Процессор']]

  const pcCategories = ["full hd", "full hd+", "2k", "4k"];

  const isPc = pcCategories.includes(
    product?.category?.name.toLowerCase() ?? ""
  );

  const images: string[] = JSON.parse(product?.allImages ?? "[]");

  const advantages = [
    {
      title: "Бесплатная доставка",
      icon: <DeliveryIcon width={32} height={32} />,
    },
    {
      title: "Гарантия до 3 лет",
      icon: <WarrantyIcon width={32} height={32} />,
    },
    {
      title: "Ежедневная тех. поддержка",
      icon: <SupportIcon width={32} height={32} />,
    },
  ];

  console.log(product?.fpsVideoUrl);

  const handleGoBack = () => {
    setSelectedProductId(null);
  };

  if (!product || !selectedProductId) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <IoChevronBack size={20} />
        <span className="font-primary text-[14px]">Назад</span>
      </button>

      <SmartImage
        src={product.image ?? "/images/categories/игровые-пк.png"}
        alt={product.name}
        className="w-full aspect-square object-contain mx-auto rounded-xl"
      />
      <div className="flex flex-col gap-4">
        <h1>{product.name}</h1>
        {isPc &&
          cpuAndGpu.map((spec, index) => (
            <div
              key={index}
              className="flex items-center gap-4 w-full rounded-xl bg-[#161616] py-2 px-4 text-[16px] font-primary"
            >
              <img
                src={`/images/${index === 0 ? "gpu.png" : "cpu.png"}`}
                alt=""
                className="w-[26px] opacity-60"
              />
              <span>{spec}</span>
            </div>
          ))}
      </div>
      <div className="flex items-baseline gap-2 rounded-xl bg-[#161616] py-2 px-4">
        <span className="text-[20px] text-[#ffff00] font-display">
          {formatPrice(product.price)}
        </span>
        <span className="text-[16px] text-[#888888] font-display line-through">
          {formatPriceWithTax(product.price)}
        </span>
      </div>
      {isPc && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] text-left font-display uppercase">
            Преимущества:
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-start gap-2 rounded-xl bg-[#161616] py-2 px-4"
              >
                {advantage.icon}
                <span className="text-[10px] text-center font-primary font-thin">
                  {advantage.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <h2 className="text-[16px] text-left font-display uppercase">
          Характеристики:
        </h2>
        <div className="w-full bg-[#111111] rounded-xl overflow-hidden text-[10px] font-primary">
          {allList.map(([key, value], index) => (
            <div key={index} className="flex w-full">
              <div
                className={`py-1 px-4 text-gray-400 flex-1 bg-[#161616] opacity-43 ${
                  index < allList.length - 1 && "border-b-1"
                } border-[#2f2f2f]`}
              >
                {`${key}:`}
              </div>
              <div
                className={`py-1 px-4 text-white text-right flex-1 bg-[#222222] ${
                  index < allList.length - 1 && "border-b-1"
                } border-[#2f2f2f]`}
              >
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Секция «Тесты FPS» рисуется только если у товара явно задана FPS-картинка.
          Если в админке стоит «FPS изображение: Нет» — на витрине никакого
          fallback-чарта не показываем (раньше была заглушка /images/fps.png,
          из-за неё админка и каталог расходились — админ видел «Нет», а юзер
          видел общий чарт игр). */}
      {pcCategories.includes(product.category?.name.toLowerCase() ?? "") &&
        product.fpsImage && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] text-left font-display uppercase">
              {`Тесты FPS:`}
            </h2>
            <SmartImage
              src={product.fpsImage}
              alt={"fps"}
              className="w-full aspect-video object-contain rounded-xl"
            />
            {product.fpsVideoUrl && (
              <a
                href={product.fpsVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-4 text-[#ffff00] font-display no-underline mx-auto"
              >
                <span className="text-[12px]">Смотреть видеообзор тестов</span>
                <FaArrowRightLong />
              </a>
            )}
          </div>
        )}
      {images.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] text-left font-display uppercase">Фото:</h2>
          <div className="w-full flex flex-col gap-4" key={"images"}>
            {images.map((url, i) => (
              <SmartImage
                src={url}
                key={url ?? i}
                className="w-full aspect-square object-contain rounded-xl"
              />
            ))}
          </div>
        </div>
      )}
      {product.videoUrl && (
        <a
          href={product.videoUrl}
          target="_blank"
          className="mt-2 flex items-center gap-4 text-[#ffff00] font-display no-underline mx-auto"
        >
          <span className="text-[12px]">Смотреть видеообзор ПК</span>
          <FaArrowRightLong />
        </a>
      )}

      <CartButton product={product} type="large">
        В корзину
      </CartButton>
    </div>
  );
}
