interface AdSlotProps {
  id?: string;
  height?: number;
  label?: string;
}

/**
 * Placeholder ad slot with fixed height to avoid CLS.
 * Integrate your ad provider script (AdSense/Mediavine/Ezoic) and map slot IDs externally.
 */
export default function AdSlot({ id, height = 250, label = 'Ad slot' }: AdSlotProps) {
  return (
    <div
      className="w-full bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 text-sm"
      style={{ minHeight: height }}
      data-ad-slot={id}
    >
      {label} {id ? `(${id})` : ''}
    </div>
  );
}
