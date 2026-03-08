"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  size: number;
  priority?: boolean;
  className?: string;
};

/**
 * Avatar image using next/image (sizes, priority for LCP). Use with AvatarFallback as sibling.
 */
export function AvatarImageOptimized({
  src,
  alt,
  size,
  priority = false,
  className,
}: Props) {
  if (!src || !src.startsWith("http")) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={size <= 40 ? "40px" : size <= 96 ? "96px" : "192px"}
      priority={priority}
      className={cn("object-cover", className)}
      unoptimized
    />
  );
}
