import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

const MobileLayout = ({ children, title, showBackButton = false, backUrl = '/game/dashboard' }: MobileLayoutProps) => {
  const { user, isAuthenticated } = useAuth();
  const { connected } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Mobile-optimized header */}
      <header className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 py-3 px-4">
        <div className="flex items-center justify-between">
          {showBackButton ? (
            <Link href={backUrl} className="text-green-400 text-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <div className="w-6"></div> // Spacer for alignment
          )}
          
          <h1 className="text-lg font-bold text-center flex-1 px-6">{title}</h1>
          
          <button
            className="text-green-400 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/80" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-gray-800 p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Link 
                href="/game/dashboard" 
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Панель керування
              </Link>
              <Link 
                href="/game/hack" 
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Система зламу
              </Link>
              <Link 
                href="/game/defense" 
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Система захисту
              </Link>
              <Link 
                href="/market" 
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ринок
              </Link>
              <Link 
                href="/game/skills" 
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Навички
              </Link>
              <Link 
                href="/game/operations" 
                className="block py-2 px-4 rounded hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Операції
              </Link>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <div className="flex items-center space-x-3 p-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{user?.username}</div>
                    <div className="text-sm text-gray-400">Рівень {user?.level || 1}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 p-2">
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{connected ? 'Підключено' : 'Відключено'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-16">
        {children}
      </main>

      {/* Mobile navigation footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden">
        <div className="flex justify-around py-2">
          <Link href="/game/dashboard" className="flex flex-col items-center p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Панель</span>
          </Link>
          <Link href="/game/hack" className="flex flex-col items-center p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs mt-1">Злам</span>
          </Link>
          <Link href="/game/defense" className="flex flex-col items-center p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs mt-1">Захист</span>
          </Link>
          <Link href="/market" className="flex flex-col items-center p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs mt-1">Ринок</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default MobileLayout;