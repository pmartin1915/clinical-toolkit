import { useState } from 'react';
import { X, FileText, Clock, Calendar } from 'lucide-react';
import { Button } from '@medical-wizards/ui';

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  effectiveDate: string;
  content: string;
  onClose: () => void;
  showAcceptButton?: boolean;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export const LegalDocument = ({
  title,
  lastUpdated,
  effectiveDate,
  content,
  onClose,
  showAcceptButton = false,
  onAccept,
  isAccepted = false
}: LegalDocumentProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-8 first:mt-0">
            {line.replace('# ', '')}
          </h1>
        );
      }
      
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
      }
      
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5">
            {line.replace('### ', '')}
          </h3>
        );
      }

      // Handle bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-bold text-gray-900 dark:text-gray-100 mb-3">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }

      // Handle bullet points
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="text-gray-700 dark:text-gray-300 ml-6 mb-2">
            {line.replace('- ', '')}
          </li>
        );
      }

      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      // Handle horizontal rule
      if (line.trim() === '---') {
        return <hr key={index} className="my-8 border-gray-300 dark:border-gray-600" />;
      }

      // Handle regular paragraphs
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Effective: {effectiveDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            icon={<X className="w-5 h-5" />}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          />
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {formatContent(content)}
          </div>
        </div>

        {/* Footer */}
        {showAcceptButton && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {!hasScrolledToBottom && !isAccepted && (
                  <span className="text-amber-600 dark:text-amber-400">
                    Please scroll to the bottom to review the complete document
                  </span>
                )}
                {isAccepted && (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    <span className="mr-2">✓</span>
                    You have accepted this document
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Close
                </Button>
                {!isAccepted && (
                  <Button
                    onClick={onAccept}
                    disabled={!hasScrolledToBottom}
                    className={!hasScrolledToBottom ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    I Understand and Agree
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};