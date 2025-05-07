export default function ProductCardSkeleton() {
  return (
    <div className="rounded-xl text-[12px] bg-[#161616] text-white font-display text-nowrap animate-pulse">
      <div className="w-full h-[200px] bg-[#2F2F2F] rounded-xl"></div>
      <div className="flex flex-col items-start px-1 overflow-hidden text-ellipsis">
        <div className="font-primary mt-2 h-[16px] bg-[#2F2F2F] rounded w-full"></div>
        <div className="flex items-center gap-1 mt-1">
          <div className="h-[14px] bg-[#2F2F2F] rounded w-1/3"></div>
          <div className="h-[10px] bg-[#2F2F2F] rounded w-1/4"></div>
        </div>
        <div className="h-[24px] bg-[#2F2F2F] rounded-full w-[95%] my-2"></div>
      </div>
    </div>
  );
} 