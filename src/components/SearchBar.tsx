interface Props {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
}

export function SearchBar({ value, onChange, onClear, onSubmit }: Props) {
  const hasValue = value.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative w-full max-w-xl mx-auto"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Рассказать анекдот о..."
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
      />

      {/* Справа — либо лупа, либо крестик */}
      {hasValue ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Очистить"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 text-lg leading-none"
        >
          ✕
        </button>
      ) : (
        <button
          type="submit"
          aria-label="Найти"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}
    </form>
  );
}
