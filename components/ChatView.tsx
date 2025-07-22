
import React, { useState, useEffect, useRef } from 'react';
import { type Chat, type Message, type UserProfile } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { generateResponseStream } from '../services/geminiService';
import { useLanguage, useTranslation } from '../i18n/LanguageContext';

interface ChatViewProps {
  chat: Chat;
  onMessagesChange: (messages: Message[]) => void;
  userProfile: UserProfile;
  isAccountSavingEnabled: boolean;
  onSaveToAccount: (infos: string[]) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
    chat, 
    onMessagesChange,
    userProfile,
    isAccountSavingEnabled,
    onSaveToAccount
}) => {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(chat.messages);
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    onMessagesChange(messages);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSendMessage = async (prompt: string, file?: File) => {
    if (isLoading || (!prompt.trim() && !file)) return;

    setIsLoading(true);

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    
    let fileData: { name: string, type: string, content: string } | undefined;
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise<void>(resolve => reader.onload = () => resolve());
            // @ts-ignore
            const base64Content = reader.result.split(',')[1];
            fileData = { name: file.name, type: file.type, content: base64Content };
        } else if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            // @ts-ignore
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map((s: any) => s.str).join(' ');
            }
            fileData = { name: file.name, type: 'text/plain', content: textContent };
        } else { // treat as plain text
             const textContent = await file.text();
             fileData = { name: file.name, type: 'text/plain', content: textContent };
        }
        newUserMessage.file = { name: file.name, type: file.type, content: fileData.content };
    }

    const newAiMessage: Message = {
      id: crypto.randomUUID(),
      role: 'model',
      content: '',
    };

    const updatedMessages = [...messages, newUserMessage, newAiMessage];
    setMessages(updatedMessages);

    try {
      const stream = generateResponseStream(
        messages, // history
        prompt,
        language,
        t,
        userProfile,
        isAccountSavingEnabled,
        fileData
      );
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
            msg.id === newAiMessage.id ? { ...msg, content: fullResponse } : msg
        ));
      }

      if (isAccountSavingEnabled) {
        const saveRegex = /<savetoaccount>(.*?)<\/savetoaccount>/gs;
        const infosToSave = [...fullResponse.matchAll(saveRegex)].map(match => match[1].trim()).filter(Boolean);

        if (infosToSave.length > 0) {
            onSaveToAccount(infosToSave);
        }
        
        const cleanResponse = fullResponse.replace(saveRegex, '').trim();

        // Final update with the cleaned response
        setMessages(prev => prev.map(msg => 
            msg.id === newAiMessage.id ? { ...msg, content: cleanResponse } : msg
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === newAiMessage.id ? { ...msg, content: t('genericError') } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-light-chat dark:bg-dark-chat">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLoading={isLoading && index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-light-chat dark:bg-dark-chat">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="max-w-4xl mx-auto text-center text-xs font-bold text-red-600 dark:text-red-400 mt-3">
            {t('betaDisclaimer')}
        </p>
      </div>
    </div>
  );
};

export default ChatView;
