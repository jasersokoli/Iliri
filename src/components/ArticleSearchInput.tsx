import { useState, useRef, useEffect } from 'react';
import type { Article } from '../types';
import './ArticleSearchInput.css';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter active articles
  const activeArticles = articles.filter((a) => a.active && !a.deleted);

  useEffect(() => {
    if (!value.trim()) {
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
  }, [value, activeArticles, searchBy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelect = (article: Article) => {
    onSelect(article);
    setShowSuggestions(false);
    setSelectedIndex(-1);
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

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

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
              onClick={() => handleSelect(article)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="article-suggestion-code">{article.code1}</div>
              <div className="article-suggestion-name">{article.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

