import Link from "next/link";

export default function LandingPage() {
  const logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCSOEp6mfy7WR2FL9G5ZEWOGNB1qgpcF7_lSfK1UFAXIsC89pyWLK-P-Igko8EX6wv4xkuaDTQGTbNDUGHvw5Z5tpggzho_grJ-fAbPbNwYS2eQ3Nmj_tV8-WVK1XGHJbzqlCeN263l77sEEaN95Df46WWogNh0c7UPHqc-YgRHVpsB_ebhVqu9KhDGqieE0trr1Q96WxCoX5_2q_aOBz8JKJLK52BtBQJ9RK9c7XlKhHXMd46vxVmeaDnSDBT1FmDGVIALg4AJ4RY";

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-surface-variant selection:text-primary">
      {/* TopNavBar */}
      <header className="bg-surface-dim dark:bg-surface-dim docked full-width top-0 border-b border-outline-variant dark:border-outline-variant flat no shadows sticky z-50">
        <div className="flex justify-between items-center w-full px-margin h-16 max-w-full">
          <div className="flex items-center gap-3">
            {/* Logo container with scale and mix-blend-screen to remove white edges */}
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center relative bg-surface-dim">
              <img
                alt="NaLI Logo"
                className="w-full h-full object-cover scale-[1.3] mix-blend-screen"
                src={logoUrl}
              />
            </div>
            <div className="font-headline-md text-headline-md tracking-tighter text-on-surface dark:text-on-surface font-bold">NaLI</div>
          </div>
          <nav className="hidden md:flex gap-md">
            <Link className="text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-colors duration-75 px-3 py-2 rounded-DEFAULT active:bg-primary active:text-on-primary" href="#">Intelligence</Link>
            <Link className="text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-colors duration-75 px-3 py-2 rounded-DEFAULT active:bg-primary active:text-on-primary" href="#">Methodology</Link>
            <Link className="text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-colors duration-75 px-3 py-2 rounded-DEFAULT active:bg-primary active:text-on-primary" href="#">Conservation</Link>
          </nav>
          <div className="flex items-center gap-md">
            <Link className="text-on-surface-variant font-label-caps text-label-caps hover:text-primary transition-colors" href="#">Sign In</Link>
            <button className="font-label-caps text-label-caps border border-outline-variant px-sm py-xs text-primary hover:bg-surface-container-high transition-colors flex items-center gap-xs">
              LOG_EXECUTION
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="w-full px-margin py-xl flex flex-col items-start justify-center min-h-[716px] border-b border-outline-variant">
          <div className="max-w-4xl">
            <div className="font-data-sm text-data-sm text-on-surface mb-md uppercase tracking-widest flex items-center gap-sm">
              <span className="w-2 h-2 bg-primary rounded-none inline-block"></span>
              WILDLIFE FIELD INTELLIGENCE · INDONESIA
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[72px] md:leading-[1.1] text-primary mb-md font-bold">
              Every species.<br/>Every field.<br/>Every second.
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-2xl">
              Instrument-grade precision for wildlife identification and conservation tracking. 
              Deployed in over 40 national parks across the Indonesian archipelago.
            </p>
            <div className="flex gap-sm">
              <button className="bg-primary text-surface-container-lowest px-lg py-sm font-label-caps text-label-caps border border-primary hover:bg-surface-container-low hover:text-primary transition-colors">
                INITIALIZE SCAN
              </button>
              <button className="bg-transparent text-primary px-lg py-sm font-label-caps text-label-caps border border-outline-variant hover:bg-surface-container-high transition-colors">
                VIEW PROTOCOLS
              </button>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 w-full border-b border-outline-variant">
          <div className="p-margin border-b md:border-b-0 md:border-r border-outline-variant flex flex-col justify-center">
            <div className="font-data-lg text-data-lg text-primary mb-xs">72,000+</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">SPECIES IN DATABASE</div>
          </div>
          <div className="p-margin border-b md:border-b-0 md:border-r border-outline-variant flex flex-col justify-center">
            <div className="font-data-lg text-data-lg text-primary mb-xs">17,000</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">ENDEMIC SPECIES</div>
          </div>
          <div className="p-margin flex flex-col justify-center">
            <div className="font-data-lg text-data-lg text-primary mb-xs">&lt; 30s</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">AVERAGE ID TIME</div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="py-sm px-margin border-b border-outline-variant bg-surface-container-low flex justify-center items-center overflow-x-auto">
          <div className="font-data-sm text-data-sm text-on-surface-variant whitespace-nowrap flex gap-md items-center">
            <span className="text-on-surface-variant/50">DATA SOURCES:</span>
            <span>GBIF</span>
            <span className="text-outline-variant">•</span>
            <span>IUCN RED LIST</span>
            <span className="text-outline-variant">•</span>
            <span>KLHK</span>
            <span className="text-outline-variant">•</span>
            <span>BIRDNET</span>
            <span className="text-outline-variant">•</span>
            <span>ARXIV</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full px-margin py-lg grid grid-cols-1 md:grid-cols-4 gap-gutter border-t border-outline-variant dark:border-outline-variant flat no shadows mt-auto">
        <div className="col-span-1 md:col-span-2">
          <div className="font-label-caps text-label-caps font-bold text-on-surface mb-sm">
            NaLI
          </div>
          <p className="font-data-sm text-data-sm text-on-surface-variant dark:text-on-surface-variant max-w-sm mb-lg">
            NATURE LIFE INTELLIGENCE
          </p>
          <div className="font-data-sm text-data-sm text-on-surface-variant dark:text-on-surface-variant">
            © 2026 PRECISION FIELD INTELLIGENCE. INSTRUMENT GRADE PRECISION.
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-md justify-start md:justify-end">
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-80 transition-opacity" href="#">Internal Protocols</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-80 transition-opacity" href="#">Security Matrix</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-80 transition-opacity" href="#">Contact Terminal</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-80 transition-opacity" href="#">Archive</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-80 transition-opacity" href="#">Hardware Status</Link>
        </div>
      </footer>
    </div>
  );
}
