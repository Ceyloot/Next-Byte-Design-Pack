import * as React from "react"
import { cn } from "../../lib/utils"

/* ── FormSection — nagłówek + opis + treść pola ──────────────────── */
export interface FormSectionProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children, className }) => (
  <div className={cn("space-y-4", className)}>
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </div>
)

/* ── FormRow — 1 lub 2 kolumny pól obok siebie ───────────────────── */
export interface FormRowProps {
  columns?: 1 | 2
  children: React.ReactNode
  className?: string
}

export const FormRow: React.FC<FormRowProps> = ({ columns = 2, children, className }) => (
  <div className={cn("grid gap-4", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1", className)}>
    {children}
  </div>
)

/* ── FormDivider — separator między sekcjami formularza ──────────── */
export const FormDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("border-t border-border", className)} />
)

/* ── FieldGroup — powiązane pola z ramką (np. adres) ─────────────── */
export interface FieldGroupProps {
  label?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ label, children, className }) => (
  <fieldset className={cn("rounded-2xl border border-border p-4 space-y-3", className)}>
    {label && <legend className="px-1.5 text-xs font-semibold text-foreground/70">{label}</legend>}
    {children}
  </fieldset>
)

/* ── FormActions — pasek przycisków submit / anuluj ──────────────── */
export interface FormActionsProps {
  children: React.ReactNode
  align?: "left" | "right" | "between"
  className?: string
}

export const FormActions: React.FC<FormActionsProps> = ({ children, align = "right", className }) => (
  <div
    className={cn(
      "flex items-center gap-2 pt-1",
      align === "right" && "justify-end",
      align === "left" && "justify-start",
      align === "between" && "justify-between",
      className,
    )}
  >
    {children}
  </div>
)
