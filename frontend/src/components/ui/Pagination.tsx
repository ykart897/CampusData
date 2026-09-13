type Props = {
  meta: { total: number; page: number; limit: number; totalPages: number };
  page: number;
  onChange: (page: number) => void;
};

export function Pagination({ meta, page, onChange }: Props) {
  if (meta.totalPages <= 1) return null;

  const start = (page - 1) * meta.limit + 1;
  const end = Math.min(page * meta.limit, meta.total);
  const pages: (number | "...")[] = [];

  for (let index = 1; index <= meta.totalPages; index += 1) {
    if (index === 1 || index === meta.totalPages || Math.abs(index - page) <= 2) {
      pages.push(index);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="mt-5 flex flex-col items-stretch justify-between gap-3 text-sm sm:flex-row sm:items-center">
      <span className="font-semibold text-slate-500">
        {start.toLocaleString("tr-TR")}-{end.toLocaleString("tr-TR")} / {meta.total.toLocaleString("tr-TR")} sonuç
      </span>

      <div className="flex max-w-full items-center justify-start gap-1 overflow-x-auto sm:justify-center">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="secondary-button px-3 py-2"
          aria-label="Önceki sayfa"
        >
          Önceki
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 font-bold text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={`rounded-lg border px-3 py-2 text-sm font-black transition ${
                item === page
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          disabled={page === meta.totalPages}
          onClick={() => onChange(page + 1)}
          className="secondary-button px-3 py-2"
          aria-label="Sonraki sayfa"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}


