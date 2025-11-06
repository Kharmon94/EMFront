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
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {trendLabel && <div className="text-xs text-gray-500 mt-1">{trendLabel}</div>}
    </div>
  );
}

