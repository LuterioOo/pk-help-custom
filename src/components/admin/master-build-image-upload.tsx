"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { StoredImage } from "@/components/ui/stored-image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  buildId: string | null;
  masterId: string;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onBuildId?: (id: string) => void;
  showManualUrl?: boolean;
};

export function MasterBuildImageUpload({
  buildId,
  masterId,
  imageUrl,
  onImageUrlChange,
  onBuildId,
  showManualUrl = true,
}: Props) {
  const t = useTranslations("admin.masters");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const resetDragState = useCallback(() => {
    dragDepthRef.current = 0;
    setDragOver(false);
  }, []);

  useEffect(() => {
    const reset = () => resetDragState();
    window.addEventListener("dragend", reset);
    window.addEventListener("drop", reset);
    return () => {
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset);
    };
  }, [resetDragState]);

  useEffect(() => {
    return () => {
      setUploading(false);
      resetDragState();
    };
  }, [resetDragState]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!masterId) {
        setPendingFile(file);
        toast.info(t("selectMasterFirst"));
        return;
      }
      setUploading(true);
      resetDragState();
      setPendingFile(null);
      try {
        const body = new FormData();
        body.append("file", file);
        if (buildId) body.append("buildId", buildId);
        else body.append("masterId", masterId);
        const res = await fetch("/api/admin/masters/build-upload", { method: "POST", body });
        const json = (await res.json()) as {
          imageUrl?: string;
          build?: { id: string };
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        if (json.build?.id) onBuildId?.(json.build.id);
        if (json.imageUrl) onImageUrlChange(json.imageUrl);
        toast.success(t("buildImageUploaded"));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("buildImageUploadError"));
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [buildId, masterId, onBuildId, onImageUrlChange, resetDragState, t]
  );

  useEffect(() => {
    if (masterId && pendingFile && !uploading) {
      void uploadFile(pendingFile);
    }
  }, [masterId, pendingFile, uploadFile, uploading]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetDragState();
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const removeImage = async () => {
    if (!buildId) {
      onImageUrlChange("");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch(
        `/api/admin/masters/build-upload?buildId=${encodeURIComponent(buildId)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      onImageUrlChange("");
      toast.success(t("buildImageRemoved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("buildImageRemoveError"));
    } finally {
      setUploading(false);
    }
  };

  const showPreview = Boolean(imageUrl?.trim());

  return (
    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
      <p className="text-sm text-zinc-400">{t("buildImageLabel")}</p>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepthRef.current += 1;
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
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

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />

        <label
          htmlFor={inputId}
          className={cn(
            "relative z-[1] w-full max-w-[200px] aspect-video rounded-xl overflow-hidden bg-zinc-800 border border-yellow-500/20 flex-shrink-0 cursor-pointer",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {showPreview ? (
            <StoredImage src={imageUrl} objectFit="cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center pointer-events-none">
              <Monitor className="w-10 h-10 text-zinc-600" />
            </div>
          )}
          {uploading ? (
            <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : null}
        </label>

        <div className="relative z-[1] flex flex-col gap-2 min-w-0 flex-1 sm:min-w-[180px]">
          <label
            htmlFor={inputId}
            className={cn(
              "inline-flex items-center justify-center gap-1 px-4 py-2 text-sm rounded-lg min-h-[36px]",
              "cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5 transition-all",
              uploading && "opacity-50 pointer-events-none"
            )}
          >
            <ImagePlus className="w-4 h-4" />
            {imageUrl ? t("buildImageReplace") : t("buildImageUpload")}
          </label>
          {imageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => void removeImage()}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("buildImageRemove")}
            </Button>
          ) : null}
          <p className="text-xs text-zinc-600">{t("buildImageDropHint")}</p>
          {pendingFile && !masterId ? (
            <p className="text-xs text-amber-400/90">{t("pendingFileHint")}</p>
          ) : null}
          {showManualUrl ? (
            <button
              type="button"
              className="text-xs text-zinc-500 hover:text-zinc-300 text-left underline-offset-2 hover:underline"
              onClick={() => setShowUrlInput((v) => !v)}
            >
              {showUrlInput ? t("buildImageHideUrl") : t("buildImageManualUrl")}
            </button>
          ) : null}
        </div>
      </div>
      {showManualUrl && showUrlInput ? (
        <input
          placeholder={t("imageUrl")}
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value.trim())}
          className="w-full px-3 py-2 rounded-lg glass text-sm font-mono text-xs"
        />
      ) : null}
    </div>
  );
}
