import { useRouter } from "next/navigation";

export default function DashboardControls({ range, setRange }: any) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="inline-flex rounded-full bg-white border shadow-sm overflow-hidden">
        {(["24h", "7d", "1mo"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 text-sm font-semibold ${range === r ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "text-gray-700"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-white border px-3 py-2 rounded-lg text-sm active:bg-blue-200" onClick={() => router.push("/contact")}>Export CSV</button>
        
      </div>
    </div>
  );
}
