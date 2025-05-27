import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FaSpinner } from 'react-icons/fa';
import { IoChevronBack } from "react-icons/io5";
import * as yup from "yup";
import Input from "../../../components/Input";
import { useTelegram } from "../../../hooks";
import { useUserByTelegramId } from "../../../hooks/useUsers";
import { orderService } from "../../../services";
import { useCartContext } from "../../../store/CartContext";
import { DeliveryType, PayingType } from "../../../types";
import { formatPrice } from "../../../utils/formatters";

const validationSchema = yup.object().shape({
  contactName: yup.string().required("ФИО обязательно"),
  contactPhone: yup.string().required("Телефон обязателен"),
  contactEmail: yup.string().email("Некорректный email").optional(),
  city: yup.string().when('deliveryType', {
    is: (type: DeliveryType) => type === DeliveryType.MOSCOW || type === DeliveryType.CDEK,
    then: (schema) => schema.required("Город обязателен"),
  }),
  street: yup.string().when('deliveryType', {
    is: (type: DeliveryType) => type === DeliveryType.MOSCOW || type === DeliveryType.CDEK,
    then: (schema) => schema.required("Улица обязательна"),
  }),
  house: yup.string().when('deliveryType', {
    is: (type: DeliveryType) => type === DeliveryType.MOSCOW || type === DeliveryType.CDEK,
    then: (schema) => schema.required("Дом обязателен"),
  }),
  apartment: yup.string().when('deliveryType', {
    is: (type: DeliveryType) => type === DeliveryType.MOSCOW || type === DeliveryType.CDEK,
    then: (schema) => schema.required("Квартира обязательна"),
  }),
  deliveryType: yup.string().oneOf(Object.values(DeliveryType), "Выберите корректный тип доставки").required("Тип доставки обязателен"),
  payingType: yup.string().oneOf(Object.values(PayingType), "Выберите корректный тип оплаты").required("Тип оплаты обязателен"),
  userName: yup.string().required("Имя пользователя обязательно"),
  promocode: yup.string().optional(),
  comments: yup.string().optional(),
});


const pcCategories = ["full hd", "2k", "4k"];

const isPC = (category: string) => pcCategories.includes(
  category.toLowerCase()
);

const getSpecs = (specs: string) => {
  const specsObj = JSON.parse(specs ?? '{}') as Record<string, string>;
  return [specsObj['Видеокарта'], specsObj['Процессор']];
}


export default function OrderForm({ setOrder }: { setOrder: React.Dispatch<React.SetStateAction<"no" | "start" | "finish">>; }) {
  const { user } = useTelegram();
  const { data: userData } = useUserByTelegramId({ telegramId: user?.id.toString() ?? "805354266" });
  const { cart, clearCart } = useCartContext();

  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      city: "",
      street: "",
      house: "",
      apartment: "",
      deliveryType: DeliveryType.CDEK,
      payingType: PayingType.CARD,
      userName: "",
      promocode: "",
      comments: "",
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const deliveryAddress = values.deliveryType === DeliveryType.PICKUP
          ? 'Самовывоз'
          : `${values.city}, ${values.street}, д. ${values.house}, кв. ${values.apartment}`;

        const data = {
          userId: user?.id ?? "805354266",
          userModelId: userData?.id,
          ...values,
          deliveryAddress,
          total: cart.total,
          cart: cart.items,
        };
        console.log(data);
        const response = await orderService.createOrder(data);
        setOrder('finish');
        clearCart();
        console.log(response);

      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (userData) {
      formik.setValues({
        contactName: userData.fio ?? '',
        contactPhone: userData.phoneNumber ?? '',
        userName: userData.username ?? '',
        contactEmail: '',
        city: '',
        street: '',
        house: '',
        apartment: '',
        deliveryType: DeliveryType.MOSCOW,
        payingType: PayingType.CARD,
        promocode: '',
        comments: '',
      });
    }
  }, [userData]);

  useEffect(() => {
    if (formik.values.deliveryType === DeliveryType.MOSCOW) {
      formik.setFieldValue("city", "Москва");
    } else if (formik.values.deliveryType === DeliveryType.CDEK) {
      formik.setFieldValue("city", "");
    }
  }, [formik.values.deliveryType]);

  if (isLoading) {
    return (
      <div className="p-4 h-400px">
        <button
          onClick={() => setOrder('no')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
        >
          <IoChevronBack size={20} />
          <span className="font-primary text-[14px]">Назад</span>
        </button>
        <h1 className="font-display font-thin mb-4">Оформление заказа</h1>
        <div className="flex items-center justify-center h-64">
          <FaSpinner color="#ffff00" className="animate-spin text-[#0000ff] text-4xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={() => setOrder('no')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
      >
        <IoChevronBack size={20} />
        <span className="font-primary text-[14px]">Назад</span>
      </button>
      <h1 className="font-display font-thin mb-4">Оформление заказа</h1>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="deliveryType" className="text-[10px] text-gray-400 font-primary">Тип доставки*</label>
          <div className="relative">
            <select
              onChange={formik.handleChange}
              value={formik.values.deliveryType}
              name='deliveryType'
              className="appearance-none w-full p-4 w-full px-4 font-primary py-2 bg-[#161616] rounded-2xl text-[12px] text-white focus:bg-[#222222] focus:outline-none"
            >
              <option value={DeliveryType.CDEK}>Доставка СДЭК</option>
              <option value={DeliveryType.MOSCOW}>Доставка по Москве</option>
              <option value={DeliveryType.PICKUP}>Самовывоз</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-xs">
              ▼
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {(formik.values.deliveryType === DeliveryType.MOSCOW || formik.values.deliveryType === DeliveryType.CDEK) && (
            <>
              <Input
                name="city"
                label="Город*"
                value={formik.values.city}
                onChange={formik.handleChange}
                disabled={formik.values.deliveryType === DeliveryType.MOSCOW}
              />
              <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.city}</p>

              <div className="flex items-center gap-2 justify-between">
                <div className="flex flex-col gap-2 w-1/2">
                  <Input name="street" label="Улица*" value={formik.values.street} onChange={formik.handleChange} />
                  <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.street}</p>
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <Input name="house" label="Дом*" value={formik.values.house} onChange={formik.handleChange} />
                  <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.house}</p>
                </div>
              </div>

              <Input name="apartment" label="Квартира*" value={formik.values.apartment} onChange={formik.handleChange} />
              <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.apartment}</p>
            </>
          )}

          <Input name="contactName" label="ФИО получателя*" value={formik.values.contactName} onChange={formik.handleChange} />
          <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.contactName}</p>

          <Input name="contactPhone" label="Телефон получателя*" value={formik.values.contactPhone} onChange={formik.handleChange} />
          <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.contactPhone}</p>

          <Input name="contactEmail" label="Email получателя" value={formik.values.contactEmail} onChange={formik.handleChange} />
          <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.contactEmail}</p>

          <Input name="userName" label="Имя пользователя*" value={`@${formik.values.userName}`} onChange={formik.handleChange} disabled={true} className="text-gray-400" />
          <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.userName}</p>

          <div className="flex items-center gap-2 justify-between">
            <div className="flex flex-col gap-2 w-1/2 ">
              <label htmlFor="payingType" className="text-[10px] text-gray-400 font-primary">Тип оплаты*</label>
              <div className="relative">
                <select
                  onChange={formik.handleChange}
                  value={formik.values.payingType}
                  name='payingType'
                  className="appearance-none w-full p-4 w-full px-4 font-primary py-2 bg-[#161616] rounded-2xl text-[12px] text-white focus:bg-[#222222] focus:outline-none"
                >
                  <option value={PayingType.CASH}>Наличные</option>
                  <option value={PayingType.CARD}>Карта</option>
                  <option value={PayingType.CREDIT}>Кредит</option>
                  <option value={PayingType.OTHER}>Связаться с менеджером</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-xs">
                  ▼
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <Input
                name="promocode"
                label="Промокод"
                placeholder="Промокод"
                value={formik.values.promocode}
                onChange={formik.handleChange}
                className="p-4 bg-[#161616] rounded-2xl text-gray-200 font-primary text-[16px] border-none focus:outline-none focus:ring-2 focus:ring-[#222222] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#161616] p-2">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <h2 className="font-primary text-[12px]">Товары</h2>
            <p className="font-primary text-[12px]">{cart.items.length}</p>
          </div>
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-2 items-center justify-between py-2 border-b border-gray-700">
              <img src={item.image as string ?? '/images/categories/игровые-пк.png'} alt={item.name} className="w-[40px] h-[40px] rounded-xl" />
              <div className="h-full w-full flex items-start gap-2 text-[10px] font-primary">
                {!isPC(item.category?.name ?? '') ? <div className="rounded-xl bg-[#222222] px-2 py-1">{item.name}</div> : getSpecs(item.specs ?? '{}').map((spec, index) => (
                  <div key={index} className="rounded-xl bg-[#222222] px-2 py-1">{spec}</div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-primary text-[12px]">{item.quantity}</p>
                <span>&#xD7;</span>
                <p className="font-primary text-[12px]">{item.price}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between mt-2 border-b border-gray-700 pb-2">
            <p className="font-primary text-[12px]">Доставка</p>
            <p className="font-primary text-[12px]">Бесплатно</p>
          </div>

          <div className="flex items-center justify-between mt-2 ">
            <p className="font-primary text-[16px] uppercase">Итого</p>
            <p className="font-primary text-[16px]">{formatPrice(cart.total)}</p>
          </div>
        </div>

        <Input type="textarea" name="comments" label="Комментарий к заказу" value={formik.values.comments} onChange={formik.handleChange} />
        <button type="submit" className="bg-[#ffff00] text-black font-display rounded-2xl p-2">Оформить заказ</button>
      </form>
    </div>
  );
}
