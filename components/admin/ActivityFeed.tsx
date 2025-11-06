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
      case 'signup': return 'text-green-400 bg-green-900/30';
      case 'upload': return 'text-blue-400 bg-blue-900/30';
      case 'report': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
      <div className="p-4">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            const colorClass = getIconColor(activity.type);
            
            return (
              <div key={index} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}

