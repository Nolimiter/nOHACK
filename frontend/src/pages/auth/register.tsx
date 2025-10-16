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

    // Check for uppercase, lowercase, number, and special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Пароль має містити принаймні одну велику літеру, одну малу літеру, одну цифру та один спеціальний символ (@$!%*?&)');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, confirmPassword);
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
      <Head>
        <title>Реєстрація - nOHACK</title>
        <meta name="description" content="Створіть обліковий запис nOHACK" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xs sm:max-w-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 text-green-40">Створити обліковий запис</h1>
        
        {error && (
          <div className="bg-red-900 text-red-200 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-1 text-sm">Ім'я користувача</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Введіть ваше ім'я користувача"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-sm">Електронна пошта</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Введіть вашу електронну пошту"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 text-sm">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Створіть пароль"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">
              Мінімум 8 символів, включаючи велику літеру, малу літеру, цифру та спецсимвол (@$!%*?&)
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-1 text-sm">Підтвердіть пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Повторіть пароль"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded font-bold transition-colors text-sm ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Реєстрація...' : 'Створити обліковий запис'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            Вже маєте обліковий запис?{' '}
            <Link href="/auth/login" className="text-green-400 hover:underline">
              Увійти
            </Link>
          </p>
          <p className="text-gray-400 mt-2 text-xs sm:text-sm">
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