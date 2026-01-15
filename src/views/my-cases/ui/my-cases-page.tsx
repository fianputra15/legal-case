import { MainLayout } from '@/widgets/layout';
import { Button } from '@/shared/ui';

export default function MyCasesPage() {
  return (
    <MainLayout 
      headerTitle="My Cases"
      headerActions={
        <Button className="bg-legal-primary hover:bg-legal-primary/90 text-white">
          Create New Case
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-legal-active">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-legal-text-primary">Status:</label>
              <select className="px-3 py-1 border border-legal-active rounded text-sm">
                <option>All Cases</option>
                <option>Active</option>
                <option>Pending Review</option>
                <option>Closed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-legal-text-primary">Priority:</label>
              <select className="px-3 py-1 border border-legal-active rounded text-sm">
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-legal-text-primary">Client:</label>
              <input 
                type="text" 
                placeholder="Search clients..."
                className="px-3 py-1 border border-legal-active rounded text-sm w-48"
              />
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid gap-6">
          {[
            {
              id: 'CS-2026-001',
              title: 'Smith vs. Johnson Contract Dispute',
              client: 'John Smith',
              status: 'Active',
              priority: 'High',
              lastUpdate: '2 hours ago',
              description: 'Contract dispute regarding breach of service agreement terms and conditions.',
              attachments: 12,
              dueDate: 'Jan 25, 2026'
            },
            {
              id: 'CS-2026-002',
              title: 'Corporate Merger - ABC Corp',
              client: 'ABC Corporation',
              status: 'Pending Review',
              priority: 'Medium',
              lastUpdate: '1 day ago',
              description: 'Due diligence and documentation for corporate merger proceedings.',
              attachments: 8,
              dueDate: 'Feb 5, 2026'
            },
            {
              id: 'CS-2026-003',
              title: 'Personal Injury Claim',
              client: 'Jane Doe',
              status: 'Active',
              priority: 'High',
              lastUpdate: '3 days ago',
              description: 'Motor vehicle accident injury claim and insurance settlement.',
              attachments: 15,
              dueDate: 'Jan 30, 2026'
            },
            {
              id: 'CS-2026-004',
              title: 'Intellectual Property Dispute',
              client: 'Tech Innovations Inc.',
              status: 'Closed',
              priority: 'Low',
              lastUpdate: '1 week ago',
              description: 'Patent infringement case resolved through negotiated settlement.',
              attachments: 6,
              dueDate: 'Completed'
            },
            {
              id: 'CS-2026-005',
              title: 'Employment Discrimination Case',
              client: 'Sarah Johnson',
              status: 'Active',
              priority: 'Medium',
              lastUpdate: '5 days ago',
              description: 'Workplace discrimination and wrongful termination claim.',
              attachments: 9,
              dueDate: 'Feb 10, 2026'
            },
            {
              id: 'CS-2026-006',
              title: 'Real Estate Transaction',
              client: 'Property Holdings LLC',
              status: 'Pending Review',
              priority: 'Low',
              lastUpdate: '2 days ago',
              description: 'Commercial real estate purchase and title review.',
              attachments: 4,
              dueDate: 'Feb 15, 2026'
            },
          ].map((case_) => (
            <div key={case_.id} className="bg-white p-6 rounded-lg border border-legal-active hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-legal-text-sub">{case_.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      case_.status === 'Active' ? 'bg-legal-success text-green-700' :
                      case_.status === 'Pending Review' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {case_.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      case_.priority === 'High' ? 'bg-red-50 text-red-700' :
                      case_.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {case_.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-legal-text-primary mb-2">{case_.title}</h3>
                  <p className="text-legal-text-sub text-sm mb-2">Client: {case_.client}</p>
                  <p className="text-legal-text-sub text-sm mb-4">{case_.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-legal-text-sub">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-9 9 9v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <span>{case_.attachments} attachments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h12m-3 0v13a2 2 0 01-2 2H7a2 2 0 01-2-2V7h3z" />
                      </svg>
                      <span>Due: {case_.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Last updated: {case_.lastUpdate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-legal-active">
          <p className="text-sm text-legal-text-sub">Showing 1 to 6 of 12 cases</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
              Next
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}