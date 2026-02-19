import { Globe, Clock, CheckCircle, XCircle, ChevronRight, Search, Filter, X, Layers, Calendar, TrendingUp } from "lucide-react";
import type { AnalysisResult } from "../hooks/useWebsiteAnalysis";
import { formatTime } from "../utils/helpers";
import { useState, useMemo } from "react";

interface ResultsPanelProps {
  results: AnalysisResult[];
  currentResultId?: number;
  onSelectResult: (result: AnalysisResult) => void;
  onClearAll: () => void;
}

export default function ResultsPanel({
  results,
  currentResultId,
  onSelectResult,
  onClearAll
}: ResultsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "error">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.websiteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.websiteType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime();
      } else {
        return (a.websiteName || a.url).localeCompare(b.websiteName || b.url);
      }
    });

    return filtered;
  }, [results, searchTerm, filterStatus, sortBy]);

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Analysis History</h2>
              <p className="text-sm text-blue-100">{results.length} total analyses</p>
            </div>
          </div>
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{results.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Success</p>
                <p className="text-xl font-bold text-green-600">{successCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Failed</p>
                <p className="text-xl font-bold text-red-600">{errorCount}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {results.length > 0 && (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, URL, or type..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filters */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterStatus === "all"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("success")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  filterStatus === "success"
                    ? "bg-green-600 shadow text-white"
                    : "text-green-600 hover:bg-green-50"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                Success
              </button>
              <button
                onClick={() => setFilterStatus("error")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  filterStatus === "error"
                    ? "bg-red-600 shadow text-white"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <XCircle className="w-3 h-3" />
                Error
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setSortBy("recent")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  sortBy === "recent"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calendar className="w-3 h-3" />
                Recent
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  sortBy === "name"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Filter className="w-3 h-3" />
                Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 px-4">
            {results.length === 0 ? (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Start by analyzing a website to see your results here
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredResults.map((result) => (
              <ResultItem
                key={result.id}
                result={result}
                isSelected={currentResultId === result.id}
                onClick={() => result.status === "success" && onSelectResult(result)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with summary */}
      {filteredResults.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Showing {filteredResults.length} of {results.length} results</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {successCount} successful
              </span>
              <span>•</span>
              <span>{errorCount} failed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultItem({ 
  result, 
  isSelected, 
  onClick 
}: { 
  result: AnalysisResult; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  // Get favicon URL
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${result.url}&sz=64`;

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 cursor-pointer transition-all hover:pl-6 ${
        isSelected
          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600"
          : "hover:bg-gray-50 border-l-4 border-transparent"
      } ${result.status === "error" ? "opacity-75" : ""}`}
    >
      {/* Status indicator line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        result.status === "success" 
          ? isSelected ? "bg-blue-600" : "bg-green-500" 
          : "bg-red-500"
      }`} />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
          result.status === "success" 
            ? "bg-gradient-to-br from-blue-100 to-indigo-100" 
            : "bg-red-100"
        }`}>
          {result.status === "success" ? (
            <img 
              src={faviconUrl} 
              alt="" 
              className="w-5 h-5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
              }}
            />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-medium truncate ${
                isSelected ? "text-blue-900" : "text-gray-900"
              }`}>
                {result.websiteName || result.url}
              </h3>
              {result.websiteName && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {result.url}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(result.analyzedAt)}
              </span>
              {result.status === "success" && (
                <ChevronRight className={`w-4 h-4 transition-all ${
                  isSelected ? "text-blue-600 translate-x-1" : "text-gray-400 group-hover:translate-x-1"
                }`} />
              )}
            </div>
          </div>

          {/* Tags/Status */}
          <div className="flex items-center gap-2 mt-2">
            {result.status === "success" ? (
              <>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Success
                </span>
                {result.websiteType && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {result.websiteType}
                  </span>
                )}
                {result.categories && result.categories.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {result.categories.length} cats
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1 max-w-full">
                <XCircle className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{result.error || "Analysis failed"}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}