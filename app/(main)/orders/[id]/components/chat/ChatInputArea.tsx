"use client";

import React, { useState, useRef, useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Paperclip, SendHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FilePreviewQueue } from "./FilePreviewQueue";
import type { PendingChatFile } from "./types";
import {
  CHAT_FILE_ACCEPT,
  CHAT_FILE_MAX_BYTES,
} from "./types";
import { cn } from "@/lib/utils";

const BUCKET = "chat-attachments";

type Props = {
  orderId: string;
  onSend: (
    content: string | null,
    fileUrl: string | null,
    fileType: string | null
  ) => void;
  disabled?: boolean;
  fullScreen?: boolean;
};

export function ChatInputArea({
  orderId,
  onSend,
  disabled = false,
  fullScreen = false,
}: Props) {
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingChatFile[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    const toAdd: PendingChatFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > CHAT_FILE_MAX_BYTES) {
        toast.error("Файл слишком большой (макс. 10 МБ)");
        continue;
      }
      const id = `file-${Date.now()}-${i}`;
      const previewUrl =
        file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;
      toAdd.push({ id, file, previewUrl });
    }
    setPendingFiles((prev) => [...prev, ...toAdd]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleSend = useCallback(async () => {
    const content = text.trim() || null;
    if (!content && pendingFiles.length === 0) return;
    if (disabled || sending) return;

    setSending(true);
    const supabase = createClient();
    const filesToSend = [...pendingFiles];

    if (filesToSend.length === 0) {
      onSend(content, null, null);
      setText("");
      setSending(false);
      return;
    }

    for (let i = 0; i < filesToSend.length; i++) {
      const { file } = filesToSend[i];
      const ext = file.name.split(".").pop() ?? "";
      const path = `${orderId}/${crypto.randomUUID()}-${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (error) {
        toast.error("Не удалось загрузить файл");
        setSending(false);
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const fileContent = i === 0 ? content : null;
      onSend(fileContent, data.publicUrl, file.type);
    }

    setText("");
    setPendingFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return [];
    });
    setSending(false);
  }, [text, pendingFiles, orderId, onSend, disabled, sending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend =
    (text.trim().length > 0 || pendingFiles.length > 0) && !disabled && !sending;

  const inputWrapperClass = fullScreen
    ? "sticky bottom-0 left-0 right-0 border-t border-border bg-background p-3 pb-[env(safe-area-inset-bottom,16px)]"
    : "flex-shrink-0 border-t border-border bg-background p-3";

  return (
    <div className={inputWrapperClass}>
      <FilePreviewQueue files={pendingFiles} onRemove={removeFile} />
      <div className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          accept={CHAT_FILE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-3xl text-muted-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Прикрепить файл"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <TextareaAutosize
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение…"
          minRows={1}
          maxRows={5}
          className={cn(
            "flex-1 min-w-0 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          disabled={disabled}
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-3xl"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Отправить"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
