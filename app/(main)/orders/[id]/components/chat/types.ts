/** Message row from DB (order_messages). */
export type OrderMessage = {
  id: string;
  order_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
  is_read: boolean;
};

/** Optimistic message shown before server confirms (has tempId; may have sendFailed). */
export type OptimisticMessage = OrderMessage & {
  tempId: string;
  isOptimistic: true;
  sendFailed?: boolean;
};

/** Union for list items: either confirmed or optimistic. */
export type ChatMessageItem = OrderMessage | OptimisticMessage;

export function isOptimisticMessage(
  m: ChatMessageItem
): m is OptimisticMessage {
  return "isOptimistic" in m && m.isOptimistic === true;
}

/** File selected in the input (before upload). */
export type PendingChatFile = {
  id: string;
  file: File;
  previewUrl?: string; // for images
};

export const CHAT_FILE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
export const CHAT_FILE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
