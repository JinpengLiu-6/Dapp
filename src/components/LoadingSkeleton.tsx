type LoadingSkeletonProps = {
  lines?: number;
  className?: string;
  lineClassName?: string;
};

export function LoadingSkeleton({
  lines = 3,
  className = 'space-y-3',
  lineClassName = 'h-4 rounded-full bg-white/10 animate-pulse',
}: LoadingSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => {
        const widths = ['w-full', 'w-11/12', 'w-8/12', 'w-10/12'];
        const widthClass = widths[index % widths.length];

        return <div className={`${lineClassName} ${widthClass}`} key={index} />;
      })}
    </div>
  );
}
