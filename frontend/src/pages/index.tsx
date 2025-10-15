import { NextPage } from 'next';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

const HomePage: NextPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>nOHACK - Веб-браузерна гра "Хакерський симулятор"</title>
        <meta name="description" content="nOHACK - це багатокористувацька веб-гра в жанрі симулятора хакера" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center py-6">
          <div className="text-2xl font-bold text-green-40">nOHACK</div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#features" className="hover:text-green-40 transition-colors">Можливості</a></li>
              <li><a href="#how-it-works" className="hover:text-green-400 transition-colors">Як грати</a></li>
              <li><a href="#community" className="hover:text-green-40 transition-colors">Спільнота</a></li>
              {!isAuthenticated ? (
                <>
                  <li><Link href="/auth/login" className="hover:text-green-400 transition-colors">Увійти</Link></li>
                  <li><Link href="/auth/register" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">Реєстрація</Link></li>
                </>
              ) : (
                <li><Link href="/game/dashboard" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">До гри</Link></li>
              )}
            </ul>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Веб-браузерна гра "Хакерський симулятор"</h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Приєднуйтесь до найбільшої мережі хакерів у віртуальному світі. Проводіть кібератаки, захищайте свої системи, розвивайте інфраструктуру та змагайтеся за домінування в кіберпросторі.
          </p>
          {!isAuthenticated ? (
            <div className="space-x-4">
              <Link href="/auth/register" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                Почати грати
              </Link>
              <Link href="/auth/login" className="border-2 border-green-600 text-green-400 hover:bg-green-600 hover:text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                Увійти
              </Link>
            </div>
          ) : (
            <Link href="/game/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Продовжити гру
            </Link>
          )}
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Основні можливості</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-green-400">Система зламу</h3>
              <p>Використовуйте різні методи атак: DDoS, SQL-ін'єкції, ренсомвейри та інші. Кожна атака вимагає різних навичок та ресурсів.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-green-400">Система захисту</h3>
              <p>Налаштуйте фаєрвол, IDS/IPS, систему реагування на інциденти. Захищайте свої системи від інших гравців.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-green-400">Економічна система</h3>
              <p>Створюйте та продавайте експлуатаційні вразливості, вкрадені дані, обладнання на внутрішньому ринку. Керуйте своїми ресурсами.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Як грати</h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start mb-10">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Створіть аккаунт</h3>
                <p>Зареєструйте свій обліковий запис і створіть свій перший хакерський профіль. Оберіть свою першу спеціалізацію.</p>
              </div>
            </div>
            <div className="flex items-start mb-10">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Навчіться основам</h3>
                <p>Пройдіть навчальні місії, щоб зрозуміти основи зламу та захисту. Навчіться використовувати інструменти та методи.</p>
              </div>
            <div className="flex items-start">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Почніть свою кампанію</h3>
                <p>Виберіть свою першу ціль, сплануйте атаку та виконайте її. Збирайте ресурси, розвивайте навички, збільшуйте свій вплив.</p>
              </div>
            </div>
          </div>
            <div className="flex items-start">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Почніть свою кампанію</h3>
                <p>Виберіть свою першу ціль, сплануйте атаку та виконайте її. Збирайте ресурси, розвивайте навички, збільшуйте свій вплив.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Готові до виклику?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Приєднуйтесь до тисяч гравців, які вже борються за домінування в кіберпросторі.
          </p>
          {!isAuthenticated ? (
            <Link href="/auth/register" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition-colors">
              Почати зараз
            </Link>
          ) : (
            <Link href="/game/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition-colors">
              До своєї панелі
            </Link>
          )}
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-500 border-t border-gray-800">
          <p>© {new Date().getFullYear()} nOHACK. Всі права захищені.</p>
          <p className="mt-2">Ця гра створена виключно для освітніх цілей. Не застосовуйте отримані знання в реальному світі без дозволу.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;