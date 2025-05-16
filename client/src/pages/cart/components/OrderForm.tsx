import { useFormik } from "formik";
import { useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import * as yup from "yup";
import Input from "../../../components/Input";
import { useTelegram } from "../../../hooks";
import { useUserByTelegramId } from "../../../hooks/useUsers";
import { useCartContext } from "../../../store/CartContext";
import { formatPrice } from "../../../utils/formatters";

enum DeliveryType {
  DELIVERY = "delivery",
  PICKUP = "pickup",
}

enum PayingType {
  CASH = "cash",
  CARD = "card",
  CREDIT = "credit",
  OTHER = "other",
}

const validationSchema = yup.object().shape({
  contactName: yup.string().required("ФИО обязательно"),
  contactPhone: yup.string().required("Телефон обязателен"),
  contactEmail: yup.string().email("Некорректный email").optional(),
  deliveryAddress: yup.string().required("Адрес обязателен"),
  deliveryType: yup.string().oneOf(Object.values(DeliveryType), "Выберите корректный тип доставки").required("Тип доставки обязателен"),
  payingType: yup.string().oneOf(Object.values(PayingType), "Выберите корректный тип оплаты").required("Тип оплаты обязателен"),
  userName: yup.string().required("Имя пользователя обязательно"),
  promocode: yup.string().optional(),
  comments: yup.string().optional(),
});

export default function OrderForm({ setOrder }: { setOrder: (order: boolean) => void; }) {

  const { cart } = useCartContext();

  const formik = useFormik({
    initialValues: {
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      deliveryAddress: "",
      deliveryType: DeliveryType.DELIVERY,
      payingType: PayingType.CARD,
      userName: "",
      promocode: "",
      comments: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const { user } = useTelegram();

  const { data: userData } = useUserByTelegramId({ telegramId: "805354266" });

  useEffect(() => {
    if (formik.values.deliveryType === DeliveryType.PICKUP) {
      formik.setFieldValue("deliveryAddress", 'Самовывоз');
    } else {
      formik.setFieldValue("deliveryAddress", '');
    }
  }, [formik.values.deliveryType]);

  useEffect(() => {
    if (userData) {
      formik.setValues({
        contactName: userData.fio ?? '',
        contactPhone: userData.phoneNumber ?? '',
        userName: userData.username ?? '',
        contactEmail: '',
        deliveryAddress: '',
        deliveryType: DeliveryType.DELIVERY,
        payingType: PayingType.CARD,
        promocode: '',
        comments: '',
      });
    }
  }, [userData]);

  console.log(userData);

  return (
    <div className="p-4">
      <button
        onClick={() => setOrder(false)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
      >
        <IoChevronBack size={20} />
        <span className="font-primary text-[14px]">Назад</span>
      </button>
      <h1 className="font-display font-thin mb-4">Оформление заказа</h1>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center bg-[#161616] rounded-2xl">
          <button
            className={`text-white font-primary rounded-2xl flex items-center justify-center p-2 w-full ${formik.values.deliveryType === DeliveryType.DELIVERY ? "bg-[#222222]" : ""
              }`}
            onClick={() => formik.setFieldValue("deliveryType", DeliveryType.DELIVERY)}
          >
            <p className="text-[12px] font-primary uppercase">Доставка</p>
          </button>
          <button
            className={`text-white font-primary rounded-2xl flex items-center justify-center p-2 w-full ${formik.values.deliveryType === DeliveryType.PICKUP ? "bg-[#222222]" : ""
              }`}
            onClick={() => formik.setFieldValue("deliveryType", DeliveryType.PICKUP)}
          >
            <p className="text-[12px] font-primary uppercase">Самовывоз</p>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {formik.values.deliveryType === DeliveryType.DELIVERY && (
            <>
              <Input name="deliveryAddress" label="Адрес" value={formik.values.deliveryAddress} onChange={formik.handleChange} />
              <p className="text-red-500 font-primary font-thin text-[10px]">{formik.errors.deliveryAddress}</p>
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
                {/* Кастомная стрелка */}
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
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-700">
              <img src={item.image as string ?? '/images/categories/игровые-пк.png'} alt={item.name} className="w-[40px] h-[40px] rounded-xl" />

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
