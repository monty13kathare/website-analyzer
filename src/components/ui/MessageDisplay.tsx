import { Check, X, AlertCircle } from "lucide-react";

interface MessageDisplayProps {
  message: { text: string; type: "success" | "error" | "info" };
}

export default function MessageDisplay({ message }: MessageDisplayProps) {
  const config = {
    success: { 
      bg: "bg-green-50", 
      border: "border-green-500", 
      text: "text-green-700",
      icon: <Check className="w-5 h-5" />
    },
    error: { 
      bg: "bg-red-50", 
      border: "border-red-500", 
      text: "text-red-700",
      icon: <X className="w-5 h-5" />
    },
    info: { 
      bg: "bg-blue-50", 
      border: "border-blue-500", 
      text: "text-blue-700",
      icon: <AlertCircle className="w-5 h-5" />
    },
  }[message.type];

  return (
    <div className={`mt-4 p-4 rounded-xl border-l-4 ${config.bg} ${config.border} ${config.text}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="font-medium">{message.text}</span>
      </div>
    </div>
  );
}