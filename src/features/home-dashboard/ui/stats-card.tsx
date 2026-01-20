interface StatsCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'gray';
}

export function StatsCard({ title, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 text-blue-800',
    green: 'bg-green-50 text-green-600 text-green-800', 
    yellow: 'bg-yellow-50 text-yellow-600 text-yellow-800',
    gray: 'bg-gray-50 text-gray-600 text-gray-800'
  };

  const [bgClass, valueClass, titleClass] = colorClasses[color].split(' ');

  return (
    <div className={`${bgClass} p-6 rounded-lg text-center`}>
      <div className={`text-3xl font-bold ${valueClass}`}>
        {value}
      </div>
      <div className={`font-medium ${titleClass}`}>
        {title}
      </div>
    </div>
  );
}