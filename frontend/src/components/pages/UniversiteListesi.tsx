import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { universityApi, type University } from "../../services/api";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { displayCity, formatNumber, universityTypeColors, universityTypeLabel } from "../../lib/format";

type SortKey = "name" | "city";
const UNIVERSITY_TYPES = ["DEVLET", "VAKIF"] as const;

export default function UniversiteListesi() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [type, setType] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    setCity(searchParams.get("city") ?? "");
  }, [searchParams]);

  const { data: universities, isLoading, isError } = useQuery({
    queryKey: ["universities"],
    queryFn: () => universityApi.list(),
    staleTime: Infinity,
  });

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: universityApi.cities,
    staleTime: Infinity,
  });

  const filtered = useMemo(() => {
    const items = [...(universities ?? [])].filter((university) => {
      const query = search.toLocaleLowerCase("tr-TR");
      const name = university.name.toLocaleLowerCase("tr-TR");
      const universityCity = displayCity(university.city).toLocaleLowerCase("tr-TR");

      if (search && !name.includes(query) && !universityCity.includes(query)) return false;
      if (city && university.city !== city) return false;
      if (type && university.type !== type) return false;
      return true;
    });

    return items.sort((a, b) => sortUniversities(a, b, sort));
  }, [city, search, sort, type, universities]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (universities ?? []).forEach((university) => {
      counts.set(university.type, (counts.get(university.type) ?? 0) + 1);
    });
    return counts;
  }, [universities]);

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Kurum keşfi"
        title="Üniversiteler"
        description="Üniversiteleri şehir, tür ve temel kurumsal göstergelerle geniş ekran tablo düzeninde karşılaştır."
        aside={
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Toplam" value={formatNumber(universities?.length)} />
            <MiniStat label="Sonuç" value={formatNumber(filtered.length)} />
            <MiniStat label="Şehir" value={formatNumber(cities?.length)} />
          </div>
        }
      />

      <div className="panel mb-6 grid grid-cols-[minmax(0,1fr)_14rem_13rem_13rem] gap-3 p-4">
        <input
          type="text"
          placeholder="Üniversite veya şehir ara..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field"
        />
        <select value={city} onChange={(event) => setCity(event.target.value)} className="input-field">
          <option value="">Tüm şehirler</option>
          {(cities ?? []).map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="input-field">
          <option value="">Tüm türler</option>
          <option value="DEVLET">Devlet</option>
          <option value="VAKIF">Vakıf</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="input-field">
          <option value="name">Ada göre</option>
          <option value="city">Şehre göre</option>
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {UNIVERSITY_TYPES.map((universityType) => (
          <button
            key={universityType}
            onClick={() => setType(type === universityType ? "" : universityType)}
            className={`rounded-lg border p-4 text-left transition ${
              type === universityType
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
            }`}
          >
            <p className="text-xl font-black">{typeCounts.get(universityType) ?? 0}</p>
            <p className="mt-1 text-xs font-bold uppercase">{universityTypeLabel(universityType)}</p>
          </button>
        ))}
      </div>

      {isError && (
        <EmptyState
          title="Üniversite verisi yüklenemedi"
          description="Backend yanıtı alınamadı. Sunucunun çalıştığını ve /api/university endpointinin erişilebilir olduğunu kontrol edin."
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-200/80" />
          ))}
        </div>
      ) : filtered.length === 0 && !isError ? (
        <EmptyState title="Sonuç bulunamadı" description="Arama veya filtreleri gevşeterek tekrar deneyin." />
      ) : (
        <div className="table-shell">
          <div className="grid grid-cols-[minmax(0,1.4fr)_12rem_11rem_8rem] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500">
            <span>Üniversite</span>
            <span>Şehir</span>
            <span>Tür</span>
            <span className="text-right">Detay</span>
          </div>
          {filtered.map((university) => (
            <Link
              key={university.id}
              to={`/universite/${university.id}`}
              className="grid grid-cols-[minmax(0,1.4fr)_12rem_11rem_8rem] items-center border-b border-slate-100 px-4 py-4 text-sm last:border-0 hover:bg-teal-50/50"
            >
              <span className="min-w-0">
                <span className="block truncate font-black text-slate-950">{university.name}</span>
                {university.websiteUrl && (
                  <span className="mt-1 block truncate text-xs font-semibold text-slate-400">{university.websiteUrl}</span>
                )}
              </span>
              <span className="font-semibold text-slate-700">{displayCity(university.city)}</span>
              <span>
                <span className={`chip ${universityTypeColors[university.type] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  {universityTypeLabel(university.type)}
                </span>
              </span>
              <span className="text-right font-black text-teal-700">İncele</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile min-w-28">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
    </div>
  );
}

function sortUniversities(a: University, b: University, sort: SortKey) {
  if (sort === "city") return displayCity(a.city).localeCompare(displayCity(b.city), "tr");
  return a.name.localeCompare(b.name, "tr");
}



