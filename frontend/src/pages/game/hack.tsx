import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const HackPage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected, gameData, startOperation } = useGame();
  const [targetIP, setTargetIP] = useState('');
  const [attackType, setAttackType] = useState('ddos');
  const [selectedTool, setSelectedTool] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="mb-6">Будь ласка, увійдіть до свого облікового запису, щоб отримати доступ до системи зламу.</p>
          <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  const handleAttack = () => {
    if (!targetIP) {
      alert('Введіть IP-адресу цілі');
      return;
    }
    startOperation(attackType, targetIP);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Система зламу - nOHACK</title>
        <meta name="description" content="Система зламу в nOHACK" />
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
          {/* Attack controls - mobile optimized */}
          <div className="md:w-2/3">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4 text-green-400">Система зламу</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="targetIP" className="block mb-2">IP-адреса цілі</label>
                  <input
                    type="text"
                    id="targetIP"
                    value={targetIP}
                    onChange={(e) => setTargetIP(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    placeholder="Введіть IP цілі"
                  />
                </div>
                
                <div>
                  <label htmlFor="attackType" className="block mb-2">Тип атаки</label>
                  <select
                    id="attackType"
                    value={attackType}
                    onChange={(e) => setAttackType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  >
                    <option value="DDOS">DDoS</option>
                    <option value="SQL_INJECTION">SQL-ін'єкція</option>
                    <option value="RANSOMWARE">Ренсомвейр</option>
                    <option value="ZERO_DAY">Уразливість нульового дня</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="toolSelect" className="block mb-2">Оберіть інструмент</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['nmap', 'metasploit', 'wireshark', 'hydra', 'sqlmap', 'burp', 'nessus', 'nikto'].map((tool) => (
                    <button
                      key={tool}
                      onClick={() => setSelectedTool(tool)}
                      className={`p-3 rounded text-center ${
                        selectedTool === tool
                          ? 'bg-green-600 border-2 border-green-400'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleAttack}
                disabled={!targetIP || !selectedTool}
                className={`w-full py-3 rounded font-bold transition-colors ${
                  !targetIP || !selectedTool
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Розпочати атаку
              </button>
            </div>
            
            {/* Attack history - mobile responsive */}
            <div className="bg-gray-800 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">Історія атак</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">192.168.1.{item}</div>
                        <div className="text-sm text-gray-400">DDoS • Успішно • 10 хв тому</div>
                      </div>
                      <div className="text-green-400">+{item * 50} REP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Stats sidebar - mobile responsive */}
          <div className="md:w-1/3">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-green-400">Статистика</h2>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Біткойни</span>
                  <span>{user?.bitcoins?.toFixed(2) || '100.00'}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Репутація</span>
                  <span>{user?.reputation || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Досвід</span>
                  <span>{user?.experience || 0} / 1000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold mb-2">Активні атаки</h3>
                <div className="space-y-2">
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between">
                      <span>DDoS на 192.168.1.100</span>
                      <span className="text-green-400">65%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
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

export default HackPage;