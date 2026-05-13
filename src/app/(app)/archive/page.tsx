import Link from "next/link";
import { Database, Filter, Search, Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // For UI scaffolding purposes, we simulate the observations since the DB is not fully populated in this dev step.
  // In a real scenario we'd query: await supabase.from('observations').select('*, species_reference(*)').eq('user_id', user?.id)
  
  const simulatedObservations = [
    {
      id: "obs-1",
      species: { scientific_name: "Panthera tigris sumatrae", common_name_en: "Sumatran Tiger" },
      latitude: 3.12,
      longitude: 98.45,
      processing_stage: "completed",
      review_status: "unreviewed",
      is_anomaly: false,
      created_at: "2026-05-13T08:00:00Z"
    },
    {
      id: "obs-2",
      species: { scientific_name: "Pongo abelii", common_name_en: "Sumatran Orangutan" },
      latitude: 3.20,
      longitude: 98.15,
      processing_stage: "identifying",
      review_status: "unreviewed",
      is_anomaly: true,
      created_at: "2026-05-13T09:30:00Z"
    }
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md flex flex-col">
      {/* Top Navbar */}
      <header className="bg-surface-dim border-b border-outline-variant h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center relative bg-surface-dim">
              <img
                alt="NaLI Logo"
                className="w-full h-full object-cover scale-[1.3] mix-blend-screen"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSOEp6mfy7WR2FL9G5ZEWOGNB1qgpcF7_lSfK1UFAXIsC89pyWLK-P-Igko8EX6wv4xkuaDTQGTbNDUGHvw5Z5tpggzho_grJ-fAbPbNwYS2eQ3Nmj_tV8-WVK1XGHJbzqlCeN263l77sEEaN95Df46WWogNh0c7UPHqc-YgRHVpsB_ebhVqu9KhDGqieE0trr1Q96WxCoX5_2q_aOBz8JKJLK52BtBQJ9RK9c7XlKhHXMd46vxVmeaDnSDBT1FmDGVIALg4AJ4RY"
              />
           </div>
          <span className="font-headline-md text-xl tracking-tighter text-primary font-bold">NaLI</span>
          <span className="text-on-surface-variant/50 mx-2">/</span>
          <span className="font-label-caps text-[11px] uppercase tracking-widest text-on-surface-variant">Field Log Archive</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-data-sm text-on-surface-variant">
            {user?.email}
          </span>
          <Link href="/logout" className="text-xs font-label-caps text-on-surface-variant hover:text-primary transition-colors">
            LOGOUT
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display-lg text-primary mb-2">Observation Archive</h1>
            <p className="text-on-surface-variant">Review and manage your ecological field records.</p>
          </div>
          <Link href="/observe" className="bg-primary text-surface-container-lowest font-label-caps text-label-caps px-4 py-2 rounded-lg hover:bg-surface-container-low hover:text-primary hover:border hover:border-primary transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            NEW OBSERVATION
          </Link>
        </div>

        {/* Dashboard Filters */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-dim rounded-lg border border-outline-variant/50 w-full md:w-64">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search scientific name..." 
              className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="h-6 w-px bg-outline-variant mx-2 hidden md:block"></div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <FilterButton label="Conservation Status" active={false} />
            <FilterButton label="Anomaly Only" active={true} />
            <FilterButton label="Review Needed" active={false} />
            <FilterButton label="Offline Pending" active={false} />
          </div>
        </div>

        {/* Log List */}
        <div className="space-y-4">
          {simulatedObservations.map((obs) => (
            <Link href={`/observation/${obs.id}`} key={obs.id} className="block group">
              <div className="bg-surface-container border border-outline-variant rounded-xl p-4 md:p-6 hover:border-primary transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-dim border border-outline-variant flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-data-sm font-semibold text-primary uppercase">{obs.species.scientific_name}</h3>
                      {obs.is_anomaly && (
                        <span className="bg-error/10 text-error text-[10px] font-label-caps px-2 py-0.5 rounded-sm border border-error/20">
                          ANOMALY
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">{obs.species.common_name_en}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-label-caps text-on-surface-variant/70 uppercase">Processing</span>
                    <span className={`font-data-sm ${obs.processing_stage === 'completed' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {obs.processing_stage}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-label-caps text-on-surface-variant/70 uppercase">Location</span>
                    <span className="font-data-sm text-on-surface-variant">{obs.latitude.toFixed(2)}, {obs.longitude.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-label-caps text-on-surface-variant/70 uppercase">Timestamp</span>
                    <span className="font-data-sm text-on-surface-variant">{new Date(obs.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function FilterButton({ label, active }: { label: string, active: boolean }) {
  return (
    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-caps text-[11px] uppercase tracking-wider transition-colors border whitespace-nowrap ${
      active 
        ? "bg-primary/10 border-primary text-primary" 
        : "bg-surface-variant/30 border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/60"
    }`}>
      <Filter className="w-3 h-3" />
      {label}
    </button>
  );
}
