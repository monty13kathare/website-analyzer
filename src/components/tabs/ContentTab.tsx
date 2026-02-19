import { X, Plus, Hash, Search, Tag } from "lucide-react";
import type { AnalysisResult } from "../../hooks/useWebsiteAnalysis";
import { useState } from "react";

interface ContentTabProps {
  result: AnalysisResult;
  onUpdate: (updates: Partial<AnalysisResult>) => void;
}

export default function ContentTab({ result, onUpdate }: ContentTabProps) {
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [isAddingPhrase, setIsAddingPhrase] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [phraseSearch, setPhraseSearch] = useState("");

  // Tag management
  const addTag = () => {
    const trimmedTag = newTag.trim().replace(/^#/, ''); // Remove # if user adds it
    if (trimmedTag && !result.tags?.includes(trimmedTag)) {
      onUpdate({
        tags: [...(result.tags || []), trimmedTag]
      });
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...(result.tags || [])];
    newTags.splice(index, 1);
    onUpdate({ tags: newTags });
  };

  // Phrase management
  const addPhrase = () => {
    const trimmedPhrase = newPhrase.trim();
    if (trimmedPhrase && !result.relatedPhrases?.includes(trimmedPhrase)) {
      onUpdate({
        relatedPhrases: [...(result.relatedPhrases || []), trimmedPhrase]
      });
      setNewPhrase("");
      setIsAddingPhrase(false);
    }
  };

  const removePhrase = (index: number) => {
    const newPhrases = [...(result.relatedPhrases || [])];
    newPhrases.splice(index, 1);
    onUpdate({ relatedPhrases: newPhrases });
  };

  // Keyboard handlers
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    } else if (e.key === 'Escape') {
      setIsAddingTag(false);
      setNewTag("");
    }
  };

  const handlePhraseKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPhrase();
    } else if (e.key === 'Escape') {
      setIsAddingPhrase(false);
      setNewPhrase("");
    }
  };

  // Filter tags and phrases based on search
  const filteredTags = result.tags?.filter(tag => 
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  ) || [];

  const filteredPhrases = result.relatedPhrases?.filter(phrase => 
    phrase.toLowerCase().includes(phraseSearch.toLowerCase())
  ) || [];

  // Tag suggestions
  const tagSuggestions = ["react", "tailwind", "javascript", "typescript", "nextjs", "nodejs", "responsive", "design", "frontend", "backend"];

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Tags Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            {result.tags && result.tags.length > 0 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {result.tags.length}
              </span>
            )}
          </div>
          {!isAddingTag && (
            <button
              onClick={() => setIsAddingTag(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </button>
          )}
        </div>

        {/* Add Tag Form */}
        {isAddingTag && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    placeholder="Enter tag (e.g., react, tailwind)"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingTag(false);
                    setNewTag("");
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Tag Suggestions */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setNewTag(tag)}
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    disabled={result.tags?.includes(tag)}
                  >
                    <Hash className="w-3 h-3 mr-1 text-gray-400" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Press Enter to add, Escape to cancel
            </p>
          </div>
        )}

        {/* Search Bar */}
        {result.tags && result.tags.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>
        )}

        {/* Tags Grid */}
        <div className="min-h-[100px]">
          {filteredTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag, index) => (
                <div
                  key={index}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200 shadow-sm"
                >
                  <Hash className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-sm font-medium">{tag}</span>
                  <button
                    onClick={() => removeTag(index)}
                    className="ml-1 text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !isAddingTag && (
              <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Tag className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No tags added yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Tag" to get started</p>
              </div>
            )
          )}
        </div>

        {/* Tags Count */}
        {filteredTags.length > 0 && tagSearch && (
          <div className="mt-4 text-xs text-gray-500">
            Found {filteredTags.length} tag{filteredTags.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {/* Related Discovery Phrases Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Related Discovery Phrases
            </h3>
            {result.relatedPhrases && result.relatedPhrases.length > 0 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {result.relatedPhrases.length}
              </span>
            )}
          </div>
          {!isAddingPhrase && (
            <button
              onClick={() => setIsAddingPhrase(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Phrase
            </button>
          )}
        </div>

        {/* Add Phrase Form */}
        {isAddingPhrase && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <textarea
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  onKeyDown={handlePhraseKeyPress}
                  placeholder="Enter a related discovery phrase..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-none"
                  rows={2}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button
                  onClick={addPhrase}
                  disabled={!newPhrase.trim()}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingPhrase(false);
                    setNewPhrase("");
                  }}
                  className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Phrase Tips */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">💡 Tips:</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Use specific phrases that describe content</li>
                <li>Keep phrases concise and clear</li>
                <li>Add multiple variations for better coverage</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Press Enter to add (Shift+Enter for new line), Escape to cancel
            </p>
          </div>
        )}

        {/* Search Bar */}
        {result.relatedPhrases && result.relatedPhrases.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={phraseSearch}
                onChange={(e) => setPhraseSearch(e.target.value)}
                placeholder="Search phrases..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>
        )}

        {/* Phrases List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredPhrases.length > 0 ? (
            filteredPhrases.map((phrase, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed">{phrase}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added {new Date().toLocaleDateString()} {/* You can add actual date if available */}
                  </p>
                </div>
                <button
                  onClick={() => removePhrase(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  aria-label="Remove phrase"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            !isAddingPhrase && (
              <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Search className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No phrases added yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Phrase" to get started</p>
              </div>
            )
          )}
        </div>

        {/* Phrases Count */}
        {filteredPhrases.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {phraseSearch ? (
                <>Found {filteredPhrases.length} phrase{filteredPhrases.length === 1 ? '' : 's'}</>
              ) : (
                <>Total: {result.relatedPhrases?.length} phrase{result.relatedPhrases?.length === 1 ? '' : 's'}</>
              )}
            </p>
            {result.relatedPhrases && result.relatedPhrases.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all phrases?')) {
                    onUpdate({ relatedPhrases: [] });
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}