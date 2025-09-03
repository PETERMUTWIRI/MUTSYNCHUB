import React from 'react';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange, placeholder }) => {
  return (
    <input
      type="date"
      value={date ? date.toISOString().substring(0, 10) : ''}
      onChange={e => {
        const value = e.target.value;
        onDateChange(value ? new Date(value) : undefined);
      }}
      placeholder={placeholder || 'Select date'}
  className="rounded-lg px-3 py-2 bg-[#232347] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)]"
      style={{ minWidth: 160 }}
    />
  );
};