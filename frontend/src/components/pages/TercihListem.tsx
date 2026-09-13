import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { preferenceApi, type PreferenceItem, type PreferenceList } from "../../services/api";
import { useAuthStore, usePreferenceStore } from "../../store/filter.store";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";

export default function TercihListem() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState("");
  const activeListId = usePreferenceStore((s) => s.activeListId);
  const setActiveListId = usePreferenceStore((s) => s.setActiveList);
  const [error, setError] = useState("");
  const preferenceQueryKey = ["preference-lists", user?.id] as const;

  const { data: lists, isLoading } = useQuery({
    queryKey: preferenceQueryKey,
    queryFn: preferenceApi.getLists,
    enabled: !!user,
  });

  const { mutate: createList, isPending: creating } = useMutation({
    mutationFn: () => preferenceApi.createList(newListName || "Tercih Listem"),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: preferenceQueryKey });
      setActiveListId(newList.id);
      setNewListName("");
      setError("");
    },
    onError: () => {
      setError("Liste oluşturulamadı. Giriş durumunu ve backend bağlantısını kontrol edin.");
    },
  });

  const { mutate: removeItem } = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) => preferenceApi.removeItem(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferenceQueryKey });
      setError("");
    },
    onError: () => {
      setError("Tercih silinemedi. Lütfen tekrar deneyin.");
    },
  });

  const { mutate: reorder, isPending: reordering } = useMutation({
    mutationFn: ({ listId, itemIds }: { listId: string; itemIds: string[] }) =>
      preferenceApi.reorder(listId, itemIds),
    onSuccess: (updatedList) => {
      queryClient.setQueryData<PreferenceList[]>(preferenceQueryKey, (current) =>
        current?.map((list) => (list.id === updatedList.id ? updatedList : list))
      );
      setError("");
    },
    onError: () => setError("Tercih sırası güncellenemedi. Lütfen tekrar deneyin."),
  });

  if (!user) {
    return (
      <div className="page-shell grid min-h-[70vh] place-items-center">
        <EmptyState
          title="Giriş gerekli"
          description="Tercih listesi oluşturmak ve kaydetmek için hesabına giriş yapmalısın."
          action={
            <div className="flex gap-3">
              <Link to="/giris?redirect=/listem" className="primary-button">
                Giriş Yap
              </Link>
              <Link to="/kayit?redirect=/listem" className="secondary-button">
                Kayıt Ol
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const activeList = lists?.find((list) => list.id === activeListId) ?? lists?.[0];

  const moveItem = (index: number, offset: -1 | 1) => {
    if (!activeList) return;
    const target = index + offset;
    if (target < 0 || target >= activeList.preferences.length) return;
    const ordered = [...activeList.preferences];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    reorder({ listId: activeList.id, itemIds: ordered.map((item) => item.id) });
  };

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Tercih yönetimi"
        title="Tercih Listem"
        description="Listelerini oluştur, programları sırala ve 24 tercih hakkını daha kontrollü yönet."
      />

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="panel space-y-3 p-4">
            <h2 className="font-black text-slate-950">Yeni liste</h2>
            {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</div>}
            <input
              type="text"
              placeholder="Liste adı"
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              className="input-field"
            />
            <button onClick={() => createList()} disabled={creating} className="primary-button w-full">
              {creating ? "Oluşturuluyor..." : "Oluştur"}
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : (
            lists?.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  activeList?.id === list.id
                    ? "border-teal-300 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className="font-black">{list.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {list.preferences?.length ?? 0} tercih · Lisans
                </p>
              </button>
            ))
          )}

          {lists?.length === 0 && !isLoading && (
            <p className="rounded-lg bg-white p-4 text-center text-sm font-semibold text-slate-400">Henüz liste yok.</p>
          )}
        </aside>

        <main className="min-w-0">
          {activeList ? (
            <div className="table-shell">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{activeList.name}</h2>
                  <p className="text-sm font-semibold text-slate-500">{activeList.preferences?.length ?? 0} / 24 tercih</p>
                </div>
                <Link to="/programlar" className="secondary-button">
                  Program Ekle
                </Link>
              </div>

              {activeList.preferences?.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <p className="font-semibold">Liste boş. Program atlasından tercih ekleyebilirsin.</p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Program</th>
                        <th className="px-4 py-3 text-left">Tür</th>
                        <th className="px-4 py-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeList.preferences?.map((item: PreferenceItem, index: number) => (
                        <tr key={item.id} className="hover:bg-teal-50/40">
                          <td className="px-4 py-3 font-mono font-black text-slate-400">{item.rank}</td>
                          <td className="px-4 py-3">
                            <Link to={`/programlar/${item.programId}`} className="font-black text-slate-950 hover:text-teal-700">
                              {item.programName ?? `Program #${item.programId}`}
                            </Link>
                            {item.universityName && <p className="mt-1 text-xs font-semibold text-slate-400">{item.universityName}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="chip border-slate-200 bg-slate-50 text-slate-700">{item.type}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0 || reordering}
                              className="mr-2 h-8 w-8 font-black text-slate-600 disabled:opacity-30"
                              title="Yukarı taşı"
                              aria-label="Yukarı taşı"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveItem(index, 1)}
                              disabled={index === activeList.preferences.length - 1 || reordering}
                              className="mr-3 h-8 w-8 font-black text-slate-600 disabled:opacity-30"
                              title="Aşağı taşı"
                              aria-label="Aşağı taşı"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeItem({ listId: activeList.id, itemId: item.id })}
                              className="font-black text-rose-600 hover:text-rose-800"
                              title="Sil"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="panel py-20 text-center font-semibold text-slate-400">
              Sol taraftan bir liste seç veya yeni liste oluştur.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


