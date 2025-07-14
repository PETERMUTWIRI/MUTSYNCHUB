import React from 'react';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange, placeholder }) => {
  return (
    <input
      type="date"
      value={date ? date.toISOString().substring(0, 10) : ''}
      onChange={(e) => {
        const value = e.target.value;
        onDateChange(value ? new Date(value) : undefined);
      }}
      placeholder={placeholder || 'Select date'}
      className="px-2 py-1 rounded border bg-gray-900 text-gray-200 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export { DatePicker };
export default DatePicker;
