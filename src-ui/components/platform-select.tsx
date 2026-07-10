import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

interface PlatformSelectOption {
  value: string;
  label: string;
}

interface PlatformSelectProps {
  id: string;
  value?: string;
  options: PlatformSelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PlatformSelect({
  id,
  value,
  options,
  onValueChange,
  className,
  disabled,
}: PlatformSelectProps) {
  if (navigator.userAgent.includes("Mac")) {
    return (
      <NativeSelect
        id={id}
        className={className}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  }

  return (
    <Select value={value} disabled={disabled} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
