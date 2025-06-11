import { FullscreenControl, Map, Placemark, YMaps, ZoomControl } from '@pbe/react-yandex-maps';

interface PickupPoint {
  id: number;
  name: string;
  address: string;
  coordinates: [number, number];
}

const pickupPoints: PickupPoint[] = [
  {
    id: 1,
    name: 'Магазин на Тверской',
    address: 'ул. Тверская, 1',
    coordinates: [55.762, 37.615]
  },
  {
    id: 2,
    name: 'Магазин на Арбате',
    address: 'ул. Арбат, 20',
    coordinates: [55.749, 37.591]
  },
  {
    id: 3,
    name: 'Магазин на Кутузовском',
    address: 'Кутузовский проспект, 30',
    coordinates: [55.752, 37.538]
  }
];

interface YandexMapProps {
  onSelectPoint: (point: PickupPoint) => void;
  selectedPointId?: number;
  onLoad?: () => void;
}

export default function YandexMap({
  onSelectPoint,
  selectedPointId = undefined,
  onLoad = () => {},
}: YandexMapProps) {
  const defaultState = {
    center: [55.752, 37.615],
    zoom: 11,
  };

  const handleMapClick = (e: ymaps.MapEvent) => {
    const coords = e.get("coords");
    const closestPoint = pickupPoints.reduce((prev, curr) => {
      const prevDist = Math.sqrt(
        Math.pow(prev.coordinates[0] - coords[0], 2) +
          Math.pow(prev.coordinates[1] - coords[1], 2)
      );
      const currDist = Math.sqrt(
        Math.pow(curr.coordinates[0] - coords[0], 2) +
          Math.pow(curr.coordinates[1] - coords[1], 2)
      );
      return prevDist < currDist ? prev : curr;
    });
    onSelectPoint(closestPoint);
  };

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden">
      <YMaps>
        <Map
          defaultState={defaultState}
          width="100%"
          height="100%"
          onClick={handleMapClick}
          onLoad={onLoad}
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          <FullscreenControl options={{ position: { right: 10, top: 50 } }} />
          {pickupPoints.map((point) => (
            <Placemark
              key={point.id}
              geometry={point.coordinates}
              properties={{
                balloonContent: `
                  <strong>${point.name}</strong><br/>
                  ${point.address}
                `,
              }}
              options={{
                preset:
                  selectedPointId === point.id
                    ? "islands#blueStretchyIcon"
                    : "islands#redStretchyIcon",
                iconColor: selectedPointId === point.id ? "#ffff00" : "#ff0000",
              }}
              onClick={() => onSelectPoint(point)}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
} 