"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchSuggestion {
  /** Unique key for React list rendering */
  key: string;
  /** Display text */
  text: string;
  /** Image path relative to /images/ (rendered via assetPath) */
  image?: string;
  /** Right-side type label (e.g. "아이템", "요리") */
  typeLabel?: string;
  /** Optional dot color class when no image (e.g. "bg-[#6a8a6a]") */
  dotClass?: string;
  /** Arbitrary payload passed back on selection */
  data?: unknown;
}

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (v: string) => void;
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  /** Called when Enter is pressed without a suggestion selected */
  onSubmit?: (value: string) => void;
  /** Called when Backspace is pressed with empty input */
  onBackspace?: () => void;
  onClear?: () => void;
  placeholder?: string;
  /** Whether to show clear button (defaults to value.length > 0) */
  showClear?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchWithSuggestions({
  value,
  onChange,
  suggestions,
  onSelect,
  onSubmit,
  onBackspace,
  onClear,
  showClear,
  placeholder,
  className,
}: SearchWithSuggestionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset selection when input changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  const handleSelect = (s: SearchSuggestion) => {
    onSelect(s);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowDropdown(false);
        setSelectedIndex(-1);
        return;
      }
    }

    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onSubmit?.(value);
      setShowDropdown(false);
    }

    if (e.key === "Backspace" && !value) {
      onBackspace?.();
    }
  };

  const hasClear = showClear ?? value.length > 0;

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
    setShowDropdown(false);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-8 rounded-md border border-input bg-surface pl-8 pr-8 text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {hasClear && (
        <button
          onClick={handleClear}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover shadow-md overflow-y-auto max-h-64">
          {suggestions.map((s, i) => (
            <button
              key={s.key}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-2 h-8 text-sm sm:text-xs text-left transition-colors",
                i === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
              )}
            >
              {s.image ? (
                <img
                  src={assetPath(`/images/${s.image}`)}
                  alt=""
                  className="size-5 object-contain shrink-0"
                />
              ) : s.dotClass ? (
                <span className={cn("size-2 rounded-full shrink-0 mx-1.5", s.dotClass)} />
              ) : null}
              <span className="truncate">{s.text}</span>
              {s.typeLabel && (
                <span className="ml-auto text-xs sm:text-[10px] text-muted-foreground shrink-0">
                  {s.typeLabel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
