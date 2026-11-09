import { useRef, useState } from "react";
import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { formatDateToDMY, parseDMYToISO } from "@/lib/date";
import { cn } from "@/lib/utils";

interface DatePickerInputProps {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

export function DatePickerInput({
  id,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: DatePickerInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [displayText, setDisplayText] = useState(() => formatDateToDMY(value));
  const nativePickerRef = useRef<HTMLInputElement>(null);

  // Sync displayed text when parent `value` changes (e.g. preset clicked)
  if (value !== prevValue) {
    setPrevValue(value);
    setDisplayText(formatDateToDMY(value));
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setDisplayText(text);
    const parsedIso = parseDMYToISO(text);
    if (parsedIso) {
      onChange(parsedIso);
    }
  }

  function handleBlur() {
    const parsedIso = parseDMYToISO(displayText);
    if (parsedIso) {
      onChange(parsedIso);
      setDisplayText(formatDateToDMY(parsedIso));
    } else {
      // Revert to current valid value if typed text is invalid
      setDisplayText(formatDateToDMY(value));
    }
  }

  function handleNativePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      onChange(e.target.value);
      setDisplayText(formatDateToDMY(e.target.value));
    }
  }

  function openPicker() {
    try {
      nativePickerRef.current?.showPicker();
    } catch {
      nativePickerRef.current?.focus();
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <Input
        id={id}
        type="text"
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleBlur();
          }
        }}
        placeholder="dd/mm/yy"
        aria-label={ariaLabel}
        className={cn(
          "h-8 w-[150px] rounded-md bg-surface pr-8 text-xs",
          className,
        )}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        className="absolute right-2 flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label="Open calendar"
      >
        <Calendar className="size-4" aria-hidden="true" />
      </button>

      {/* Invisible native date input overlaying the calendar button */}
      <input
        ref={nativePickerRef}
        type="date"
        value={value}
        onChange={handleNativePickerChange}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-auto absolute top-0 right-0 bottom-0 w-8 cursor-pointer opacity-0"
      />
    </div>
  );
}
