"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/ui/stored-image";
import { toast } from "sonner";
import { Pencil, Trash2, User, Plus } from "lucide-react";

type MasterBuild = {
  id: string;
  title: string;
  titleUk?: string | null;
  titleEn?: string | null;
  titlePl?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  pricePLN?: number | null;
  sortOrder: number;
  active: boolean;
};

type Master = {
  id: string;
  name: string;
  nameUk?: string | null;
  nameEn?: string | null;
  namePl?: string | null;
  avatarUrl?: string | null;
  specialization?: string | null;
  specUk?: string | null;
  specEn?: string | null;
  specPl?: string | null;
  description?: string | null;
  sortOrder: number;
  active: boolean;
  builds: MasterBuild[];
};

const emptyMaster = {
  name: "",
  nameUk: "",
  nameEn: "",
  namePl: "",
  avatarUrl: "",
  specialization: "",
  specUk: "",
  specEn: "",
  specPl: "",
  description: "",
  sortOrder: 0,
  active: true,
};

const emptyBuild = {
  masterId: "",
  title: "",
  titleUk: "",
  titleEn: "",
  titlePl: "",
  description: "",
  imageUrl: "",
  pricePLN: 0,
  sortOrder: 0,
  active: true,
};

export function MastersPanel() {
  const t = useTranslations("admin.masters");
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMasterId, setEditingMasterId] = useState<string | null>(null);
  const [masterForm, setMasterForm] = useState(emptyMaster);
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [buildForm, setBuildForm] = useState(emptyBuild);
  const [showBuildForm, setShowBuildForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/masters");
      if (res.status === 401) return;
      const data = await res.json();
      setMasters(data.masters ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveMaster = async () => {
    if (!masterForm.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    const payload = { ...masterForm, type: "master" };
    if (editingMasterId) {
      await fetch("/api/admin/masters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMasterId, ...payload }),
      });
    } else {
      await fetch("/api/admin/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setEditingMasterId(null);
    setMasterForm(emptyMaster);
    await load();
    toast.success(t("saved"));
  };

  const saveBuild = async () => {
    if (!buildForm.title.trim() || !buildForm.masterId) {
      toast.error(t("buildRequired"));
      return;
    }
    const payload = { ...buildForm, type: "build" };
    if (editingBuildId) {
      await fetch("/api/admin/masters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBuildId, ...payload }),
      });
    } else {
      await fetch("/api/admin/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setEditingBuildId(null);
    setBuildForm(emptyBuild);
    setShowBuildForm(false);
    await load();
    toast.success(t("saved"));
  };

  const editMaster = (m: Master) => {
    setEditingMasterId(m.id);
    setMasterForm({
      name: m.name,
      nameUk: m.nameUk ?? "",
      nameEn: m.nameEn ?? "",
      namePl: m.namePl ?? "",
      avatarUrl: m.avatarUrl ?? "",
      specialization: m.specialization ?? "",
      specUk: m.specUk ?? "",
      specEn: m.specEn ?? "",
      specPl: m.specPl ?? "",
      description: m.description ?? "",
      sortOrder: m.sortOrder,
      active: m.active,
    });
  };

  const editBuild = (b: MasterBuild, masterId: string) => {
    setEditingBuildId(b.id);
    setBuildForm({
      masterId,
      title: b.title,
      titleUk: b.titleUk ?? "",
      titleEn: b.titleEn ?? "",
      titlePl: b.titlePl ?? "",
      description: b.description ?? "",
      imageUrl: b.imageUrl ?? "",
      pricePLN: b.pricePLN ?? 0,
      sortOrder: b.sortOrder,
      active: b.active,
    });
    setShowBuildForm(true);
  };

  const removeMaster = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/masters?id=${id}`, { method: "DELETE" });
    await load();
  };

  const removeBuild = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/masters?id=${id}&type=build`, { method: "DELETE" });
    await load();
  };

  const inputClass = "px-3 py-2 rounded-lg glass text-sm w-full";

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 space-y-4 border border-yellow-500/10">
        <p className="text-sm text-yellow-400/90 font-medium">
          {editingMasterId ? t("editMaster") : t("addMaster")}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input placeholder={t("name")} value={masterForm.name} onChange={(e) => setMasterForm({ ...masterForm, name: e.target.value })} className={inputClass} />
          <input placeholder={t("nameUk")} value={masterForm.nameUk} onChange={(e) => setMasterForm({ ...masterForm, nameUk: e.target.value })} className={inputClass} />
          <input placeholder={t("nameEn")} value={masterForm.nameEn} onChange={(e) => setMasterForm({ ...masterForm, nameEn: e.target.value })} className={inputClass} />
          <input placeholder={t("namePl")} value={masterForm.namePl} onChange={(e) => setMasterForm({ ...masterForm, namePl: e.target.value })} className={inputClass} />
          <input placeholder={t("specialization")} value={masterForm.specialization} onChange={(e) => setMasterForm({ ...masterForm, specialization: e.target.value })} className={inputClass} />
          <input placeholder={t("avatarUrl")} value={masterForm.avatarUrl} onChange={(e) => setMasterForm({ ...masterForm, avatarUrl: e.target.value })} className={inputClass} />
          <input type="number" placeholder={t("sortOrder")} value={masterForm.sortOrder} onChange={(e) => setMasterForm({ ...masterForm, sortOrder: Number(e.target.value) })} className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={masterForm.active} onChange={(e) => setMasterForm({ ...masterForm, active: e.target.checked })} />
            {t("active")}
          </label>
        </div>
        <textarea placeholder={t("description")} value={masterForm.description} onChange={(e) => setMasterForm({ ...masterForm, description: e.target.value })} className={`${inputClass} sm:col-span-2`} rows={2} />
        <div className="flex gap-2">
          <Button onClick={() => void saveMaster()}>{editingMasterId ? t("save") : t("add")}</Button>
          {editingMasterId && (
            <Button variant="ghost" onClick={() => { setEditingMasterId(null); setMasterForm(emptyMaster); }}>{t("cancel")}</Button>
          )}
        </div>
      </div>

      {showBuildForm ? (
        <div className="glass rounded-2xl p-5 space-y-4 border border-white/10">
          <p className="text-sm text-zinc-300 font-medium">{editingBuildId ? t("editBuild") : t("addBuild")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select value={buildForm.masterId} onChange={(e) => setBuildForm({ ...buildForm, masterId: e.target.value })} className={inputClass}>
              <option value="">{t("selectMaster")}</option>
              {masters.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input placeholder={t("buildTitle")} value={buildForm.title} onChange={(e) => setBuildForm({ ...buildForm, title: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t("pricePLN")} value={buildForm.pricePLN || ""} onChange={(e) => setBuildForm({ ...buildForm, pricePLN: Number(e.target.value) })} className={inputClass} />
            <input placeholder={t("imageUrl")} value={buildForm.imageUrl} onChange={(e) => setBuildForm({ ...buildForm, imageUrl: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t("sortOrder")} value={buildForm.sortOrder} onChange={(e) => setBuildForm({ ...buildForm, sortOrder: Number(e.target.value) })} className={inputClass} />
          </div>
          <textarea placeholder={t("buildDescription")} value={buildForm.description} onChange={(e) => setBuildForm({ ...buildForm, description: e.target.value })} className={inputClass} rows={2} />
          <div className="flex gap-2">
            <Button onClick={() => void saveBuild()}>{t("save")}</Button>
            <Button variant="ghost" onClick={() => { setShowBuildForm(false); setEditingBuildId(null); setBuildForm(emptyBuild); }}>{t("cancel")}</Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowBuildForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          {t("addBuild")}
        </Button>
      )}

      {loading ? (
        <p className="text-zinc-500">{t("loading")}</p>
      ) : masters.length === 0 ? (
        <p className="text-zinc-500">{t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {masters.map((master) => (
            <div key={master.id} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                  {master.avatarUrl ? (
                    <StoredImage src={master.avatarUrl} sizes="48px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{master.name}</p>
                  <p className="text-xs text-zinc-500">{master.specialization} · #{master.sortOrder}{master.active ? "" : ` (${t("hidden")})`}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => editMaster(master)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => void removeMaster(master.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              {master.builds.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-2 mt--2">
                  {master.builds.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 text-sm bg-white/[0.02] rounded-lg px-3 py-2">
                      <span className="truncate">{b.title} {b.pricePLN ? `— ${b.pricePLN} PLN` : ""}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => editBuild(b, master.id)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => void removeBuild(b.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
