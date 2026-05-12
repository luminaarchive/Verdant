import Link from "next/link";

export default function LandingPage() {
  const logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCSOEp6mfy7WR2FL9G5ZEWOGNB1qgpcF7_lSfK1UFAXIsC89pyWLK-P-Igko8EX6wv4xkuaDTQGTbNDUGHvw5Z5tpggzho_grJ-fAbPbNwYS2eQ3Nmj_tV8-WVK1XGHJbzqlCeN263l77sEEaN95Df46WWogNh0c7UPHqc-YgRHVpsB_ebhVqu9KhDGqieE0trr1Q96WxCoX5_2q_aOBz8JKJLK52BtBQJ9RK9c7XlKhHXMd46vxVmeaDnSDBT1FmDGVIALg4AJ4RY";

  return (
    <>
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-surface-container-low border-r border-outline-variant/20 flex flex-col h-full z-40 hidden lg:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Added scale-[1.2] to crop out the white edges from the logo */}
            <img
              alt="NaLI Logo"
              className="w-full h-full object-cover scale-[1.2] mix-blend-lighten"
              src={logoUrl}
            />
          </div>
          <Link className="font-headline-lg text-2xl tracking-tighter text-primary" href="#">
            NaLI
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link className="flex items-center gap-3 px-4 py-3 bg-primary text-surface font-body-md rounded-lg" href="#">
            <span className="material-symbols-outlined text-[20px]">search</span>
            New Query
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary rounded-lg transition-colors font-body-md" href="#">
            <span className="material-symbols-outlined text-[20px]">explore</span>
            Discover
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary rounded-lg transition-colors font-body-md" href="#">
            <span className="material-symbols-outlined text-[20px]">library_books</span>
            Library
          </Link>
          <div className="pt-8 pb-2 px-4">
            <span className="font-label-caps text-[10px] text-on-surface-variant/50 uppercase tracking-[0.2em]">
              Recent Observations
            </span>
          </div>
          <div className="space-y-1">
            <Link className="flex items-center gap-3 px-4 py-2 text-on-surface-variant/80 hover:bg-surface-variant/30 hover:text-primary rounded-lg transition-colors font-body-md text-sm truncate" href="#">
              <span className="material-symbols-outlined text-[16px] opacity-40">history</span>
              Mycelial network communication patterns
            </Link>
            <Link className="flex items-center gap-3 px-4 py-2 text-on-surface-variant/80 hover:bg-surface-variant/30 hover:text-primary rounded-lg transition-colors font-body-md text-sm truncate" href="#">
              <span className="material-symbols-outlined text-[16px] opacity-40">history</span>
              Connections between moonlight and tides
            </Link>
            <Link className="flex items-center gap-3 px-4 py-2 text-on-surface-variant/80 hover:bg-surface-variant/30 hover:text-primary rounded-lg transition-colors font-body-md text-sm truncate" href="#">
              <span className="material-symbols-outlined text-[16px] opacity-40">history</span>
              Why do forests feel alive after rain?
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-outline-variant/10 mt-auto">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary rounded-lg transition-colors font-body-md">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-surface">
        {/* TopNavBar (Mobile) */}
        <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface-dim border-b border-outline-variant/10 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
              <img
                alt="NaLI Logo"
                className="w-full h-full object-cover scale-[1.2] mix-blend-lighten"
                src={logoUrl}
              />
            </div>
            <Link className="font-headline-lg text-headline-lg-mobile tracking-tighter text-primary" href="#">
              NaLI
            </Link>
          </div>
          <button className="text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </nav>
        
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-24 relative">
          {/* Search / Query Interface */}
          <section className="w-full mb-16">
            <h1 className="font-display-xl text-5xl md:text-6xl text-on-surface text-center mb-10 leading-tight">
              Consult the earth's quiet intelligence.
            </h1>
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="relative flex flex-col bg-surface-container border border-outline-variant/30 rounded-2xl p-4 shadow-xl transition-all duration-500 focus-within:border-outline/50">
                <div className="flex items-center mb-3">
                  <span className="material-symbols-outlined text-primary/70 ml-2 mr-3">psychology</span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 text-body-lg font-body-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                    placeholder="Ask about cycles, connections, or patterns..."
                    type="text"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3 mt-1">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-variant/30 hover:bg-surface-variant/60 text-on-surface-variant text-sm transition-colors font-body-md">
                      <span className="material-symbols-outlined text-[18px]">filter_list</span>
                      Focus
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-variant/30 hover:bg-surface-variant/60 text-on-surface-variant text-sm transition-colors font-body-md">
                      <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                      Nature Archive
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input className="sr-only" type="checkbox" defaultChecked />
                        <div className="block bg-surface-variant w-8 h-5 rounded-full border border-outline-variant/20"></div>
                        <div className="dot absolute left-1 top-1 bg-primary w-3 h-3 rounded-full transition transform translate-x-full"></div>
                      </div>
                      <span className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                        Pro Search
                      </span>
                    </label>
                    <button className="p-2 bg-primary text-surface rounded-full hover:brightness-110 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Suggested Prompts */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 opacity-90">
              <button className="px-4 py-1.5 bg-surface-container border border-outline-variant/20 rounded-full font-label-caps text-[11px] text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">water_drop</span> Why do forests feel alive after rain?
              </button>
              <button className="px-4 py-1.5 bg-surface-container border border-outline-variant/20 rounded-full font-label-caps text-[11px] text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">nightlight</span> Connections between moonlight and tides
              </button>
              <button className="px-4 py-1.5 bg-surface-container border border-outline-variant/20 rounded-full font-label-caps text-[11px] text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors hidden md:flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">hub</span> Mycelial network communication patterns
              </button>
            </div>
          </section>
          
          {/* Discovery Threads / Answer Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 opacity-40">
            <div className="lg:col-span-8 space-y-8">
              <div className="h-6 w-1/3 bg-surface-variant/40 rounded animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-surface-variant/20 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-surface-variant/20 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-surface-variant/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-32 w-full bg-surface-variant/20 rounded-lg animate-pulse"></div>
              <div className="h-32 w-full bg-surface-variant/20 rounded-lg animate-pulse"></div>
            </div>
          </section>
        </main>
        
        {/* Footer inside main scroll area */}
        <footer className="w-full px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-outline-variant/10 text-sm mt-auto bg-surface-dim">
          <p className="font-body-md text-on-surface-variant/50">© 2024 NaLI Intelligence.</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link className="text-on-surface-variant/50 hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="text-on-surface-variant/50 hover:text-primary transition-colors" href="#">Terms</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
