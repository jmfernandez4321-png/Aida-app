
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChatMode, User } from "../types";

const getApiKey = () => process.env.API_KEY || "";

export const sendMessageToGemini = async (
  prompt: string,
  mode: ChatMode,
  user: User
): Promise<{ text?: string; image?: string; thinking?: string }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  // Custom system instruction to avoid markdown symbols like ** or $ as requested
  const systemInstruction = `Eres AIDA (Asistente Inteligente de Agenda), la IA oficial del Colegio Los Próceres.
  Estás ayudando a ${user.firstName} ${user.lastName} de ${user.year} año, sección ${user.section}.
  IMPORTANTE: No uses símbolos de formato como asteriscos (**), almohadillas (#) o símbolos de dólar ($) en tus respuestas. Escribe en texto plano y limpio.
  Responde de forma profesional y precisa para el nivel de bachillerato en Venezuela.`;

  // IMAGE MODE: GENERATION (Nano Banana)
  if (mode === ChatMode.IMAGE) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Genera una imagen educativa o académica sobre: ${prompt}. Estilo limpio y profesional para un estudiante de bachillerato.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    let generatedImage = "";
    let textDescription = "";

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        generatedImage = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        textDescription += part.text;
      }
    }

    return { 
      text: textDescription || "Aquí tienes la imagen generada por AIDA.", 
      image: generatedImage 
    };
  }

  // TEXT MODES: FAST or THINK
  const modelName = mode === ChatMode.THINK ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const config: any = { systemInstruction };
  
  if (mode === ChatMode.THINK) {
    config.thinkingConfig = { thinkingBudget: 16000 };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config
  });

  return { 
    text: response.text?.replace(/[\*\$#]/g, '') || "Error al procesar la respuesta.",
    thinking: (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought
  };
};
