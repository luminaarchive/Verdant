import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listFieldLogs } from "@/lib/repositories/observation.repository";
import type { FieldLogSummary } from "@/lib/repositories/observation.repository";

type DashboardSearchParams = Promise<{
  q?: string;
  status?: string;
  review?: string;
  sync?: string;
}>;

const conservationFilters = ["all", "CR", "EN", "VU", "NT", "LC", "DD"];
const reviewFilters = ["all", "unreviewed", "verified", "rejected"];
const syncFilters = ["all", "synced", "pending_sync", "failed_sync"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role, institution")
    .eq("id", session.user.id)
    .single();

  const logsResult = await listFieldLogs(session.user.id, {
    search: params.q,
    conservationStatus: params.status,
    reviewStatus: params.review,
    syncState: params.sync,
  });

  const logs = logsResult.success ? logsResult.data : [];

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-forest-950">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">
              Protected field archive
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">Observation Field Logs</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-forest-700">
              Structured wildlife records for identification, review, sync tracking, and
              conservation handoff.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-forest-900 px-4 text-sm font-semibold text-stone-50"
              href="/observe"
            >
              <Plus className="h-4 w-4" />
              New Observation
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="mb-4 rounded-sm border border-stone-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-forest-950">
                {profile?.full_name || session.user.email}
              </p>
              <p className="text-sm capitalize text-forest-700">
                {profile?.role || "field user"}
                {profile?.institution ? ` - ${profile.institution}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <ArchiveState icon={<ClipboardList className="h-4 w-4" />} label={`${logs.length} logs`} />
              <ArchiveState
                icon={<AlertTriangle className="h-4 w-4" />}
                label={`${logs.filter((log) => log.anomalyFlag).length} anomaly flags`}
              />
              <ArchiveState
                icon={<WifiOff className="h-4 w-4" />}
                label={`${logs.filter((log) => log.syncState !== "synced").length} pending sync`}
              />
            </div>
          </div>
        </section>

        <form className="mb-5 rounded-sm border border-stone-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-forest-800">
            <Filter className="h-4 w-4" />
            Search and filter field logs
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500" />
              <input
                className="field-input pl-10"
                defaultValue={params.q || ""}
                name="q"
                placeholder="Search scientific name, local name, or notes"
                type="search"
              />
            </label>
            <SelectFilter defaultValue={params.status || "all"} name="status" values={conservationFilters} />
            <SelectFilter defaultValue={params.review || "all"} name="review" values={reviewFilters} />
            <SelectFilter defaultValue={params.sync || "all"} name="sync" values={syncFilters} />
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-forest-900 px-4 text-sm font-semibold text-stone-50"
              type="submit"
            >
              Apply
            </button>
          </div>
        </form>

        {logsResult.success ? null : (
          <div className="mb-4 rounded-sm border border-rare-red/40 bg-rare-red/10 p-3 text-sm text-forest-800">
            Could not load field logs: {logsResult.error.message}
          </div>
        )}

        {logs.length === 0 ? (
          <section className="rounded-sm border border-dashed border-stone-300 bg-white p-8 text-center">
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-olive-700" />
            <h2 className="text-xl font-semibold text-forest-950">No matching field logs</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-forest-700">
              Capture an observation or loosen filters to review archived records.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-forest-900 px-4 text-sm font-semibold text-stone-50"
              href="/observe"
            >
              Start Observation
            </Link>
          </section>
        ) : (
          <div className="grid gap-3">
            {logs.map((log) => (
              <FieldLogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLogRow({ log }: { log: FieldLogSummary }) {
  return (
    <Link
      className="block rounded-sm border border-stone-200 bg-white p-4 transition hover:border-olive-300"
      href={`/observation/${log.id}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold italic text-forest-950">{log.scientificName}</h2>
            <StatusBadge status={log.conservationStatus} />
            {log.anomalyFlag ? (
              <span className="inline-flex items-center gap-1 rounded-sm bg-conservation-orange/10 px-2 py-1 text-xs font-semibold text-forest-900">
                <AlertTriangle className="h-3.5 w-3.5" />
                anomaly
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-forest-700">{log.localName}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-forest-700">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(log.timestamp).toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-56">
          <StatePill label="sync" value={log.syncState.replace("_", " ")} />
          <StatePill label="review" value={log.reviewStatus} />
          <StatePill label="status" value={log.status.replace("_", " ")} />
          <StatePill
            label="confidence"
            value={log.confidenceLevel === null ? "pending" : `${Math.round(log.confidenceLevel * 100)}%`}
          />
        </div>
      </div>
    </Link>
  );
}

function SelectFilter({
  defaultValue,
  name,
  values,
}: {
  defaultValue: string;
  name: string;
  values: string[];
}) {
  return (
    <select className="field-input capitalize" defaultValue={defaultValue} name={name}>
      {values.map((value) => (
        <option key={value} value={value}>
          {value.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}

function ArchiveState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm bg-stone-100 px-3 py-2 font-medium text-forest-800">
      {icon}
      {label}
    </span>
  );
}

function StatePill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-sm border border-stone-200 bg-stone-50 px-2 py-1">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-forest-600">
        {label}
      </span>
      <span className="capitalize text-forest-900">{value}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "CR"
      ? "bg-rare-red text-white"
      : status === "EN"
        ? "bg-conservation-orange text-forest-950"
        : status === "VU"
          ? "bg-warning-amber text-forest-950"
          : "bg-olive-600 text-white";

  return <span className={`rounded-sm px-2 py-1 text-xs font-bold ${className}`}>{status}</span>;
}
