
import React from 'react';
import { DownloadIcon, CopyIcon } from '../components/icons';
import { useTranslation } from '../i18n/LanguageContext';

const handleDownload = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handlePdfDownload = (filename: string, content: string) => {
  try {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180); // 180mm width for A4 page with margins
    doc.text(splitText, 10, 10);
    doc.save(filename);
  } catch (e) {
    console.error("Failed to generate PDF", e);
    alert("Error: Could not generate PDF file.");
  }
};

const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).catch(err => console.error("Copy failed", err));
}

const CodeBlock: React.FC<{ language: string; content: string }> = ({ language, content }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);
    
    const onCopy = () => {
        handleCopy(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    
    return (
        <div className="bg-gray-900/70 rounded-lg my-4 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50 text-xs text-gray-300">
                <span>{language || 'code'}</span>
                <button onClick={onCopy} className="flex items-center gap-1.5 text-xs hover:text-white">
                    {copied ? t('copied') : <><CopyIcon className="w-4 h-4" /> {t('copy')}</>}
                </button>
            </div>
            <pre className="p-4 text-sm text-white overflow-x-auto">
                <code>{content}</code>
            </pre>
        </div>
    );
};

export const parseResponse = (text: string): React.ReactNode => {
  const { t } = useTranslation();
  const parts = [];
  let lastIndex = 0;

  const tagRegex = /(<bold>.*?<\/bold>)|(<create_downloadablefile .*?>.*?<\/create_downloadablefile>)|(<create_pdf .*?>.*?<\/create_pdf>)|(```(?:\w*)\n[\s\S]*?\n```)/gs;
  
  text.replace(tagRegex, (match, bold, file, pdf, code, offset) => {
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset));
    }
    
    if (bold) {
        const content = bold.slice(6, -7);
        parts.push(<strong key={offset}>{content}</strong>);
    } 
    else if (file) {
        const filenameMatch = file.match(/filename="([^"]+)"/);
        const filename = filenameMatch ? filenameMatch[1] : 'download.txt';
        const content = file.match(/>([\s\S]*?)<\/create_downloadablefile>/)?.[1] || '';
        parts.push(
            <div key={offset} className="my-2 p-3 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg flex items-center justify-between">
                <span className="font-medium text-sm text-blue-800 dark:text-blue-300">{filename}</span>
                <button 
                    onClick={() => handleDownload(filename, content)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4"/>
                    {t('download')}
                </button>
            </div>
        );
    }
    else if (pdf) {
        const filenameMatch = pdf.match(/filename="([^"]+)"/);
        const filename = filenameMatch ? filenameMatch[1] : 'document.pdf';
        const content = pdf.match(/>([\s\S]*?)<\/create_pdf>/)?.[1] || '';
        parts.push(
            <div key={offset} className="my-2 p-3 bg-red-500/10 dark:bg-red-400/20 rounded-lg flex items-center justify-between">
                <span className="font-medium text-sm text-red-800 dark:text-red-300">{filename}</span>
                <button 
                    onClick={() => handlePdfDownload(filename, content)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4"/>
                    {t('download')}
                </button>
            </div>
        );
    } 
    else if (code) {
      const langMatch = code.match(/```(\w*)\n/);
      const language = langMatch ? langMatch[1] : '';
      const content = code.replace(/```\w*\n/, '').replace(/\n```/, '');
      parts.push(<CodeBlock key={offset} language={language} content={content} />);
    }

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};