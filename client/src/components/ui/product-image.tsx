import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export default function ProductImage({ 
  src, 
  alt, 
  className, 
  width = 400, 
  height = 400, 
  objectFit = "cover" 
}: ProductImageProps) {
  const [error, setError] = useState(false);

  // Default fallback image when the original image fails to load
  const fallbackSrc = "https://placehold.co/400x400/e2e8f0/64748b?text=Sin+Imagen";

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      className={cn(
        "overflow-hidden",
        className
      )}
      style={{ position: "relative" }}
    >
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        style={{ objectFit }}
        className="w-full h-full"
        onError={handleError}
      />
    </div>
  );
}
