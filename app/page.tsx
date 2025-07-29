"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-500 flex items-center justify-center">
      <div className="text-center text-white space-y-6">
        <h1 className="text-6xl font-bold mb-4">
          NeonPro
        </h1>
        <p className="text-xl opacity-90">
          Revolução Digital para Clínicas Estéticas
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Começar Grátis
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
            Saiba Mais
          </button>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-yellow-300">+500</div>
            <div className="text-sm opacity-80">Clínicas Ativas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">98%</div>
            <div className="text-sm opacity-80">Satisfação</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">24/7</div>
            <div className="text-sm opacity-80">Suporte Técnico</div>
          </div>
        </div>
      </div>
    </div>
  );
}