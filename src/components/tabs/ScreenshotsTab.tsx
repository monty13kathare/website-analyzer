import { useState, useRef } from "react";
import { Monitor, Smartphone, X, Upload, Camera, Image, Trash2, Download, Maximize2 } from "lucide-react";
import type { AnalysisResult } from "../../hooks/useWebsiteAnalysis";
import { API_BASE } from "../../config/constants";

interface ScreenshotsTabProps {
  result: AnalysisResult;
  onUpdate: (updates: Partial<AnalysisResult>) => void;
}

export default function ScreenshotsTab({ result, onUpdate }: ScreenshotsTabProps) {
  const [screenshotView, setScreenshotView] = useState<"desktop" | "mobile">("desktop");
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return null;
        }
        return prev + 10;
      });
    }, 100);

    // Here you would typically upload to your server
    // For now, we'll create a local URL
    const localUrl = URL.createObjectURL(file);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(null);
      
      // Update the screenshot with the local URL
      // In production, you'd use the URL from your server
      onUpdate({ 
        [`${screenshotView}Screenshot`]: localUrl 
      });
    }, 1000);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeScreenshot = () => {
    if (currentScreenshot?.startsWith('blob:')) {
      URL.revokeObjectURL(currentScreenshot);
    }
    onUpdate({ [`${screenshotView}Screenshot`]: "" });
  };

  const downloadScreenshot = () => {
    if (currentScreenshot) {
      const link = document.createElement('a');
      link.href = currentScreenshot.startsWith('blob:') 
        ? currentScreenshot 
        : `${API_BASE}/${currentScreenshot}`;
      link.download = `${screenshotView}-screenshot.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const currentScreenshot = result[`${screenshotView}Screenshot` as keyof AnalysisResult] as string;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setScreenshotView("desktop")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              screenshotView === "desktop"
                ? "bg-white shadow-lg text-blue-600 scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setScreenshotView("mobile")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              screenshotView === "mobile"
                ? "bg-white shadow-lg text-blue-600 scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Upload button for when no screenshot exists */}
        {!currentScreenshot && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload {screenshotView === "desktop" ? "Desktop" : "Mobile"} Screenshot
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileRef}
        onChange={onFileSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        className="hidden"
      />

      {/* Screenshot Area */}
      <div className="relative">
        {currentScreenshot ? (
          <>
            {/* Image Container */}
            <div 
              className={`relative group ${
                screenshotView === "desktop" ? "w-full" : "max-w-sm mx-auto"
              }`}
            >
              <img
                src={currentScreenshot.startsWith("blob:") || currentScreenshot.startsWith("http")
                  ? currentScreenshot
                  : `${API_BASE}/${currentScreenshot}`
                }
                alt={`${screenshotView} screenshot`}
                className={`w-full h-auto rounded-xl border-2 border-gray-200 shadow-lg transition-all duration-300 ${
                  isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsFullscreen(!isFullscreen)}
              />

              {/* Image Overlay Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={downloadScreenshot}
                  className="w-10 h-10 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-200"
                  title="Download screenshot"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-10 h-10 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-200"
                  title="View fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={removeScreenshot}
                  className="w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
                  title="Remove screenshot"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Upload New Button */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-gray-200 text-sm font-medium flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Replace
                </button>
              </div>

              {/* Image Dimensions */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                1920 × 1080
              </div>
            </div>
          </>
        ) : (
          /* Drag and Drop Upload Area */
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              relative aspect-video rounded-xl border-3 border-dashed transition-all duration-200
              ${screenshotView === "mobile" ? "w-64 mx-auto" : "w-full"}
              ${isDragging 
                ? "border-blue-500 bg-blue-50 scale-[1.02]" 
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
              }
            `}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {uploadProgress !== null ? (
                /* Upload Progress */
                <div className="w-full max-w-xs text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={226.2}
                        strokeDashoffset={226.2 * (1 - uploadProgress / 100)}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Uploading screenshot...</p>
                </div>
              ) : isDragging ? (
                /* Drag Over State */
                <>
                  <Upload className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                  <p className="text-lg font-medium text-blue-600">Drop to upload</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, WEBP up to 10MB</p>
                </>
              ) : (
                /* Default Empty State */
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-700">
                      No {screenshotView} screenshot
                    </p>
                    <p className="text-sm text-gray-500 mt-2 mb-4">
                      Drag and drop or click to upload
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Screenshot
                      </button>
                      
                      <button
                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Browse Gallery
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Supported formats: PNG, JPG, WEBP, GIF (Max 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && currentScreenshot && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={currentScreenshot.startsWith("blob:") || currentScreenshot.startsWith("http")
                ? currentScreenshot
                : `${API_BASE}/${currentScreenshot}`
              }
              alt={`${screenshotView} screenshot fullscreen`}
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={downloadScreenshot}
              className="absolute bottom-4 right-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>
      )}

      {/* Screenshot Info Card */}
      {currentScreenshot && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Screenshot Information</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{screenshotView}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Dimensions</p>
              <p className="text-sm font-medium text-gray-900">1920 × 1080</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Format</p>
              <p className="text-sm font-medium text-gray-900">PNG</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Size</p>
              <p className="text-sm font-medium text-gray-900">2.4 MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}