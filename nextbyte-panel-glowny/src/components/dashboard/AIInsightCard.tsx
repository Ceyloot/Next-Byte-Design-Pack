import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Plakietka, type IntencjaPlakietki } from '@/components/ui/plakietka';
import { Szkielet } from '@/components/ui/stany';
import { Brain, TrendingUp, Users, Target, Lightbulb, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChatStats } from '@/hooks/useChatStats';
import { useNavigate } from 'react-router-dom';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'team' | 'content' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  action?: string;
  icon: any;
}

// Kategoria niesie wyłącznie IKONĘ. Poprzednio każda miała własny gradient
// z palety Tailwinda (blue/pink/yellow/green) — na jasnych motywach nieczytelne,
// a żółć i zieleń zlewają się z akcentem na motywie Smoczym. Kolor znaczący
// jest jeden: akcent motywu.
const insightCategories = {
  performance: { icon: TrendingUp },
  team: { icon: Users },
  content: { icon: Lightbulb },
  strategy: { icon: Target },
} as const;

const PRIORYTET: Record<AIInsight['priority'], { intencja: IntencjaPlakietki; etykieta: string }> = {
  high: { intencja: 'krytyczna', etykieta: 'Wysoki' },
  medium: { intencja: 'uwaga', etykieta: 'Średni' },
  low: { intencja: 'neutralna', etykieta: 'Niski' },
};

export function AIInsightCard() {
  const navigate = useNavigate();
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { messageCount } = useChatStats();

  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Insight na podstawie aktywności chat
    if (messageCount > 10) {
      insights.push({
        id: '1',
        title: 'Aktywny Użytkownik AI',
        description: `Wysłałeś już ${messageCount} wiadomości w tym miesiącu! To pokazuje, że aktywnie wykorzystujesz AI do pracy.`,
        category: 'performance',
        priority: 'medium',
        action: 'Sprawdź historię',
        icon: Brain,
      });
    } else if (messageCount === 0) {
      insights.push({
        id: '1',
        title: 'Rozpocznij Przygodę z AI',
        description: 'Nie wysłałeś jeszcze żadnej wiadomości do Agent AI. To idealna okazja, aby rozpocząć!',
        category: 'performance',
        priority: 'high',
        action: 'Rozpocznij chat',
        icon: Brain,
      });
    }

    // Domyślny insight o możliwościach
    insights.push({
      id: '3',
      title: 'Odkryj Możliwości',
      description: 'Platforma oferuje kursy, szablony i narzędzia AI. Sprawdź wszystkie dostępne funkcje.',
      category: 'content',
      priority: 'low',
      action: 'Poznaj funkcje',
      icon: Lightbulb,
    });

    return insights;
  };

  const insights = generateInsights();

  useEffect(() => {
    if (insights.length === 0) return;

    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const generateNewInsight = async () => {
    if (insights.length === 0) return;

    setIsGenerating(true);
    // Simulate AI insight generation
    setTimeout(() => {
      setCurrentInsight(Math.floor(Math.random() * insights.length));
      setIsGenerating(false);
    }, 2000);
  };

  const handlePrevious = () => {
    setCurrentInsight((prev) =>
      prev === 0 ? insights.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentInsight((prev) =>
      (prev + 1) % insights.length
    );
  };

  // Add safety checks for insight and category
  const insight = insights[currentInsight];
  if (!insight) {
    return (
      <Tile>
        <TileHeader ikona={Brain} tytul="AI Insights" />
        {/* Szkielet ma kształt docelowej treści — po dojściu danych nic nie skacze. */}
        <Szkielet wierszy={3} />
      </Tile>
    );
  }

  const categoryInfo = insightCategories[insight.category];
  const prio = PRIORYTET[insight.priority];

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'Sprawdź historię':
        navigate('/chat-ai');
        break;
      case 'Rozpocznij chat':
        navigate('/chat-ai');
        break;
      case 'Poznaj funkcje':
        navigate('/konto');
        break;
      default:
        break;
    }
  };

  return (
    <Tile>
      <TileHeader
        ikona={Brain}
        tytul="AI Insights"
        poPrawej={
          <span className="flex items-center gap-2">
            <Plakietka intencja={prio.intencja}>{prio.etykieta}</Plakietka>
            <Button
              variant="cichy"
              size="sm"
              onClick={generateNewInsight}
              disabled={isGenerating}
              className="h-7 w-7 rounded-lg p-0"
              aria-label="Wylosuj inny insight"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </span>
        }
      />

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <categoryInfo.icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="mb-2 font-semibold text-card-foreground">{insight.title}</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
          </div>
        </div>

        {insight.action && (
          <div className="border-t border-border pt-4">
            <Button
              variant="glass"
              size="sm"
              onClick={() => handleActionClick(insight.action!)}
            >
              {insight.action}
            </Button>
          </div>
        )}
      </div>

      {/* Navigation controls */}
      {insights.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="cichy"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 rounded-full p-0"
            aria-label="Poprzedni insight"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>

          <div className="flex items-center gap-1">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentInsight(index)}
                className={`h-2 max-h-2 min-h-0 flex-shrink-0 rounded-full transition-all duration-300 ${
                  index === currentInsight
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                }`}
                aria-label={`Przejdź do insight ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="cichy"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 rounded-full p-0"
            aria-label="Następny insight"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </Tile>
  );
}
