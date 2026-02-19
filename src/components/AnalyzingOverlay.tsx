import { Loader2 } from "lucide-react";

interface AnalyzingOverlayProps {
  mode: "single" | "bulk";
  results: any[];
  bulkUrls: string;
}

export default function AnalyzingOverlay({ mode, results, bulkUrls }: AnalyzingOverlayProps) {
  const urlCount = bulkUrls.split('\n').filter(u => u.trim()).length;
  const successfulCount = results.filter(r => r.status === "success").length;
  const progress = mode === "single" ? 60 : urlCount > 0 ? ((successfulCount + 1) / urlCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Website</h3>
          <p className="text-gray-600">
            {mode === "single"
              ? "Extracting intelligence from the website..."
              : `Processing ${successfulCount + 1} of ${urlCount} websites...`
            }
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}