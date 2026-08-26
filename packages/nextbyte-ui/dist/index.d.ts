import * as React$1 from 'react';
import React__default from 'react';
import * as lucide_react from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ToasterProps } from 'sonner';
export { toast } from 'sonner';
import { ClassValue } from 'clsx';

/**
 * KAFELEK — jeden wygląd, zmienia się tylko treść.
 * Official NextByte Production Tile Component System
 */
declare const ELEWACJA: {
    /** w płaszczyźnie strony — tylko obramowanie */
    readonly plaska: "shadow-none";
    /** domyślny kafelek z efektem szkła */
    readonly uniesiona: "shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.12)]";
    /** kafelek pod kursorem, panel nakładany */
    readonly wyzej: "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.18)]";
};
declare const INTENCJA: {
    readonly neutralna: {
        readonly obwodka: "border-white/10 dark:border-white/10";
        readonly ikona: "text-foreground/70";
        readonly chip: "bg-white/[0.04]";
    };
    readonly akcent: {
        readonly obwodka: "border-primary/25";
        readonly ikona: "text-primary";
        readonly chip: "bg-primary/10";
    };
    readonly krytyczna: {
        readonly obwodka: "border-destructive/30";
        readonly ikona: "text-destructive";
        readonly chip: "bg-destructive/10";
    };
};
type Elewacja = keyof typeof ELEWACJA;
type Intencja = keyof typeof INTENCJA;
declare function klasyKafelka(opcje?: {
    intencja?: Intencja;
    elewacja?: Elewacja;
    interaktywny?: boolean;
    zwarty?: boolean;
}): string;
interface TileProps extends React__default.HTMLAttributes<HTMLDivElement> {
    intencja?: Intencja;
    elewacja?: Elewacja;
    interaktywny?: boolean;
    zwarty?: boolean;
    children?: React__default.ReactNode;
}
declare const Tile: React__default.ForwardRefExoticComponent<TileProps & React__default.RefAttributes<HTMLDivElement>>;
interface TileHeaderProps {
    ikona?: LucideIcon;
    tytul: React__default.ReactNode;
    podtytul?: React__default.ReactNode;
    intencja?: Intencja;
    poPrawej?: React__default.ReactNode;
    className?: string;
}
declare const TileHeader: React__default.FC<TileHeaderProps>;
interface TileRowProps extends React__default.HTMLAttributes<HTMLDivElement> {
    ikona?: LucideIcon;
    intencja?: Intencja;
    poPrawej?: React__default.ReactNode;
    children?: React__default.ReactNode;
}
declare const TileRow: React__default.FC<TileRowProps>;
declare const TilePill: React__default.FC<{
    intencja?: Intencja;
    children: React__default.ReactNode;
    className?: string;
}>;
declare const AKCJA: {
    readonly glowna: "border-primary/40 bg-primary/[0.08] text-primary hover:border-primary/70 hover:bg-primary/[0.15]";
    readonly wtorna: "border-foreground/15 bg-foreground/[0.04] text-foreground hover:border-foreground/30 hover:bg-foreground/[0.08]";
    readonly cicha: "border-transparent bg-transparent text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground";
    readonly usun: "border-destructive/40 bg-destructive/[0.08] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.15]";
};
type RodzajAkcji = keyof typeof AKCJA;
interface TileActionProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    rodzaj?: RodzajAkcji;
    ikona?: LucideIcon;
    samaIkona?: boolean;
}
declare const TileAction: React__default.ForwardRefExoticComponent<TileActionProps & React__default.RefAttributes<HTMLButtonElement>>;
declare const TileFooter: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;
declare const TOKENY_KAFELKA: {
    readonly ELEWACJA: {
        /** w płaszczyźnie strony — tylko obramowanie */
        readonly plaska: "shadow-none";
        /** domyślny kafelek z efektem szkła */
        readonly uniesiona: "shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.12)]";
        /** kafelek pod kursorem, panel nakładany */
        readonly wyzej: "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.18)]";
    };
    readonly INTENCJA: {
        readonly neutralna: {
            readonly obwodka: "border-white/10 dark:border-white/10";
            readonly ikona: "text-foreground/70";
            readonly chip: "bg-white/[0.04]";
        };
        readonly akcent: {
            readonly obwodka: "border-primary/25";
            readonly ikona: "text-primary";
            readonly chip: "bg-primary/10";
        };
        readonly krytyczna: {
            readonly obwodka: "border-destructive/30";
            readonly ikona: "text-destructive";
            readonly chip: "bg-destructive/10";
        };
    };
    readonly PROMIEN: {
        readonly kafelek: "rounded-2xl";
        readonly wiersz: "rounded-xl";
        readonly chip: "rounded-xl";
        readonly pigulka: "rounded-full";
    };
    readonly AKCJA: {
        readonly glowna: "border-primary/40 bg-primary/[0.08] text-primary hover:border-primary/70 hover:bg-primary/[0.15]";
        readonly wtorna: "border-foreground/15 bg-foreground/[0.04] text-foreground hover:border-foreground/30 hover:bg-foreground/[0.08]";
        readonly cicha: "border-transparent bg-transparent text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground";
        readonly usun: "border-destructive/40 bg-destructive/[0.08] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.15]";
    };
};

type BgKey = 'nextbyte' | 'landscape' | 'gradient' | 'galaxy' | 'city' | 'aurora' | 'off';
declare const BG_OPTIONS: {
    key: BgKey;
    label: string;
    icon: React__default.ReactNode;
}[];
interface AppBackgroundProps {
    bgKey: BgKey;
}
declare function AppBackground({ bgKey }: AppBackgroundProps): React__default.JSX.Element | null;
interface BgToggleProps {
    bgKey: BgKey;
    onCycle: () => void;
}
declare function BgToggle({ bgKey, onCycle }: BgToggleProps): React__default.JSX.Element;

interface BadgeProps extends React$1.HTMLAttributes<HTMLSpanElement> {
    intent?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'default';
    dot?: boolean;
}
declare function Badge({ intent, size, dot, className, children, ...props }: BadgeProps): React$1.JSX.Element;

interface PatternBackgroundProps {
    patternColor?: string;
    patternSize?: number;
    patternOpacity?: number;
    backgroundColor?: string;
    className?: string;
    style?: React__default.CSSProperties;
    fade?: boolean;
}
declare const BackgroundPlus: React__default.FC<PatternBackgroundProps>;
declare const BackgroundDots: React__default.FC<PatternBackgroundProps>;
declare const BackgroundGrid: React__default.FC<PatternBackgroundProps>;
interface PatternConfig {
    pattern_type: 'plus' | 'dots' | 'grid';
    pattern_color: string;
    pattern_size: number;
    pattern_opacity: number;
    background_color: string;
    fade: boolean;
}
declare const PatternBackground: React__default.FC<PatternConfig & {
    className?: string;
    style?: React__default.CSSProperties;
}>;

declare const buttonVariants: (props?: ({
    variant?: "link" | "nextbyte" | "gradient" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "glass" | null | undefined;
    size?: "sm" | "default" | "icon" | "lg" | "xl" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: React$1.ForwardRefExoticComponent<ButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

declare const SIZE$1: {
    readonly sm: "h-4 w-4";
    readonly default: "h-5 w-5";
    readonly lg: "h-6 w-6";
};
type CheckboxSize = keyof typeof SIZE$1;
interface CheckboxProps extends React$1.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    checkboxSize?: CheckboxSize;
}
declare const Checkbox: React$1.ForwardRefExoticComponent<CheckboxProps & React$1.RefAttributes<HTMLButtonElement>>;
interface CheckboxFieldProps {
    label: React$1.ReactNode;
    description?: React$1.ReactNode;
    id?: string;
    checkboxSize?: CheckboxSize;
    checked?: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
    disabled?: boolean;
    className?: string;
}
declare const CheckboxField: React$1.FC<CheckboxFieldProps>;

declare const Dialog: React$1.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogClose: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React$1.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogOverlay: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DialogContent: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DialogHeader: React$1.FC<React$1.HTMLAttributes<HTMLDivElement>>;
declare const DialogTitle: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const DialogDescription: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const DialogFooter: React$1.FC<React$1.HTMLAttributes<HTMLDivElement>>;

declare const AlertDialog: React$1.FC<AlertDialogPrimitive.AlertDialogProps>;
declare const AlertDialogTrigger: React$1.ForwardRefExoticComponent<AlertDialogPrimitive.AlertDialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogPortal: React$1.FC<AlertDialogPrimitive.AlertDialogPortalProps>;
declare const AlertDialogOverlay: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogOverlayProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertDialogContent: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertDialogHeader: React$1.FC<React$1.HTMLAttributes<HTMLDivElement>>;
declare const AlertDialogTitle: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const AlertDialogDescription: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const AlertDialogFooter: React$1.FC<React$1.HTMLAttributes<HTMLDivElement>>;
declare const AlertDialogAction: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogActionProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogCancel: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogCancelProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;

interface FileUploadButtonProps {
    onFiles?: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    label?: string;
    disabled?: boolean;
    className?: string;
}
declare const FileUploadButton: React$1.FC<FileUploadButtonProps>;
interface FileDropzoneProps {
    onFiles?: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    hint?: string;
    className?: string;
}
declare const FileDropzone: React$1.FC<FileDropzoneProps>;
interface UploadedFile {
    name: string;
    size?: number;
    progress?: number;
}
interface FileListProps {
    files: UploadedFile[];
    onRemove?: (index: number) => void;
    className?: string;
}
declare const FileList: React$1.FC<FileListProps>;

interface FormSectionProps {
    title: React$1.ReactNode;
    description?: React$1.ReactNode;
    children: React$1.ReactNode;
    className?: string;
}
declare const FormSection: React$1.FC<FormSectionProps>;
interface FormRowProps {
    columns?: 1 | 2;
    children: React$1.ReactNode;
    className?: string;
}
declare const FormRow: React$1.FC<FormRowProps>;
declare const FormDivider: React$1.FC<{
    className?: string;
}>;
interface FieldGroupProps {
    label?: React$1.ReactNode;
    children: React$1.ReactNode;
    className?: string;
}
declare const FieldGroup: React$1.FC<FieldGroupProps>;
interface FormActionsProps {
    children: React$1.ReactNode;
    align?: "left" | "right" | "between";
    className?: string;
}
declare const FormActions: React$1.FC<FormActionsProps>;

declare const inputVariants: (props?: ({
    variant?: "default" | "ghost" | "error" | null | undefined;
    inputSize?: "sm" | "default" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface InputProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants> {
    iconLeft?: React$1.ReactNode;
    iconRight?: React$1.ReactNode;
}
declare const Input: React$1.ForwardRefExoticComponent<InputProps & React$1.RefAttributes<HTMLInputElement>>;
declare const InputLabel: React$1.ForwardRefExoticComponent<React$1.LabelHTMLAttributes<HTMLLabelElement> & React$1.RefAttributes<HTMLLabelElement>>;
declare const InputHint: React$1.FC<React$1.HTMLAttributes<HTMLSpanElement>>;
declare const InputError: React$1.FC<React$1.HTMLAttributes<HTMLSpanElement>>;
interface FieldProps {
    label?: React$1.ReactNode;
    hint?: React$1.ReactNode;
    error?: React$1.ReactNode;
    htmlFor?: string;
    className?: string;
    children: React$1.ReactNode;
}
declare const Field: React$1.FC<FieldProps>;

/**
 * LiquidGlass — iOS 26-style WebGL overlay.
 *
 * Architektura (kluczowa zmiana):
 *  • WebGL canvas = WYŁĄCZNIE efekty na krawędzi (rim) + top specular
 *  • Wewnątrz karty alpha = 0 → brak widocznego kwadratu
 *  • Specular siedzi przy górze szkła (jak odbicie światła sufitowego),
 *    przesuwa się tylko w osi X za myszą — to jest iOS 26
 *  • CSS nb-szklo obsługuje blur + przezroczystość ciała szkła
 *
 * Lazy init: WebGL tworzony przy pierwszym hover.
 */

interface LiquidGlassProps extends React__default.HTMLAttributes<HTMLDivElement> {
    radius?: number;
    intensity?: number;
    children?: React__default.ReactNode;
}
declare const LiquidGlass: React__default.ForwardRefExoticComponent<LiquidGlassProps & React__default.RefAttributes<HTMLDivElement>>;

interface NbTab {
    key: string;
    label: React__default.ReactNode;
    icon?: React__default.ReactNode;
}
interface NbTabsProps {
    tabs: NbTab[];
    defaultTab?: string;
    onChange?: (key: string) => void;
    className?: string;
}
/**
 * NbTabs — nawigacja zakładkowa z efektem liquid glass.
 * Implementacja CSS z produkcyjnego Studio Zdjęć (nextbyte.space):
 *   - kontener: .nb-szklo .nb-szklo-plynne (szkło płynne)
 *   - aktywna zakładka: wirujący conic-gradient (.nb-pigulka-rant .nb-tab-pill-spin)
 *     + szklane wypełnienie (.nb-pigulka-szklo)
 *   - zmiana zakładki: płynne przesunięcie pigułki przez CSS transform
 */
declare function NbTabs({ tabs, defaultTab, onChange, className }: NbTabsProps): React__default.JSX.Element;

interface OtpInputProps {
    length?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}
declare const OtpInput: React$1.FC<OtpInputProps>;

declare const SIZE: {
    readonly sm: "h-4 w-4";
    readonly default: "h-5 w-5";
    readonly lg: "h-6 w-6";
};
type RadioSize = keyof typeof SIZE;
declare const RadioGroup: React$1.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
interface RadioGroupItemProps extends React$1.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
    radioSize?: RadioSize;
}
declare const RadioGroupItem: React$1.ForwardRefExoticComponent<RadioGroupItemProps & React$1.RefAttributes<HTMLButtonElement>>;
interface RadioCardProps {
    value: string;
    label: React$1.ReactNode;
    description?: React$1.ReactNode;
    id?: string;
    disabled?: boolean;
    className?: string;
}
declare const RadioCard: React$1.FC<RadioCardProps>;
interface RadioFieldProps {
    value: string;
    label: React$1.ReactNode;
    description?: React$1.ReactNode;
    id?: string;
    radioSize?: RadioSize;
    disabled?: boolean;
    className?: string;
}
declare const RadioField: React$1.FC<RadioFieldProps>;

interface RatingProps {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    max?: number;
    size?: "sm" | "default" | "lg";
    readOnly?: boolean;
    className?: string;
}
declare const Rating: React$1.FC<RatingProps>;
interface EmojiRatingProps {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    size?: "sm" | "default" | "lg";
    className?: string;
}
declare const EmojiRating: React$1.FC<EmojiRatingProps>;

declare const Select: React$1.FC<SelectPrimitive.SelectProps>;
declare const SelectGroup: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectValue: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React$1.RefAttributes<HTMLSpanElement>>;
interface SelectTriggerProps extends React$1.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
    error?: boolean;
    triggerSize?: "sm" | "default" | "lg";
}
declare const SelectTrigger: React$1.ForwardRefExoticComponent<SelectTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const SelectScrollUpButton: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectScrollDownButton: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectContent: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectLabel: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectItem: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectSeparator: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

interface SliderProps extends React$1.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    showValue?: boolean;
    formatValue?: (value: number) => string;
}
declare const Slider: React$1.ForwardRefExoticComponent<SliderProps & React$1.RefAttributes<HTMLSpanElement>>;

declare const TRACK: {
    readonly sm: "h-4 w-7";
    readonly default: "h-5 w-9";
    readonly lg: "h-6 w-11";
};
type SwitchSize = keyof typeof TRACK;
interface SwitchProps extends React$1.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
    switchSize?: SwitchSize;
}
declare const Switch: React$1.ForwardRefExoticComponent<SwitchProps & React$1.RefAttributes<HTMLButtonElement>>;
interface SwitchFieldProps {
    label: React$1.ReactNode;
    description?: React$1.ReactNode;
    id?: string;
    switchSize?: SwitchSize;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}
declare const SwitchField: React$1.FC<SwitchFieldProps>;

declare const Tabs: React$1.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsGroup: React$1.ForwardRefExoticComponent<TabsPrimitive.TabsListProps & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsList: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsTrigger: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const TabsContent: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsLine: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsLineTrigger: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;

interface TagInputProps {
    value?: string[];
    defaultValue?: string[];
    onChange?: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
    disabled?: boolean;
    className?: string;
}
declare const TagInput: React$1.FC<TagInputProps>;

type PatternLocationKey = string;
declare function usePatternLocations(): {
    isLocationEnabled: (_location: PatternLocationKey) => boolean;
};

/**
 * Techgrid — delikatna siatka w tle, ale TYLKO gdy użytkownik nie ustawił
 * własnego wyglądu.
 *
 * Sedno: platforma sprzedaje wzory i tła. `PatternOverlay` już rysuje wzór
 * użytkownika, a tło obrazkowe może być pod nim. Dorysowanie techgridu na
 * sztywno dałoby trzy warstwy naraz i zabrudziło rzecz, za którą ktoś zapłacił
 * Byte. Dlatego techgrid ustępuje: jest wyłącznie tłem domyślnym.
 *
 * Ustępuje gdy:
 *   • użytkownik ma aktywny wzór ORAZ ten wzór jest włączony w tym miejscu,
 *   • albo ma ustawione tło obrazkowe.
 *
 * Rysowany wyłącznie na `currentColor` z alfą, więc jest neutralny wobec
 * wszystkich 14 motywów — nie wnosi własnego koloru, tylko lekko rozjaśnia
 * albo przyciemnia to, co jest pod nim, zależnie od jasności motywu.
 */
interface TechGridProps {
    location: PatternLocationKey;
    /** Rozmiar oczka siatki w px. */
    oczko?: number;
    className?: string;
}
declare const TechGrid: React__default.FC<TechGridProps>;

declare const textareaVariants: (props?: ({
    variant?: "default" | "ghost" | "error" | null | undefined;
    resize?: "none" | "auto" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TextareaProps extends React$1.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
    showCount?: boolean;
    maxLength?: number;
    autoGrow?: boolean;
}
declare const Textarea: React$1.ForwardRefExoticComponent<TextareaProps & React$1.RefAttributes<HTMLTextAreaElement>>;

declare function Toaster(props: ToasterProps): React$1.JSX.Element;

interface GlassCardProps extends React__default.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'thin';
    radius?: string;
    padding?: string;
    interactive?: boolean;
    /** 'auto' (domyślnie) podąża za globalnym trybem Glass/Normal.
     *  'solid' wymusza nb-tafla niezależnie od trybu — dla list z wieloma
     *  powtórzeniami (FAQ, opinie, siatki kart), gdzie dziesiątki elementów
     *  z drogim backdrop-filter SVG realnie zacinają scroll. Ma to sens
     *  tylko na elementach, które NIE są głównym punktem uwagi strony. */
    forceMode?: 'auto' | 'solid';
}
declare function GlassCard({ variant, radius, padding, interactive, forceMode, className, children, ...props }: GlassCardProps): React__default.JSX.Element;

declare function NbGlassFilters(): React__default.JSX.Element;

interface GlassPanelProps extends React__default.HTMLAttributes<HTMLDivElement> {
    direction?: 'row' | 'col';
}
declare function GlassPanel({ direction, className, children, ...props }: GlassPanelProps): React__default.JSX.Element;

interface GlassInputProps extends Omit<React__default.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    iconLeft?: React__default.ReactNode;
    iconRight?: React__default.ReactNode;
    size?: 'sm' | 'default' | 'lg';
}
declare function GlassInput({ iconLeft, iconRight, size, className, ...props }: GlassInputProps): React__default.JSX.Element;

interface GlassSearchProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    size?: 'sm' | 'default' | 'lg';
    className?: string;
    autoFocus?: boolean;
}
declare function GlassSearch({ placeholder, value, onChange, onSearch, size, className, autoFocus, }: GlassSearchProps): React__default.JSX.Element;

type GlassButtonVariant = 'primary' | 'hero' | 'solid' | 'ghost' | 'outline' | 'danger' | 'success';
type GlassButtonSize = 'sm' | 'default' | 'lg' | 'icon';
interface GlassButtonProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: GlassButtonVariant;
    size?: GlassButtonSize;
}
declare function GlassButton({ variant, size, className, children, disabled, ...props }: GlassButtonProps): React__default.JSX.Element;

interface GlassBadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    intent?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'default';
    dot?: boolean;
}
declare function GlassBadge({ intent, size, dot, className, children, ...props }: GlassBadgeProps): React__default.JSX.Element;

interface GlassStatProps {
    label: string;
    value: React__default.ReactNode;
    delta?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React__default.ReactNode;
    subtext?: string;
    className?: string;
}
declare function GlassStat({ label, value, delta, trend, icon, subtext, className, }: GlassStatProps): React__default.JSX.Element;

interface GlassModalProps {
    open: boolean;
    onClose: () => void;
    title?: React__default.ReactNode;
    description?: string;
    width?: string;
    className?: string;
    children: React__default.ReactNode;
    footer?: React__default.ReactNode;
}
declare function GlassModal({ open, onClose, title, description, width, className, children, footer, }: GlassModalProps): React__default.JSX.Element | null;

interface GlassNavProps extends React__default.HTMLAttributes<HTMLElement> {
    position?: 'top' | 'free';
}
declare function GlassNav({ position, className, children, ...props }: GlassNavProps): React__default.JSX.Element;
interface GlassNavItemProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}
declare function GlassNavItem({ active, className, children, ...props }: GlassNavItemProps): React__default.JSX.Element;
declare function GlassNavBrand({ className, children, ...props }: React__default.HTMLAttributes<HTMLDivElement>): React__default.JSX.Element;
declare function GlassNavSpacer(): React__default.JSX.Element;

interface Model {
    id: string;
    name: string;
    provider: string;
    badge?: string;
    description: string;
    fullDescription?: string;
    contextLabel?: string;
    tags: string[];
    cost?: number;
    needsSetup?: boolean;
    speed: 'fast' | 'balanced' | 'powerful';
    icon: React__default.ReactNode;
    metrics: {
        label: string;
        value: number;
    }[];
    messageCost: number;
    reasoningLevels: string[];
    group: 'NEXTBYTE' | 'INNE MODELE';
}
interface GlassModelSearchProps {
    className?: string;
    onSelect?: (model: Model) => void;
    selectedId?: string;
    models?: Model[];
    mode?: 'dropdown' | 'inline';
    placement?: 'top' | 'bottom';
    defaultOpen?: boolean;
}
declare function GlassModelSearch({ className, onSelect, selectedId, models, mode, placement, defaultOpen, }: GlassModelSearchProps): React__default.JSX.Element;

interface ComposerToggle {
    id: string;
    label: string;
    icon: React__default.ComponentType<{
        className?: string;
    }>;
    active?: boolean;
}
interface GlassChatComposerProps {
    modelName: string;
    modelIcon?: React__default.ComponentType<{
        className?: string;
    }>;
    modelCost?: number;
    modelMenuOpen?: boolean;
    onModelClick?: () => void;
    toggles?: ComposerToggle[];
    onToggle?: (id: string) => void;
    value?: string;
    onChange?: (v: string) => void;
    onSend?: () => void;
    placeholder?: string;
    tokenCount?: string;
    sendCost?: number;
    disabled?: boolean;
    footerText?: React__default.ReactNode;
    className?: string;
}
declare function GlassChatComposer({ modelName, modelIcon: ModelIcon, modelCost, modelMenuOpen, onModelClick, toggles, onToggle, value, onChange, onSend, placeholder, tokenCount, sendCost, disabled, footerText, className, }: GlassChatComposerProps): React__default.JSX.Element;

interface ModelPickerItem {
    id: string;
    name: string;
    description: string;
    icon: React__default.ComponentType<{
        className?: string;
    }>;
    cost?: number;
    needsSetup?: boolean;
}
interface ModelPickerGroup {
    label: string;
    items: ModelPickerItem[];
}
interface ModelMetric {
    label: string;
    /** 0–10 segmentów wypełnionych */
    value: number;
    max?: number;
}
interface ModelPickerDetail {
    name: string;
    badge: string;
    description: string;
    contextLabel: string;
    metrics: ModelMetric[];
    messageCost: number;
    reasoningLevels: string[];
    activeReasoningLevel?: string;
}
interface GlassModelPickerProps {
    groups: ModelPickerGroup[];
    activeId?: string;
    /** ID elementu który jest hover'owany/podejrzany (drugi po aktywnym) */
    peekId?: string;
    onSelect?: (item: ModelPickerItem) => void;
    detail: ModelPickerDetail;
    onReasoningLevelChange?: (level: string) => void;
    className?: string;
}
declare function GlassModelPicker({ groups, activeId, peekId, onSelect, detail, onReasoningLevelChange, className, }: GlassModelPickerProps): React__default.JSX.Element;

interface GlassRingSegment {
    pct: number;
    color: string;
}
interface GlassRingProps {
    value?: number;
    segments?: GlassRingSegment[];
    size?: number;
    variant?: 'full' | 'gauge';
    label?: React__default.ReactNode;
    sublabel?: string;
    subtext?: string;
    color?: string;
    thickness?: number;
    className?: string;
}
declare function GlassRing({ value, segments, size, variant, label, sublabel, subtext, color, thickness, className, }: GlassRingProps): React__default.JSX.Element;

interface GlassProgressProps {
    value: number;
    label?: string;
    valueLabel?: React__default.ReactNode;
    color?: string;
    size?: 'sm' | 'default';
    showMarker?: boolean;
    className?: string;
}
declare function GlassProgress({ value, label, valueLabel, color, size, showMarker, className, }: GlassProgressProps): React__default.JSX.Element;

type AlertIntent = 'info' | 'success' | 'warning' | 'danger';
interface GlassAlertProps {
    intent?: AlertIntent;
    title?: React__default.ReactNode;
    children?: React__default.ReactNode;
    onClose?: () => void;
    className?: string;
    icon?: React__default.ReactNode;
}
declare function GlassAlert({ intent, title, children, onClose, className, icon, }: GlassAlertProps): React__default.JSX.Element;

type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
interface GlassChipProps {
    color?: ChipColor;
    size?: 'sm' | 'default';
    onRemove?: () => void;
    active?: boolean;
    className?: string;
    children: React__default.ReactNode;
    onClick?: () => void;
}
declare function GlassChip({ color, size, onRemove, active, className, children, onClick, }: GlassChipProps): React__default.JSX.Element;

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'busy' | 'away' | 'offline';
interface GlassAvatarProps {
    src?: string;
    initials?: string;
    name?: string;
    size?: AvatarSize;
    status?: AvatarStatus;
    color?: string;
    className?: string;
}
declare function GlassAvatar({ src, initials, name, size, status, color, className, }: GlassAvatarProps): React__default.JSX.Element;
interface GlassAvatarGroupProps {
    avatars: Omit<GlassAvatarProps, 'size'>[];
    max?: number;
    size?: AvatarSize;
    className?: string;
}
declare function GlassAvatarGroup({ avatars, max, size, className, }: GlassAvatarGroupProps): React__default.JSX.Element;

type Side = 'top' | 'bottom' | 'left' | 'right';
interface GlassTooltipProps {
    content: React__default.ReactNode;
    children: React__default.ReactElement;
    side?: Side;
    delay?: number;
    className?: string;
}
declare function GlassTooltip({ content, children, side, delay, className, }: GlassTooltipProps): React__default.JSX.Element;

interface DropdownItem {
    key: string;
    label: React__default.ReactNode;
    icon?: React__default.ReactNode;
    danger?: boolean;
    disabled?: boolean;
    divider?: boolean;
}
interface GlassDropdownProps {
    trigger: React__default.ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}
declare function GlassDropdown({ trigger, items, align, className }: GlassDropdownProps): React__default.JSX.Element;
interface GlassDropdownSelectProps {
    options: {
        value: string;
        label: string;
    }[];
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    className?: string;
}
declare function GlassDropdownSelect({ options, value, onChange, placeholder, className, }: GlassDropdownSelectProps): React__default.JSX.Element;

interface SkeletonProps extends React__default.HTMLAttributes<HTMLDivElement> {
    radius?: string;
}
/** Pojedynczy blok — buduje wszystkie pozostałe warianty */
declare function GlassSkeleton({ radius, className, ...props }: SkeletonProps): React__default.JSX.Element;
declare function GlassSkeletonText({ lines, className, }: {
    lines?: number;
    className?: string;
}): React__default.JSX.Element;
declare const AV: {
    readonly xs: "h-6 w-6";
    readonly sm: "h-8 w-8";
    readonly md: "h-10 w-10";
    readonly lg: "h-12 w-12";
    readonly xl: "h-16 w-16";
};
declare function GlassSkeletonAvatar({ size, className, }: {
    size?: keyof typeof AV;
    className?: string;
}): React__default.JSX.Element;
/** Avatar + dwie linie — typowy wiersz listy */
declare function GlassSkeletonListItem({ className }: {
    className?: string;
}): React__default.JSX.Element;
declare function GlassSkeletonImage({ aspect, className, }: {
    aspect?: string;
    className?: string;
}): React__default.JSX.Element;
declare function GlassSkeletonCard({ image, className, }: {
    image?: boolean;
    className?: string;
}): React__default.JSX.Element;
declare function GlassSkeletonTable({ rows, cols, className, }: {
    rows?: number;
    cols?: number;
    className?: string;
}): React__default.JSX.Element;
declare function GlassSkeletonForm({ fields, className, }: {
    fields?: number;
    className?: string;
}): React__default.JSX.Element;

type SpinnerSize = 'sm' | 'md' | 'lg';
declare function GlassSpinner({ size, className, label, }: {
    size?: SpinnerSize;
    className?: string;
    label?: string;
}): React__default.JSX.Element;
declare function GlassSpinnerDots({ size, className, }: {
    size?: SpinnerSize;
    className?: string;
}): React__default.JSX.Element;
declare function GlassSpinnerBar({ top, className, }: {
    top?: boolean;
    className?: string;
}): React__default.JSX.Element;
declare function GlassLoadingOverlay({ label, fullScreen, className, }: {
    label?: string;
    fullScreen?: boolean;
    className?: string;
}): React__default.JSX.Element;

type EmptyVariant = 'ogolny' | 'brak-wynikow' | 'brak-danych' | 'blad';
interface GlassEmptyProps {
    variant?: EmptyVariant;
    icon?: React__default.ReactNode;
    title?: string;
    desc?: string;
    action?: React__default.ReactNode;
    compact?: boolean;
    bordered?: boolean;
    className?: string;
}
declare function GlassEmpty({ variant, icon, title, desc, action, compact, bordered, className, }: GlassEmptyProps): React__default.JSX.Element;

interface GlassAccordionProps {
    multiple?: boolean;
    defaultOpen?: string[];
    className?: string;
    children: React__default.ReactNode;
}
declare function GlassAccordion({ multiple, defaultOpen, className, children, }: GlassAccordionProps): React__default.JSX.Element;
interface ItemProps {
    value?: string;
    title: React__default.ReactNode;
    icon?: React__default.ReactNode;
    badge?: React__default.ReactNode;
    disabled?: boolean;
    /** Wymusza tryb solid niezależnie od Glass/Normal — dla dłuższych list
     *  (FAQ, itd.), gdzie każda pozycja z drogim backdrop-filter SVG
     *  realnie się sumuje. Patrz `forceMode` na GlassCard. */
    forceMode?: 'auto' | 'solid';
    className?: string;
    children: React__default.ReactNode;
}
declare function GlassAccordionItem({ value, title, icon, badge, disabled, forceMode, className, children, }: ItemProps): React__default.JSX.Element;
declare function GlassCollapsible({ title, defaultOpen, className, children, }: {
    title: React__default.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;

type DrawerSide = 'right' | 'left' | 'bottom' | 'top';
interface GlassDrawerProps {
    open: boolean;
    onClose: () => void;
    side?: DrawerSide;
    title?: React__default.ReactNode;
    desc?: React__default.ReactNode;
    footer?: React__default.ReactNode;
    /** Uchwyt do przeciągania — naturalny dla wariantu dolnego */
    handle?: boolean;
    className?: string;
    children: React__default.ReactNode;
}
declare function GlassDrawer({ open, onClose, side, title, desc, footer, handle, className, children, }: GlassDrawerProps): React__default.JSX.Element;

interface GlassActivityGridProps {
    weeksCount?: number;
    className?: string;
    showSummary?: boolean;
    showStreaks?: boolean;
    quote?: string;
    showContent?: boolean;
    title?: string;
    badgeText?: string;
    compact?: boolean;
    hideHeader?: boolean;
}
declare function GlassActivityGrid({ weeksCount, className, showSummary, showStreaks, quote, showContent, title, badgeText, compact, hideHeader, }: GlassActivityGridProps): React__default.JSX.Element;

interface GlassFeatureRowProps {
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    label: React__default.ReactNode;
    desc?: React__default.ReactNode;
    badge?: React__default.ReactNode;
    highlight?: boolean;
    className?: string;
}
declare function GlassFeatureRow({ icon: Icon, label, desc, badge, highlight, className, }: GlassFeatureRowProps): React__default.JSX.Element;

type CompareCellValue = 'yes' | 'no' | string;
interface GlassCompareTableProps {
    columns: string[];
    rows: {
        label: string;
        values: CompareCellValue[];
    }[];
    highlightLast?: boolean;
    className?: string;
}
declare function GlassCompareTable({ columns, rows, highlightLast, className }: GlassCompareTableProps): React__default.JSX.Element;

interface GlassTableColumn<T = Record<string, unknown>> {
    key: string;
    header: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    render?: (value: unknown, row: T, rowIndex: number) => React__default.ReactNode;
}
interface GlassTableProps<T = Record<string, unknown>> {
    columns: GlassTableColumn<T>[];
    data: T[];
    caption?: string;
    compact?: boolean;
    onRowClick?: (row: T, rowIndex: number) => void;
    className?: string;
    /** Klucz wiersza do identyfikacji zaznaczenia (domyślnie index). */
    rowKey?: (row: T, rowIndex: number) => string | number;
    /** Włącza kolumnę checkboxów + "zaznacz wszystko". */
    selectable?: boolean;
    selectedKeys?: Array<string | number>;
    onSelectionChange?: (keys: Array<string | number>) => void;
    /** Nagłówek przykleja się do góry scrollowanego kontenera. */
    stickyHeader?: boolean;
    maxHeight?: string;
}
declare function GlassTable<T extends Record<string, unknown>>({ columns, data, caption, compact, onRowClick, className, rowKey, selectable, selectedKeys, onSelectionChange, stickyHeader, maxHeight, }: GlassTableProps<T>): React__default.JSX.Element;

interface GlassLineChartPoint {
    label: string;
    value: number;
}
interface GlassLineSeries {
    points: GlassLineChartPoint[];
    color?: string;
    label?: string;
    showArea?: boolean;
}
interface GlassLineChartProps {
    series: GlassLineSeries[];
    height?: number;
    caption?: string;
    showGrid?: boolean;
    showDots?: boolean;
    showXLabels?: boolean;
    showYLabels?: boolean;
    className?: string;
}
declare function GlassLineChart({ series, height, caption, showGrid, showDots, showXLabels, showYLabels, className, }: GlassLineChartProps): React__default.JSX.Element;

interface GlassToggleProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    label?: React__default.ReactNode;
    description?: string;
    className?: string;
}
declare function GlassToggle({ checked, defaultChecked, onChange, size, disabled, label, description, className, }: GlassToggleProps): React__default.JSX.Element;

interface GlassSliderProps {
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number[]) => void;
    formatValue?: (v: number) => string;
    showValue?: boolean;
    disabled?: boolean;
    color?: string;
    className?: string;
}
declare function GlassSlider({ value, defaultValue, min, max, step, onChange, formatValue, showValue, disabled, color, className, }: GlassSliderProps): React__default.JSX.Element;

interface GlassPaginationProps {
    page: number;
    total: number;
    siblings?: number;
    onChange: (page: number) => void;
    size?: 'sm' | 'md';
    className?: string;
}
declare function GlassPagination({ page, total, siblings, onChange, size, className, }: GlassPaginationProps): React__default.JSX.Element;

interface GlassBarDatum {
    label: string;
    /** Pojedyncza wartość, albo tablica wartości dla wariantu grouped/stacked. */
    values: number | number[];
}
interface GlassBarChartProps {
    data: GlassBarDatum[];
    /** Kolory serii — indeks odpowiada indeksowi w `values`. */
    colors?: string[];
    /** Nazwy serii do legendy. */
    seriesLabels?: string[];
    orientation?: 'vertical' | 'horizontal';
    /** 'grouped' — słupki obok siebie, 'stacked' — jeden na drugim. */
    mode?: 'grouped' | 'stacked';
    height?: number;
    showGrid?: boolean;
    showValues?: boolean;
    showAxisLabels?: boolean;
    caption?: string;
    className?: string;
}
declare function GlassBarChart({ data, colors, seriesLabels, orientation, mode, height, showGrid, showValues, showAxisLabels, caption, className, }: GlassBarChartProps): React__default.JSX.Element;

interface GlassSparklineProps {
    data: number[];
    /** 'line' — krzywa, 'bar' — mini słupki. */
    variant?: 'line' | 'bar';
    color?: string;
    width?: number;
    height?: number;
    showArea?: boolean;
    /** Kropka na ostatnim punkcie — sygnalizuje stan bieżący. */
    showLastDot?: boolean;
    /** Kolor sam wynika ze znaku trendu (zielony w górę, czerwony w dół). */
    autoTrendColor?: boolean;
    className?: string;
}
declare function GlassSparkline({ data, variant, color, width, height, showArea, showLastDot, autoTrendColor, className, }: GlassSparklineProps): React__default.JSX.Element | null;

type ChatRole = 'user' | 'assistant' | 'system';
type ChatStatus = 'sending' | 'sent' | 'delivered' | 'read';
interface GlassChatBubbleProps {
    role?: ChatRole;
    children: React__default.ReactNode;
    /** Inicjały lub węzeł renderowany jako avatar obok bąbla. */
    avatar?: React__default.ReactNode;
    author?: string;
    time?: string;
    status?: ChatStatus;
    className?: string;
}
declare function GlassChatBubble({ role, children, avatar, author, time, status, className, }: GlassChatBubbleProps): React__default.JSX.Element;
declare function GlassChatTyping({ avatar, label, className }: {
    avatar?: React__default.ReactNode;
    label?: string;
    className?: string;
}): React__default.JSX.Element;
interface GlassChatHeaderProps {
    title: string;
    subtitle?: string;
    avatar?: React__default.ReactNode;
    /** Zielona kropka obecności przy avatarze. */
    online?: boolean;
    actions?: React__default.ReactNode;
    className?: string;
}
declare function GlassChatHeader({ title, subtitle, avatar, online, actions, className }: GlassChatHeaderProps): React__default.JSX.Element;
interface GlassChatInputProps {
    value?: string;
    onChange?: (v: string) => void;
    onSend?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Rząd sugestii nad polem — klik wstawia treść i wysyła. */
    suggestions?: string[];
    className?: string;
}
declare function GlassChatInput({ value, onChange, onSend, placeholder, disabled, suggestions, className, }: GlassChatInputProps): React__default.JSX.Element;
declare function GlassChatThread({ children, maxHeight, className, }: {
    children: React__default.ReactNode;
    maxHeight?: number;
    className?: string;
}): React__default.JSX.Element;

interface CommandItem {
    id: string;
    label: string;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    /** Nagłówek grupy, pod którym pozycja się pojawi. */
    group?: string;
    hint?: string;
    shortcut?: string;
    onRun?: () => void;
}
interface GlassCommandPaletteProps {
    open: boolean;
    onClose: () => void;
    items: CommandItem[];
    placeholder?: string;
    emptyText?: string;
    /** Renderuj inline zamiast jako overlay — do prezentacji w bibliotece. */
    inline?: boolean;
    className?: string;
}
declare function GlassCommandPalette({ open, onClose, items, placeholder, emptyText, inline, className, }: GlassCommandPaletteProps): React__default.JSX.Element | null;
/** Spina ⌘K / Ctrl+K z lokalnym stanem otwarcia palety. */
declare function useCommandPalette(): {
    open: boolean;
    setOpen: React__default.Dispatch<React__default.SetStateAction<boolean>>;
    close: () => void;
};

interface DateRange {
    from: Date | null;
    to: Date | null;
}
interface GlassCalendarProps {
    /** 'single' zwraca Date, 'range' zwraca DateRange. */
    mode?: 'single' | 'range';
    value?: Date | DateRange | null;
    onChange?: (value: Date | DateRange | null) => void;
    /** Miesiąc pokazany przy pierwszym renderze. */
    defaultMonth?: Date;
    minDate?: Date;
    maxDate?: Date;
    /** Kompaktowy widget — mniejsze komórki, np. do sidebaru. */
    compact?: boolean;
    className?: string;
}
declare function GlassCalendar({ mode, value, onChange, defaultMonth, minDate, maxDate, compact, className, }: GlassCalendarProps): React__default.JSX.Element;
interface GlassDatePickerProps {
    mode?: 'single' | 'range';
    value?: Date | DateRange | null;
    onChange?: (v: Date | DateRange | null) => void;
    placeholder?: string;
    className?: string;
}
declare function GlassDatePicker({ mode, value, onChange, placeholder, className, }: GlassDatePickerProps): React__default.JSX.Element;

interface ComboOption {
    value: string;
    label: string;
    hint?: string;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    disabled?: boolean;
}
interface GlassComboboxProps {
    options: ComboOption[];
    /** string dla trybu pojedynczego, string[] gdy `multiple`. */
    value?: string | string[];
    onChange?: (v: string | string[]) => void;
    multiple?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
}
declare function GlassCombobox({ options, value, onChange, multiple, placeholder, searchPlaceholder, emptyText, disabled, className, }: GlassComboboxProps): React__default.JSX.Element;

interface StepItem {
    label: string;
    description?: string;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
}
interface GlassStepperProps {
    steps: StepItem[];
    /** Indeks kroku bieżącego — wcześniejsze renderują się jako ukończone. */
    current: number;
    orientation?: 'horizontal' | 'vertical';
    /** Oznacza krok bieżący jako nieudany (czerwony X zamiast numeru). */
    error?: boolean;
    onStepClick?: (index: number) => void;
    className?: string;
}
declare function GlassStepper({ steps, current, orientation, error, onStepClick, className, }: GlassStepperProps): React__default.JSX.Element;
declare function GlassProgressSteps({ total, current, labels, className, }: {
    total: number;
    current: number;
    labels?: string[];
    className?: string;
}): React__default.JSX.Element;

interface GlassMediaCardProps {
    title: string;
    description?: string;
    meta?: string;
    badge?: string;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    gradient?: string;
    /** Miniatura po lewej zamiast nad treścią. */
    horizontal?: boolean;
    /** Nakładka z przyciskiem play — wariant wideo. */
    video?: boolean;
    duration?: string;
    footer?: React__default.ReactNode;
    onClick?: () => void;
    className?: string;
}
declare function GlassMediaCard({ title, description, meta, badge, icon, gradient, horizontal, video, duration, footer, onClick, className, }: GlassMediaCardProps): React__default.JSX.Element;
interface GlassProductCardProps {
    name: string;
    price: string;
    oldPrice?: string;
    badge?: string;
    rating?: number;
    reviews?: number;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    gradient?: string;
    /** Wyszarza kartę i blokuje CTA. */
    soldOut?: boolean;
    onAdd?: () => void;
    className?: string;
}
declare function GlassProductCard({ name, price, oldPrice, badge, rating, reviews, icon, gradient, soldOut, onAdd, className, }: GlassProductCardProps): React__default.JSX.Element;
interface GlassProfileCardProps {
    name: string;
    role?: string;
    bio?: string;
    initials?: string;
    /** Pasek statystyk pod bio — np. obserwujący / projekty. */
    stats?: {
        label: string;
        value: string;
    }[];
    online?: boolean;
    /** Pełny wariant dokłada pasek okładki nad avatarem. */
    cover?: boolean;
    gradient?: string;
    actions?: React__default.ReactNode;
    className?: string;
}
declare function GlassProfileCard({ name, role, bio, initials, stats, online, cover, gradient, actions, className, }: GlassProfileCardProps): React__default.JSX.Element;

type TimelineStatus = 'done' | 'active' | 'pending' | 'error';
interface TimelineEvent {
    title: string;
    description?: string;
    time?: string;
    status?: TimelineStatus;
    /** Ikona dostaje kolor przez `style`, więc typ musi go dopuszczać. */
    icon?: React__default.ComponentType<{
        className?: string;
        style?: React__default.CSSProperties;
    }>;
    /** Nadpisuje kolor markera i łącznika (np. kolor kategorii). */
    color?: string;
    meta?: React__default.ReactNode;
}
interface GlassTimelineProps {
    events: TimelineEvent[];
    orientation?: 'vertical' | 'horizontal';
    /** Węższe odstępy — do paneli bocznych. */
    compact?: boolean;
    className?: string;
}
declare function GlassTimeline({ events, orientation, compact, className, }: GlassTimelineProps): React__default.JSX.Element;
interface FeedItem {
    actor: string;
    action: string;
    target?: string;
    time: string;
    initials?: string;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    meta?: React__default.ReactNode;
}
declare function GlassActivityFeed({ items, className, }: {
    items: FeedItem[];
    className?: string;
}): React__default.JSX.Element;

/**
 * Zamyka Tab w obrębie kontenera i przywraca fokus tam, skąd przyszedł.
 * Podpiąć do modala/drawera: `const ref = useFocusTrap(open)`.
 */
declare function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean): React__default.RefObject<T | null>;
/** True, gdy system prosi o ograniczenie ruchu — użyj do wyłączenia animacji. */
declare function useReducedMotion(): boolean;
/** Treść wyłącznie dla czytników ekranu — niewidoczna, ale odczytywana. */
declare function SrOnly({ children }: {
    children: React__default.ReactNode;
}): React__default.JSX.Element;
/**
 * Region ogłoszeń dla czytnika. `polite` czeka na przerwę w mowie,
 * `assertive` przerywa — rezerwuj drugi dla błędów.
 */
declare function LiveRegion({ message, politeness, }: {
    message: string;
    politeness?: 'polite' | 'assertive';
}): React__default.JSX.Element;
/** Link pomijający nawigację — pierwszy w tab orderze, widoczny po fokusie. */
declare function SkipLink({ href, children }: {
    href?: string;
    children?: React__default.ReactNode;
}): React__default.JSX.Element;
/** Wizualna legenda skrótów klawiszowych. */
declare function GlassKbd({ keys, className }: {
    keys: string[];
    className?: string;
}): React__default.JSX.Element;

declare const MAXW: {
    readonly sm: "max-w-2xl";
    readonly md: "max-w-4xl";
    readonly lg: "max-w-6xl";
    readonly xl: "max-w-7xl";
    readonly full: "max-w-none";
};
declare function GlassContainer({ size, bleed, className, children, }: {
    size?: keyof typeof MAXW;
    /** Pełna szerokość — znosi max-width i padding boczny. */
    bleed?: boolean;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare const GAP: {
    readonly sm: "gap-2";
    readonly md: "gap-3";
    readonly lg: "gap-5";
};
declare function GlassGrid({ cols, gap, className, children, }: {
    cols?: 1 | 2 | 3 | 4 | 6;
    gap?: keyof typeof GAP;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
interface BentoTile {
    /** Ile kolumn z 4 zajmuje kafelek (1–4). */
    span?: 1 | 2 | 3 | 4;
    /** Ile rzędów zajmuje — daje charakterystyczną nierówną siatkę. */
    rows?: 1 | 2;
    content: React__default.ReactNode;
}
declare function GlassBento({ tiles, gap, className, }: {
    tiles: BentoTile[];
    gap?: keyof typeof GAP;
    className?: string;
}): React__default.JSX.Element;
/** Oparte na CSS columns — treść płynie w dół kolumny, więc kafelki
 *  o różnej wysokości nie zostawiają dziur jak w grid. */
declare function GlassMasonry({ cols, gap, className, children, }: {
    cols?: 2 | 3 | 4;
    gap?: keyof typeof GAP;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare const RATIO: {
    readonly '1/2': "lg:grid-cols-2";
    readonly '1/3': "lg:grid-cols-[1fr_2fr]";
    readonly '2/3': "lg:grid-cols-[2fr_1fr]";
    readonly '1/4': "lg:grid-cols-[1fr_3fr]";
};
declare function GlassSplit({ ratio, gap, reverse, className, children, }: {
    ratio?: keyof typeof RATIO;
    gap?: keyof typeof GAP;
    /** Odwraca kolejność na desktopie — mobile zawsze zostaje w DOM order. */
    reverse?: boolean;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare const SPACE: {
    readonly xs: "gap-1";
    readonly sm: "gap-2";
    readonly md: "gap-4";
    readonly lg: "gap-6";
    readonly xl: "gap-10";
};
declare const ALIGN: {
    readonly start: "items-start";
    readonly center: "items-center";
    readonly end: "items-end";
    readonly stretch: "items-stretch";
};
declare function GlassStack({ space, align, divide, className, children, }: {
    space?: keyof typeof SPACE;
    align?: keyof typeof ALIGN;
    /** Cienka linia między dziećmi. */
    divide?: boolean;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare const JUSTIFY: {
    readonly start: "justify-start";
    readonly center: "justify-center";
    readonly end: "justify-end";
    readonly between: "justify-between";
};
/** Poziomy rząd, który zawija się zamiast przepełniać — do pigułek,
 *  tagów, przycisków akcji. */
declare function GlassCluster({ space, justify, align, className, children, }: {
    space?: keyof typeof SPACE;
    justify?: keyof typeof JUSTIFY;
    align?: keyof typeof ALIGN;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare const ASPECT: {
    readonly '16/9': "aspect-video";
    readonly '1/1': "aspect-square";
    readonly '4/3': "aspect-[4/3]";
    readonly '3/2': "aspect-[3/2]";
    readonly '21/9': "aspect-[21/9]";
};
declare function GlassAspectRatio({ ratio, className, children, }: {
    ratio?: keyof typeof ASPECT;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;

declare function GlassDivider({ orientation, label, variant, className, }: {
    orientation?: 'horizontal' | 'vertical';
    /** Tekst na środku linii — linia rozdziela się na dwie części. */
    label?: React__default.ReactNode;
    variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
    className?: string;
}): React__default.JSX.Element;
declare function GlassOrb({ size, color, opacity, blur, className, style, }: {
    size?: number;
    color?: string;
    opacity?: number;
    blur?: number;
    className?: string;
    style?: React__default.CSSProperties;
}): React__default.JSX.Element;
declare function GlassNoise({ opacity, className, }: {
    opacity?: number;
    className?: string;
}): React__default.JSX.Element;
/** Poświata podążająca za kursorem. Nasłuch jest na kontenerze, nie na
 *  oknie — kilka spotlightów na stronie nie depcze sobie po evencie. */
declare function GlassSpotlight({ color, size, className, children, }: {
    color?: string;
    size?: number;
    className?: string;
    children?: React__default.ReactNode;
}): React__default.JSX.Element;
declare function GlassMeshGradient({ colors, opacity, className, }: {
    colors?: string[];
    opacity?: number;
    className?: string;
}): React__default.JSX.Element;
declare function GlassAurora({ className, speed, }: {
    className?: string;
    /** Czas jednego cyklu w sekundach — wyższy = spokojniej. */
    speed?: number;
}): React__default.JSX.Element;
/** Techniczne narożniki — dwie kreski w każdym rogu, jak celownik. */
declare function GlassCornerDecor({ size, color, corners, className, }: {
    size?: number;
    color?: string;
    corners?: 'all' | 'top' | 'bottom';
    className?: string;
}): React__default.JSX.Element;
/** Świecąca krawędź przez podwójną warstwę: gradientowe tło pod spodem
 *  i wewnętrzna powierzchnia z marginesem 1px, która je przykrywa. */
declare function GlassBorderGlow({ radius, color, animated, className, children, }: {
    radius?: string;
    color?: string;
    animated?: boolean;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;

declare function GlassList({ divided, className, children, }: {
    divided?: boolean;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
interface GlassListItemProps {
    title: React__default.ReactNode;
    description?: React__default.ReactNode;
    /** Lewa strefa — avatar, ikona, miniatura. */
    leading?: React__default.ReactNode;
    /** Prawa strefa — badge, przycisk, wartość. */
    trailing?: React__default.ReactNode;
    /** Strzałka po prawej i hover — sygnalizuje nawigację. */
    chevron?: boolean;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}
declare function GlassListItem({ title, description, leading, trailing, chevron, active, disabled, onClick, className, }: GlassListItemProps): React__default.JSX.Element;
declare function GlassBulletList({ items, ordered, 
/** Ptaszek zamiast kropki — do list korzyści. */
check, className, }: {
    items: React__default.ReactNode[];
    ordered?: boolean;
    check?: boolean;
    className?: string;
}): React__default.JSX.Element;
interface KeyValueRow {
    key: React__default.ReactNode;
    value: React__default.ReactNode;
    /** Wartość monospace + przycisk kopiowania (ID, hash, klucz). */
    mono?: boolean;
    copyable?: string;
}
declare function GlassKeyValue({ rows, 
/** 'row' — klucz i wartość w jednej linii; 'stack' — pod sobą. */
layout, className, }: {
    rows: KeyValueRow[];
    layout?: 'row' | 'stack';
    className?: string;
}): React__default.JSX.Element;
interface CloudTag {
    label: string;
    /** Waga 1–5 steruje rozmiarem i intensywnością koloru. */
    weight?: 1 | 2 | 3 | 4 | 5;
    onClick?: () => void;
}
declare function GlassTagCloud({ tags, className }: {
    tags: CloudTag[];
    className?: string;
}): React__default.JSX.Element;

interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    /** Liczba / status po prawej stronie wiersza. */
    badge?: React__default.ReactNode;
    disabled?: boolean;
}
interface GlassTreeViewProps {
    nodes: TreeNode[];
    /** Id-ki rozwinięte na starcie. */
    defaultExpanded?: string[];
    selectedId?: string;
    onSelect?: (node: TreeNode) => void;
    /** Pionowe kreski pokazujące poziom zagnieżdżenia. */
    showGuides?: boolean;
    className?: string;
}
declare function GlassTreeView({ nodes, defaultExpanded, selectedId, onSelect, showGuides, className, }: GlassTreeViewProps): React__default.JSX.Element;

interface KanbanCard {
    id: string;
    title: string;
    description?: string;
    /** Kolorowe pigułki nad tytułem — etykiety kategorii. */
    labels?: {
        text: string;
        color: string;
    }[];
    assignee?: string;
    comments?: number;
    attachments?: number;
    priority?: 'low' | 'medium' | 'high';
}
interface KanbanColumn {
    id: string;
    title: string;
    cards: KanbanCard[];
    /** Limit WIP — nagłówek zapala się na czerwono po przekroczeniu. */
    limit?: number;
    accent?: string;
}
declare function GlassKanbanCard({ card, dragging, onDragStart, onDragEnd, className, }: {
    card: KanbanCard;
    dragging?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    className?: string;
}): React__default.JSX.Element;
declare function GlassKanbanColumn({ column, children, onAdd, isDropTarget, ...dropProps }: {
    column: KanbanColumn;
    children?: React__default.ReactNode;
    onAdd?: () => void;
    isDropTarget?: boolean;
} & React__default.HTMLAttributes<HTMLDivElement>): React__default.JSX.Element;
declare function GlassKanbanBoard({ columns, onChange, onAddCard, className, }: {
    columns: KanbanColumn[];
    /** Wywoływane po przeniesieniu karty — zwraca cały nowy układ kolumn. */
    onChange?: (columns: KanbanColumn[]) => void;
    onAddCard?: (columnId: string) => void;
    className?: string;
}): React__default.JSX.Element;

interface GlassCodeBlockProps {
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
    /** Numery linii do podświetlenia (1-indeksowane). */
    highlight?: number[];
    /** Zwija blok powyżej N linii z przyciskiem rozwijania. */
    maxLines?: number;
    className?: string;
}
declare function GlassCodeBlock({ code, language, filename, showLineNumbers, highlight, maxLines, className, }: GlassCodeBlockProps): React__default.JSX.Element;
declare function GlassInlineCode({ children, className }: {
    children: React__default.ReactNode;
    className?: string;
}): React__default.JSX.Element;
declare function GlassJsonViewer({ data, className }: {
    data: unknown;
    className?: string;
}): React__default.JSX.Element;
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';
interface LogLine {
    time: string;
    level: LogLevel;
    message: string;
    source?: string;
}
declare function GlassLogView({ lines, maxHeight, 
/** Filtr poziomów — puste pokazuje wszystko. */
levels, className, }: {
    lines: LogLine[];
    maxHeight?: number;
    levels?: LogLevel[];
    className?: string;
}): React__default.JSX.Element;

interface GalleryItem {
    id: string;
    title?: string;
    caption?: string;
    gradient?: string;
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
    /** Własny węzeł zamiast placeholdera — tu wstawiasz <img>. */
    render?: React__default.ReactNode;
}
declare function GlassGallery({ items, cols, masonry, onOpen, className, }: {
    items: GalleryItem[];
    cols?: 2 | 3 | 4;
    /** Nierówne wysokości w układzie kolumnowym. */
    masonry?: boolean;
    onOpen?: (index: number) => void;
    className?: string;
}): React__default.JSX.Element;
declare function GlassLightbox({ items, index, onClose, onIndexChange, }: {
    items: GalleryItem[];
    /** null zamyka nakładkę. */
    index: number | null;
    onClose: () => void;
    onIndexChange: (i: number) => void;
}): React__default.JSX.Element | null;
declare function GlassCarousel({ items, autoPlay, interval, className, }: {
    items: GalleryItem[];
    autoPlay?: boolean;
    interval?: number;
    className?: string;
}): React__default.JSX.Element;
declare function GlassImageCompare({ before, after, labelBefore, labelAfter, className, }: {
    before: GalleryItem;
    after: GalleryItem;
    labelBefore?: string;
    labelAfter?: string;
    className?: string;
}): React__default.JSX.Element;

declare function GlassVideoPlayer({ title, duration, poster, className, }: {
    title?: string;
    /** Długość w sekundach. */
    duration?: number;
    /** Węzeł tła — np. <img> albo gradient. */
    poster?: React__default.ReactNode;
    className?: string;
}): React__default.JSX.Element;
declare function GlassAudioPlayer({ title, artist, duration, showWaveform, className, }: {
    title: string;
    artist?: string;
    duration?: number;
    showWaveform?: boolean;
    className?: string;
}): React__default.JSX.Element;

declare function GlassAuthCard({ title, subtitle, logo, footer, className, children, }: {
    title: string;
    subtitle?: string;
    logo?: React__default.ReactNode;
    footer?: React__default.ReactNode;
    className?: string;
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare function GlassPasswordField({ value, onChange, placeholder, showStrength, error, className, }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    showStrength?: boolean;
    error?: string;
    className?: string;
}): React__default.JSX.Element;
interface StrengthResult {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
    checks: {
        label: string;
        ok: boolean;
    }[];
}
/** Prosty, przewidywalny scoring — 5 kryteriów, wynik = liczba spełnionych.
 *  Świadomie bez zxcvbn: zero zależności, wystarczające jako sygnał w UI. */
declare function scorePassword(pw: string): StrengthResult;
declare function GlassPasswordStrength({ password, showChecks, className, }: {
    password: string;
    showChecks?: boolean;
    className?: string;
}): React__default.JSX.Element;
declare const PROVIDERS: {
    readonly google: {
        readonly label: "Google";
        readonly icon: React__default.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & React__default.RefAttributes<SVGSVGElement>>;
    };
    readonly github: {
        readonly label: "GitHub";
        readonly icon: React__default.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & React__default.RefAttributes<SVGSVGElement>>;
    };
    readonly apple: {
        readonly label: "Apple";
        readonly icon: React__default.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & React__default.RefAttributes<SVGSVGElement>>;
    };
};
declare function GlassSocialButtons({ providers, 
/** 'row' — same ikony obok siebie; 'stack' — pełne przyciski z tekstem. */
layout, onSelect, className, }: {
    providers?: (keyof typeof PROVIDERS)[];
    layout?: 'row' | 'stack';
    onSelect?: (p: keyof typeof PROVIDERS) => void;
    className?: string;
}): React__default.JSX.Element;
declare function GlassLoginForm({ onSubmit, error, loading, className, }: {
    onSubmit?: (data: {
        email: string;
        password: string;
        remember: boolean;
    }) => void;
    error?: string;
    loading?: boolean;
    className?: string;
}): React__default.JSX.Element;

interface FilterChip {
    id: string;
    label: string;
    value: string;
}
declare function GlassFilterBar({ query, onQueryChange, chips, onRemoveChip, onClearAll, placeholder, actions, className, }: {
    query: string;
    onQueryChange: (v: string) => void;
    /** Aktywne filtry jako zdejmowalne pigułki. */
    chips?: FilterChip[];
    onRemoveChip?: (id: string) => void;
    onClearAll?: () => void;
    placeholder?: string;
    actions?: React__default.ReactNode;
    className?: string;
}): React__default.JSX.Element;
declare function GlassBulkActionBar({ count, onClear, actions, 
/** Przykleja pasek do dołu ekranu, gdy coś jest zaznaczone. */
floating, className, }: {
    count: number;
    onClear?: () => void;
    actions?: React__default.ReactNode;
    floating?: boolean;
    className?: string;
}): React__default.JSX.Element | null;
declare function GlassSettingsSection({ title, description, children, className, }: {
    title: string;
    description?: string;
    children: React__default.ReactNode;
    className?: string;
}): React__default.JSX.Element;
declare function GlassDangerZone({ title, items, className, }: {
    title?: string;
    items: {
        label: string;
        description: string;
        action: string;
        onAction?: () => void;
    }[];
    className?: string;
}): React__default.JSX.Element;
declare function GlassApiKey({ label, value, createdAt, onRegenerate, className, }: {
    label: string;
    value: string;
    createdAt?: string;
    onRegenerate?: () => void;
    className?: string;
}): React__default.JSX.Element;
declare function GlassUsageBar({ label, used, total, unit, 
/** Próg, powyżej którego pasek zmienia kolor na ostrzegawczy. */
warnAt, className, }: {
    label: string;
    used: number;
    total: number;
    unit?: string;
    warnAt?: number;
    className?: string;
}): React__default.JSX.Element;
interface NotificationItem {
    id: string;
    title: string;
    description?: string;
    time: string;
    read?: boolean;
    intent?: 'info' | 'success' | 'warning' | 'error';
    icon?: React__default.ComponentType<{
        className?: string;
    }>;
}
declare function GlassNotificationCenter({ items, onMarkAllRead, onSelect, maxHeight, className, }: {
    items: NotificationItem[];
    onMarkAllRead?: () => void;
    onSelect?: (n: NotificationItem) => void;
    maxHeight?: number;
    className?: string;
}): React__default.JSX.Element;

declare function GlassQrCode({ value, size, quiet, label, className, }: {
    value: string;
    size?: number;
    /** Margines w modułach — norma wymaga 4, w UI 2 zwykle wystarcza. */
    quiet?: number;
    label?: string;
    className?: string;
}): React__default.JSX.Element;
declare function GlassCountdown({ to, onDone, compact, className, }: {
    to: Date;
    onDone?: () => void;
    compact?: boolean;
    className?: string;
}): React__default.JSX.Element;
/** Auto-odświeżający się względny czas („2 minuty temu"). */
declare function GlassRelativeTime({ date, className, }: {
    date: Date;
    className?: string;
}): React__default.JSX.Element;
declare function GlassBackToTop({ 
/** Po ilu pikselach przewinięcia przycisk się pojawia. */
threshold, target, className, }: {
    threshold?: number;
    /** Element przewijany — domyślnie okno. */
    target?: React__default.RefObject<HTMLElement>;
    className?: string;
}): React__default.JSX.Element | null;
interface TocEntry {
    id: string;
    label: string;
    level?: 1 | 2;
}
/** Spis treści z podświetleniem aktywnej sekcji przez IntersectionObserver. */
declare function GlassToc({ entries, title, className, }: {
    entries: TocEntry[];
    title?: string;
    className?: string;
}): React__default.JSX.Element;

declare function cn(...inputs: ClassValue[]): string;

declare const CHART_1 = "hsl(var(--chart-1, var(--primary)))";
declare const CHART_2 = "hsl(var(--chart-2, var(--brand-primary-light)))";
declare const CHART_3 = "hsl(var(--chart-3, var(--brand-primary-dark)))";
declare const CHART_4 = "hsl(var(--chart-4, var(--destructive)))";
declare const CHART_NEUTRAL = "hsl(var(--muted-foreground))";
declare const TINT_1 = "hsl(var(--primary))";
declare const TINT_2 = "color-mix(in oklch, hsl(var(--primary)) 74%, black 26%)";
declare const TINT_3 = "color-mix(in oklch, hsl(var(--primary)) 50%, black 50%)";
declare const TINT_4 = "color-mix(in oklch, hsl(var(--primary)) 30%, black 70%)";
declare const TINT_5 = "color-mix(in oklch, hsl(var(--primary)) 16%, black 84%)";
declare function tintFaded(color: string, pct: number): string;

interface GlassContextValue {
    isGlass: boolean;
    setIsGlass: (v: boolean) => void;
    toggle: () => void;
    showContent: boolean;
    setShowContent: (v: boolean) => void;
    toggleContent: () => void;
}
declare function GlassProvider({ children }: {
    children: React__default.ReactNode;
}): React__default.JSX.Element;
declare function useGlass(): GlassContextValue;
/** Zwraca 'nb-szklo' gdy glass mode aktywny, inaczej zwraca fallback */
declare function useGlassCls(fallback?: string): string;

declare function useAuthId(): string | null;

/**
 * Lightweight TypeScript hook for dynamic Liquid Glass scroll refraction.
 * Calculates scroll velocity, direction and depth position, updating CSS
 * variables with requestAnimationFrame.
 *
 * Only runs the rAF loop while something is actually moving (during/right
 * after a scroll) and stops once the values settle — the previous version
 * ran forever from mount, writing to document.documentElement.style every
 * single frame even at complete rest, which forces a style recalc on the
 * root (and everything that inherits from it) 60x/sec for no visual gain
 * and was the main source of page-wide jank alongside the backdrop-filter
 * tiles.
 */
declare function useLiquidGlassScroll(containerRef?: React.RefObject<HTMLElement | null>): void;

declare function useProfileBackgrounds(_userId?: string): {
    activeBackground: null;
};

declare function useProfilePatterns(_userId?: string): {
    activePattern: null;
};

export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, AppBackground, BG_OPTIONS, BackgroundDots, BackgroundGrid, BackgroundPlus, Badge, type BadgeProps, type BentoTile, type BgKey, BgToggle, Button, type ButtonProps, CHART_1, CHART_2, CHART_3, CHART_4, CHART_NEUTRAL, type ChatRole, type ChatStatus, Checkbox, CheckboxField, type CheckboxFieldProps, type CheckboxProps, type CheckboxSize, type CloudTag, type ComboOption, type CommandItem, type CompareCellValue, type ComposerToggle, type DateRange, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, type DrawerSide, type Elewacja, EmojiRating, type EmojiRatingProps, type FeedItem, Field, FieldGroup, type FieldGroupProps, type FieldProps, FileDropzone, type FileDropzoneProps, FileList, type FileListProps, FileUploadButton, type FileUploadButtonProps, type FilterChip, FormActions, type FormActionsProps, FormDivider, FormRow, type FormRowProps, FormSection, type FormSectionProps, type GalleryItem, GlassAccordion, GlassAccordionItem, GlassActivityFeed, GlassActivityGrid, GlassAlert, GlassApiKey, GlassAspectRatio, GlassAudioPlayer, GlassAurora, GlassAuthCard, GlassAvatar, GlassAvatarGroup, GlassBackToTop, GlassBadge, GlassBarChart, type GlassBarChartProps, type GlassBarDatum, GlassBento, GlassBorderGlow, GlassBulkActionBar, GlassBulletList, GlassButton, GlassCalendar, type GlassCalendarProps, GlassCard, GlassCarousel, GlassChatBubble, type GlassChatBubbleProps, GlassChatComposer, type GlassChatComposerProps, GlassChatHeader, GlassChatInput, GlassChatThread, GlassChatTyping, GlassChip, GlassCluster, GlassCodeBlock, type GlassCodeBlockProps, GlassCollapsible, GlassCombobox, type GlassComboboxProps, GlassCommandPalette, type GlassCommandPaletteProps, GlassCompareTable, GlassContainer, GlassCornerDecor, GlassCountdown, GlassDangerZone, GlassDatePicker, type GlassDatePickerProps, GlassDivider, GlassDrawer, GlassDropdown, GlassDropdownSelect, GlassEmpty, GlassFeatureRow, GlassFilterBar, GlassGallery, GlassGrid, GlassImageCompare, GlassInlineCode, GlassInput, GlassJsonViewer, GlassKanbanBoard, GlassKanbanCard, GlassKanbanColumn, GlassKbd, GlassKeyValue, GlassLightbox, GlassLineChart, type GlassLineChartPoint, type GlassLineSeries, GlassList, GlassListItem, type GlassListItemProps, GlassLoadingOverlay, GlassLogView, GlassLoginForm, GlassMasonry, GlassMediaCard, type GlassMediaCardProps, GlassMeshGradient, GlassModal, GlassModelPicker, type GlassModelPickerProps, GlassModelSearch, GlassNav, GlassNavBrand, GlassNavItem, GlassNavSpacer, GlassNoise, GlassNotificationCenter, GlassOrb, GlassPagination, GlassPanel, GlassPasswordField, GlassPasswordStrength, GlassProductCard, type GlassProductCardProps, GlassProfileCard, type GlassProfileCardProps, GlassProgress, GlassProgressSteps, GlassProvider, GlassQrCode, GlassRelativeTime, GlassRing, GlassSearch, GlassSettingsSection, GlassSkeleton, GlassSkeletonAvatar, GlassSkeletonCard, GlassSkeletonForm, GlassSkeletonImage, GlassSkeletonListItem, GlassSkeletonTable, GlassSkeletonText, GlassSlider, GlassSocialButtons, GlassSparkline, type GlassSparklineProps, GlassSpinner, GlassSpinnerBar, GlassSpinnerDots, GlassSplit, GlassSpotlight, GlassStack, GlassStat, GlassStepper, type GlassStepperProps, GlassTable, type GlassTableColumn, type GlassTableProps, GlassTagCloud, GlassTimeline, type GlassTimelineProps, GlassToc, GlassToggle, GlassTooltip, GlassTreeView, type GlassTreeViewProps, GlassUsageBar, GlassVideoPlayer, Input, InputError, InputHint, InputLabel, type InputProps, type Intencja, type KanbanCard, type KanbanColumn, type KeyValueRow, LiquidGlass, type LiquidGlassProps, LiveRegion, type LogLevel, type LogLine, type ModelMetric, type ModelPickerDetail, type ModelPickerGroup, type ModelPickerItem, NbGlassFilters, type NbTab, NbTabs, type NotificationItem, OtpInput, type OtpInputProps, PatternBackground, type PatternConfig, type PatternLocationKey, RadioCard, type RadioCardProps, RadioField, type RadioFieldProps, RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioSize, Rating, type RatingProps, type RodzajAkcji, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, type SelectTriggerProps, SelectValue, SkipLink, Slider, type SliderProps, SrOnly, type StepItem, type StrengthResult, Switch, SwitchField, type SwitchFieldProps, type SwitchProps, type SwitchSize, TINT_1, TINT_2, TINT_3, TINT_4, TINT_5, TOKENY_KAFELKA, Tabs, TabsContent, TabsGroup, TabsLine, TabsLineTrigger, TabsList, TabsTrigger, TagInput, type TagInputProps, TechGrid, Textarea, type TextareaProps, Tile, TileAction, type TileActionProps, TileFooter, TileHeader, type TileHeaderProps, TilePill, type TileProps, TileRow, type TileRowProps, type TimelineEvent, type TimelineStatus, Toaster, type TocEntry, type TreeNode, type UploadedFile, buttonVariants, cn, klasyKafelka, scorePassword, tintFaded, useAuthId, useCommandPalette, useFocusTrap, useGlass, useGlassCls, useLiquidGlassScroll, usePatternLocations, useProfileBackgrounds, useProfilePatterns, useReducedMotion };
