import { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

const LoginPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
      <Head>
        <title>Увійти - nOHACK</title>
        <meta name="description" content="Увійдіть до свого облікового запису nOHACK" />
      </Head>

      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-400">Увійти до nOHACK</h1>
        
        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2">Ім'я користувача або електронна пошта</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Введіть ваше ім'я користувача або електронну пошту"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Введіть ваш пароль"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-bold transition-colors ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Немає облікового запису?{' '}
            <Link href="/auth/register" className="text-green-400 hover:underline">
              Зареєструватися
            </Link>
          </p>
          <p className="text-gray-400 mt-2">
            <Link href="/" className="text-green-400 hover:underline">
              Повернутися на головну
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;