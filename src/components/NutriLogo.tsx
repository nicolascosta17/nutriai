import Image from "next/image";

export default function NutriLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/icon-192.png"
      alt=""
      width={192}
      height={192}
      unoptimized
      className={`shrink-0 rounded-lg ${className ?? "size-9"}`}
    />
  );
}
