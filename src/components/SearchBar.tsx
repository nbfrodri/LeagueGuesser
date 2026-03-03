import { useState, useMemo } from "react";

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

  // Filter items based on query
  const suggestions = useMemo(() => {
    if (!query) return [];
    return data.filter((item) => filter(item, query));
  }, [data, query, filter]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
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
        onKeyDown={(e) => {
          if (e.key === "Enter" && suggestions.length > 0) {
            handleSelect(suggestions[0]);
          }
        }}
      />
      {isOpen && query && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-2 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 max-h-60 overflow-y-auto backdrop-blur">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="p-2.5 flex items-center gap-2 text-slate-100 cursor-pointer hover:bg-slate-800 transition"
              onClick={() => handleSelect(item)}
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
