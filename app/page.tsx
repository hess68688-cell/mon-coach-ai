'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    id: 1,
    question: "Comment préfères-tu travailler ?",
    options: [
      { value: "equipe", label: "🤝 En équipe", desc: "J'aime collaborer et partager" },
      { value: "solo", label: "🎯 En solo", desc: "Je préfère me concentrer seul" },
      { value: "leader", label: "👑 En dirigeant", desc: "J'aime organiser et guider" },
      { value: "support", label: "🤲 En aidant", desc: "Je préfère soutenir les autres" }
    ]
  },
  {
    id: 2,
    question: "Face au stress, tu :",
    options: [
      { value: "planifie", label: "📋 Planifies", desc: "J'organise tout à l'avance" },
      { value: "adapte", label: "🌊 T'adaptes", desc: "Je m'ajuste rapidement" },
      { value: "delegue", label: "🤝 Délègues", desc: "Je fais confiance aux autres" },
      { value: "focus", label: "🎯 Te concentres", desc: "Je me focus sur l'essentiel" }
    ]
  },
  {
    id: 3,
    question: "Ton style de communication :",
    options: [
      { value: "direct", label: "💬 Direct", desc: "Je vais droit au but" },
      { value: "diplomatique", label: "🤝 Diplomatique", desc: "Je nuance mes propos" },
      { value: "inspirant", label: "✨ Inspirant", desc: "Je motive les autres" },
      { value: "analytique", label: "📊 Analytique", desc: "Je donne des faits précis" }
    ]
  },
  {
    id: 4,
    question: "Dans un projet, tu es :",
    options: [
      { value: "visionnaire", label: "🔮 Visionnaire", desc: "J'imagine les possibilités" },
      { value: "organisateur", label: "📋 Organisateur", desc: "Je structure le travail" },
      { value: "executeur", label: "⚡ Exécuteur", desc: "Je réalise concrètement" },
      { value: "controleur", label: "🔍 Contrôleur", desc: "Je vérifie la qualité" }
    ]
  },
  {
    id: 5,
    question: "Tu apprends mieux :",
    options: [
      { value: "pratique", label: "🛠️ En pratiquant", desc: "J'apprends en faisant" },
      { value: "theorie", label: "📚 Par la théorie", desc: "J'étudie d'abord les concepts" },
      { value: "discussion", label: "💭 En discutant", desc: "J'échange avec d'autres" },
      { value: "observation", label: "👀 En observant", desc: "Je regarde puis j'imite" }
    ]
  },
  {
    id: 6,
    question: "Ton environnement de travail idéal :",
    options: [
      { value: "calme", label: "🧘 Calme", desc: "J'ai besoin de silence" },
      { value: "stimulant", label: "⚡ Stimulant", desc: "J'aime l'énergie collective" },
      { value: "flexible", label: "🏠 Flexible", desc: "Je change souvent d'endroit" },
      { value: "structure", label: "🏢 Structuré", desc: "J'aime un cadre défini" }
    ]
  },
  {
    id: 7,
    question: "Face à un problème complexe :",
    options: [
      { value: "decompose", label: "🧩 Tu décomposes", desc: "Je divise en petites parties" },
      { value: "intuition", label: "💡 Tu suis ton intuition", desc: "J'écoute mon instinct" },
      { value: "recherche", label: "🔍 Tu recherches", desc: "Je collecte des informations" },
      { value: "brainstorm", label: "💭 Tu brainstormes", desc: "Je génère plein d'idées" }
    ]
  },
  {
    id: 8,
    question: "Ta plus grande motivation :",
    options: [
      { value: "impact", label: "🌍 Impact", desc: "Changer positivement le monde" },
      { value: "reconnaissance", label: "🏆 Reconnaissance", desc: "Être apprécié pour mon travail" },
      { value: "autonomie", label: "🗽 Autonomie", desc: "Avoir ma liberté d'action" },
      { value: "croissance", label: "📈 Croissance", desc: "Apprendre et progresser" }
    ]
  },
  {
    id: 9,
    question: "Dans une réunion, tu :",
    options: [
      { value: "anime", label: "🎤 Animes", desc: "Je prends la parole facilement" },
      { value: "ecoute", label: "👂 Écoutes", desc: "J'analyse avant de parler" },
      { value: "synthese", label: "📝 Synthétises", desc: "Je résume les points clés" },
      { value: "challenge", label: "🤔 Challenges", desc: "Je pose des questions difficiles" }
    ]
  },
  {
    id: 10,
    question: "Pour réussir, tu mises sur :",
    options: [
      { value: "perseverance", label: "💪 Persévérance", desc: "Je ne lâche jamais" },
      { value: "creativite", label: "🎨 Créativité", desc: "Je trouve des solutions originales" },
      { value: "relations", label: "🤝 Relations", desc: "Je m'appuie sur mon réseau" },
      { value: "excellence", label: "⭐ Excellence", desc: "Je vise la perfection" }
    ]
  }
];

export default function PlatformeIA() {
  const [currentStep, setCurrentStep] = useState('questionnaire');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Analyse avec Gemini
  const analyzeProfile = async () => {
    setIsLoading(true);
    setCurrentStep('analysis');
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: answers,
          userInfo: { timestamp: new Date().toISOString() }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.analysis);
        setTimeout(() => setCurrentStep('dashboard'), 3000);
      }
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat avec Gemini
  const sendMessage = async (message: string) => {
    const newMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userProfile: userProfile
        })
      });
      
      const data = await response.json();
      setChatMessages([...newMessages, {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      }]);
    } catch (error) {
      console.error('Erreur chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🧠 Coach IA Gratuit
            </h1>
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                ✅ 100% Gratuit
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                🚀 Powered by Gemini
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* QUESTIONNAIRE */}
          {currentStep === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      Question {currentQuestion + 1} sur {QUESTIONS.length}
                    </span>
                    <span className="text-sm font-medium text-purple-600">
                      {Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {QUESTIONS[currentQuestion]?.question}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {QUESTIONS[currentQuestion]?.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[currentQuestion] = option.value;
                          setAnswers(newAnswers);
                          
                          setTimeout(() => {
                            if (currentQuestion < QUESTIONS.length - 1) {
                              setCurrentQuestion(currentQuestion + 1);
                            } else {
                              analyzeProfile();
                            }
                          }, 500);
                        }}
                        className={`p-4 text-left border-2 rounded-xl transition-all hover:border-purple-500 hover:bg-purple-50 ${
                          answers[currentQuestion] === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="font-medium text-gray-800 mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.desc}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYSE EN COURS */}
          {currentStep === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl shadow-xl p-12">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="text-6xl mb-6"
                >
                  🧠
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Gemini analyse ton profil...
                </h2>
                <p className="text-gray-600 mb-8">
                  Intelligence artificielle Google en action
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* DASHBOARD RÉSULTATS */}
          {currentStep === 'dashboard' && userProfile && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Score & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl text-center">
                  <h3 className="text-lg font-semibold mb-2">Score Global</h3>
                  <div className="text-4xl font-bold">{userProfile.score}</div>
                  <p className="text-sm opacity-90">/100</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl text-center">
                  <h3 className="text-lg font-semibold mb-2">Type de Profil</h3>
                  <div className="text-2xl font-bold">{userProfile.type}</div>
                </div>
              </div>

              {/* Analyse */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  📊 Ton Analyse Personnalisée
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {userProfile.analysis}
                </p>

                {/* Forces */}
                {userProfile.strengths && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-600 mb-3">💪 Tes Forces</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userProfile.strengths.map((strength: string, index: number) => (
                        <div key={index} className="bg-green-50 p-3 rounded-lg">
                          <span className="text-green-800">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-600 mb-3">💡 Recommandations</h4>
                  <div className="space-y-3">
                    {userProfile.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
                        <span className="text-blue-500 text-lg">🎯</span>
                        <span className="text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setCurrentStep('chat');
                      setChatMessages([{
                        role: 'assistant',
                        content: `Salut ! Je suis ton coach IA personnel. J'ai analysé ton profil ${userProfile.type} avec un score de ${userProfile.score}/100. Comment puis-je t'aider aujourd'hui ?`,
                        timestamp: new Date().toISOString()
                      }]);
                    }}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    💬 Discuter avec ton Coach IA
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep('questionnaire');
                      setCurrentQuestion(0);
                      setAnswers([]);
                      setUserProfile(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    🔄 Refaire le Test
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CHAT IA */}
          {currentStep === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">💬 Coach IA Personnel</h3>
                    <button
                      onClick={() => setCurrentStep('dashboard')}
                      className="text-white hover:text-gray-200"
                    >
                      ← Retour
                    </button>
                  </div>
                </div>
                
                <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-800 shadow-md'
                      }`}>
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-4 border-t bg-white">
                  <ChatInput onSendMessage={sendMessage} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Composant Chat Input
function ChatInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Écris ton message..."
        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
      >
        Envoyer
      </button>
    </form>
  );
}