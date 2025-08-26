import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { messages, userProfile } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Aucun message fourni" 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construire le contexte du coach
    const systemContext = userProfile ? `
Tu es un coach personnel bienveillant et expert. Tu connais ce profil utilisateur:
- Score: ${userProfile.score}/100
- Type: ${userProfile.type}  
- Analyse: ${userProfile.analysis}
- Forces: ${userProfile.strengths?.join(', ') || 'À découvrir'}
- Améliorations: ${userProfile.improvements?.join(', ') || 'En développement'}

INSTRUCTIONS IMPORTANTES:
- Réponds de manière personnalisée basée sur ce profil
- Sois encourageant, pratique et spécifique  
- Maximum 3-4 phrases par réponse
- Utilise un ton amical et professionnel
- Donne des conseils concrets et applicables
- Fais référence à leur profil quand c'est pertinent
` : `
Tu es un coach personnel bienveillant et expert.
- Sois encourageant et donne des conseils pratiques
- Maximum 3-4 phrases par réponse
- Ton amical mais professionnel
`;

    const lastMessage = messages[messages.length - 1].content;
    const conversationHistory = messages.slice(-3).map((msg: any) => 
      `${msg.role === 'user' ? 'Utilisateur' : 'Coach'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemContext}

HISTORIQUE RÉCENT:
${conversationHistory}

MESSAGE ACTUEL: ${lastMessage}

Réponds maintenant en tant que coach personnel:`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    // Nettoyage et validation de la réponse
    let cleanResponse = response.trim();
    
    // Supprimer les préfixes indésirables
    cleanResponse = cleanResponse.replace(/^(Coach|IA|Assistant):\s*/i, '');
    cleanResponse = cleanResponse.replace(/^\*\*/,'').replace(/\*\*$/,'');
    
    // S'assurer que la réponse n'est pas trop longue
    if (cleanResponse.length > 400) {
      const sentences = cleanResponse.split('. ');
      cleanResponse = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
    }

    // Ajouter de l'empathie si la réponse semble trop froide
    if (cleanResponse.length < 50) {
      cleanResponse += " Comment puis-je t'aider davantage ?";
    }

    return NextResponse.json({ 
      success: true,
      response: cleanResponse,
      timestamp: new Date().toISOString(),
      context: userProfile ? 'profil_connu' : 'profil_inconnu'
    });

  } catch (error) {
    console.error('Erreur API Chat:', error);
    
    // Réponses de fallback selon le type d'erreur
    const fallbackResponses = [
      "Je rencontre un petit problème technique. Peux-tu reformuler ta question ? Je suis là pour t'aider ! 😊",
      "Désolé pour cette interruption technique. Repose ta question et je te donnerai de meilleurs conseils ! 💪",
      "Un souci technique survient parfois. N'hésite pas à me reparler, j'ai hâte de t'accompagner ! 🚀"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({ 
      success: false,
      response: randomResponse,
      timestamp: new Date().toISOString(),
      error: "technical_issue",
      retry_suggested: true
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "API Chat IA - Endpoint POST uniquement",
    status: "active", 
    model: "gemini-1.5-flash",
    capabilities: ["coaching", "conversation", "conseils"],
    timestamp: new Date().toISOString()
  });
}