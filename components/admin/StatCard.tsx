import { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: number;
  trendLabel?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendLabel, iconColor = 'text-blue-400' }: StatCardProps) {
  const getGradientClass = () => {
    if (iconColor.includes('blue')) return 'from-blue-100 dark:from-blue-900/20 to-gray-200 dark:to-gray-900/50 border-blue-300 dark:border-blue-800/30 hover:border-blue-600 dark:hover:border-blue-600/50';
    if (iconColor.includes('purple')) return 'from-purple-100 dark:from-purple-900/20 to-gray-200 dark:to-gray-900/50 border-purple-300 dark:border-purple-800/30 hover:border-purple-600 dark:hover:border-purple-600/50';
    if (iconColor.includes('green')) return 'from-green-100 dark:from-green-900/20 to-gray-200 dark:to-gray-900/50 border-green-300 dark:border-green-800/30 hover:border-green-600 dark:hover:border-green-600/50';
    if (iconColor.includes('red')) return 'from-red-100 dark:from-red-900/20 to-gray-200 dark:to-gray-900/50 border-red-300 dark:border-red-800/30 hover:border-red-600 dark:hover:border-red-600/50';
    if (iconColor.includes('yellow')) return 'from-yellow-100 dark:from-yellow-900/20 to-gray-200 dark:to-gray-900/50 border-yellow-300 dark:border-yellow-800/30 hover:border-yellow-600 dark:hover:border-yellow-600/50';
    return 'from-gray-200 dark:from-gray-900 to-gray-100 dark:to-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-gray-600';
  };

  return (
    <div className={`group relative bg-gradient-to-br ${getGradientClass()} border rounded-2xl p-6 transition-all hover:scale-105 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-900/50 flex items-center justify-center ${iconColor} border border-gray-200 dark:border-gray-800 group-hover:border-current transition-all`}>
          <Icon className="w-7 h-7" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
            trend >= 0 
              ? 'text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-900/20 border border-green-400 dark:border-green-800/30' 
              : 'text-red-600 dark:text-red-400 bg-red-200 dark:bg-red-900/20 border border-red-400 dark:border-red-800/30'
          }`}>
            {trend >= 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</div>
      {trendLabel && <div className="text-xs text-gray-500 mt-2">{trendLabel}</div>}
    </div>
  );
}

