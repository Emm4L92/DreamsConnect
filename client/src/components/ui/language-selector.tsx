import { useState } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage, SUPPORTED_LANGUAGES, t } from "@/hooks/use-language";

interface LanguageSelectorProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  minimal?: boolean;
}

export function LanguageSelector({ 
  variant = "outline", 
  size = "default",
  minimal = false
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {minimal ? (
            <Globe className="h-4 w-4" />
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || "English"}</span>
            </>
          )}
          {!minimal && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-48">
        <Command>
          <CommandInput placeholder={t("Search language...", language)} />
          <CommandEmpty>{t("No language found.", language)}</CommandEmpty>
          <CommandGroup>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <CommandItem
                key={lang.code}
                value={lang.code}
                onSelect={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    language === lang.code ? "opacity-100" : "opacity-0"
                  )}
                />
                {lang.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}