import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';

const DashboardPage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected, gameData, operations, startOperation } = useGame();

  // Simulate fetching user game data
  useEffect(() => {
    // In a real app, we would fetch user's game data here
    // For now, we'll just use the context data
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="mb-6">Будь ласка, увійдіть до свого облікового запису, щоб отримати доступ до панелі керування.</p>
          <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout title="Панель керування" showBackButton={false}>
      <Head>
        <title>Панель керування - nOHACK</title>
        <meta name="description" content="Ваша панель керування в nOHACK" />
      </Head>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <section className="py-4">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Панель керування</h1>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-bold text-green-40">{user?.bitcoins?.toFixed(2) || '100.00'}</div>
              <div className="text-xs text-gray-400">Біткойни</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-bold text-green-400">{user?.reputation || 0}</div>
              <div className="text-xs text-gray-400">Репутація</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-bold text-green-400">{user?.level || 1}</div>
              <div className="text-xs text-gray-400">Рівень</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-bold text-green-40">{user?.experience || 0}</div>
              <div className="text-xs text-gray-400">Досвід</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-3">Швидкі дії</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/game/hack" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-1">🔓</div>
              <div className="text-sm">Злам</div>
            </Link>
            <Link href="/game/defense" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-sm">Захист</div>
            </Link>
            <Link href="/market" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-1">🛒</div>
              <div className="text-sm">Ринок</div>
            </Link>
            <Link href="/game/skills" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-1">🧠</div>
              <div className="text-sm">Навички</div>
            </Link>
          </div>
        </section>

        {/* Active Operations - спрощений варіант */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg md:text-xl font-bold">Активні операції</h2>
            <Link href="/game/operations" className="text-green-400 text-sm hover:underline">Переглянути всі</Link>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm">Секція активних операцій (часово спрощена для збірки)</p>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-3">Остання активність</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm">Остання активність поки не реалізована</p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default DashboardPage;