export default function DeviceNavigationSkeleton() {
  return (
    <div className="grid grid-cols-2 p-4 gap-2">
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className="rounded-xl text-[12px] py-2 text-white uppercase font-display text-nowrap bg-[#161616] animate-pulse"
        >
          <div className="flex items-center justify-between pl-2 pr-1">
            <div className="h-[12px] bg-[#2F2F2F] rounded w-1/3"></div>
            <div className="h-[16px] w-[16px] bg-[#2F2F2F] rounded"></div>
          </div>
          <div className="h-[90px] bg-[#2F2F2F] rounded-xl mx-auto my-2"></div>
        </div>
      ))}
    </div>
  );
} 