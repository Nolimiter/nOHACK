import { NextPage } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const SkillsPage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected, gameData } = useGame();
  const [activeTab, setActiveTab] = useState('skills');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="mb-6">Будь ласка, увійдіть до свого облікового запису, щоб отримати доступ до навичок.</p>
          <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for skills
  const skills = [
    { id: 1, name: 'Сканування', level: 5, maxLevel: 10, description: 'Збільшує ефективність сканерів' },
    { id: 2, name: 'Експлойти', level: 3, maxLevel: 10, description: 'Покращує шанс успіху експлойтів' },
    { id: 3, name: 'Безпека', level: 4, maxLevel: 10, description: 'Покращує захист систем' },
    { id: 4, name: 'Криптографія', level: 2, maxLevel: 10, description: 'Покращує шифрування та обхід' },
    { id: 5, name: 'Соціальна інженерія', level: 1, maxLevel: 10, description: 'Покращує фішингові атаки' },
  ];

  // Mock data for technologies
  const technologies = [
    { id: 1, name: 'Linux Exploitation', level: 3, maxLevel: 5, description: 'Експлойти для систем Linux' },
    { id: 2, name: 'Windows Security', level: 2, maxLevel: 5, description: 'Захист систем Windows' },
    { id: 3, name: 'Network Protocols', level: 4, maxLevel: 5, description: 'Розуміння мережевих протоколів' },
  ];

  const handleUpgradeSkill = (skillId: number) => {
    // In a real app, this would make an API call to upgrade the skill
    alert(`Навичка оновлена: ${skills.find(s => s.id === skillId)?.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Навички - nOHACK</title>
        <meta name="description" content="Система навичок nOHACK" />
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
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 text-green-400">Система прогресу</h1>
          
          {/* Mobile-friendly tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['skills', 'technologies', 'achievements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {tab === 'skills' && 'Навички'}
                {tab === 'technologies' && 'Технології'}
                {tab === 'achievements' && 'Досягнення'}
              </button>
            ))}
          </div>
          
          {/* Skills grid - mobile responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'skills' && skills.map((skill) => (
              <div key={skill.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{skill.name}</h3>
                  <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">
                    Рівень {skill.level}/{skill.maxLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{skill.description}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Прогрес</span>
                    <span>{Math.round((skill.level / skill.maxLevel) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleUpgradeSkill(skill.id)}
                  disabled={skill.level >= skill.maxLevel}
                  className={`w-full py-2 rounded text-sm ${
                    skill.level >= skill.maxLevel
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {skill.level >= skill.maxLevel ? 'Макс. рівень' : 'Покращити (100 REP)'}
                </button>
              </div>
            ))}
            
            {activeTab === 'technologies' && technologies.map((tech) => (
              <div key={tech.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{tech.name}</h3>
                  <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">
                    Рівень {tech.level}/{tech.maxLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{tech.description}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Прогрес</span>
                    <span>{Math.round((tech.level / tech.maxLevel) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(tech.level / tech.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <button
                  onClick={() => alert(`Технологія оновлена: ${tech.name}`)}
                  disabled={tech.level >= tech.maxLevel}
                  className={`w-full py-2 rounded text-sm ${
                    tech.level >= tech.maxLevel
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {tech.level >= tech.maxLevel ? 'Макс. рівень' : 'Покращити (200 REP)'}
                </button>
              </div>
            ))}
            
            {activeTab === 'achievements' && (
              <div className="col-span-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((ach) => (
                    <div key={ach} className="bg-gray-700 rounded-lg p-4 flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        ach <= 3 ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {ach <= 3 ? '🏆' : '🔒'}
                      </div>
                      <div>
                        <h3 className="font-bold">Досягнення {ach}</h3>
                        <p className="text-sm text-gray-300">Опис досягнення {ach}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {ach <= 3 ? 'Отримано' : 'Заблоковано'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress summary - mobile responsive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Ваш прогрес</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Загальний рівень</span>
                  <span>{user?.level || 1}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Досвід</span>
                  <span>{user?.experience || 0} / 1000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Репутація</span>
                  <span>{user?.reputation || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-green-400">Статистика</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">24</div>
                <div className="text-xs">Успішних атак</div>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">18</div>
                <div className="text-xs">Заблокованих атак</div>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">150</div>
                <div className="text-xs">Днів у грі</div>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <div className="text-xl font-bold">5</div>
                <div className="text-xs">Досягнень</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillsPage;