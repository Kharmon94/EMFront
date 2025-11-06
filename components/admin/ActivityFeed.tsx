import { FiUser, FiMusic, FiFlag, FiAlertTriangle } from 'react-icons/fi';

interface Activity {
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'signup': return FiUser;
      case 'upload': return FiMusic;
      case 'report': return FiFlag;
      default: return FiAlertTriangle;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'signup': return 'text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-900/30';
      case 'upload': return 'text-blue-600 dark:text-blue-400 bg-blue-200 dark:bg-blue-900/30';
      case 'report': return 'text-red-600 dark:text-red-400 bg-red-200 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-300 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-gray-300 dark:border-gray-800/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full" />
          Recent Activity
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            const colorClass = getIconColor(activity.type);
            
            return (
              <div key={index} className="group p-4 hover:bg-gray-200 dark:hover:bg-gray-800/30 transition-all border-b border-gray-300 dark:border-gray-800/30 last:border-0">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400 dark:border-gray-700 ${colorClass} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <FiAlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

