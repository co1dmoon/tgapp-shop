import { Empty } from "../../components";

export default function Orders() {
  return (
    <div className="p-4">
      <h1 className="font-display font-thin">Ваши заказы</h1>
      <Empty>Кажется, вы еще не сделали заказов</Empty>
    </div>
  );
}
