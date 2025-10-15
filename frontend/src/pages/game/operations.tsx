import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const OperationsPage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected, operations, startOperation, cancelOperation } = useGame();
  const [activeTab, setActiveTab] = useState('active');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="mb-6">Будь ласка, увійдіть до свого облікового запису, щоб отримати доступ до операцій.</p>
          <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for operations
  const mockOperations = [
    { id: 1, type: 'DDoS', target: '192.168.1.100', progress: 65, status: 'active', duration: '00:15:32', reward: 150 },
    { id: 2, type: 'SQL-ін\'єкція', target: 'bank.example.com', progress: 30, status: 'active', duration: '00:05:45', reward: 300 },
    { id: 3, type: 'Брутфорс', target: 'admin.server.com', progress: 100, status: 'completed', duration: '00:10:20', reward: 200 },
    { id: 4, type: 'Сканування', target: '10.0.0.0/24', progress: 100, status: 'completed', duration: '00:02:10', reward: 50 },
  ];

  const activeOperations = mockOperations.filter(op => op.status === 'active');
  const completedOperations = mockOperations.filter(op => op.status === 'completed');
  const pendingOperations = mockOperations.filter(op => op.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Операції - nOHACK</title>
        <meta name="description" content="Система операцій nOHACK" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      {/* Mobile-friendly header */}
      <header className="py-4 px-4 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <Link href="/game/dashboard" className="text-green-400 text-xl font-bold">nOHACK</Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{connected ? 'Підключено' : 'Відключено'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{user?.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-first main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0 text-green-400">Система операцій</h1>
            
            {/* Mobile-friendly tabs */}
            <div className="flex flex-wrap gap-2">
              {['active', 'completed', 'pending'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded ${
                    activeTab === tab
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {tab === 'active' && 'Активні'}
                  {tab === 'completed' && 'Завершені'}
                  {tab === 'pending' && 'Очікують'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Operations list - mobile responsive */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-left">Тип</th>
                  <th className="py-3 text-left hidden md:table-cell">Ціль</th>
                  <th className="py-3 text-left">Прогрес</th>
                  <th className="py-3 text-left hidden sm:table-cell">Тривалість</th>
                  <th className="py-3 text-left">Нагорода</th>
                  <th className="py-3 text-left">Дії</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'active' ? activeOperations : 
                  activeTab === 'completed' ? completedOperations : 
                  pendingOperations).map((operation) => (
                  <tr key={operation.id} className="border-b border-gray-700 last:border-0">
                    <td className="py-3">
                      <div className="font-bold">{operation.type}</div>
                      <div className="text-sm text-gray-400 md:hidden">Ціль: {operation.target}</div>
                    </td>
                    <td className="py-3 hidden md:table-cell">{operation.target}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${operation.progress}%` }}
                          ></div>
                        </div>
                        <span>{operation.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 hidden sm:table-cell">{operation.duration}</td>
                    <td className="py-3">
                      <span className="text-green-400">{operation.reward} REP</span>
                    </td>
                    <td className="py-3">
                      {operation.status === 'active' ? (
                        <button
                          onClick={() => cancelOperation(operation.id.toString())}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                          Скасувати
                        </button>
                      ) : operation.status === 'completed' ? (
                        <span className="text-green-400 text-sm">Завершено</span>
                      ) : (
                        <button
                          onClick={() => startOperation(operation.type, operation.target)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                        >
                          Розпочати
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {activeTab === 'active' && activeOperations.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Немає активних операцій
            </div>
          )}
          
          {activeTab === 'completed' && completedOperations.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Немає завершених операцій
            </div>
          )}
          
          {activeTab === 'pending' && pendingOperations.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Немає очікуючих операцій
            </div>
          )}
        </div>
        
        {/* Operation controls - mobile responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Почати нову операцію</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Тип операції</label>
                <select className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white">
                  <option>DDoS-атака</option>
                  <option>SQL-ін'єкція</option>
                  <option>Сканування мережі</option>
                  <option>Брутфорс</option>
                  <option>Соціальна інженерія</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2">Цільова IP-адреса</label>
                <input
                  type="text"
                  placeholder="Введіть IP-адресу цілі"
                  className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                />
              </div>
              
              <div>
                <label className="block mb-2">Рівень агресивності</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      Рівень {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold">
                Розпочати операцію (50 REP)
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Статистика операцій</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">24</div>
                <div className="text-xs">Всього</div>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">18</div>
                <div className="text-xs">Успішних</div>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">85%</div>
                <div className="text-xs">Успішність</div>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">150</div>
                <div className="text-xs">Отримано REP</div>
              </div>
            </div>
            
            <h3 className="font-bold mb-3">Останні операції</h3>
            <div className="space-y-3">
              {mockOperations.slice(0, 3).map((op) => (
                <div key={op.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold">{op.type}</div>
                    <div className="text-sm text-gray-400">{op.target} • {op.duration}</div>
                  </div>
                  <div className={`text-sm ${op.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {op.reward} REP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperationsPage;