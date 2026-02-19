import { useState, useEffect, useRef } from "react";
import { 
  Check, X, Loader2, Monitor, Zap, AlertCircle, 
  Globe, Link2, Upload, FileText, History, 
  Sparkles, ArrowRight, Copy, CheckCircle2,
  Shield, Clock, BarChart
} from "lucide-react";
import MessageDisplay from "./ui/MessageDisplay";

interface InputSectionProps {
  mode: "single" | "bulk";
  url: string;
  bulkUrls: string;
  loading: boolean;
  message: { text: string; type: "success" | "error" | "info" } | null;
  onModeChange: (mode: "single" | "bulk") => void;
  onUrlChange: (url: string) => void;
  onBulkUrlsChange: (urls: string) => void;
  onAnalyzeSingle: () => void;
  onAnalyzeBulk: () => void;
}

export default function InputSection({
  mode,
  url,
  bulkUrls,
  loading,
  message,
  onModeChange,
  onUrlChange,
  onBulkUrlsChange,
  onAnalyzeSingle,
  onAnalyzeBulk
}: InputSectionProps) {
  const [urlError, setUrlError] = useState<string | null>(null);
  const [bulkUrlCount, setBulkUrlCount] = useState(0);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Validate URL
  const validateUrl = (url: string) => {
    if (!url) return null;
    try {
      new URL(url);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  };

  // Handle URL change with validation
  const handleUrlChange = (value: string) => {
    onUrlChange(value);
    setUrlError(validateUrl(value));
  };

  // Count URLs in bulk input
  useEffect(() => {
    if (bulkUrls) {
      const urls = bulkUrls.split('\n').filter(u => u.trim());
      setBulkUrlCount(urls.length);
    } else {
      setBulkUrlCount(0);
    }
  }, [bulkUrls]);

  // Load recent URLs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentUrls');
    if (saved) {
      setRecentUrls(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save to recent URLs after successful analysis
  const saveToRecent = (analyzedUrl: string) => {
    const updated = [analyzedUrl, ...recentUrls.filter(u => u !== analyzedUrl)].slice(0, 5);
    setRecentUrls(updated);
    localStorage.setItem('recentUrls', JSON.stringify(updated));
  };

  // Click outside handler for history dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle analyze with save to history
  const handleAnalyzeSingle = () => {
    if (url && !urlError) {
      onAnalyzeSingle();
      saveToRecent(url);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && mode === "single" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyzeSingle();
    }
  };

  // Stats for bulk mode
  const validUrlsCount = bulkUrls
    .split('\n')
    .filter(u => {
      try {
        return u.trim() && new URL(u.trim());
      } catch {
        return false;
      }
    }).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${
        mode === "single" 
          ? "from-blue-600 to-indigo-600" 
          : "from-purple-600 to-pink-600"
      } px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              {mode === "single" ? (
                <Globe className="w-5 h-5 text-white" />
              ) : (
                <Zap className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === "single" ? "Website Analysis" : "Bulk Analysis"}
              </h2>
              <p className="text-sm text-white/80">
                {mode === "single" 
                  ? "Analyze a single website in detail" 
                  : "Analyze multiple websites at once"}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          {mode === "bulk" && bulkUrlCount > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-white font-medium">{bulkUrlCount} URLs</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => onModeChange("single")}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              mode === "single"
                ? "bg-white shadow-lg text-blue-600 scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Monitor className="w-4 h-4" />
              Single
            </div>
          </button>
          <button
            onClick={() => onModeChange("bulk")}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              mode === "bulk"
                ? "bg-white shadow-lg text-purple-600 scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Bulk
            </div>
          </button>
        </div>

        {/* Input Fields */}
        {mode === "single" ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-gray-500" />
                  Website URL
                </label>
                
                {/* Recent URLs dropdown */}
                {recentUrls.length > 0 && (
                  <div className="relative" ref={historyRef}>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      Recent
                    </button>
                    
                    {showHistory && (
                      <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                        {recentUrls.map((recentUrl, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              onUrlChange(recentUrl);
                              setShowHistory(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <History className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{recentUrl}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com"
                  className={`w-full pl-11 pr-4 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 transition-all ${
                    urlError
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                />
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                {/* Paste button */}
                <button
                  onClick={async () => {
                    const text = await navigator.clipboard.readText();
                    handleUrlChange(text);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Paste from clipboard"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* URL validation message */}
              {urlError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {urlError}
                </p>
              )}

              {/* URL suggestions */}
              {!url && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <p className="text-xs text-gray-500 w-full mb-1">Try examples:</p>
                  {["https://github.com", "https://stackoverflow.com", "https://medium.com"].map((example) => (
                    <button
                      key={example}
                      onClick={() => handleUrlChange(example)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 rounded-lg transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyzeSingle}
              disabled={loading || !url || !!urlError}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Monitor className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Analyze Website
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  URLs (one per line)
                </label>
                
                {/* URL counter */}
                {bulkUrlCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      validUrlsCount === bulkUrlCount
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {validUrlsCount}/{bulkUrlCount} valid
                    </span>
                  </div>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={bulkUrls}
                  onChange={(e) => onBulkUrlsChange(e.target.value)}
                  placeholder="https://example.com&#10;https://another-site.com&#10;https://third-site.com"
                  rows={6}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all font-mono text-sm"
                />
              </div>

              {/* Quick actions for bulk mode */}
              {bulkUrls && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(bulkUrls)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                  
                  <span className="text-gray-300">|</span>
                  
                  <button
                    onClick={() => onBulkUrlsChange("")}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>

                  {/* Example bulk URLs */}
                  {!bulkUrls && (
                    <button
                      onClick={() => onBulkUrlsChange(
                        "https://github.com\nhttps://stackoverflow.com\nhttps://medium.com"
                      )}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Load examples
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onAnalyzeBulk}
              disabled={loading || !bulkUrls.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing {bulkUrlCount} URLs...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Analyze All URLs
                  {bulkUrlCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                      {bulkUrlCount}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="mt-4">
            <MessageDisplay message={message} />
          </div>
        )}

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Fast analysis</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BarChart className="w-3 h-3" />
            <span>Detailed results</span>
          </div>
        </div>
      </div>
    </div>
  );
}