import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const MarketPage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected, gameData } = useGame();
  const [activeTab, setActiveTab] = useState('tools');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="mb-6">Будь ласка, увійдіть до свого облікового запису, щоб отримати доступ до ринку.</p>
          <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for market items
  const marketItems = {
    tools: [
      { id: 1, name: 'Nmap Pro', price: 50, description: 'Просунутий сканер мережі', category: 'tools' },
      { id: 2, name: 'Metasploit Pro', price: 120, description: 'Фреймворк для експлойтів', category: 'tools' },
      { id: 3, name: 'Wireshark Ultimate', price: 80, description: 'Аналізатор трафіку', category: 'tools' },
      { id: 4, name: 'Hydra++', price: 75, description: 'Брутфорс інструмент', category: 'tools' },
    ],
    exploits: [
      { id: 5, name: 'Zero Day Exploit', price: 500, description: 'Уразливість нульового дня', category: 'exploits' },
      { id: 6, name: 'Kernel Exploit', price: 300, description: 'Експлойт ядра системи', category: 'exploits' },
      { id: 7, name: 'Browser Zero-Day', price: 400, description: 'Уразливість браузера', category: 'exploits' },
    ],
    data: [
      { id: 8, name: 'Database Dumps', price: 200, description: 'Дампи баз даних', category: 'data' },
      { id: 9, name: 'Credit Cards', price: 150, description: 'Вкрадені карти', category: 'data' },
      { id: 10, name: 'Personal Info', price: 100, description: 'Персональні дані', category: 'data' },
    ]
  };

  const handleBuyItem = (item: any) => {
    if (user?.bitcoins && user.bitcoins >= item.price) {
      alert(`Придбано: ${item.name} за ${item.price} BTC`);
      // In a real app, this would make an API call to purchase the item
    } else {
      alert('Недостатньо коштів для покупки');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Ринок - nOHACK</title>
        <meta name="description" content="Внутрішній ринок nOHACK" />
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
          {/* Market content - mobile optimized */}
          <div className="md:w-2/3">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4 text-green-400">Внутрішній ринок</h1>
              
              {/* Mobile-friendly tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['tools', 'exploits', 'data'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded ${
                      activeTab === tab
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {tab === 'tools' && 'Інструменти'}
                    {tab === 'exploits' && 'Експлойти'}
                    {tab === 'data' && 'Дані'}
                  </button>
                ))}
              </div>
              
              {/* Items grid - mobile responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketItems[activeTab as keyof typeof marketItems].map((item) => (
                  <div 
                    key={item.id} 
                    className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-transform hover:scale-[1.02] ${
                      selectedItem?.id === item.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className="text-green-400 font-bold">{item.price} BTC</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyItem(item);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm"
                    >
                      Купити
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Auction section - mobile responsive */}
            <div className="bg-gray-800 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 text-green-400">Аукціон</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((auction) => (
                  <div key={auction} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Експлойт для Windows {auction}</h3>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Поточна ставка:</span>
                      <span className="text-green-400">150 BTC</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span>Закінчується:</span>
                      <span>4:22:10</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Ваша ставка"
                        className="flex-1 px-2 py-1 bg-gray-600 rounded text-white text-sm"
                      />
                      <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                        Ставка
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Item details sidebar - mobile responsive */}
          <div className="md:w-1/3">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-green-400">Деталі предмета</h2>
              
              {selectedItem ? (
                <div>
                  <h3 className="text-lg font-bold mb-2">{selectedItem.name}</h3>
                  <p className="text-gray-300 mb-4">{selectedItem.description}</p>
                  
                  <div className="mb-4 p-3 bg-gray-700 rounded">
                    <div className="flex justify-between mb-1">
                      <span>Ціна:</span>
                      <span className="text-green-400 font-bold">{selectedItem.price} BTC</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Категорія:</span>
                      <span>
                        {selectedItem.category === 'tools' && 'Інструменти'}
                        {selectedItem.category === 'exploits' && 'Експлойти'}
                        {selectedItem.category === 'data' && 'Дані'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBuyItem(selectedItem)}
                    className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold"
                  >
                    Купити за {selectedItem.price} BTC
                  </button>
                </div>
              ) : (
                <p className="text-gray-400">Оберіть предмет для перегляду деталей</p>
              )}
              
              <div className="mt-6">
                <h3 className="font-bold mb-2">Ваші ресурси</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 p-3 rounded text-center">
                    <div className="text-lg font-bold">{user?.bitcoins?.toFixed(2) || '100.00'}</div>
                    <div className="text-xs">BTC</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded text-center">
                    <div className="text-lg font-bold">{user?.reputation || 0}</div>
                    <div className="text-xs">REP</div>
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

export default MarketPage;