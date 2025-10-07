interface StatItem {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
}

const mockStats: StatItem[] = [
  { title: 'Total Users', value: '1,234', change: '+12%', trend: 'up' },
  { title: 'Revenue', value: '$45,678', change: '+8%', trend: 'up' },
  { title: 'Orders', value: '789', change: '-3%', trend: 'down' },
  { title: 'Conversion', value: '3.4%', change: '+0.5%', trend: 'up' },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockStats.map(stat => (
        <div key={stat.title} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            {stat.change && (
              <p
                className={`ml-2 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
