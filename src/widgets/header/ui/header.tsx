import { config } from '@/shared/config';

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {config.appName}
          </h1>
          <nav className="flex items-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Cases
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Profile
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}