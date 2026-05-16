import { useQuery } from "@tanstack/react-query";
import { universityApi, type BachelorFilter } from "../../services/api";

type Props = {
  filter: BachelorFilter;
  onChange: (filter: Partial<BachelorFilter>) => void;
  onClear: () => void;
  universities?: { id: number; name: string }[];
};

const SCORE_TYPES = ["SAY", "EA", "SOZ", "DIL"];
const TEACHING_TYPES = [
  { value: "ORGUNLU", label: "Örgün" },
  { value: "IKINDI", label: "İkinci öğretim" },
  { value: "UZAKTAN", label: "Uzaktan" },
];
const UNIVERSITY_TYPES = [
  { value: "DEVLET", label: "Devlet" },
  { value: "VAKIF", label: "Vakıf" },
];

export function FilterPanel({ filter, onChange, onClear, universities = [] }: Props) {
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: universityApi.cities,
    staleTime: Infinity,
  });

  const set = (key: keyof BachelorFilter, value: unknown) => {
    onChange({ [key]: value === "" ? undefined : value });
  };

  return (
    <div className="panel sticky top-28 overflow-hidden text-sm">
      <div className="atlas-panel-title">Program filtresi</div>
      <div className="space-y-5 p-4">
        <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-sky-700">Kılavuz verisi</p>
          <h2 className="mt-1 text-base font-black text-slate-950">Filtreler</h2>
        </div>
        <button onClick={onClear} className="text-xs font-bold text-slate-500 transition hover:text-sky-700">
          Temizle
        </button>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Program veya üniversite</label>
        <input
          type="text"
          placeholder="Bilgisayar, hukuk, İstanbul..."
          value={filter.search ?? ""}
          onChange={(event) => set("search", event.target.value)}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-bold uppercase text-slate-500">Ana yıl</p>
          <p className="mt-1 font-black text-slate-900">2025</p>
        </div>

        <div>
          <label className="mb-1.5 block font-bold text-slate-700">Sıralama</label>
          <select
            value={filter.sort ?? "baseRank_asc"}
            onChange={(event) => set("sort", event.target.value)}
            className="input-field"
          >
            <option value="baseRank_asc">Taban sıra artan</option>
            <option value="baseRank_desc">Taban sıra azalan</option>
            <option value="quota_desc">Kontenjan azalan</option>
            <option value="quota_asc">Kontenjan artan</option>
            <option value="programName_asc">Program adı A-Z</option>
            <option value="programName_desc">Program adı Z-A</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block font-bold text-slate-700">Puan türü</label>
        <div className="grid grid-cols-4 gap-1.5">
          {SCORE_TYPES.map((scoreType) => (
            <button
              key={scoreType}
              onClick={() => set("scoreType", filter.scoreType === scoreType ? undefined : scoreType)}
              className={`rounded-lg border px-2 py-2 text-xs font-black transition ${
                filter.scoreType === scoreType
                  ? "border-[#1f5d99] bg-[#1f5d99] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-400 hover:bg-sky-50"
              }`}
            >
              {scoreType}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Şehir</label>
        <select value={filter.city ?? ""} onChange={(event) => set("city", event.target.value)} className="input-field">
          <option value="">Tüm şehirler</option>
          {(cities ?? []).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Üniversite</label>
        <select
          value={filter.universityId ?? ""}
          onChange={(event) => set("universityId", event.target.value ? Number(event.target.value) : undefined)}
          className="input-field"
        >
          <option value="">Tüm üniversiteler</option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {university.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block font-bold text-slate-700">Üniversite türü</label>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <input
              type="radio"
              name="universityType"
              checked={!filter.universityType}
              onChange={() => set("universityType", undefined)}
              className="accent-sky-700"
            />
            <span className="font-semibold text-slate-700">Tümü</span>
          </label>
          {UNIVERSITY_TYPES.map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <input
                type="radio"
                name="universityType"
                value={value}
                checked={filter.universityType === value}
                onChange={() => set("universityType", value)}
                className="accent-sky-700"
              />
              <span className="font-semibold text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Öğretim türü</label>
        <select
          value={filter.teachingType ?? ""}
          onChange={(event) => set("teachingType", event.target.value)}
          className="input-field"
        >
          <option value="">Tümü</option>
          {TEACHING_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Taban sıra aralığı</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filter.minRank ?? ""}
            onChange={(event) => set("minRank", event.target.value ? Number(event.target.value) : undefined)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max"
            value={filter.maxRank ?? ""}
            onChange={(event) => set("maxRank", event.target.value ? Number(event.target.value) : undefined)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Taban puan aralığı</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={filter.minBaseScore ?? ""}
            onChange={(event) => set("minBaseScore", event.target.value ? Number(event.target.value) : undefined)}
            className="input-field"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={filter.maxBaseScore ?? ""}
            onChange={(event) => set("maxBaseScore", event.target.value ? Number(event.target.value) : undefined)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-bold text-slate-700">Kontenjan aralığı</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filter.minQuota ?? ""}
            onChange={(event) => set("minQuota", event.target.value ? Number(event.target.value) : undefined)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max"
            value={filter.maxQuota ?? ""}
            onChange={(event) => set("maxQuota", event.target.value ? Number(event.target.value) : undefined)}
            className="input-field"
          />
        </div>
      </div>

      </div>
    </div>
  );
}



