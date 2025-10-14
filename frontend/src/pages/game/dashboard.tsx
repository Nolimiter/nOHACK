import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Панель керування - HackEX</title>
        <meta name="description" content="Ваша панель керування в HackEX" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b border-gray-800">
          <div className="text-2xl font-bold text-green-400">HackEX</div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">{connected ? 'Підключено' : 'Відключено'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-bold">{user?.username}</div>
                <div className="text-sm text-gray-400">Рівень {user?.level || 1}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <section className="py-8">
          <h1 className="text-3xl font-bold mb-6">Панель керування</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-40">{user?.bitcoins?.toFixed(2) || '100.00'}</div>
              <div className="text-gray-400">Біткойни</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{user?.reputation || 0}</div>
              <div className="text-gray-400">Репутація</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{user?.level || 1}</div>
              <div className="text-gray-400">Рівень</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-40">{user?.experience || 0}</div>
              <div className="text-gray-400">Досвід</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Швидкі дії</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/game/hack" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors">
              <div className="text-4xl mb-2">🔓</div>
              <div>Злам</div>
            </Link>
            <Link href="/game/defense" className="bg-gray-800 hover:bg-gray-70 p-6 rounded-lg text-center transition-colors">
              <div className="text-4xl mb-2">🔒</div>
              <div>Захист</div>
            </Link>
            <Link href="/market" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors">
              <div className="text-4xl mb-2">🛒</div>
              <div>Ринок</div>
            </Link>
            <Link href="/game/skills" className="bg-gray-800 hover:bg-gray-70 p-6 rounded-lg text-center transition-colors">
              <div className="text-4xl mb-2">🧠</div>
              <div>Навички</div>
            </Link>
          </div>
        </section>

        {/* Active Operations */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Активні операції</h2>
            <Link href="/game/operations" className="text-green-400 hover:underline">Переглянути всі</Link>
          </div>
          {operations && operations.length > 0 ? (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {operations.map((operation) => (
                <div key={operation.id} className="p-4 border-b border-gray-700 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{operation.type}</div>
                      <div className="text-sm text-gray-400">Ціль: {operation.targetId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{operation.progress}%</div>
                      <div className="text-sm text-gray-400">{operation.status}</div>
                    </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                       <div
                                         className="bg-green-600 h-2.5 rounded-full"
                                         style={{ width: `${operation.progress}%` }}
                                       ></div>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             ) : (
                               <div className="bg-gray-800 p-8 rounded-lg text-center">
                                 <p>У вас немає активних операцій</p>
                                 <Link href="/game/hack" className="text-green-400 hover:underline mt-2 inline-block">
                                   Розпочати нову операцію
                                 </Link>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="bg-gray-800 p-8 rounded-lg text-center">
                         <p>У вас немає активних операцій</p>
                         <Link href="/game/hack" className="text-green-400 hover:underline mt-2 inline-block">
                           Розпочати нову операцію
                         </Link>
                       </div>
                     )}
                   </section>
                 </section>
               </section>
           </section>
         </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Остання активність</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <p>Остання активність поки не реалізована</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;