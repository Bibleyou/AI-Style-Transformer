
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ClothingStyle, MusicalStyle, Scenario, Pose, TransformationConfig } from './types';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TransformationConfig>({
    style: ClothingStyle.URBAN,
    musicalStyle: MusicalStyle.NONE,
    scenario: Scenario.ROOM,
    pose: Pose.DANCE,
    accessories: ['Óculos de sol', 'Brincos']
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeStyle = async () => {
    if (!image) return;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("API Key não encontrada. Verifique as configurações.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      // Usando o Gemini 3 Flash que é gratuito no AI Studio (Free Tier)
      const prompt = `Analise esta foto e crie um ROTEIRO DE ESTILO VIRAL para o TikTok.
      ESTILO ESCOLHIDO: ${config.style}
      INFLUÊNCIA MUSICAL: ${config.musicalStyle}
      CENÁRIO: ${config.scenario}
      POSE SUGERIDA: ${config.pose}
      ACESSÓRIOS: ${config.accessories.join(', ')}

      Responda em Markdown estruturado:
      1. **Análise de Biotipo**: O que combina com a pessoa da foto.
      2. **O Look Ideal**: Descreva peça por peça (ex: 'Calça cargo bege com fivelas').
      3. **Dica de Iluminação**: Como usar o cenário ${config.scenario}.
      4. **Legenda Viral**: Sugira 2 legendas com hashtags.
      5. **Dica de Áudio**: Que tipo de música usar.
      
      Seja muito criativo, jovem e use gírias de TikTok.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }],
      });

      setAnalysis(response.text);
    } catch (err: any) {
      console.error(err);
      setError("Erro na consultoria: " + (err.message || "Tente novamente mais tarde."));
    } finally {
      setLoading(false);
    }
  };

  const toggleAccessory = (acc: string) => {
    setConfig(prev => ({
      ...prev,
      accessories: prev.accessories.includes(acc) 
        ? prev.accessories.filter(a => a !== acc)
        : [...prev.accessories, acc]
    }));
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {loading && <LoadingOverlay message="IA Analisando seu potencial viral..." />}
      
      <header className="sticky top-0 z-40 bg-black text-white py-4 px-6 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="tiktok-gradient p-2 rounded-lg">
              <i className="fa-brands fa-tiktok text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">TikTok Style Guide</h1>
          </div>
          <span className="bg-green-500 text-[10px] px-2 py-1 rounded-full font-bold">GRÁTIS / FREE TIER</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* Step 1: Upload */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">1</span>
            <h2 className="text-xl font-bold">Sua Foto Atual</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-50 ${image ? 'border-green-400' : 'border-gray-200'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              {image ? (
                <img src={image} className="w-full h-full object-cover rounded-xl" alt="Preview" />
              ) : (
                <div className="text-center">
                  <i className="fa-solid fa-cloud-arrow-up text-gray-300 text-3xl mb-2"></i>
                  <p className="font-bold text-gray-400">Clique para enviar</p>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 flex flex-col justify-center italic">
              "Nossa IA vai analisar sua foto e criar o guia completo de como você deve se vestir e se comportar para viralizar."
            </div>
          </div>
        </section>

        {/* Step 2: Customization */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">2</span>
            <h2 className="text-xl font-bold">O Que Você Quer Ser?</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Estilo Base</label>
                <select 
                  value={config.style}
                  onChange={(e) => setConfig(prev => ({ ...prev, style: e.target.value as ClothingStyle }))}
                  className="w-full mt-1 bg-gray-50 border-2 border-gray-100 rounded-xl p-3 font-semibold outline-none"
                >
                  {Object.values(ClothingStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Ritmo Musical</label>
                <select 
                  value={config.musicalStyle}
                  onChange={(e) => setConfig(prev => ({ ...prev, musicalStyle: e.target.value as MusicalStyle }))}
                  className="w-full mt-1 bg-gray-50 border-2 border-gray-100 rounded-xl p-3 font-semibold outline-none"
                >
                  {Object.values(MusicalStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Acessórios Desejados</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Óculos Juliet', 'Corrente de Ouro', 'Chapéu Boiadeiro', 'Fone Gamer', 'Shoulder Bag'].map(acc => (
                  <button
                    key={acc}
                    onClick={() => toggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${config.accessories.includes(acc) ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={analyzeStyle}
          disabled={!image || loading}
          className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${!image || loading ? 'bg-gray-200 text-gray-400' : 'tiktok-gradient text-white hover:scale-[1.02]'}`}
        >
          {loading ? 'ANALISANDO...' : 'CRIAR MEU ROTEIRO DE ESTILO'}
          <i className="fa-solid fa-bolt"></i>
        </button>

        {analysis && (
          <section className="bg-white rounded-3xl p-8 shadow-2xl border-t-4 border-[#FE2C55] animate-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <i className="fa-solid fa-star text-yellow-400"></i>
              Seu Plano para Viralizar
            </h2>
            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-center">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Compartilhe esse roteiro</p>
              <div className="flex justify-center gap-4">
                <button className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><i className="fa-brands fa-whatsapp"></i></button>
                <button className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><i className="fa-brands fa-instagram"></i></button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-10 text-gray-400 text-xs font-bold tracking-widest uppercase">
        Powered by Gemini 3 Flash (Free Tier)
      </footer>
    </div>
  );
};

export default App;
