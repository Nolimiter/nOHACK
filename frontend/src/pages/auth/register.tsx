import { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

const RegisterPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Паролі не збігаються');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Пароль має містити принаймні 8 символів');
      return;
    }
    
    setLoading(true);

    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
      <Head>
        <title>Реєстрація - HackEX</title>
        <meta name="description" content="Створіть обліковий запис HackEX" />
      </Head>

      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-40">Створити обліковий запис</h1>
        
        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2">Ім'я користувача</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Введіть ваше ім'я користувача"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2">Електронна пошта</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Введіть вашу електронну пошту"
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
              placeholder="Створіть пароль"
              required
              minLength={8}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2">Підтвердіть пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Повторіть пароль"
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
            {loading ? 'Реєстрація...' : 'Створити обліковий запис'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Вже маєте обліковий запис?{' '}
            <Link href="/auth/login" className="text-green-400 hover:underline">
              Увійти
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

export default RegisterPage;