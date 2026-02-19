import { Globe, Zap } from "lucide-react";

interface HeaderProps {
  onLoadExample: () => void;
}

export default function Header({ onLoadExample }: HeaderProps) {
  return (
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
      
      </div>
    </div>
  );
}