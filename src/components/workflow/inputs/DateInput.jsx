import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { cn } from '../../../utils/cn';

// Custom input component for DatePicker to match Tailwind styling
const CustomInput = forwardRef(({ value, onClick, error, label, description }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100",
        error ? "border-red-500" : "border-gray-300 dark:border-gray-700",
        !value && "text-gray-400"
      )}
    >
      {value || "Select date..."}
      <Calendar className="h-4 w-4 opacity-50" />
    </button>
    {description && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
));

CustomInput.displayName = 'CustomInput';

const DateInput = ({ 
  label, 
  value, 
  onChange, 
  description, 
  error,
  showTimeInput = true,
  dateFormat = "MM/dd/yyyy HH:mm"
}) => {
  // Convert string value to Date object if needed
  const selectedDate = value ? new Date(value) : null;

  const handleChange = (date) => {
    // Return ISO string or formatted string depending on requirement
    // Legacy used: convertDateStringToDateObject(values[inputName])
    // And onChange: setFieldValue(inputName, date)
    // We'll pass the Date object or null back
    onChange(date ? date.toISOString() : null);
  };

  return (
    <div className="mb-4">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        showTimeInput={showTimeInput}
        dateFormat={dateFormat}
        customInput={
          <CustomInput 
            label={label} 
            description={description} 
            error={error} 
          />
        }
        isClearable
        timeInputLabel="Time:"
        wrapperClassName="w-full"
      />
    </div>
  );
};

export default DateInput;
