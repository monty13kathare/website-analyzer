import { useState } from "react";
import { useWebsiteAnalysis } from "../hooks/useWebsiteAnalysis";
import Header from "../components/Header";
import InputSection from "../components/InputSection";
import ResultsPanel from "../components/ResultsPanel";
import AnalysisView from "../components/AnalysisView";
import StatsFooter from "../components/StatsFooter";
import AnalyzingOverlay from "../components/AnalyzingOverlay";


export default function WebsiteAnalyzer() {
  const {
    state,
    actions,
    analysis
  } = useWebsiteAnalysis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Header onLoadExample={actions.loadExample} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <InputSection
              mode={state.mode}
              url={state.url}
              bulkUrls={state.bulkUrls}
              loading={state.loading}
              message={state.message}
              onModeChange={actions.setMode}
              onUrlChange={actions.setUrl}
              onBulkUrlsChange={actions.setBulkUrls}
              onAnalyzeSingle={analysis.analyzeSingle}
              onAnalyzeBulk={analysis.analyzeBulk}
            />
            
            <ResultsPanel
              results={state.results}
              currentResultId={state.currentResult?.id}
              onSelectResult={actions.setCurrentResult}
              onClearAll={actions.clearForm}
            />
          </div>
          
          <div className="lg:col-span-2">
            <AnalysisView
              currentResult={state.currentResult}
              results={state.results}
              onUpdateResult={actions.updateCurrentResult}
              onSubmitWebsite={analysis.submitWebsite}
            />
          </div>
        </div>
        
        <StatsFooter results={state.results} />
        {state.analyzing && (
          <AnalyzingOverlay
            mode={state.mode}
            results={state.results}
            bulkUrls={state.bulkUrls}
          />
        )}
      </div>
    </div>
  );
}