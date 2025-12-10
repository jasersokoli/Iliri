import { useState, useRef, useEffect } from 'react';
import type { Article } from '../types';
import './ArticleSearchInput.css';
import React from 'react';

interface ArticleSearchInputProps {
  articles: Article[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (article: Article) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchBy: 'code' | 'name';
}

export default function ArticleSearchInput({
  articles,
  value,
  onChange,
  onSelect,
  placeholder,
  disabled,
  className = '',
  searchBy,
}: ArticleSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const isSelectingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter active articles
  const activeArticles = articles.filter((a) => a.active && !a.deleted);

  useEffect(() => {
    // Don't show suggestions if we're in the middle of selecting
    if (isSelectingRef.current) {
      return;
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Check if value exactly matches an article (likely from a selection)
    const exactMatch = activeArticles.find((article) => {
      if (searchBy === 'code') {
        return article.code1 === value || article.code2 === value;
      } else {
        return article.name === value;
      }
    });

    // If there's an exact match, don't show suggestions (article is already selected)
    if (exactMatch) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = activeArticles.filter((article) => {
      if (searchBy === 'code') {
        return (
          article.code1.toLowerCase().includes(searchLower) ||
          (article.code2 && article.code2.toLowerCase().includes(searchLower))
        );
      } else {
        return article.name.toLowerCase().includes(searchLower);
      }
    });

    setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, searchBy, articles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelect = (article: Article) => {
    // Set flag immediately to prevent useEffect from showing suggestions
    isSelectingRef.current = true;
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    
    // Update the input value immediately based on searchBy
    const newValue = searchBy === 'code' ? article.code1 : article.name;
    onChange(newValue);
    
    // Call onSelect - this may update the value in parent, but we'll keep flag true
    onSelect(article);
    
    // Keep the flag true for a bit longer to prevent suggestions from reappearing
    // when parent updates the value
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the focus is moving to a suggestion element
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
      return; // Don't close if clicking on a suggestion
    }
    // Delay to allow click on suggestion
    setTimeout(() => {
      if (!isSelectingRef.current) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  return (
    <div className={`article-search-input ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim() && setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="article-search-input-field"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="article-search-suggestions">
          {suggestions.map((article, index) => (
            <div
              key={article.id}
              className={`article-search-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur before click
                handleSelect(article);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {searchBy === 'code' ? (
                <div className="article-suggestion-code">{article.code1}</div>
              ) : (
                <div className="article-suggestion-name">{article.name}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

