import type { Case } from '../model';
import { formatDate, getStatusColor, getCategoryColor } from '../model';

interface RecentCasesProps {
  cases: Case[];
}

export function RecentCases({ cases }: RecentCasesProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center text-gray-600">
        <p>No cases found. Start by creating your first case.</p>
        <a href="/dashboard" className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium">
          Go to Dashboard →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
        <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
          View All →
        </a>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {caseItem.title}
                  </h4>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(caseItem.category)}`}>
                      {caseItem.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created {formatDate(caseItem.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Priority: {caseItem.priority}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}