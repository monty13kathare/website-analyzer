import type { AnalysisResult } from "../../hooks/useWebsiteAnalysis";
import { useState } from "react";

interface DesignTabProps {
  result: AnalysisResult;
  onUpdate: (updates: Partial<AnalysisResult>) => void;
}

export default function DesignTab({ result, onUpdate }: DesignTabProps) {
  const [newColor, setNewColor] = useState("");
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newFont, setNewFont] = useState("");
  const [isAddingFont, setIsAddingFont] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  const addColor = () => {
    if (newColor.trim() && !result.colors?.includes(newColor.trim())) {
      onUpdate({
        colors: [...(result.colors || []), newColor.trim()]
      });
      setNewColor("");
      setIsAddingColor(false);
    }
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...(result.colors || [])];
    newColors[index] = color;
    onUpdate({ colors: newColors });
  };

  const removeColor = (index: number) => {
    const newColors = [...(result.colors || [])];
    newColors.splice(index, 1);
    onUpdate({ colors: newColors });
    if (editingColorIndex === index) {
      setEditingColorIndex(null);
    }
  };

  const addFont = () => {
    if (newFont.trim() && !result.fonts?.includes(newFont.trim())) {
      onUpdate({
        fonts: [...(result.fonts || []), newFont.trim()]
      });
      setNewFont("");
      setIsAddingFont(false);
    }
  };

  const removeFont = (index: number) => {
    const newFonts = [...(result.fonts || [])];
    newFonts.splice(index, 1);
    onUpdate({ fonts: newFonts });
  };

  const handleColorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addColor();
    } else if (e.key === 'Escape') {
      setIsAddingColor(false);
      setNewColor("");
    }
  };

  const handleFontKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addFont();
    } else if (e.key === 'Escape') {
      setIsAddingFont(false);
      setNewFont("");
    }
  };

  // Predefined color suggestions
  const colorSuggestions = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#D4A5A5"];

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Color Palette Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Color Palette</h3>
          {!isAddingColor && (
            <button
              onClick={() => setIsAddingColor(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Color
            </button>
          )}
        </div>

        {/* Add Color Form */}
        {isAddingColor && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={handleColorKeyPress}
                  placeholder="Enter hex color (e.g., #FF6B6B)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addColor}
                  disabled={!newColor.trim()}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingColor(false);
                    setNewColor("");
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Color Suggestions */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {colorSuggestions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-gray-400 transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Press Enter to add, Escape to cancel
            </p>
          </div>
        )}

        {/* Colors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {result.colors?.map((color, index) => (
            <div key={index} className="group relative">
              <div className="relative">
                <div
                  className="w-full aspect-square rounded-xl shadow-md mb-2 border-2 border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: color }}
                  onClick={() => setEditingColorIndex(editingColorIndex === index ? null : index)}
                />
                <button
                  onClick={() => removeColor(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center shadow-lg"
                  aria-label={`Remove color ${color}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {editingColorIndex === index ? (
                <input
                  type="text"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  onBlur={() => setEditingColorIndex(null)}
                  className="text-xs font-mono text-center w-full px-2 py-1.5 border-2 border-blue-500 rounded-lg focus:outline-none"
                  autoFocus
                />
              ) : (
                <p className="text-xs font-mono text-center text-gray-600 truncate px-1">{color}</p>
              )}
            </div>
          ))}
          
          {!isAddingColor && (!result.colors || result.colors.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4.56a2 2 0 011.58.76l1.58 2.06a2 2 0 001.58.76H20a2 2 0 012 2v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6" />
              </svg>
              <p className="text-sm text-gray-500">No colors added yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add Color" to get started</p>
            </div>
          )}
        </div>

        {/* Colors Count */}
        {result.colors && result.colors.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Total: {result.colors.length} color{result.colors.length === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>

      {/* Font Families Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Font Families</h3>
          {!isAddingFont && (
            <button
              onClick={() => setIsAddingFont(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Font
            </button>
          )}
        </div>

        {/* Add Font Form */}
        {isAddingFont && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newFont}
                  onChange={(e) => setNewFont(e.target.value)}
                  onKeyDown={handleFontKeyPress}
                  placeholder="Enter font family (e.g., Inter, Roboto, 'Open Sans')"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addFont}
                  disabled={!newFont.trim()}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingFont(false);
                    setNewFont("");
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Font Suggestions */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {["Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Lato"].map((font) => (
                  <button
                    key={font}
                    onClick={() => setNewFont(font)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Press Enter to add, Escape to cancel
            </p>
          </div>
        )}

        {/* Fonts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.fonts?.map((font, index) => (
            <div key={index} className="group relative">
              <div className="relative">
                <div
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                  style={{ fontFamily: font }}
                >
                  <p className="text-sm font-medium truncate">{font}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
                <button
                  onClick={() => removeFont(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center shadow-lg"
                  aria-label={`Remove font ${font}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          {!isAddingFont && (!result.fonts || result.fonts.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h.001m-5.074-5.001L12 13.5M15 12h2m-6 3h4m-2-3v7" />
              </svg>
              <p className="text-sm text-gray-500">No fonts added yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add Font" to get started</p>
            </div>
          )}
        </div>

        {/* Fonts Count */}
        {result.fonts && result.fonts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Total: {result.fonts.length} font{result.fonts.length === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}