/**
 * Полноэкранный лоадер при первом открытии аппки. Чёрный фон, лого B-Zone
 * (B- жёлтая, Zone белое), под ним тонкая жёлтая полоска, бегающая туда-сюда.
 * Уезжает плавно через fade-out, когда `loading` становится false.
 */
import clsx from "clsx";

type Props = {
  loading: boolean;
};

export default function SplashLoader({ loading }: Props) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center",
        "transition-opacity duration-500",
        loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!loading}
    >
      {/* Лого: «B-» жёлтая, «Zone» белая */}
      <div className="font-display text-[44px] tracking-wider leading-none flex items-baseline">
        <span className="text-[#ffff00]">B-</span>
        <span className="text-white">Zone</span>
      </div>
      <div className="font-primary text-[10px] uppercase tracking-[0.4em] text-gray-500 mt-2">
        pc store
      </div>

      {/* Бегущая полоска */}
      <div className="mt-10 relative w-[180px] h-[2px] bg-[#1a1a1a] overflow-hidden rounded-full">
        <div className="absolute inset-y-0 w-[40%] bg-[#ffff00] rounded-full splash-loader-bar" />
      </div>
    </div>
  );
}
