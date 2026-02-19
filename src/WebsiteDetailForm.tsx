import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Check, X, Loader2, Upload, Globe, Smartphone, Monitor, Zap, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function WebsiteAnalyzer() {
  // State Management
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [screenshotView, setScreenshotView] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"overview" | "design" | "content" | "screenshots">("overview");
  
  // File upload refs
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  // Show message helper
  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };


  console.log('currentResult', currentResult)
  console.log('results', results)

  // Clear form
  const clearForm = () => {
    setUrl("");
    setBulkUrls("");
    setResults([]);
    setCurrentResult(null);
    setMessage(null);
  };

  // Validate URL
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // Analyze single URL
  const analyzeSingle = async () => {
    if (!url.trim()) {
      showMessage("Please enter a URL", "error");
      return;
    }

    if (!isValidUrl(url)) {
      showMessage("Please enter a valid URL (include http:// or https://)", "error");
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE}/analyze`, { url });
      const data = response.data;
      
      // Add to results
      const newResult = {
        ...data,
        id: Date.now(),
        analyzedAt: new Date().toISOString(),
        status: "success"
      };
      
      setResults([newResult, ...results]);
      setCurrentResult(newResult);
      showMessage("✅ Website analyzed successfully!", "success");
    } catch (error: any) {
      const errorResult = {
        id: Date.now(),
        url,
        status: "error",
        error: error.response?.data?.message || "Analysis failed",
        analyzedAt: new Date().toISOString()
      };
      
      setResults([errorResult, ...results]);
      showMessage("❌ Analysis failed. Please try again.", "error");
    } finally {
      setLoading(false);
      setTimeout(() => setAnalyzing(false), 1000);
    }
  };

  // Analyze bulk URLs
  const analyzeBulk = async () => {
    const urlList = bulkUrls
      .split("\n")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urlList.length === 0) {
      showMessage("Please enter at least one URL", "error");
      return;
    }

    const invalidUrls = urlList.filter(u => !isValidUrl(u));
    if (invalidUrls.length > 0) {
      showMessage(`Invalid URLs detected: ${invalidUrls.join(", ")}`, "error");
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE}/analyze/bulk`, { urls: urlList });
      const data = response.data;
      
      const newResults = data.results.map((result: any, index: number) => {
        if (result.success) {
          return {
            ...result.data,
            id: Date.now() + index,
            analyzedAt: new Date().toISOString(),
            status: "success"
          };
        } else {
          return {
            id: Date.now() + index,
            url: urlList[index],
            status: "error",
            error: result.error,
            analyzedAt: new Date().toISOString()
          };
        }
      });
      
      setResults([...newResults, ...results]);
      if (newResults.length > 0 && newResults[0].status === "success") {
        setCurrentResult(newResults[0]);
      }
      showMessage(`✅ Analyzed ${data.success} of ${data.total} websites successfully`, "success");
    } catch (error: any) {
      showMessage("❌ Bulk analysis failed. Please try again.", "error");
    } finally {
      setLoading(false);
      setTimeout(() => setAnalyzing(false), 1000);
    }
  };

  // Handle manual screenshot upload
  const handleScreenshotUpload = async (file: File, type: "desktop" | "mobile") => {
    if (!currentResult) return;

    const formData = new FormData();
    formData.append("screenshot", file);
    formData.append("type", type);
    formData.append("websiteId", currentResult.id);

    try {
      const response = await axios.post(`${API_BASE}/upload-screenshot`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setCurrentResult({
        ...currentResult,
        [`${type}Screenshot`]: response.data.url
      });

      showMessage(`✅ ${type} screenshot uploaded successfully!`, "success");
    } catch (error) {
      showMessage(`❌ Failed to upload ${type} screenshot`, "error");
    }
  };

  // Handle website submission
  const submitWebsite = async () => {
    if (!currentResult) {
      showMessage("No website data to submit", "error");
      return;
    }

    if (!currentResult.websiteName || !currentResult.websiteType) {
      showMessage("Website name and type are required", "error");
      return;
    }

    try {
      await axios.post(`${API_BASE}/submit`, {
        ...currentResult,
        submittedAt: new Date().toISOString()
      });

      showMessage("✅ Website submitted successfully!", "success");
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCurrentResult(null);
        setUrl("");
      }, 2000);
    } catch (error) {
      showMessage("❌ Submission failed. Please try again.", "error");
    }
  };

  // Load example data
  const loadExample = () => {
    const exampleData = {
      id: Date.now(),
      url: "https://example.com",
      websiteName: "Example Technology Corp",
      websiteType: "Technology",
      categories: ["Technology", "SaaS", "Business Solutions"],
      tags: ["modern", "responsive", "api", "cloud", "developer-friendly"],
      relatedPhrases: [
        "websites similar to technology platforms",
        "saas company websites",
        "business technology solutions"
      ],
      colors: ["#2563EB", "#059669", "#DC2626", "#7C3AED", "#F59E0B"],
      fonts: ["Inter", "Roboto", "sans-serif", "system-ui"],
      desktopScreenshot: `${API_BASE}/desktop-example.webp`,
      mobileScreenshot: `${API_BASE}/mobile-example.webp`,
      analyzedAt: new Date().toISOString(),
      status: "success"
    };
    
    setCurrentResult(exampleData);
    setResults([exampleData, ...results]);
    showMessage("Example data loaded successfully", "info");
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Website Intelligence Analyzer
                </h1>
                <p className="text-gray-600 mt-1">
                  Advanced website analysis with AI-powered insights
                </p>
              </div>
            </div>
            <button
              onClick={loadExample}
              className="px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black shadow-md transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Load Example
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-inner max-w-md">
            <button
              onClick={() => setMode("single")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === "single"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Single Analysis
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === "bulk"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulk Analysis
            </button>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input & Results */}
          <div className="lg:col-span-1 space-y-8">
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {mode === "single" ? "Analyze Website" : "Bulk Analysis"}
              </h2>

              {mode === "single" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all"
                      onKeyPress={(e) => e.key === "Enter" && analyzeSingle()}
                    />
                  </div>
                  <button
                    onClick={analyzeSingle}
                    disabled={loading}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Monitor className="w-5 h-5" />
                        Analyze Website
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URLs (one per line)
                    </label>
                    <textarea
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      placeholder="https://example.com&#10;https://another-site.com"
                      rows={6}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-3 focus:ring-purple-200 transition-all font-mono text-sm"
                    />
                  </div>
                  <button
                    onClick={analyzeBulk}
                    disabled={loading}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing {results.filter(r => r.status === "success").length} websites...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Analyze All URLs
                      </>
                    )}
                  </button>
                </div>
              )}

              {message && (
                <div className={`mt-4 p-4 rounded-xl border-l-4 ${
                  message.type === "success" ? "bg-green-50 border-green-500 text-green-700" :
                  message.type === "error" ? "bg-red-50 border-red-500 text-red-700" :
                  "bg-blue-50 border-blue-500 text-blue-700"
                }`}>
                  <div className="flex items-center gap-2">
                    {message.type === "success" && <Check className="w-5 h-5" />}
                    {message.type === "error" && <X className="w-5 h-5" />}
                    {message.type === "info" && <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Analysis Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Analysis</h2>
                <button
                  onClick={clearForm}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No analysis results yet</p>
                    <p className="text-sm mt-1">Start by analyzing a website</p>
                  </div>
                ) : (
                  results.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => result.status === "success" && setCurrentResult(result)}
                      className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                        currentResult?.id === result.id
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.status === "success" ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          ) : (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                          <span className="font-medium text-gray-900 truncate">
                            {result.websiteName || result.url}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(result.analyzedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {result.status === "success" ? (
                          <span className="text-sm text-gray-600">
                            {result.websiteType} • {result.categories?.length || 0} categories
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">{result.error}</span>
                        )}
                        {result.status === "success" && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {result.categories?.[0] || "General"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {currentResult ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentResult.websiteName}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {currentResult.websiteType}
                        </span>
                        <span className="text-sm text-gray-600">
                          Analyzed at {formatTime(currentResult.analyzedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={submitWebsite}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-md transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Submit to Database
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`px-6 py-4 font-medium text-sm transition-all ${
                        activeTab === "overview"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Overview
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("design")}
                      className={`px-6 py-4 font-medium text-sm transition-all ${
                        activeTab === "design"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                        Design
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("content")}
                      className={`px-6 py-4 font-medium text-sm transition-all ${
                        activeTab === "content"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        📄 Content
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("screenshots")}
                      className={`px-6 py-4 font-medium text-sm transition-all ${
                        activeTab === "screenshots"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        📸 Screenshots
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Website Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-600">Website Name</label>
                              <input
                                type="text"
                                value={currentResult.websiteName}
                                onChange={(e) => setCurrentResult({
                                  ...currentResult,
                                  websiteName: e.target.value
                                })}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Website Type</label>
                              <input
                                type="text"
                                value={currentResult.websiteType}
                                onChange={(e) => setCurrentResult({
                                  ...currentResult,
                                  websiteType: e.target.value
                                })}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">URL</label>
                              <input
                                type="text"
                                value={currentResult.url}
                                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                readOnly
                              />
                            </div>
                          </div>
                        </div>

                        {/* Categories */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                            <button
                              onClick={() => {
                                const category = prompt("Add category:");
                                if (category && !currentResult.categories.includes(category)) {
                                  setCurrentResult({
                                    ...currentResult,
                                    categories: [...currentResult.categories, category]
                                  });
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {currentResult.categories?.map((category: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                                <span className="text-sm">{category}</span>
                                <button
                                  onClick={() => {
                                    const newCategories = [...currentResult.categories];
                                    newCategories.splice(index, 1);
                                    setCurrentResult({
                                      ...currentResult,
                                      categories: newCategories
                                    });
                                  }}
                                  className="text-blue-500 hover:text-blue-700 text-lg leading-none"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "design" && (
                    <div className="space-y-8">
                      {/* Colors */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
                        <div className="flex flex-wrap gap-4">
                          {currentResult.colors?.map((color: string, index: number) => (
                            <div key={index} className="text-center">
                              <div
                                className="w-16 h-16 rounded-xl shadow-md mb-2 border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                              <input
                                type="text"
                                value={color}
                                onChange={(e) => {
                                  const newColors = [...currentResult.colors];
                                  newColors[index] = e.target.value;
                                  setCurrentResult({
                                    ...currentResult,
                                    colors: newColors
                                  });
                                }}
                                className="text-xs font-mono text-center w-full px-2 py-1 border rounded"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const color = prompt("Enter hex color:");
                              if (color && !currentResult.colors.includes(color)) {
                                setCurrentResult({
                                  ...currentResult,
                                  colors: [...currentResult.colors, color]
                                });
                              }
                            }}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Fonts */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Families</h3>
                        <div className="flex flex-wrap gap-3">
                          {currentResult.fonts?.map((font: string, index: number) => (
                            <div key={index} className="relative group">
                              <div
                                className="px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm min-w-[120px] text-center"
                                style={{ fontFamily: font }}
                              >
                                {font}
                              </div>
                              <button
                                onClick={() => {
                                  const newFonts = [...currentResult.fonts];
                                  newFonts.splice(index, 1);
                                  setCurrentResult({
                                    ...currentResult,
                                    fonts: newFonts
                                  });
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const font = prompt("Enter font family:");
                              if (font && !currentResult.fonts.includes(font)) {
                                setCurrentResult({
                                  ...currentResult,
                                  fonts: [...currentResult.fonts, font]
                                });
                              }
                            }}
                            className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400"
                          >
                            + Add Font
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className="space-y-8">
                      {/* Tags */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                          <button
                            onClick={() => {
                              const tag = prompt("Add tag:");
                              if (tag && !currentResult.tags.includes(tag)) {
                                setCurrentResult({
                                  ...currentResult,
                                  tags: [...currentResult.tags, tag]
                                });
                              }
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentResult.tags?.map((tag: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg">
                              <span className="text-sm">#{tag}</span>
                              <button
                                onClick={() => {
                                  const newTags = [...currentResult.tags];
                                  newTags.splice(index, 1);
                                  setCurrentResult({
                                    ...currentResult,
                                    tags: newTags
                                  });
                                }}
                                className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related Phrases */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Related Discovery Phrases
                          </h3>
                          <button
                            onClick={() => {
                              const phrase = prompt("Add related phrase:");
                              if (phrase && !currentResult.relatedPhrases.includes(phrase)) {
                                setCurrentResult({
                                  ...currentResult,
                                  relatedPhrases: [...currentResult.relatedPhrases, phrase]
                                });
                              }
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {currentResult.relatedPhrases?.map((phrase: string, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                              <div className="flex-1 text-gray-700">{phrase}</div>
                              <button
                                onClick={() => {
                                  const newPhrases = [...currentResult.relatedPhrases];
                                  newPhrases.splice(index, 1);
                                  setCurrentResult({
                                    ...currentResult,
                                    relatedPhrases: newPhrases
                                  });
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "screenshots" && (
                    <div className="space-y-8">
                      {/* Screenshot Mode Toggle */}
                      <div className="flex gap-4 p-1 bg-gray-100 rounded-xl max-w-md">
                        <button
                          onClick={() => setScreenshotView("desktop")}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            screenshotView === "desktop"
                              ? "bg-white shadow text-blue-600"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Monitor className="w-4 h-4" />
                          Desktop
                        </button>
                        <button
                          onClick={() => setScreenshotView("mobile")}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            screenshotView === "mobile"
                              ? "bg-white shadow text-blue-600"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          Mobile
                        </button>
                      </div>

                      {/* Screenshot Display */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {screenshotView === "desktop" ? "Desktop" : "Mobile"} Screenshot
                          </h3>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              ref={screenshotView === "desktop" ? desktopFileRef : mobileFileRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleScreenshotUpload(file, screenshotView);
                                }
                              }}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => {
                                if (screenshotView === "desktop") {
                                  desktopFileRef.current?.click();
                                } else {
                                  mobileFileRef.current?.click();
                                }
                              }}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                              Upload Custom
                            </button>
                          </div>
                        </div>

                        {currentResult[`${screenshotView}Screenshot`] ? (
                          <div className="relative">
                            <img
                              src={currentResult[`${screenshotView}Screenshot`].startsWith("http") 
                                ? currentResult[`${screenshotView}Screenshot`]
                                : `${API_BASE}/${currentResult[`${screenshotView}Screenshot`]}`
                              }
                              alt={`${screenshotView} screenshot`}
                              className={`rounded-xl border-2 border-gray-200 shadow-lg ${
                                screenshotView === "desktop" ? "w-full" : "w-64 mx-auto"
                              }`}
                            />
                            <button
                              onClick={() => {
                                setCurrentResult({
                                  ...currentResult,
                                  [`${screenshotView}Screenshot`]: ""
                                });
                              }}
                              className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className={`aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center ${
                            screenshotView === "mobile" ? "w-64 mx-auto" : ""
                          }`}>
                            <div className="text-center">
                              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500">No screenshot available</p>
                              <p className="text-sm text-gray-400 mt-1">
                                {screenshotView === "desktop" 
                                  ? "Desktop screenshot not captured" 
                                  : "Mobile screenshot not captured"
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Website Selected
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {results.length > 0
                      ? "Select a website from the analysis history to view its details"
                      : "Start by analyzing a website using the input form on the left"}
                  </p>
                  {results.length === 0 && (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setUrl("https://example.com");
                          setTimeout(() => analyzeSingle(), 100);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md transition-all"
                      >
                        Try Example Analysis
                      </button>
                      <p className="text-sm text-gray-500">
                        Or enter your own URL above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">
                {results.filter(r => r.status === "success").length}
              </div>
              <div className="text-sm text-blue-600 font-medium">Successful Analysis</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <div className="text-2xl font-bold text-purple-700">
                {results.filter(r => r.status === "error").length}
              </div>
              <div className="text-sm text-purple-600 font-medium">Failed Analysis</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="text-2xl font-bold text-green-700">
                {results.length > 0 
                  ? Math.round((results.filter(r => r.status === "success").length / results.length) * 100)
                  : 0
                }%
              </div>
              <div className="text-sm text-green-600 font-medium">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="text-2xl font-bold text-gray-700">{results.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Analyzed</div>
            </div>
          </div>
        </div>

        {/* Analyzing Overlay */}
        {analyzing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Website</h3>
                <p className="text-gray-600">
                  {mode === "single"
                    ? "Extracting intelligence from the website..."
                    : `Processing ${results.filter(r => r.status === "success").length + 1} of ${bulkUrls.split('\n').filter(u => u.trim()).length} websites...`
                  }
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: mode === "single" ? "60%" : 
                      `${((results.filter(r => r.status === "success").length + 1) / bulkUrls.split('\n').filter(u => u.trim()).length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}