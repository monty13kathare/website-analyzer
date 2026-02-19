import { useState, useCallback } from "react";
import axios from "axios";
import { isValidUrl } from "../utils/helpers";
import { API_BASE } from "../config/constants";

interface Message {
  text: string;
  type: "success" | "error" | "info";
}

export interface AnalysisResult {
  id: number;
  url: string;
  websiteName?: string;
  websiteType?: string;
  categories?: string[];
  tags?: string[];
  relatedPhrases?: string[];
  colors?: string[];
  fonts?: string[];
  desktopScreenshot?: string;
  mobileScreenshot?: string;
  analyzedAt: string;
  status: "success" | "error";
  error?: string;
}

export const useWebsiteAnalysis = () => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const updateCurrentResult = useCallback((updates: Partial<AnalysisResult>) => {
    setCurrentResult(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const clearForm = useCallback(() => {
    setUrl("");
    setBulkUrls("");
    setResults([]);
    setCurrentResult(null);
    setMessage(null);
  }, []);

  const analyzeSingle = useCallback(async () => {
    if (!url.trim()) {
      setMessage({ text: "Please enter a URL", type: "error" });
      return;
    }

    if (!isValidUrl(url)) {
      setMessage({ 
        text: "Please enter a valid URL (include http:// or https://)", 
        type: "error" 
      });
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE}/analyze`, { url });
      const data = response.data;
      
      const newResult: AnalysisResult = {
        ...data,
        id: Date.now(),
        analyzedAt: new Date().toISOString(),
        status: "success"
      };
      
      setResults(prev => [newResult, ...prev]);
      setCurrentResult(newResult);
      setMessage({ text: "✅ Website analyzed successfully!", type: "success" });
    } catch (error: any) {
      const errorResult: AnalysisResult = {
        id: Date.now(),
        url,
        status: "error",
        error: error.response?.data?.message || "Analysis failed",
        analyzedAt: new Date().toISOString()
      };
      
      setResults(prev => [errorResult, ...prev]);
      setMessage({ text: "❌ Analysis failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setAnalyzing(false), 1000);
    }
  }, [url]);

  const analyzeBulk = useCallback(async () => {
    const urlList = bulkUrls
      .split("\n")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urlList.length === 0) {
      setMessage({ text: "Please enter at least one URL", type: "error" });
      return;
    }

    const invalidUrls = urlList.filter(u => !isValidUrl(u));
    if (invalidUrls.length > 0) {
      setMessage({ 
        text: `Invalid URLs detected: ${invalidUrls.join(", ")}`, 
        type: "error" 
      });
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
      
      setResults(prev => [...newResults, ...prev]);
      if (newResults.length > 0 && newResults[0].status === "success") {
        setCurrentResult(newResults[0]);
      }
      
      setMessage({ 
        text: `✅ Analyzed ${data.success} of ${data.total} websites successfully`, 
        type: "success" 
      });
    } catch (error: any) {
      setMessage({ text: "❌ Bulk analysis failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setAnalyzing(false), 1000);
    }
  }, [bulkUrls]);

  const loadExample = useCallback(() => {
    const exampleData: AnalysisResult = {
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
    setResults(prev => [exampleData, ...prev]);
    setMessage({ text: "Example data loaded successfully", type: "info" });
  }, []);

  const submitWebsite = useCallback(async () => {
    if (!currentResult) {
      setMessage({ text: "No website data to submit", type: "error" });
      return;
    }

    if (!currentResult.websiteName || !currentResult.websiteType) {
      setMessage({ text: "Website name and type are required", type: "error" });
      return;
    }

    try {
      await axios.post(`${API_BASE}/submit`, {
        ...currentResult,
        submittedAt: new Date().toISOString()
      });

      setMessage({ text: "✅ Website submitted successfully!", type: "success" });
      
      setTimeout(() => {
        setCurrentResult(null);
        setUrl("");
      }, 2000);
    } catch (error) {
      setMessage({ text: "❌ Submission failed. Please try again.", type: "error" });
    }
  }, [currentResult]);

  return {
    state: {
      mode,
      url,
      bulkUrls,
      loading,
      analyzing,
      results,
      currentResult,
      message
    },
    actions: {
      setMode,
      setUrl,
      setBulkUrls,
      setCurrentResult,
      updateCurrentResult,
      clearForm,
      loadExample
    },
    analysis: {
      analyzeSingle,
      analyzeBulk,
      submitWebsite
    }
  };
};