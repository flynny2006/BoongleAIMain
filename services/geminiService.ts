import { GoogleGenAI, Content } from "@google/genai";
import { type Message, type Language, type UserProfile } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

const getSystemInstruction = (language: Language, userProfile: UserProfile, isAccountSavingEnabled: boolean) => {
  let instruction = `You are Boongle AI, a helpful and creative assistant.
- You must respond in ${language}.
- You can format your responses. Use <bold>text</bold> to make text bold.
- To create a downloadable text-based file, use the format <create_downloadablefile filename="your_filename.ext">file content here</create_downloadablefile>.
- To create a downloadable PDF file, use the format <create_pdf filename="your_filename.pdf">The text content for the PDF goes here.</create_pdf>. The content inside the tag will be converted into a PDF.
- For code, use standard markdown code blocks (\`\`\`language\ncode\n\`\`\`).
- Be conversational and friendly.`;

  const profileInfo = [
    userProfile.name ? `The user's name is ${userProfile.name}.` : '',
    userProfile.hobbies ? `The user's hobbies are: ${userProfile.hobbies}.` : '',
    userProfile.notes ? `Here are some things you've learned about the user previously: ${userProfile.notes}` : ''
  ].filter(Boolean).join('\n');

  if (profileInfo) {
    instruction += `\n\nHere is some information about the user you are talking to:\n${profileInfo}`;
  }
  
  if (isAccountSavingEnabled) {
    instruction += `\n\n- When you learn a new, important, and concrete fact about the user (like their preferences, name, profession, family, etc.) from their message, you MUST save it. To do this, wrap the information in a <savetoaccount> tag. For example: <savetoaccount>The user's favorite color is blue.</savetoaccount>. Do not invent information. Only save what the user explicitly tells you. Do not put your conversational response inside the tag. The tag is for saving facts only and will be hidden from the user.`;
  }
  
  return instruction;
};


export async function* generateResponseStream(
  chatHistory: Message[],
  prompt: string,
  language: Language,
  t: (key: string, replacements?: { [key: string]: string }) => string,
  userProfile: UserProfile,
  isAccountSavingEnabled: boolean,
  file?: { name: string; type: string; content: string }
): AsyncGenerator<string> {
    
  const geminiHistory: Content[] = chatHistory.map(msg => {
    const parts: any[] = [];
    let messageText = msg.content.replace(/<savetoaccount>.*?<\/savetoaccount>/gs, '');
    
    if (msg.file) {
        if(msg.file.type.startsWith('image/')) {
            parts.push({
                inlineData: {
                    mimeType: msg.file.type,
                    data: msg.file.content
                }
            });
        } else { // For PDF text and other text files
             messageText = `Content from file "${msg.file.name}":\n\n${msg.file.content}\n\n---\n\n${messageText}`;
        }
    }
    
    if (messageText) {
      parts.push({ text: messageText });
    }

    return {
        role: msg.role,
        parts
    };
  });
  
  const userParts: any[] = [];
  let userMessageText = prompt;
  
  if (file) {
    if(file.type.startsWith('image/')) {
        userParts.push({
            inlineData: {
                mimeType: file.type,
                data: file.content
            }
        });
    } else { // For PDF text and other text files
        userMessageText = `Content from file "${file.name}":\n\n${file.content}\n\n---\n\n${userMessageText}`;
    }
  }
  if(userMessageText){
    userParts.push({ text: userMessageText });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
        model,
        contents: [...geminiHistory, { role: 'user', parts: userParts }],
        config: {
            systemInstruction: getSystemInstruction(language, userProfile, isAccountSavingEnabled),
        }
    });

    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating response:", error);
    if (error instanceof Error && (error.message.includes('quota') || error.message.includes('limit'))) {
        yield t('quotaError');
    } else {
        yield t('genericError');
    }
  }
}

export const generateTitle = async ({ messageContent, language }: { messageContent: string, language: Language }): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Generate a short, concise title (max 5 words) in ${language} for the following user query: "${messageContent}"`,
        });
        return response.text.replace(/"/g, '').trim();
    } catch (error) {
        console.error("Error generating title:", error);
        return language === 'English' ? 'Untitled Chat' : language === 'Hungarian' ? 'Névtelen csevegés' : 'Unbenannter Chat';
    }
};