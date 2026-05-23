"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";

type Props = {
  componentId: string | null;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onPendingFile?: (file: File | null) => void;
};

export function ComponentImageUpload({
  componentId,
  imageUrl,
  onImageUrlChange,
  onPendingFile,
}: Props) {
  const t = useTranslations("admin.componentImage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!componentId) {
      onPendingFile?.(file);
      toast.info(t("saveFirst"));
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("componentId", componentId);
      const res = await fetch("/api/admin/components/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onImageUrlChange(json.imageUrl);
      onPendingFile?.(null);
      toast.success(t("uploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("uploadError"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (!componentId) {
      onImageUrlChange("");
      onPendingFile?.(null);
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(
        `/api/admin/components/upload?componentId=${encodeURIComponent(componentId)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      onImageUrlChange("");
      toast.success(t("removed"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("removeError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sm:col-span-2 lg:col-span-4 space-y-2">
      <p className="text-sm text-zinc-400">{t("label")}</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative w-28 h-28 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <Image src={imageUrl} alt="" fill className="object-contain p-1" sizes="112px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600 text-center px-2">
              {t("noImage")}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
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
            {imageUrl ? t("replace") : t("upload")}
          </Button>
          {imageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => void removeImage()}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("remove")}
            </Button>
          ) : null}
          <p className="text-xs text-zinc-600 max-w-xs">{t("hint")}</p>
        </div>
      </div>
    </div>
  );
}

export async function uploadPendingComponentImage(
  componentId: string,
  file: File
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("componentId", componentId);
  const res = await fetch("/api/admin/components/upload", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return json.imageUrl as string;
}