import type { AnalysisResult } from "../../hooks/useWebsiteAnalysis";
import { useState } from "react";

interface OverviewTabProps {
  result: AnalysisResult;
  onUpdate: (updates: Partial<AnalysisResult>) => void;
}

export default function OverviewTab({ result, onUpdate }: OverviewTabProps) {
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const addCategory = () => {
    if (newCategory.trim() && !result.categories?.includes(newCategory.trim())) {
      onUpdate({
        categories: [...(result.categories || []), newCategory.trim()]
      });
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  const removeCategory = (index: number) => {
    const newCategories = [...(result.categories || [])];
    newCategories.splice(index, 1);
    onUpdate({ categories: newCategories });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCategory();
    } else if (e.key === 'Escape') {
      setIsAddingCategory(false);
      setNewCategory("");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Website Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Website Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website Name
              </label>
              <input
                type="text"
                value={result.websiteName || ""}
                onChange={(e) => onUpdate({ websiteName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter website name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website Type
              </label>
              <input
                type="text"
                value={result.websiteType || ""}
                onChange={(e) => onUpdate({ websiteType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., E-commerce, Blog, Portfolio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={result.url}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            {!isAddingCategory && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </button>
            )}
          </div>

          {/* Add Category Input Form */}
          {isAddingCategory && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter category name"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory("");
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to add, Escape to cancel
              </p>
            </div>
          )}

          {/* Categories List */}
          <div className="min-h-[120px] max-h-[250px] overflow-y-auto">
            {result.categories && result.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.categories.map((category, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <span className="text-sm font-medium">{category}</span>
                    <button
                      onClick={() => removeCategory(index)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                      aria-label={`Remove ${category}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm text-gray-500">No categories added yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Category" to get started</p>
              </div>
            )}
          </div>

          {/* Categories Count */}
          {result.categories && result.categories.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Total: {result.categories.length} categor{result.categories.length === 1 ? 'y' : 'ies'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}