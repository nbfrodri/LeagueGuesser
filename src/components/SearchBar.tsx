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
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
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
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="p-2 flex items-center gap-2 text-black cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(item)}
            >
              {/* If item has icon, we could show it here, but generic is fine for now if we don't assume shape */}
              {/* We can cast to 'any' to check for icon safely or extend T */}
              {(item as any).icon && (
                <img
                  src={(item as any).icon}
                  alt=""
                  className="w-8 h-8 rounded-full"
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
