import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bachelorApi } from "../../services/api";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { displayCity, formatNumber, scoreColors } from "../../lib/format";

const SCORE_TYPES = ["SAY", "EA", "SOZ", "DIL"] as const;

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  CERTAIN: { label: "Güçlü", cls: "border-teal-200 bg-teal-50 text-teal-800" },
  RISKY: { label: "Dengeli", cls: "border-amber-200 bg-amber-50 text-amber-800" },
  DIFFICULT: { label: "Zorlayıcı", cls: "border-rose-200 bg-rose-50 text-rose-800" },
  UNKNOWN: { label: "Belirsiz", cls: "border-slate-200 bg-slate-50 text-slate-700" },
};

export default function TercihSihirbazi() {
  const [searchParams] = useSearchParams();
  const initialScoreType = SCORE_TYPES.includes(searchParams.get("scoreType") as (typeof SCORE_TYPES)[number])
    ? (searchParams.get("scoreType") as (typeof SCORE_TYPES)[number])
    : "SAY";
  const [scoreType, setScoreType] = useState<(typeof SCORE_TYPES)[number]>(initialScoreType);
  const [rank, setRank] = useState(searchParams.get("rank") ?? "");
  const [searched, setSearched] = useState(Boolean(searchParams.get("rank")));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wizard", scoreType, rank],
    queryFn: () => bachelorApi.wizard({ scoreType, rank: Number(rank), year: 2025 }),
    enabled: searched && Number(rank) > 0,
  });

  const search = () => {
    if (Number(rank) > 0) setSearched(true);
  };

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Yerleşme analizi"
        title="Tercih Sihirbazı"
        description="Başarı sıranı gir; lisans programlarını güçlü, dengeli ve zorlayıcı ihtimal gruplarıyla gör."
      />

      <div className="panel mb-6 p-5">
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Puan türü</label>
            <div className="grid grid-cols-4 gap-2">
              {SCORE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setScoreType(type);
                    setSearched(false);
                  }}
                  className={`rounded-lg border py-3 text-sm font-black transition ${
                    scoreType === type
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Başarı sıran</label>
            <input
              type="number"
              min={1}
              placeholder="Örn. 50000"
              value={rank}
              onChange={(event) => {
                setRank(event.target.value);
                setSearched(false);
              }}
              onKeyDown={(event) => event.key === "Enter" && search()}
              className="input-field py-3 font-mono text-lg"
            />
          </div>

          <button onClick={search} disabled={Number(rank) <= 0} className="primary-button h-12 px-6">
            Program Bul
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-200/80" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Sonuçlar yüklenemedi"
          description="Backend yanıtı alınamadı. /api/bachelor/wizard endpointini kontrol edin."
        />
      )}

      {data && !isLoading && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">
              <strong className="text-slate-950">{data.length}</strong> program bulundu.
            </p>
            <p className="text-sm font-semibold text-slate-500">
              Sıran: <span className="font-mono font-black text-teal-700">{formatNumber(Number(rank))}</span> / {scoreType}
            </p>
          </div>

          <div className="space-y-3">
            {data.map((item) => {
              const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.UNKNOWN;
              return (
                <div key={item.program.id} className="panel grid grid-cols-[minmax(0,1fr)_10rem_9rem_8rem] items-center gap-4 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/programlar/${item.program.id}`} className="font-black text-slate-950 transition hover:text-teal-700">
                        {item.program.programName}
                      </Link>
                      <span className={`chip ${scoreColors[item.program.scoreType]}`}>{item.program.scoreType}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {item.program.university.name} · {displayCity(item.program.university.city)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase text-slate-400">Taban sıra</p>
                    <p className="font-mono text-sm font-black text-slate-950">
                      {formatNumber(item.program.latestYearData?.baseRank)}
                    </p>
                  </div>
                  <span className={`chip justify-center ${style.cls}`}>{style.label}</span>
                  <Link to={`/programlar/${item.program.id}`} className="text-right font-black text-teal-700 hover:text-teal-900">
                    İncele
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      {searched && data?.length === 0 && (
        <EmptyState title="Uygun program bulunamadı" description="Sıra veya puan türünü değiştirerek tekrar deneyin." />
      )}
    </div>
  );
}



