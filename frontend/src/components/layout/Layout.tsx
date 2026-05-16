import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/filter.store";

const navLinks = [
  { to: "/universite", label: "ÜNİVERSİTE SEÇ" },
  { to: "/programlar", label: "LİSANS PROGRAMI SEÇ" },
  { to: "/tercih", label: "TERCİH SİHİRBAZI" },
  { to: "/netler", label: "NET SİHİRBAZI" },
  { to: "/listem", label: "LİSTEM" },
];

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-300 bg-white">
        <div className="bg-[#0f3d64] text-white">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-2 text-xs font-bold sm:px-6">
            <span>YÜKSEKÖĞRETİM PROGRAM ATLASI</span>
            <span className="hidden text-sky-100 sm:inline">Canlı YÖK Atlas kılavuz verileri</span>
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
            <NavLink to="/" className="flex shrink-0 items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded bg-[#1f5d99] text-lg font-black text-white">
                YA
              </span>
              <span>
                <span className="block text-xl font-bold text-slate-950">YÖK Atlası</span>
                <span className="block text-xs font-semibold uppercase text-slate-500">Üniversite ve program tercih rehberi</span>
              </span>
            </NavLink>

            <nav className="order-last flex w-full min-w-0 items-center gap-1 overflow-x-auto border-t border-slate-200 pt-3 lg:order-none lg:w-auto lg:flex-1 lg:border-t-0 lg:pt-0">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded px-3 py-2 text-xs font-bold transition ${
                      isActive
                        ? "bg-[#1f5d99] text-white shadow-sm"
                        : "text-slate-700 hover:bg-sky-50 hover:text-[#1f5d99]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-3">
              {user ? (
                <>
                  <span className="max-w-52 truncate text-sm font-semibold text-slate-600">
                    {user.name ?? user.email}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="secondary-button px-3 py-2"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/giris" className="secondary-button px-3 py-2">
                    Giriş Yap
                  </NavLink>
                  <NavLink to="/kayit" className="primary-button px-3 py-2">
                    Kayıt Ol
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-slate-300 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-4 py-5 text-sm text-slate-500 sm:px-6">
          <span className="font-semibold text-slate-700">YÖK Atlası</span>
          <span>
            Veriler bilgilendirme amaçlıdır; resmi tercih kararlarında ÖSYM ve YÖK kaynakları esas alınmalıdır.
          </span>
        </div>
      </footer>
    </div>
  );
}


