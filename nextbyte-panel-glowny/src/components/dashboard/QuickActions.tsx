import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Sparkles, Smartphone, Calendar, ListTodo, MessageSquare, StickyNote } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tile, TileHeader, klasyKafelka } from '@/components/ui/tile';

const quickActions = [
  {
    title: 'Personalny Asystent',
    description: 'Twój osobisty asystent AI',
    icon: Sparkles,
    href: '/asystent-nextbyte',
  },
  {
    title: 'Chat AI',
    description: 'Rozmawiaj z AI bez limitu',
    icon: MessageSquare,
    href: '/chat-ai',
  },
  {
    title: 'Kalendarz',
    description: 'Planuj swój dzień z AI',
    icon: Calendar,
    href: '/kalendarz',
  },
  {
    title: 'Zadania',
    description: 'Zarządzaj swoimi zadaniami',
    icon: ListTodo,
    href: '/zadania',
  },
  {
    title: 'Notatki',
    description: 'Twórz i organizuj notatki',
    icon: StickyNote,
    href: '/notatki',
  }
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

// Skróty w środku karty jadą z `klasyKafelka` — to samo chrome co skróty
// „Szybkiej Podróży". Elewacja płaska, bo kafelek w kafelku z własnym cieniem
// czytałby się jak dwie nałożone szyby.
const KLASY_SKROTU = cn(
  klasyKafelka({ interaktywny: true, zwarty: true, elewacja: 'plaska' }),
  'group h-full w-full items-center gap-3 text-center',
);

export function QuickActions() {
  const { isInstallable, installApp } = usePWAInstall();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "Aplikacja zainstalowana!",
        description: "NextByte zostało dodane do ekranu głównego",
      });
    } else {
      toast({
        title: "Instalacja anulowana",
        description: "Możesz zainstalować aplikację później",
        variant: "destructive"
      });
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const showInstallButton = isInstallable && isMobile;

  return (
    <Tile>
      <TileHeader ikona={Zap} tytul="Szybkie Akcje" />

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {showInstallButton && (
          <motion.div variants={itemVariants}>
            <button type="button" onClick={handleInstall} className={KLASY_SKROTU}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                <Smartphone className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium leading-tight text-card-foreground">
                  Dodaj do telefonu
                </span>
                <span className="mt-1 block text-[10px] leading-tight text-muted-foreground">
                  Aplikacja na ekranie
                </span>
              </span>
            </button>
          </motion.div>
        )}

        {quickActions.map((action) => (
          <motion.div key={action.title} variants={itemVariants}>
            <Link to={action.href} className={KLASY_SKROTU}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                <action.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium leading-tight text-card-foreground">
                  {action.title}
                </span>
                <span className="mt-1 block text-[10px] leading-tight text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Tile>
  );
}
