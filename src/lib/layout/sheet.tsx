import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = 'SheetOverlay';

const sheetVariants = cva(
  [
    'fixed z-50 flex flex-col nb-glass-static',
    'transition ease-in-out',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:duration-200 data-[state=open]:duration-300',
  ],
  {
    variants: {
      side: {
        right: [
          'inset-y-0 right-0 h-full border-l border-foreground/[0.10]',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        ],
        left: [
          'inset-y-0 left-0 h-full border-r border-foreground/[0.10]',
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        ],
        top: [
          'inset-x-0 top-0 w-full border-b border-foreground/[0.10]',
          'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        ],
        bottom: [
          'inset-x-0 bottom-0 w-full border-t border-foreground/[0.10]',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        ],
      },
      size: {
        sm:      'max-w-xs',
        default: 'max-w-md',
        lg:      'max-w-lg',
        xl:      'max-w-2xl',
        full:    'max-w-full',
      },
    },
    defaultVariants: { side: 'right', size: 'default' },
  }
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, side, size, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side, size }), className)}
      {...props}
    >
      {children}
      <SheetClose className="absolute right-4 top-4 rounded-lg p-1.5 opacity-60 transition-opacity hover:opacity-100 text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="h-4 w-4" />
        <span className="sr-only">Zamknij</span>
      </SheetClose>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = 'SheetContent';

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4 border-b border-foreground/[0.08] pr-12', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-2 px-6 py-4 border-t border-foreground/[0.08] mt-auto', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-base font-semibold text-foreground', className)} {...props} />
));
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
SheetDescription.displayName = 'SheetDescription';

const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)} {...props} />
);
SheetBody.displayName = 'SheetBody';

export {
  Sheet, SheetTrigger, SheetClose, SheetContent,
  SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetBody,
};
