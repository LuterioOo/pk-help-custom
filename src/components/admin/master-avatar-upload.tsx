"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { StoredImage } from "@/components/ui/stored-image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  masterId: string | null;
  avatarUrl: string;
  onAvatarUrlChange: (url: string) => void;
  onMasterId?: (id: string) => void;
};

export function MasterAvatarUpload({ masterId, avatarUrl, onAvatarUrlChange, onMasterId }: Props) {
  const t = useTranslations("admin.masters");
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const resetDragState = useCallback(() => {
    dragDepthRef.current = 0;
    setDragOver(false);
  }, []);

  useEffect(() => {
    const onWindowDragEnd = () => resetDragState();
    window.addEventListener("dragend", onWindowDragEnd);
    window.addEventListener("drop", onWindowDragEnd);
    return () => {
      window.removeEventListener("dragend", onWindowDragEnd);
      window.removeEventListener("drop", onWindowDragEnd);
    };
  }, [resetDragState]);

  useEffect(() => {
    return () => {
      setUploading(false);
      resetDragState();
    };
  }, [resetDragState]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    resetDragState();
    try {
      const body = new FormData();
      body.append("file", file);
      if (masterId) body.append("masterId", masterId);
      const res = await fetch("/api/admin/masters/upload", { method: "POST", body });
      const json = (await res.json()) as { avatarUrl?: string; master?: { id: string }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      if (json.master?.id) onMasterId?.(json.master.id);
      if (json.avatarUrl) onAvatarUrlChange(json.avatarUrl);
      toast.success(t("avatarUploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("avatarUploadError"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    resetDragState();
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const removeAvatar = async () => {
    if (!masterId) {
      onAvatarUrlChange("");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch(
        `/api/admin/masters/upload?masterId=${encodeURIComponent(masterId)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      onAvatarUrlChange("");
      toast.success(t("avatarRemoved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("avatarRemoveError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
      <p className="text-sm text-zinc-400">{t("avatarLabel")}</p>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepthRef.current += 1;
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setDragOver(false);
        }}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-wrap items-start gap-4 rounded-xl border border-dashed p-4 transition-colors",
          dragOver ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/15 bg-white/[0.02]"
        )}
      >
        {dragOver ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-xl ring-2 ring-yellow-500/40 ring-inset"
            aria-hidden
          />
        ) : null}
        <div className="relative z-[1] w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border border-yellow-500/20 flex-shrink-0">
          {avatarUrl ? (
            <StoredImage src={avatarUrl} sizes="96px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <User className="w-10 h-10 text-zinc-600" />
            </div>
          )}
          {uploading ? (
            <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : null}
        </div>
        <div className="relative z-[1] flex flex-col gap-2 min-w-[180px]">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="w-4 h-4 mr-1" />
            {avatarUrl ? t("avatarReplace") : t("avatarUpload")}
          </Button>
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => void removeAvatar()}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("avatarRemove")}
            </Button>
          ) : null}
          <p className="text-xs text-zinc-600">{t("avatarDropHint")}</p>
        </div>
      </div>
    </div>
  );
}
