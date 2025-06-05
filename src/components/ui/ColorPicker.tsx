interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

const defaultColors = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#14b8a6', // Teal
  '#a855f7', // Violet
];

export function ColorPicker({
  value,
  onChange,
  colors = defaultColors,
}: ColorPickerProps) {
  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-gray-700'>Farbe wählen</label>
      <div className='grid grid-cols-6 gap-2'>
        {colors.map((color) => (
          <button
            key={color}
            type='button'
            className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${
                  value === color
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:border-gray-500'
                }
              `}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>

      {/* Aktuell gewählte Farbe anzeigen */}
      <div className='flex items-center gap-2 text-sm text-gray-600'>
        <div
          className='w-4 h-4 rounded-full border border-gray-300'
          style={{ backgroundColor: value }}
        />
        <span>Gewählt: {value}</span>
      </div>
    </div>
  );
}
