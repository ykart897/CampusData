import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { scoreApi } from "../../services/api";
import { PageHeader } from "../ui/PageHeader";

type ScoreType = "SAY" | "EA" | "SOZ" | "DIL";

const SCORE_FORMULAS: Record<ScoreType, (tyt: number, ayt: number, diploma: number) => number> = {
  SAY: (tyt, ayt, diploma) => 160 + tyt * 1.6 + ayt * 3.5 + diploma * 5 * 0.12,
  EA: (tyt, ayt, diploma) => 160 + tyt * 1.6 + ayt * 3.0 + diploma * 5 * 0.12,
  SOZ: (tyt, ayt, diploma) => 160 + tyt * 1.6 + ayt * 2.8 + diploma * 5 * 0.12,
  DIL: (tyt, ayt, diploma) => 160 + tyt * 0.8 + ayt * 4.0 + diploma * 5 * 0.12,
};

const TYT_SECTIONS = [
  { name: "Türkçe", max: 40 },
  { name: "Matematik", max: 40 },
  { name: "Fen Bilimleri", max: 20 },
  { name: "Sosyal Bilimler", max: 20 },
];

const AYT_SECTIONS: Record<ScoreType, { name: string; max: number }[]> = {
  SAY: [
    { name: "Matematik", max: 40 },
    { name: "Fizik", max: 14 },
    { name: "Kimya", max: 13 },
    { name: "Biyoloji", max: 13 },
  ],
  EA: [
    { name: "Matematik", max: 40 },
    { name: "Edebiyat", max: 24 },
    { name: "Coşrafya-1", max: 6 },
  ],
  SOZ: [
    { name: "Edebiyat", max: 24 },
    { name: "Coşrafya-1", max: 6 },
    { name: "Tarih-1", max: 10 },
    { name: "Felsefe", max: 12 },
    { name: "Din", max: 8 },
  ],
  DIL: [{ name: "YDT", max: 80 }],
};

function calcNet(inputs: Record<string, string>, sections: { name: string; max: number }[]) {
  return sections.reduce((sum, section) => {
    const correct = Number(inputs[`${section.name}_c`] ?? 0);
    const wrong = Number(inputs[`${section.name}_w`] ?? 0);
    return sum + correct - wrong / 4;
  }, 0);
}

export default function NetSihirbazi() {
  const [scoreType, setScoreType] = useState<ScoreType>("SAY");
  const [tytInputs, setTytInputs] = useState<Record<string, string>>({});
  const [aytInputs, setAytInputs] = useState<Record<string, string>>({});
  const [diplomaGrade, setDiplomaGrade] = useState("80");

  const diploma = Math.min(100, Math.max(0, Number(diplomaGrade) || 0));
  const tytNet = Math.max(0, calcNet(tytInputs, TYT_SECTIONS));
  const aytNet = Math.max(0, calcNet(aytInputs, AYT_SECTIONS[scoreType]));
  const localScore = SCORE_FORMULAS[scoreType](tytNet, aytNet, diploma);
  const hasInput = tytNet > 0 || aytNet > 0;

  const { data: backendResult, isFetching } = useQuery({
    queryKey: ["scoreCalc", scoreType, tytNet, aytNet, diploma],
    queryFn: () => scoreApi.calculate({ scoreType, tytNet, aytNet, diplomaGrade: diploma }),
    enabled: hasInput,
    staleTime: Infinity,
  });

  const displayScore = backendResult?.toplamPuan ?? localScore;

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Puan ön izlemesi"
        title="Net Sihirbazı"
        description="TYT ve AYT doğru-yanlış sayılarını gir; tahmini puanını anlık olarak gör."
      />

      <div className="grid grid-cols-[minmax(0,1fr)_24rem] gap-6">
        <div className="space-y-5">
          <div className="panel grid grid-cols-[1fr_13rem] gap-5 p-4">
            <div>
              <label className="mb-3 block text-sm font-bold text-slate-700">Puan türü</label>
              <div className="grid grid-cols-4 gap-2">
                {(["SAY", "EA", "SOZ", "DIL"] as ScoreType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setScoreType(type);
                      setAytInputs({});
                    }}
                    className={`rounded-lg border py-3 font-black transition ${
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
              <label className="mb-3 block text-sm font-bold text-slate-700">Diploma notu</label>
              <input
                type="number"
                min={0}
                max={100}
                value={diplomaGrade}
                onChange={(event) => setDiplomaGrade(event.target.value)}
                className="input-field py-3 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <SectionPanel title="TYT" net={tytNet} sections={TYT_SECTIONS} inputs={tytInputs} onChange={setTytInputs} />
            <SectionPanel title={`AYT (${scoreType})`} net={aytNet} sections={AYT_SECTIONS[scoreType]} inputs={aytInputs} onChange={setAytInputs} />
          </div>
        </div>

        <aside className="panel h-fit overflow-hidden">
          <div className="bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase text-teal-200">Tahmini {scoreType}</p>
            <p className={`mt-3 text-5xl font-black transition-opacity ${isFetching ? "opacity-60" : ""}`}>
              {displayScore.toFixed(2)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Bu değer yaklaşık hesaplamadır; resmi sonuç yerine geçmez.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            <ResultTile label="TYT net" value={tytNet.toFixed(2)} />
            <ResultTile label="AYT net" value={aytNet.toFixed(2)} />
            <ResultTile label="OBP katkısı" value={(backendResult?.obpKatkisi ?? diploma * 5 * 0.12).toFixed(2)} />
          </div>
          <div className="border-t border-slate-100 p-5">
            <Link to={`/tercih?scoreType=${scoreType}`} className="primary-button w-full">
              Tercih Sihirbazına Geç
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionPanel({
  title,
  net,
  sections,
  inputs,
  onChange,
}: {
  title: string;
  net: number;
  sections: { name: string; max: number }[];
  inputs: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <span className="chip border-teal-200 bg-teal-50 text-teal-800">Net {net.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-[1fr_5rem_5rem] gap-2 border-b border-slate-100 pb-2 text-xs font-black uppercase text-slate-400">
        <span>Bölüm</span>
        <span className="text-center">Doğru</span>
        <span className="text-center">Yanlış</span>
      </div>
      {sections.map((section) => (
        <div key={section.name} className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-slate-100 py-3 last:border-0">
          <span className="text-sm font-semibold text-slate-700">
            {section.name} <span className="text-xs text-slate-400">/{section.max}</span>
          </span>
          <input
            type="number"
            min={0}
            max={section.max}
            placeholder="0"
            value={inputs[`${section.name}_c`] ?? ""}
            onChange={(event) => onChange({ ...inputs, [`${section.name}_c`]: event.target.value })}
            className="input-field px-2 text-center"
          />
          <input
            type="number"
            min={0}
            max={section.max}
            placeholder="0"
            value={inputs[`${section.name}_w`] ?? ""}
            onChange={(event) => onChange({ ...inputs, [`${section.name}_w`]: event.target.value })}
            className="input-field px-2 text-center"
          />
        </div>
      ))}
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}




