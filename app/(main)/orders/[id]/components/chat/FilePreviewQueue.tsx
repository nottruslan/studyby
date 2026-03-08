"use client";

import React from "react";
import Image from "next/image";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingChatFile } from "./types";
import { cn } from "@/lib/utils";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function isImageType(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

type Props = {
  files: PendingChatFile[];
  onRemove: (id: string) => void;
  className?: string;
};

export function FilePreviewQueue({ files, onRemove, className }: Props) {
  if (files.length === 0) return null;

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-2 scrollbar-thin",
        className
      )}
    >
      {files.map(({ id, file, previewUrl }) => (
        <div
          key={id}
          className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border"
        >
          {isImageType(file) && previewUrl ? (
            <Image
              src={previewUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="56px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-0.5 right-0.5 h-6 w-6 rounded-full p-0 opacity-90"
            onClick={() => onRemove(id)}
            aria-label="Удалить файл"
          >
            <X className="h-3 w-3" />
          </Button>
          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 truncate">
            {file.name}
          </span>
        </div>
      ))}
    </div>
  );
}
