'use client';

const handleNavClick = (section: string) => {
  // TODO: Implementar navegação quando as páginas estiverem prontas
  console.warn(`Navigation to ${section} - página em desenvolvimento`);
};

const handleDemoClick = () => {
  // TODO: Implementar modal de demo ou redirecionar para vídeo
  console.warn('Demo modal - funcionalidade em desenvolvimento');
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 border-b bg-white px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-white">
              <span className="text-sm font-bold">A</span>
            </div>
            <span className="text-xl font-bold">Acme</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              type="button"
              className="text-sm hover:text-blue-600 cursor-pointer"
              onClick={() => handleNavClick('Product')}
            >
              Product
            </button>
            <button
              type="button"
              className="text-sm hover:text-blue-600 cursor-pointer"
              onClick={() => handleNavClick('Pricing')}
            >
              Pricing
            </button>
            <button
              type="button"
              className="text-sm hover:text-blue-600 cursor-pointer"
              onClick={() => handleNavClick('Blog')}
            >
              Blog
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <a
              href="http://localhost:3001/auth/sign-in"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign in
            </a>
            <a
              href="http://localhost:3001/auth/sign-up"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Start for free
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-4 py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              ✅ Mais de 10.000 empresas confiam em nós
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your revolutionary
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Next.js SaaS
              </span>
            </h1>

            <p className="mb-8 text-xl text-gray-600 sm:text-2xl">
              This is a demo application built with Achromatic. It will save you
              time and effort building your next SaaS.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="http://localhost:3001/auth/sign-up"
                className="group inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700"
              >
                Start for free
                <span className="ml-2">→</span>
              </a>

              <button
                type="button"
                className="group inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleDemoClick}
              >
                <span className="mr-2">▶</span>
                Watch demo
              </button>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-gray-50 px-4 py-16">
          <div className="container mx-auto max-w-6xl">
            <p className="mb-8 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Trusted by leading companies
            </p>

            <div className="grid grid-cols-3 gap-8 md:grid-cols-6">
              {[
                '🏢 Acme Corp',
                '🚀 TechStart',
                '💡 InnovaCorp',
                '📊 DataFlow',
                '☁️ CloudTech',
                '🔮 NextGen',
              ].map(company => (
                <div
                  key={company}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-1">{company.split(' ')[0]}</div>
                  <span className="text-xs font-medium text-gray-500">
                    {company.split(' ').slice(1).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
