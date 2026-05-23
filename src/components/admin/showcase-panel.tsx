"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus, Trash2, Pencil } from "lucide-react";

type Item = {
  id: string;
  imageUrl: string;
  title?: string | null;
  caption?: string | null;
  showText: boolean;
  forSale: boolean;
  pricePLN?: number | null;
  sortOrder: number;
  active: boolean;
};

const emptyForm = {
  title: "",
  caption: "",
  showText: true,
  forSale: false,
  pricePLN: 0,
  sortOrder: 0,
  active: true,
  imageUrl: "",
};

export function ShowcasePanel() {
  const t = useTranslations("admin.showcase");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/showcase");
      if (res.status === 401) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadFile = async (file: File, targetId?: string | null) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (targetId) body.append("showcaseId", targetId);
      const res = await fetch("/api/admin/showcase/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setForm((f) => ({ ...f, imageUrl: json.imageUrl }));
      if (!editingId && json.item?.id) setEditingId(json.item.id);
      toast.success(t("uploaded"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("uploadError"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const save = async () => {
    if (!form.imageUrl) {
      toast.error(t("needImage"));
      return;
    }
    const payload = {
      title: form.title,
      caption: form.caption,
      showText: form.showText,
      forSale: form.forSale,
      pricePLN: form.forSale ? form.pricePLN : null,
      sortOrder: form.sortOrder,
      active: form.active,
      imageUrl: form.imageUrl,
    };
    if (editingId) {
      await fetch("/api/admin/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
    } else {
      await fetch("/api/admin/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setEditingId(null);
    setForm(emptyForm);
    await load();
    toast.success(t("saved"));
  };

  const edit = (item: Item) => {
    setEditingId(item.id);
    setForm({
      title: item.title ?? "",
      caption: item.caption ?? "",
      showText: item.showText,
      forSale: item.forSale,
      pricePLN: item.pricePLN ?? 0,
      sortOrder: item.sortOrder,
      active: item.active,
      imageUrl: item.imageUrl,
    });
  };

  const remove = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/showcase?id=${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    await load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/showcase", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 space-y-4 border border-yellow-500/10">
        <p className="text-sm text-yellow-400/90 font-medium">{t("formTitle")}</p>
        <div className="flex flex-wrap gap-4 items-start">
          <div className="relative w-40 h-28 rounded-xl bg-black/40 border border-yellow-500/20 overflow-hidden">
            {form.imageUrl ? (
              <Image src={form.imageUrl} alt="" fill className="object-cover" sizes="160px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600 px-2 text-center">
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
                if (file) void uploadFile(file, editingId);
              }}
            />
            <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <ImagePlus className="w-4 h-4 mr-1" />
              {t("upload")}
            </Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder={t("title")}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2 rounded-lg glass text-sm"
          />
          <input
            placeholder={t("caption")}
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            className="px-3 py-2 rounded-lg glass text-sm"
          />
          <input
            type="number"
            placeholder={t("sortOrder")}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg glass text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-400 px-2">
            <input type="checkbox" checked={form.showText} onChange={(e) => setForm({ ...form, showText: e.target.checked })} />
            {t("showText")}
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400 px-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            {t("active")}
          </label>
          <label className="flex items-center gap-2 text-sm text-yellow-400/90 px-2 sm:col-span-2">
            <input type="checkbox" checked={form.forSale} onChange={(e) => setForm({ ...form, forSale: e.target.checked })} />
            {t("forSale")}
          </label>
          {form.forSale ? (
            <input
              type="number"
              placeholder={t("pricePLN")}
              value={form.pricePLN || ""}
              onChange={(e) => setForm({ ...form, pricePLN: Number(e.target.value) })}
              className="px-3 py-2 rounded-lg glass text-sm"
            />
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void save()}>{editingId ? t("save") : t("add")}</Button>
          {editingId && (
            <Button variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              {t("cancel")}
            </Button>
          )}
        </div>
        <p className="text-xs text-zinc-600">{t("hint")}</p>
      </div>

      {loading ? (
        <p className="text-zinc-500">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-zinc-500">{t("empty")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-xl overflow-hidden border border-yellow-500/10">
              <div className="relative aspect-video bg-black">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="400px" />
                ) : null}
                {item.showText && item.title ? (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-sm text-yellow-400 font-medium">{item.title}</p>
                  </div>
                ) : null}
              </div>
              <div className="p-3 flex flex-wrap justify-between gap-2 items-center">
                <span className="text-xs text-zinc-500">
                  #{item.sortOrder}
                  {item.forSale ? ` · ${t("saleTag")}${item.pricePLN ? ` ${item.pricePLN} PLN` : ""}` : ` · ${t("decorTag")}`}
                  {item.active ? "" : ` (${t("hidden")})`}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => edit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => void toggleActive(item.id, item.active)}>
                    {item.active ? t("hide") : t("show")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void remove(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}