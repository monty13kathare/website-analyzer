import { useState, useRef } from "react";
import { Upload, Globe, Monitor, Smartphone, X } from "lucide-react";
import type { AnalysisResult } from "../hooks/useWebsiteAnalysis";
import OverviewTab from "./tabs/OverviewTab";
import DesignTab from "./tabs/DesignTab";
import ContentTab from "./tabs/ContentTab";
import ScreenshotsTab from "./tabs/ScreenshotsTab";
import { formatTime } from "../utils/helpers";


interface AnalysisViewProps {
  currentResult: AnalysisResult | null;
  results: AnalysisResult[];
  onUpdateResult: (updates: Partial<AnalysisResult>) => void;
  onSubmitWebsite: () => void;
}

export default function AnalysisView({
  currentResult,
  results,
  onUpdateResult,
  onSubmitWebsite
}: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "design" | "content" | "screenshots">("overview");

  if (!currentResult) {
    return (
      <EmptyState 
        hasResults={results.length > 0}
        onAnalyzeExample={() => {
          // This would be handled by parent
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <AnalysisHeader
        result={currentResult}
        onSubmit={onSubmitWebsite}
      />
      
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="p-6">
        {activeTab === "overview" && (
          <OverviewTab
            result={currentResult}
            onUpdate={onUpdateResult}
          />
        )}
        {activeTab === "design" && (
          <DesignTab
            result={currentResult}
            onUpdate={onUpdateResult}
          />
        )}
        {activeTab === "content" && (
          <ContentTab
            result={currentResult}
            onUpdate={onUpdateResult}
          />
        )}
        {activeTab === "screenshots" && (
          <ScreenshotsTab
            result={currentResult}
            onUpdate={onUpdateResult}
          />
        )}
      </div>
    </div>
  );
}

function AnalysisHeader({ result, onSubmit }: { 
  result: AnalysisResult; 
  onSubmit: () => void;
}) {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {result.websiteName}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {result.websiteType}
            </span>
            <span className="text-sm text-gray-600">
              Analyzed at {formatTime(result.analyzedAt)}
            </span>
          </div>
        </div>
        <button
          onClick={onSubmit}
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-md transition-all flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Submit to Database
        </button>
      </div>
    </div>
  );
}

function TabNavigation({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string; 
  onTabChange: (tab: any) => void;
}) {
  const tabs = [
    { id: "overview", label: "Overview", icon: <Globe className="w-4 h-4" /> },
    { id: "design", label: "Design", icon: <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" /> },
    { id: "content", label: "Content", icon: "📄" },
    { id: "screenshots", label: "Screenshots", icon: "📸" },
  ] as const;

  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ 
  hasResults, 
  onAnalyzeExample 
}: { 
  hasResults: boolean; 
  onAnalyzeExample: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Website Selected
        </h3>
        <p className="text-gray-600 mb-6">
          {hasResults
            ? "Select a website from the analysis history to view its details"
            : "Start by analyzing a website using the input form on the left"}
        </p>
        {!hasResults && (
          <div className="space-y-3">
            <button
              onClick={onAnalyzeExample}
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
  );
}