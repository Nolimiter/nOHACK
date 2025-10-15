import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const DefensePage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected, gameData } = useGame();
  const [firewallActive, setFirewallActive] = useState(true);
  const [idsActive, setIdsActive] = useState(false);
  const [antivirusLevel, setAntivirusLevel] = useState(2);
  const [ipsActive, setIpsActive] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="mb-6">Будь ласка, увійдіть до свого облікового запису, щоб отримати доступ до системи захисту.</p>
          <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  const toggleFirewall = () => {
    setFirewallActive(!firewallActive);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Система захисту - nOHACK</title>
        <meta name="description" content="Система захисту в nOHACK" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      {/* Mobile-friendly header */}
      <header className="py-4 px-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
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
        <div className="flex flex-col md:flex-row gap-6">
          {/* Defense controls - mobile optimized */}
          <div className="md:w-2/3">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4 text-green-400">Система захисту</h1>
              
              {/* Firewall controls */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold">Фаєрвол</h2>
                  <button
                    onClick={toggleFirewall}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      firewallActive ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        firewallActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {firewallActive 
                    ? 'Фаєрвол активний. Блокує небезпечні з\'єднання.' 
                    : 'Фаєрвол вимкнено. Система вразлива до атак.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">12</div>
                    <div className="text-xs">Блоковано</div>
                  </div>
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">8</div>
                    <div className="text-xs">Дозволено</div>
                  </div>
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">3</div>
                    <div className="text-xs">Підозріло</div>
                  </div>
                </div>
              </div>
              
              {/* IDS/IPS controls */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-lg font-bold">IDS/IPS</h2>
                    <p className="text-sm text-gray-400">Система виявлення/запобігання вторгнень</p>
                  </div>
                  <button
                    onClick={() => setIdsActive(!idsActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      idsActive ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        idsActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">24</div>
                    <div className="text-xs">Подій</div>
                  </div>
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">5</div>
                    <div className="text-xs">Атак</div>
                  </div>
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">85%</div>
                    <div className="text-xs">Точність</div>
                  </div>
                  <div className="bg-gray-600 p-3 rounded text-center">
                    <div className="text-lg font-bold">0.2s</div>
                    <div className="text-xs">Латентність</div>
                  </div>
                </div>
              </div>
              
              {/* Antivirus */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-lg font-bold">Антивірус</h2>
                    <p className="text-sm text-gray-400">Рівень захисту: {antivirusLevel}/5</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Прогрес сканування</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setAntivirusLevel(level)}
                      className={`px-3 py-1 rounded ${
                        antivirusLevel === level
                          ? 'bg-green-600 border-2 border-green-400'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    >
                      Рівень {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent threats - mobile responsive */}
            <div className="bg-gray-800 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">Останні загрози</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Спроба {item} DDoS</div>
                        <div className="text-sm text-gray-400">Заблоковано • 10 хв тому</div>
                      </div>
                      <div className="text-red-400">Високий</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Stats sidebar - mobile responsive */}
          <div className="md:w-1/3">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-green-400">Захист системи</h2>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span>Загальний захист</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-700 p-3 rounded text-center">
                  <div className="text-lg font-bold">{user?.level || 1}</div>
                  <div className="text-xs">Рівень</div>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <div className="text-lg font-bold">{user?.reputation || 0}</div>
                  <div className="text-xs">Репутація</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">Статус захисту</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Фаєрвол</span>
                    <span className={firewallActive ? 'text-green-400' : 'text-red-400'}>
                      {firewallActive ? 'Активний' : 'Вимкнений'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IDS</span>
                    <span className={idsActive ? 'text-green-400' : 'text-red-400'}>
                      {idsActive ? 'Активний' : 'Вимкнений'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IPS</span>
                    <span className={ipsActive ? 'text-green-400' : 'text-red-400'}>
                      {ipsActive ? 'Активний' : 'Вимкнений'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Найближчі оновлення</h3>
                <div className="space-y-2">
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="flex justify-between">
                      <span>WAF v2.1</span>
                      <span className="text-green-400">1500 REP</span>
                    </div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Honeypot Pro</span>
                      <span className="text-green-400">2200 REP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DefensePage;