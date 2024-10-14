// components/ui/multi-select.tsx
import { useState } from "react";
import { Input } from "./input";
import { Badge } from "./badge";
import { Icons } from "./icons";

interface MultiSelectProps {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  id,
  values,
  onChange,
  placeholder = "Add items...",
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!values.includes(inputValue.trim())) {
        onChange([...values, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  return (
    <div className="flex flex-wrap items-center border rounded-md p-1">
      {values.map((value) => (
        <Badge key={value} className="m-1">
          {value}
          <button
            type="button"
            onClick={() => handleRemoveValue(value)}
            className="ml-1"
          >
            <Icons.x className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="flex-grow border-none focus:ring-0"
      />
    </div>
  );
}
