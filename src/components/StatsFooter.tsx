interface StatsFooterProps {
  results: any[];
}

export default function StatsFooter({ results }: StatsFooterProps) {
  const successful = results.filter(r => r.status === "success").length;
  const failed = results.filter(r => r.status === "error").length;
  const successRate = results.length > 0 
    ? Math.round((successful / results.length) * 100)
    : 0;

  const stats = [
    { label: "Successful Analysis", value: successful, gradient: "from-blue-50 to-blue-100", text: "text-blue-700" },
    { label: "Failed Analysis", value: failed, gradient: "from-purple-50 to-purple-100", text: "text-purple-700" },
    { label: "Success Rate", value: `${successRate}%`, gradient: "from-green-50 to-green-100", text: "text-green-700" },
    { label: "Total Analyzed", value: results.length, gradient: "from-gray-50 to-gray-100", text: "text-gray-700" },
  ];

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`text-center p-4 bg-gradient-to-r ${stat.gradient} rounded-xl`}>
            <div className={`text-2xl font-bold ${stat.text}`}>
              {stat.value}
            </div>
            <div className={`text-sm ${stat.text.replace('700', '600')} font-medium`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}