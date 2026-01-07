
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ClothingStyle, MusicalStyle, Scenario, Pose, TransformationConfig } from './types';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
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
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const transformImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const musicalInfluence = config.musicalStyle !== MusicalStyle.NONE 
        ? `Adicione uma forte influência estética do estilo musical ${config.musicalStyle}.` 
        : "";

      const prompt = `Gere uma nova imagem profissional de alta resolução da mesma pessoa na foto de referência.
      MODIFICAÇÕES:
      1. Roupas: Alterar para o estilo ${config.style}. ${musicalInfluence}
      2. Cenário: Mudar o fundo para ${config.scenario}.
      3. Pose: Ajustar para ${config.pose}.
      4. Acessórios: Incluir ${config.accessories.join(', ')}.
      
      REGRAS CRÍTICAS:
      - Mantenha a identidade facial e características físicas da pessoa exatamente iguais.
      - Estilo fotográfico realista com iluminação suave de alta qualidade (TikTok aesthetic).
      - Cores vivas e saturadas.
      - Se o estilo musical for Sertanejo ou Vaquejada, incorpore elementos como botas e detalhes em couro de forma moderna.
      - Se for Funk, use estética "mandrake" ou de grife urbana com acessórios chamativos.
      - A imagem deve parecer um frame estático de um vídeo viral.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        const imagePart = parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          setResult(`data:image/png;base64,${imagePart.inlineData.data}`);
        } else {
          throw new Error("Não foi possível gerar a imagem. Tente novamente.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao processar imagem: " + (err.message || "Serviço temporariamente indisponível."));
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
    <div className="min-h-screen pb-20">
      {loading && <LoadingOverlay message="Criando seu look viral..." />}
      
      <header className="sticky top-0 z-40 bg-black/90 text-white py-4 px-6 shadow-xl backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <i className="fa-brands fa-tiktok text-black text-xl"></i>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">AI Style Transformer</h1>
          </div>
          <div className="hidden sm:block text-xs uppercase tracking-widest text-gray-400 font-bold">
            TikTok Edition
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* Step 1: Image Upload */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">1</span>
            <h2 className="text-xl font-bold">Foto de Referência</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-50 group ${image ? 'border-green-400' : 'border-gray-200'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              {image ? (
                <img src={image} className="w-full h-full object-cover rounded-xl" alt="Preview" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-camera text-gray-400 text-2xl"></i>
                  </div>
                  <p className="font-bold text-gray-600">Toque para enviar</p>
                  <p className="text-sm text-gray-400 mt-1">Sua foto atual</p>
                </>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                <p className="text-sm text-blue-800 font-medium">
                  Dica: Use uma foto nítida para manter sua identidade visual.
                </p>
              </div>
              {image && (
                <button 
                  onClick={() => setImage(null)}
                  className="text-red-500 font-bold text-sm hover:underline w-fit"
                >
                  Remover Foto
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Step 2: Customization */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">2</span>
            <h2 className="text-xl font-bold">Configurar Transformação</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Base do Vestuário</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(ClothingStyle).map((style) => (
                  <button
                    key={style}
                    onClick={() => setConfig(prev => ({ ...prev, style }))}
                    className={`px-4 py-3 rounded-xl text-left font-semibold text-sm transition-all border-2 ${config.style === style ? 'border-[#FE2C55] bg-[#FE2C55]/5 text-[#FE2C55]' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Influência Musical</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(MusicalStyle).map((mStyle) => (
                  <button
                    key={mStyle}
                    onClick={() => setConfig(prev => ({ ...prev, musicalStyle: mStyle }))}
                    className={`px-3 py-2 rounded-xl text-center font-bold text-xs transition-all border-2 ${config.musicalStyle === mStyle ? 'border-[#25F4EE] bg-[#25F4EE]/5 text-teal-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                  >
                    {mStyle.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Cenário</label>
                <select 
                  value={config.scenario}
                  onChange={(e) => setConfig(prev => ({ ...prev, scenario: e.target.value as Scenario }))}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 font-semibold focus:border-black outline-none appearance-none"
                >
                  {Object.values(Scenario).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Pose</label>
                <select 
                  value={config.pose}
                  onChange={(e) => setConfig(prev => ({ ...prev, pose: e.target.value as Pose }))}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 font-semibold focus:border-black outline-none appearance-none"
                >
                  {Object.values(Pose).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Acessórios</label>
              <div className="flex flex-wrap gap-2">
                {['Óculos de sol', 'Boné', 'Fones', 'Brincos', 'Relógio', 'Mochila', 'Chapéu de Couro'].map(acc => (
                  <button
                    key={acc}
                    onClick={() => toggleAccessory(acc)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${config.accessories.includes(acc) ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span className="font-semibold text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={transformImage}
          disabled={!image || loading}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3 ${!image || loading ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'tiktok-gradient text-white hover:brightness-110'}`}
        >
          {loading ? 'Processando Estilo...' : 'GERAR LOOK VIRAL'}
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </button>

        {result && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FE2C55] text-white flex items-center justify-center font-bold">✨</span>
                <h2 className="text-xl font-bold">Resultado AI</h2>
              </div>
              <a 
                href={result} 
                download="tiktok-style-ai.png"
                className="text-black font-bold text-sm flex items-center gap-2 hover:underline"
              >
                <i className="fa-solid fa-download"></i> Baixar
              </a>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border-4 border-white">
              <img src={result} className="w-full h-auto" alt="Resultado AI" />
            </div>
          </section>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-400 text-sm font-medium">
        Criado com IA Gemini 2.5 • Estética Musical TikTok
      </footer>
    </div>
  );
};

export default App;
