import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../ui/PageHeader";

type ScoreType = "SAY" | "EA" | "SOZ" | "DIL";

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
    { name: "Coğrafya-1", max: 6 },
  ],
  SOZ: [
    { name: "Edebiyat", max: 24 },
    { name: "Coğrafya-1", max: 6 },
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
  const tytNet = calcNet(tytInputs, TYT_SECTIONS);
  const aytNet = calcNet(aytInputs, AYT_SECTIONS[scoreType]);
  const totalNet = tytNet + aytNet;

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Net hesabı"
        title="Net Sihirbazı"
        description="TYT ve AYT doğru-yanlış sayılarını gir; dört yanlışın bir doğruyu götürdüğü net hesabını gör."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          <div className="panel p-4">
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
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SectionPanel title="TYT" net={tytNet} sections={TYT_SECTIONS} inputs={tytInputs} onChange={setTytInputs} />
            <SectionPanel title={`AYT (${scoreType})`} net={aytNet} sections={AYT_SECTIONS[scoreType]} inputs={aytInputs} onChange={setAytInputs} />
          </div>
        </div>

        <aside className="panel h-fit overflow-hidden">
          <div className="bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase text-teal-200">Toplam net</p>
            <p className="mt-3 text-5xl font-black">{totalNet.toFixed(2)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Puan dönüşümü sınavın standart sapmasına göre değiştiği için burada tahmini puan gösterilmez.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            <ResultTile label="TYT net" value={tytNet.toFixed(2)} />
            <ResultTile label="AYT net" value={aytNet.toFixed(2)} />
            <ResultTile label="Puan türü" value={scoreType} />
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
  function handleChange(next: Record<string, string>, section: { name: string; max: number }, changed: "c" | "w") {
    const cKey = `${section.name}_c`;
    const wKey = `${section.name}_w`;
    const correct = Math.min(section.max, Math.max(0, Math.floor(Number(next[cKey]) || 0)));
    const wrong = Math.min(section.max, Math.max(0, Math.floor(Number(next[wKey]) || 0)));
    const remaining = section.max - (changed === "c" ? correct : wrong);
    if (changed === "c") {
      onChange({ ...next, [cKey]: String(correct), [wKey]: String(Math.min(wrong, remaining)) });
    } else {
      onChange({ ...next, [wKey]: String(wrong), [cKey]: String(Math.min(correct, remaining)) });
    }
  }

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
      {sections.map((section) => {
        const correct = Math.min(section.max, Math.max(0, Number(inputs[`${section.name}_c`]) || 0));
        const wrong = Math.min(section.max, Math.max(0, Number(inputs[`${section.name}_w`]) || 0));
        const maxCorrect = section.max - wrong;
        const maxWrong = section.max - correct;
        return (
          <div key={section.name} className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-slate-100 py-3 last:border-0">
            <span className="text-sm font-semibold text-slate-700">
              {section.name} <span className="text-xs text-slate-400">/{section.max}</span>
            </span>
            <input
              type="number"
              min={0}
              max={maxCorrect}
              placeholder="0"
              value={inputs[`${section.name}_c`] ?? ""}
              onChange={(event) => handleChange({ ...inputs, [`${section.name}_c`]: event.target.value }, section, "c")}
              className="input-field px-2 text-center"
            />
            <input
              type="number"
              min={0}
              max={maxWrong}
              placeholder="0"
              value={inputs[`${section.name}_w`] ?? ""}
              onChange={(event) => handleChange({ ...inputs, [`${section.name}_w`]: event.target.value }, section, "w")}
              className="input-field px-2 text-center"
            />
          </div>
        );
      })}
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




