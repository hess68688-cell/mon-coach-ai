import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { responses, userInfo } = await request.json();

    if (!responses || responses.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Aucune réponse fournie" 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Tu es un psychologue expert et coach professionnel. Analyse ce profil utilisateur et génère une réponse en JSON strict.

RÉPONSES DU QUESTIONNAIRE: ${JSON.stringify(responses)}
INFO UTILISATEUR: ${JSON.stringify(userInfo)}

INSTRUCTIONS:
- Analyse les réponses pour déterminer le profil psychologique
- Génère un score global basé sur la cohérence et le potentiel
- Identifie le type dominant parmi: Leader, Créatif, Analytique, Social, Entrepreneur
- Fournis des conseils pratiques et personnalisés

RÉPONDS UNIQUEMENT avec ce JSON exact (sans markdown, sans texte supplémentaire):
{
  "score": [nombre entre 75-95],
  "type": "[Leader|Créatif|Analytique|Social|Entrepreneur]",
  "analysis": "[Analyse personnalisée en 2-3 phrases décrivant les traits dominants et les tendances comportementales]",
  "recommendations": [
    "[Conseil pratique #1 spécifique au profil]",
    "[Conseil pratique #2 pour le développement]",
    "[Conseil pratique #3 pour l'action]"
  ],
  "strengths": [
    "[Force principale identifiée]",
    "[Atout comportemental clé]"
  ],
  "improvements": [
    "[Zone d'amélioration #1]",
    "[Compétence à développer #2]"
  ],
  "career_suggestions": [
    "[Orientation professionnelle #1]",
    "[Type de rôle adapté #2]"
  ]
}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Nettoyer la réponse pour extraire seulement le JSON
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0].trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Fallback avec analyse de base
      analysis = {
        score: 82,
        type: "Profil Unique",
        analysis: "Votre profil révèle des qualités équilibrées avec des tendances intéressantes. Vous montrez une capacité d'adaptation et des compétences variées qui constituent vos atouts principaux.",
        recommendations: [
          "Développez vos points forts naturels identifiés",
          "Cherchez des opportunités qui correspondent à votre style",
          "Cultivez un environnement qui valorise votre approche unique"
        ],
        strengths: ["Adaptabilité", "Perspective équilibrée"],
        improvements: ["Communication assertive", "Prise de décision rapide"],
        career_suggestions: ["Rôles polyvalents", "Postes de coordination"]
      };
    }

    // Validation des données
    if (!analysis.score || !analysis.type || !analysis.analysis) {
      analysis.score = analysis.score || 80;
      analysis.type = analysis.type || "Profil Équilibré";
      analysis.analysis = analysis.analysis || "Votre profil montre un équilibre intéressant entre différentes dimensions de personnalité.";
    }

    return NextResponse.json({ 
      success: true, 
      analysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API Analyse:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: "Erreur lors de l'analyse. Veuillez réessayer.",
      fallback_analysis: {
        score: 78,
        type: "Profil en Développement",
        analysis: "Une erreur technique s'est produite, mais vos réponses suggèrent un profil avec un bon potentiel. Nous vous encourageons à refaire le test pour une analyse complète.",
        recommendations: [
          "Retentez l'analyse dans quelques minutes",
          "Vos réponses montrent de la réflexion et de l'authenticité",
          "Continuez à explorer vos forces personnelles"
        ],
        strengths: ["Persévérance", "Curiosité"],
        improvements: ["Patience technique", "Flexibilité"],
        career_suggestions: ["Développement personnel", "Apprentissage continu"]
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "API Analyse IA - Endpoint POST uniquement",
    status: "active",
    timestamp: new Date().toISOString()
  });
}