import { MainLayout } from '@/widgets/layout';
import { Button } from '@/shared/ui';

export default function MessagesPage() {
  return (
    <MainLayout 
      headerTitle="Messages"
      headerActions={
        <Button className="bg-legal-primary hover:bg-legal-primary/90 text-white">
          Compose Message
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-legal-active">
            <div className="p-4 border-b border-legal-active">
              <h3 className="font-semibold text-legal-text-primary">Conversations</h3>
            </div>
            
            <div className="divide-y divide-legal-active">
              {[
                {
                  id: 1,
                  name: 'John Smith',
                  role: 'Client',
                  lastMessage: 'Thank you for the update on my case...',
                  time: '2h ago',
                  unread: 2,
                  avatar: 'JS'
                },
                {
                  id: 2,
                  name: 'Sarah Johnson',
                  role: 'Client',
                  lastMessage: 'Can we schedule a meeting to discuss...',
                  time: '5h ago',
                  unread: 1,
                  avatar: 'SJ'
                },
                {
                  id: 3,
                  name: 'Michael Chen',
                  role: 'Paralegal',
                  lastMessage: 'The documents have been prepared...',
                  time: '1d ago',
                  unread: 0,
                  avatar: 'MC'
                },
                {
                  id: 4,
                  name: 'ABC Corporation',
                  role: 'Client',
                  lastMessage: 'Merger documents are ready for review',
                  time: '2d ago',
                  unread: 0,
                  avatar: 'AC'
                },
                {
                  id: 5,
                  name: 'Jane Doe',
                  role: 'Client',
                  lastMessage: 'I have some questions about the settlement',
                  time: '3d ago',
                  unread: 0,
                  avatar: 'JD'
                },
              ].map((conversation) => (
                <div 
                  key={conversation.id} 
                  className={`p-4 hover:bg-legal-bg cursor-pointer transition-colors ${
                    conversation.id === 1 ? 'bg-legal-active' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-legal-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">{conversation.avatar}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-legal-text-primary truncate">
                          {conversation.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-legal-text-sub">{conversation.time}</span>
                          {conversation.unread > 0 && (
                            <span className="w-5 h-5 bg-legal-primary text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-legal-text-badge mb-1">{conversation.role}</p>
                      <p className="text-sm text-legal-text-sub truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Message Thread */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-legal-active flex flex-col h-[600px]">
            {/* Thread Header */}
            <div className="p-4 border-b border-legal-active">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-legal-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JS</span>
                </div>
                <div>
                  <h3 className="font-medium text-legal-text-primary">John Smith</h3>
                  <p className="text-sm text-legal-text-sub">Client · Case: CS-2026-001</p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex justify-start">
                <div className="max-w-sm">
                  <div className="bg-legal-bg p-3 rounded-lg">
                    <p className="text-sm text-legal-text-primary">
                      Hi, I wanted to check on the status of my contract dispute case. Have there been any updates?
                    </p>
                  </div>
                  <p className="text-xs text-legal-text-sub mt-1">John Smith • 3 hours ago</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="max-w-sm">
                  <div className="bg-legal-primary p-3 rounded-lg">
                    <p className="text-sm text-white">
                      Hello John, thank you for reaching out. We've made significant progress on your case. The opposing counsel has responded to our initial demands, and we're currently reviewing their counter-proposal.
                    </p>
                  </div>
                  <p className="text-xs text-legal-text-sub mt-1 text-right">You • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="max-w-sm">
                  <div className="bg-legal-bg p-3 rounded-lg">
                    <p className="text-sm text-legal-text-primary">
                      That's great news! What's the next step? Should I prepare any additional documents?
                    </p>
                  </div>
                  <p className="text-xs text-legal-text-sub mt-1">John Smith • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="max-w-sm">
                  <div className="bg-legal-primary p-3 rounded-lg">
                    <p className="text-sm text-white">
                      I'll need you to review the settlement terms and provide any additional financial records from 2024. I'll send you a detailed email shortly with everything we need.
                    </p>
                  </div>
                  <p className="text-xs text-legal-text-sub mt-1 text-right">You • 2 hours ago</p>
                </div>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-legal-active">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full p-3 border border-legal-active rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-legal-primary focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-legal-active text-legal-text-primary hover:bg-legal-active"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-9 9 9v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-legal-primary hover:bg-legal-primary/90 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}