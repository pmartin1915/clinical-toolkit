import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronRight, AlertTriangle, Info, Clock, Stethoscope, Activity } from 'lucide-react';
import { EnhancedSymptomSearchEngine } from '../../data/enhancedSymptomDatabase';
import type { Condition } from '../../types';

interface SearchResult {
  type: 'condition' | 'symptom';
  id: string;
  title: string;
  description: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  tools?: string[];
  conditions?: string[];
  redFlags?: string[];
  differentials?: string[];
  icd10Codes?: string[];
  medicalTerms?: string[];
}

interface EnhancedSearchProps {
  conditions: Condition[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onConditionSelect: (conditionId: string) => void;
  placeholder?: string;
}

const urgencyColors = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  emergency: 'text-red-600 bg-red-50 border-red-200'
};

const urgencyIcons = {
  low: Info,
  medium: Clock,
  high: AlertTriangle,
  emergency: AlertTriangle
};

export const EnhancedSearch = ({ 
  conditions, 
  searchTerm, 
  onSearchChange, 
  onConditionSelect,
  placeholder = "Search conditions or describe symptoms..." 
}: EnhancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results: SearchResult[] = [];

      // Search symptoms first with enhanced engine
      const symptomMatches = EnhancedSymptomSearchEngine.searchSymptoms(searchTerm, 8);
      symptomMatches.forEach(symptom => {
        results.push({
          type: 'symptom',
          id: symptom.symptom,
          title: symptom.symptom,
          description: symptom.description,
          urgency: symptom.urgency,
          tools: symptom.commonTools,
          conditions: symptom.conditions,
          redFlags: symptom.redFlags,
          differentials: symptom.differentials,
          icd10Codes: symptom.icd10Codes,
          medicalTerms: symptom.medicalTerms
        });
      });

      // Search conditions with enhanced matching
      const conditionMatches = conditions
        .filter(condition => {
          const searchLower = searchTerm.toLowerCase();
          return condition.title.toLowerCase().includes(searchLower) ||
                 condition.shortDescription.toLowerCase().includes(searchLower) ||
                 condition.category.toLowerCase().includes(searchLower) ||
                 condition.tools.some(tool => tool.name.toLowerCase().includes(searchLower));
        })
        .slice(0, 4);

      conditionMatches.forEach(condition => {
        results.push({
          type: 'condition',
          id: condition.id,
          title: condition.title,
          description: condition.shortDescription,
          tools: condition.tools.map(tool => tool.id)
        });
      });

      setSearchResults(results);
      setIsOpen(results.length > 0);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, conditions]);

  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.type === 'condition') {
      onConditionSelect(result.id);
    } else if (result.type === 'symptom' && result.conditions && result.conditions.length > 0) {
      // For symptoms, navigate to the most relevant condition
      const primaryCondition = result.conditions[0];
      onConditionSelect(primaryCondition);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onConditionSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            handleResultSelect(searchResults[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, highlightedIndex, handleResultSelect]);

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  const renderSearchResult = (result: SearchResult, index: number) => {
    const isHighlighted = index === highlightedIndex;
    
    if (result.type === 'symptom') {
      const UrgencyIcon = urgencyIcons[result.urgency!];
      
      return (
        <div
          key={`${result.type}-${result.id}`}
          className={`px-4 py-4 sm:py-3 cursor-pointer transition-colors touch-manipulation ${
            isHighlighted 
              ? 'bg-primary-50 border-l-4 border-l-primary-500' 
              : 'hover:bg-gray-50 active:bg-gray-100'
          }`}
          onClick={() => handleResultSelect(result)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900 capitalize">
                  {result.title}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  urgencyColors[result.urgency!]
                }`}>
                  <UrgencyIcon className="w-3 h-3 mr-1" />
                  {result.urgency?.toUpperCase()}
                </span>
                {result.icd10Codes && result.icd10Codes.length > 0 && (
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border">
                    ICD-10: {result.icd10Codes[0]}
                  </span>
                )}
              </div>
              
              {result.medicalTerms && result.medicalTerms.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Medical terms: </span>
                  <span className="text-xs text-gray-600 italic">
                    {result.medicalTerms.slice(0, 3).join(', ')}
                  </span>
                </div>
              )}
              
              <p className="text-sm text-gray-700 mb-2">{result.description}</p>
              
              {result.redFlags && result.redFlags.length > 0 && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-medium text-red-800">Red Flags:</span>
                  </div>
                  <p className="text-xs text-red-700">
                    {result.redFlags.slice(0, 3).join(', ')}
                  </p>
                </div>
              )}
              
              {result.differentials && result.differentials.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-blue-700">Consider: </span>
                  <span className="text-xs text-blue-600">
                    {result.differentials.slice(0, 3).join(', ')}
                  </span>
                </div>
              )}
              
              {result.tools && result.tools.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <Stethoscope className="w-3 h-3 text-blue-600 mt-0.5" />
                  {result.tools.slice(0, 3).map(tool => (
                    <span key={tool} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                  {result.tools.length > 3 && (
                    <span className="text-xs text-gray-500">+{result.tools.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
          </div>
          <div className="mt-2 text-xs text-primary-600 font-medium">
            Clinical Symptom • Evidence-based assessment tools available
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={`${result.type}-${result.id}`}
          className={`px-4 py-4 sm:py-3 cursor-pointer transition-colors touch-manipulation ${
            isHighlighted 
              ? 'bg-primary-50 border-l-4 border-l-primary-500' 
              : 'hover:bg-gray-50 active:bg-gray-100'
          }`}
          onClick={() => handleResultSelect(result)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{result.title}</h4>
              <p className="text-sm text-gray-600">{result.description}</p>
              <div className="mt-1 text-xs text-gray-500">
                {result.tools?.length} tools available
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          <div className="mt-2 text-xs text-green-600 font-medium">
            Condition • Click to explore
          </div>
        </div>
      );
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleInputFocus}
          className="w-full pl-11 pr-4 py-3 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm hover:border-gray-400 transition-colors"
        />
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 sm:max-h-96 overflow-y-auto">
          <div className="py-2">
            {searchTerm.length >= 2 && (
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-gray-700 font-medium">
                      Found {searchResults.filter(r => r.type === 'symptom').length} clinical symptoms and{' '}
                      {searchResults.filter(r => r.type === 'condition').length} conditions
                    </p>
                  </div>
                  {searchResults.some(r => r.urgency === 'emergency' || r.urgency === 'high') && (
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-700 font-medium">High priority results</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Includes medical terminology, ICD-10 codes, and clinical decision support
                </p>
              </div>
            )}
            {searchResults.map((result, index) => renderSearchResult(result, index))}
          </div>
        </div>
      )}
    </div>
  );
};