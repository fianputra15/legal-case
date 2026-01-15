import { MainLayout } from '@/widgets/layout';
import { Button } from '@/shared/ui';

export default function HomePage() {
  return (
    <MainLayout headerTitle="Browse Cases">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-active">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-sub text-sm">Total Cases</p>
                <p className="text-2xl font-semibold text-text-primary">1,247</p>
              </div>
              <div className="p-3 bg-weak rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-active">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-sub text-sm">Active Cases</p>
                <p className="text-2xl font-semibold text-text-primary">89</p>
              </div>
              <div className="p-3 bg-success rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-active">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-sub text-sm">Pending Review</p>
                <p className="text-2xl font-semibold text-text-primary">23</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-active">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-sub text-sm">Clients</p>
                <p className="text-2xl font-semibold text-text-primary">456</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-active">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Create New Case
            </Button>
            <Button variant="outline" className="border-active text-text-primary hover:bg-active">
              Add Client
            </Button>
            <Button variant="outline" className="border-active text-text-primary hover:bg-active">
              Schedule Meeting
            </Button>
            <Button variant="outline" className="border-active text-text-primary hover:bg-active">
              Generate Report
            </Button>
          </div>
        </div>
        
        {/* Recent Cases */}
        <div className="bg-white rounded-lg border border-active">
          <div className="p-6 border-b border-active">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Recent Cases</h3>
              <Button variant="outline" size="sm" className="border-active text-text-primary hover:bg-active">
                View All
              </Button>
            </div>
          </div>
          
          <div className="divide-y divide-active">
            {[
              { id: 'CS-2026-001', title: 'Smith vs. Johnson Contract Dispute', client: 'John Smith', status: 'Active', priority: 'High', lastUpdate: '2 hours ago' },
              { id: 'CS-2026-002', title: 'Corporate Merger - ABC Corp', client: 'ABC Corporation', status: 'Pending Review', priority: 'Medium', lastUpdate: '1 day ago' },
              { id: 'CS-2026-003', title: 'Personal Injury Claim', client: 'Jane Doe', status: 'Active', priority: 'High', lastUpdate: '3 days ago' },
              { id: 'CS-2026-004', title: 'Intellectual Property Dispute', client: 'Tech Innovations Inc.', status: 'Closed', priority: 'Low', lastUpdate: '1 week ago' },
            ].map((case_) => (
              <div key={case_.id} className="p-6 hover:bg-weak transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-text-sub">{case_.id}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        case_.status === 'Active' ? 'bg-success text-green-700' :
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
                    <h4 className="text-text-primary font-medium mb-1">{case_.title}</h4>
                    <p className="text-text-sub text-sm">Client: {case_.client}</p>
                  </div>
                  <div className="text-right text-sm text-text-sub">
                    <p>Last updated</p>
                    <p>{case_.lastUpdate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}