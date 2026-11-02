# UI Components

This directory contains reusable UI components built with Radix UI and styled with Tailwind CSS.

## Components

### Spinner

A versatile loading spinner component for consistent loading states across the application.

**Import:**
```tsx
import { Spinner } from '@/components/ui/spinner';
```

**Variants:**
- `default` - Brand-colored border spinner (best for dark backgrounds)
- `icon` - Loader2 icon spinner from lucide-react
- `light` - White border spinner (for light backgrounds)
- `secondary` - Secondary-colored border spinner

**Sizes:**
- `sm` - 16x16px (h-4 w-4)
- `default` - 32x32px (h-8 w-8)
- `lg` - 48x48px (h-12 w-12)
- `xl` - 64x64px (h-16 w-16)

**Examples:**

```tsx
// Default brand spinner
<Spinner />

// Small icon spinner
<Spinner variant="icon" size="sm" useIcon />

// Large white spinner for light backgrounds
<Spinner variant="light" size="lg" />

// Centered loading state
<div className="flex justify-center py-8">
  <Spinner />
</div>

// With text
<div className="text-center py-8">
  <Spinner className="mx-auto" />
  <p className="text-white/70 mt-4">Ładowanie...</p>
</div>
```

**Props:**
- `variant?: 'default' | 'icon' | 'light' | 'secondary'`
- `size?: 'sm' | 'default' | 'lg' | 'xl'`
- `useIcon?: boolean` - Use Loader2 icon instead of border spinner
- `className?: string` - Additional CSS classes

---

### Other Components

For other UI components in this directory, refer to their individual TypeScript definitions and examples in the codebase.

## Design System

All components use semantic tokens from:
- `src/index.css` - CSS variables and design tokens
- `tailwind.config.ts` - Tailwind configuration

Always use semantic tokens (like `bg-brand-primary`, `text-foreground`) instead of direct colors for consistency with the design system.
