import { useState, useMemo, useEffect, useRef } from "react";

interface SearchBarProps<T> {
  data: T[];
  onSelect: (item: T) => void;
  placeholder?: string;
  getKey: (item: T) => string; // To get unique key/name for display
  filter: (item: T, query: string) => boolean;
}

export function SearchBar<T>({
  data,
  onSelect,
  placeholder,
  getKey,
  filter,
}: SearchBarProps<T>) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter items based on query
  const suggestions = useMemo(() => {
    if (!query) return [];
    return data.filter((item) => filter(item, query));
  }, [data, query, filter]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Scroll to selected item
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <input
        type="text"
        className="w-full px-4 py-3 border border-slate-600 rounded-xl shadow-lg shadow-black/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-400 bg-slate-900/80 text-slate-100 placeholder-slate-400 text-base"
        placeholder={placeholder || "Search..."}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && query && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 w-full mt-2 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 max-h-60 overflow-y-auto backdrop-blur"
        >
          {suggestions.map((item, index) => (
            <li
              key={index}
              className={`p-2.5 flex items-center gap-2 text-slate-100 cursor-pointer transition ${
                index === selectedIndex
                  ? "bg-cyan-600/40 border-l-4 border-cyan-400"
                  : "hover:bg-slate-800"
              }`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* If item has icon, we could show it here, but generic is fine for now if we don't assume shape */}
              {/* We can cast to 'any' to check for icon safely or extend T */}
              {(item as any).icon && (
                <img
                  src={(item as any).icon}
                  alt=""
                  className="w-8 h-8 rounded-full border border-slate-600"
                />
              )}
              <span>{getKey(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
