interface Props {
  index: number;
  onClick: () => void;
  active?: boolean;
  title?: string;
}

const SMILEYS = ["😀", "😄", "😁", "🙂", "😊", "😆", "😂", "🤣", "😉", "😋"];

export function SmileyIcon({ index, onClick, active, title }: Props) {
  const emoji = SMILEYS[index % SMILEYS.length];
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`text-2xl sm:text-3xl p-1 rounded transition-transform hover:scale-110 ${
        active ? "ring-2 ring-blue-500 rounded-full" : ""
      }`}
    >
      {emoji}
    </button>
  );
}
