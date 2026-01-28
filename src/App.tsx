import { useState } from "react";
import axios from "axios";
import {
  Loader2,
  Globe,
  Palette,
  Type,
  Tag,
  Monitor,
  Download,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type AnalyzeResponse = {
  status: "success" | "partial_success" | "error";
  message: string;
  category: string;
  colors: string[]; // HEX colors
  fonts: string[];
  fontTypes: string[];
  tags: string[];
  desktop?: string;
  mobile?: string;
  warnings?: string[];
};

const API_BASE = "http://localhost:5000";

/* ---------------- HELPERS ---------------- */

const downloadColors = (colors: string[]) => {
  const blob = new Blob([JSON.stringify(colors, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "colors.json";
  a.click();
};

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

/* ---------------- APP ---------------- */

export default function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    if (!url.startsWith("http")) {
      setError("Please enter a valid URL starting with https://");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setData(null);

      const res = await axios.post<AnalyzeResponse>(
        `${API_BASE}/analyze`,
        { url },
        { timeout: 180000 }
      );

      setData(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "The website could not be analyzed. It may restrict automation."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file?: string) => {
    if (!file) return;
    const res = await fetch(`${API_BASE}/${file}`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file;
    a.click();
  };

  const getStatusIcon = (status: AnalyzeResponse["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "partial_success":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    }
  };

  const getStatusColor = (status: AnalyzeResponse["status"]) => {
    switch (status) {
      case "success":
        return "bg-emerald-900/30 border-emerald-800 text-emerald-300";
      case "partial_success":
        return "bg-amber-900/30 border-amber-800 text-amber-300";
      case "error":
        return "bg-rose-900/30 border-rose-800 text-rose-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Website Analyzer
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Visual, branding, and structural insights in one scan
        </p>
      </header>

      {/* Input */}
      <main className="max-w-6xl mx-auto">
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 mb-10">
          <div className="flex gap-4 flex-col md:flex-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-600
                         focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={analyze}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                         hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing…
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-900/30 border border-rose-800 rounded-lg text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Status */}
        {data && (
          <div
            className={`mb-8 p-5 rounded-2xl border ${getStatusColor(
              data.status
            )}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(data.status)}
              <div>
                <h3 className="font-semibold capitalize">
                  {data.status.replace("_", " ")}
                </h3>
                <p className="text-sm mt-1">{data.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {data?.warnings?.length ? (
          <div className="mb-8 p-5 bg-amber-900/20 border border-amber-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-amber-300">Warnings</h3>
            </div>
            <ul className="space-y-2 text-sm text-amber-200/80">
              {data.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Results */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold">Website Category</h3>
                </div>
                <span className="inline-block px-5 py-2.5 bg-blue-500/20 text-blue-200 rounded-xl font-semibold border border-blue-500/30">
                  {data.category}
                </span>
              </div>

              {/* Colors */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold">Brand Colors</h3>
                  </div>
                  {data.colors.length > 0 && (
                    <button
                      onClick={() => downloadColors(data.colors)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download JSON
                    </button>
                  )}
                </div>

                {data.colors.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No dominant colors detected.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {data.colors.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => copyToClipboard(c)}
                        className="cursor-pointer group"
                      >
                        <div
                          className="h-20 rounded-xl border border-gray-700"
                          style={{ backgroundColor: c }}
                        />
                        <p className="mt-1 text-xs font-mono text-center opacity-70 group-hover:opacity-100">
                          {c}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Screenshots */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold">Screenshots</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {data.desktop && (
                    <div>
                      <img
                        src={`${API_BASE}/${data.desktop}`}
                        className="rounded-xl border border-gray-700 mb-3"
                      />
                      <button
                        onClick={() => downloadFile(data.desktop)}
                        className="w-full py-2 bg-gray-700/50 rounded-lg"
                      >
                        Download Desktop
                      </button>
                    </div>
                  )}

                  {data.mobile && (
                    <div>
                      <img
                        src={`${API_BASE}/${data.mobile}`}
                        className="rounded-xl border border-gray-700 mb-3 mx-auto w-48"
                      />
                      <button
                        onClick={() => downloadFile(data.mobile)}
                        className="w-full py-2 bg-gray-700/50 rounded-lg"
                      >
                        Download Mobile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Fonts */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <Type className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold">Typography</h3>
                </div>

                {data.fonts.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No fonts detected reliably.
                  </p>
                ) : (
                  data.fonts.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 mb-2 bg-gray-900/50 rounded-lg border border-gray-700/50"
                      style={{ fontFamily: f }}
                    >
                      {f}
                    </div>
                  ))
                )}
              </div>

              {/* Tags */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <Tag className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold">Website Tags</h3>
                </div>

                {data.tags.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No meaningful tags extracted.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Loader2 className="w-14 h-14 text-blue-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
