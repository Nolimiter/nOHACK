import { NextPage } from 'next';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import MobileLayout from '../components/MobileLayout';

const HomePage: NextPage = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <MobileLayout title="nOHACK" showBackButton={false}>
      <Head>
        <title>nOHACK - Веб-браузерна гра "Хакерський симулятор"</title>
        <meta name="description" content="nOHACK - це багатокористувацька веб-гра в жанрі симулятора хакера" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="py-6 md:py-10 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 px-2">Веб-браузерна гра "Хакерський симулятор"</h1>
          <p className="text-sm md:text-lg text-gray-300 mb-5 md:mb-7 max-w-2xl mx-auto px-4">
            Приєднуйтесь до найбільшої мережі хакерів у віртуальному світі. Проводіть кібератаки, захищайте свої системи, розвивайте інфраструктуру та змагайтеся за домінування в кіберпросторі.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
              <Link href="/auth/register" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors text-center">
                Почати грати
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto border-2 border-green-600 text-green-400 hover:bg-green-600 hover:text-white font-bold py-3 px-6 rounded-lg text-base transition-colors text-center">
                Увійти
              </Link>
            </div>
          ) : (
            <Link href="/game/dashboard" className="inline-block w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors mx-4">
              Продовжити гру
            </Link>
          )}
        </section>

        {/* Features Section */}
        <section className="py-6 md:py-10">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-5 md:mb-7">Основні можливості</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2 md:mb-3 text-green-400">Система зламу</h3>
              <p className="text-xs sm:text-sm md:text-base">Використовуйте різні методи атак: DDoS, SQL-ін'єкції, ренсомвейри та інші. Кожна атака вимагає різних навичок та ресурсів.</p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2 md:mb-3 text-green-400">Система захисту</h3>
              <p className="text-xs sm:text-sm md:text-base">Налаштуйте фаєрвол, IDS/IPS, систему реагування на інциденти. Захищайте свої системи від інших гравців.</p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2 md:mb-3 text-green-400">Економічна система</h3>
              <p className="text-xs sm:text-sm md:text-base">Створюйте та продавайте експлуатаційні вразливості, вкрадені дані, обладнання на внутрішньому ринку. Керуйте своїми ресурсами.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-6 md:py-10">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-5 md:mb-7">Як грати</h2>
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex items-start">
              <div className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold text-sm">1</div>
              <div>
                <h3 className="text-base md:text-lg font-bold mb-1">Створіть аккаунт</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">Зареєструйте свій обліковий запис і створіть свій перший хакерський профіль. Оберіть свою першу спеціалізацію.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold text-sm">2</div>
              <div>
                <h3 className="text-base md:text-lg font-bold mb-1">Навчіться основам</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">Пройдіть навчальні місії, щоб зрозуміти основи зламу та захисту. Навчіться використовувати інструменти та методи.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold text-sm">3</div>
              <div>
                <h3 className="text-base md:text-lg font-bold mb-1">Почніть свою кампанію</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">Виберіть свою першу ціль, сплануйте атаку та виконайте її. Збирайте ресурси, розвивайте навички, збільшуйте свій вплив.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 md:py-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Готові до виклику?</h2>
          <p className="text-sm md:text-lg text-gray-300 mb-5 md:mb-7 max-w-xl mx-auto px-4">
            Приєднуйтесь до тисяч гравців, які вже борються за домінування в кіберпросторі.
          </p>
          {!isAuthenticated ? (
            <Link href="/auth/register" className="inline-block w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-base transition-colors mx-4">
              Почати зараз
            </Link>
          ) : (
            <Link href="/game/dashboard" className="inline-block w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-base transition-colors mx-4">
              До своєї панелі
            </Link>
          )}
        </section>

        {/* Footer */}
        <footer className="py-5 text-center text-gray-500 border-t border-gray-800">
          <p className="text-xs sm:text-sm md:text-base">© {new Date().getFullYear()} nOHACK. Всі права захищені.</p>
          <p className="mt-2 text-xs sm:text-xs md:text-sm px-4">Ця гра створена виключно для освітніх цілей. Не застосовуйте отримані знання в реальному світі без дозволу.</p>
        </footer>
      </div>
    </MobileLayout>
  );
};

export default HomePage;