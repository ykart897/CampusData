import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bachelorApi, universityApi } from "../../services/api";
import { displayCity, formatNumber, formatScore, universityTypeLabel } from "../../lib/format";

export default function Anasayfa() {
  const navigate = useNavigate();
  const [programSearch, setProgramSearch] = useState("");
  const [universityId, setUniversityId] = useState("");

  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: () => universityApi.list(),
    staleTime: Infinity,
  });

  const { data: bachelorPreview } = useQuery({
    queryKey: ["bachelor-home-preview"],
    queryFn: () => bachelorApi.list({ year: 2025, limit: 10, page: 1, sort: "baseRank_asc" }),
  });

  const { data: programNames } = useQuery({
    queryKey: ["bachelor-program-names"],
    queryFn: bachelorApi.programNames,
    staleTime: Infinity,
  });

  const summary = useMemo(() => {
    const typeCounts = new Map<string, number>();
    (universities ?? []).forEach((university) => typeCounts.set(university.type, (typeCounts.get(university.type) ?? 0) + 1));
    return [...typeCounts.entries()];
  }, [universities]);

  const submitProgram = (event: FormEvent) => {
    event.preventDefault();
    const search = programSearch.trim();
    navigate(search ? `/programlar?search=${encodeURIComponent(search)}` : "/programlar");
  };

  const submitUniversity = (event: FormEvent) => {
    event.preventDefault();
    navigate(universityId ? `/programlar?universityId=${universityId}` : "/universite");
  };

  return (
    <div className="page-shell space-y-5">
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-300 bg-[#f7fbff] px-5 py-4">
          <h1 className="text-2xl font-bold text-[#1f5d99]">Yükseköğretim Program Atlası</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Üniversite ve lisans programlarını 2025 kılavuz verileriyle inceleyin.
          </p>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <SearchBox
            title="ÜNİVERSİTE SEÇ"
            description="Bir üniversite seçerek bağlı lisans programlarını listeleyin."
            onSubmit={submitUniversity}
          >
            <select value={universityId} onChange={(event) => setUniversityId(event.target.value)} className="input-field h-11">
              <option value="">Üniversite seçin</option>
              {(universities ?? []).map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
            <button type="submit" className="primary-button h-11 px-6">Listele</button>
          </SearchBox>

          <SearchBox
            title="LİSANS PROGRAMI SEÇ"
            description="Program, fakülte, üniversite veya şehir adıyla arama yapın."
            onSubmit={submitProgram}
          >
            <select
              value={programSearch}
              onChange={(event) => setProgramSearch(event.target.value)}
              className="input-field h-11"
            >
              <option value="">Lisans Programı Seçin</option>
              {(programNames ?? []).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button type="submit" className="primary-button h-11 px-6">Ara</button>
          </SearchBox>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="table-shell">
          <div className="atlas-panel-title">Başarı sırasına göre ilk kayıtlar</div>
          <div className="table-scroll">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-3 text-left">Program</th>
                  <th className="px-3 py-3 text-left">Üniversite</th>
                  <th className="px-3 py-3 text-left">Puan</th>
                  <th className="px-3 py-3 text-right">Taban sıra</th>
                  <th className="px-3 py-3 text-right">Taban puan</th>
                  <th className="px-3 py-3 text-right">Kontenjan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {(bachelorPreview?.data ?? []).map((program) => (
                  <tr key={program.id} className="hover:bg-sky-50">
                    <td className="px-3 py-3">
                      <Link to={`/programlar/${program.id}`} className="font-bold text-[#1f5d99] hover:underline">
                        {program.programName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{program.faculty}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-800">{program.university.name}</span>
                      <p className="mt-1 text-xs text-slate-500">{displayCity(program.university.city)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="chip border-sky-200 bg-sky-50 text-sky-800">{program.scoreType}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold">{formatNumber(program.latestYearData?.baseRank)}</td>
                    <td className="px-3 py-3 text-right font-mono">{formatScore(program.latestYearData?.baseScore)}</td>
                    <td className="px-3 py-3 text-right font-semibold">{formatNumber(program.quota)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="panel overflow-hidden">
            <div className="atlas-panel-title">Veri Özeti</div>
            <div className="space-y-3 p-4">
              <Metric label="Üniversite" value={formatNumber(universities?.length)} />
              <Metric label="Lisans programı" value={formatNumber(bachelorPreview?.meta.total)} />
              <Metric label="Veri yılı" value="2025" />
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="atlas-panel-title">Üniversite Türleri</div>
            <div className="space-y-2 p-4">
              {summary.map(([type, count]) => (
                <Link
                  key={type}
                  to={`/programlar?universityType=${type}`}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm hover:bg-sky-50"
                >
                  <span className="font-bold">{universityTypeLabel(type)}</span>
                  <span className="font-mono text-slate-600">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SearchBox({
  title,
  description,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded border border-slate-300 bg-white">
      <div className="atlas-panel-title">{title}</div>
      <div className="space-y-4 p-4">
        <p className="text-sm font-semibold text-slate-600">{description}</p>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">{children}</div>
      </div>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</p>
    </div>
  );
}
