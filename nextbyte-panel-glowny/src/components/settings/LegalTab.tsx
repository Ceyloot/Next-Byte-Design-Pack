import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Scale, Shield, Cookie, Gift } from 'lucide-react';
import { useScreenSize } from '@/hooks/use-mobile';
import DOMPurify from 'dompurify';
import { FuturisticLoader } from '@/components/ui/futuristic-loader';
import { SettingsPopup } from '@/components/chat/SettingsPopup';
import { SettingsPopupProvider, useSettingsPopup } from '@/contexts/SettingsPopupContext';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';

interface LegalDocument {
  id: string;
  document_key: string;
  title: string;
  content: string;
  icon: string;
  tab_label: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    FileText,
    Shield,
    Scale,
    Cookie,
    Gift
  };
  return icons[iconName] || FileText;
};

const LegalTab = () => {
  return (
    <SettingsPopupProvider>
      <LegalTabContent />
    </SettingsPopupProvider>
  );
};

const LegalTabContent = () => {
  const { isMobile, isTablet } = useScreenSize();
  const { openSettings, isOpen, defaultTab, closeSettings } = useSettingsPopup();

  // Fetch active legal documents
  const { data: legalDocs, isLoading } = useQuery({
    queryKey: ['legal-documents-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as LegalDocument[];
    }
  });

  // Transliterate Polish characters to ASCII equivalents for jsPDF compatibility
  const transliterate = (text: string): string =>
    text
      .replace(/ą/g, 'a').replace(/Ą/g, 'A')
      .replace(/ć/g, 'c').replace(/Ć/g, 'C')
      .replace(/ę/g, 'e').replace(/Ę/g, 'E')
      .replace(/ł/g, 'l').replace(/Ł/g, 'L')
      .replace(/ń/g, 'n').replace(/Ń/g, 'N')
      .replace(/ó/g, 'o').replace(/Ó/g, 'O')
      .replace(/ś/g, 's').replace(/Ś/g, 'S')
      .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
      .replace(/ż/g, 'z').replace(/Ż/g, 'Z');

  const handleDownloadPDF = (documentType: string) => {
    const doc = legalDocs?.find(d => d.document_key === documentType);
    if (!doc) return;

    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = 25;

      // Helper: add new page if needed
      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      };

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text(transliterate(doc.title), margin, y);
      y += 8;

      // Description
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(transliterate(doc.description || ''), margin, y);
      y += 10;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Parse content - strip HTML tags and render as text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formatMarkdownToHtml(doc.content);

      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = transliterate(node.textContent?.trim() || '');
          if (text) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(40, 40, 40);
            const lines = pdf.splitTextToSize(text, maxWidth);
            for (const line of lines) {
              checkPage(6);
              pdf.text(line, margin, y);
              y += 5;
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();

          if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
            y += 4;
            checkPage(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(tag === 'h1' ? 16 : tag === 'h2' ? 13 : 11);
            pdf.setTextColor(20, 20, 20);
            const lines = pdf.splitTextToSize(transliterate(el.textContent || ''), maxWidth);
            for (const line of lines) {
              checkPage(7);
              pdf.text(line, margin, y);
              y += 7;
            }
            y += 2;
          } else if (tag === 'li') {
            checkPage(6);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(40, 40, 40);
            const text = transliterate(el.textContent || '');
            const lines = pdf.splitTextToSize(text, maxWidth - 6);
            pdf.text('•', margin + 2, y);
            for (let i = 0; i < lines.length; i++) {
              checkPage(5);
              pdf.text(lines[i], margin + 6, y);
              y += 5;
            }
          } else if (tag === 'p') {
            const text = transliterate(el.textContent?.trim() || '');
            if (text) {
              checkPage(6);
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(10);
              pdf.setTextColor(40, 40, 40);
              const lines = pdf.splitTextToSize(text, maxWidth);
              for (const line of lines) {
                checkPage(5);
                pdf.text(line, margin, y);
                y += 5;
              }
              y += 3;
            }
          } else if (tag === 'strong' || tag === 'b') {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            const text = transliterate(el.textContent?.trim() || '');
            if (text) {
              checkPage(6);
              const lines = pdf.splitTextToSize(text, maxWidth);
              for (const line of lines) {
                pdf.text(line, margin, y);
                y += 5;
              }
            }
            pdf.setFont('helvetica', 'normal');
          } else {
            el.childNodes.forEach(processNode);
          }
        }
      };

      tempDiv.childNodes.forEach(processNode);

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Wygenerowano przez NextByte', pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(10);
      }

      pdf.save(`${doc.title.replace(/\s+/g, '_')}.pdf`);
    });
  };

  // Handle clicks on links within content
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href === '#cookies' || target.textContent?.includes('plików cookie')) {
        e.preventDefault();
        openSettings('cookies');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FuturisticLoader size="md" showReflection={false} />
      </div>
    );
  }

  if (!legalDocs || legalDocs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Brak dostępnych dokumentów prawnych.</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-3 p-2">
      {/* `bg-background/45` zdjęte — narzędzie Tailwinda leży w arkuszu niżej
          niż warstwa komponentów, więc BIŁO wypełnienie z `glass-effect`
          i karta miała 45% krycia zamiast wartości z tokenu motywu. */}
      <div className="glass-effect border-brand-primary/30 rounded-2xl overflow-hidden">
        <LegalTabsInner
          legalDocs={legalDocs}
          isMobile={isMobile}
          isTablet={isTablet}
          handleContentClick={handleContentClick}
          handleDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
    <SettingsPopup open={isOpen} onOpenChange={closeSettings} defaultTab={defaultTab} />
    </>
  );
};

const LegalTabsInner: React.FC<{
  legalDocs: LegalDocument[];
  isMobile: boolean;
  isTablet: boolean;
  handleContentClick: (e: React.MouseEvent) => void;
  handleDownloadPDF: (key: string) => void;
}> = ({ legalDocs, isMobile, isTablet, handleContentClick, handleDownloadPDF }) => {
  const initialTab = legalDocs[0]?.document_key || 'terms';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  useEffect(() => {
    if (!legalDocs.find((d) => d.document_key === activeTab)) {
      setActiveTab(initialTab);
    }
  }, [legalDocs, initialTab, activeTab]);

  const activeDoc = legalDocs.find((d) => d.document_key === activeTab);
  const ActiveIcon = activeDoc ? getIconComponent(activeDoc.icon) : FileText;

  return (
    <div className="w-full">
      <div className="p-4">
        <AnimatedTabs
          layoutId="legal-tab-pill"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={legalDocs.map((doc) => ({ value: doc.document_key, label: doc.tab_label }))}
        />
      </div>

      {activeDoc && (
        <div className="p-4 pt-0">
          <div className="glass-effect bg-foreground/5 border-border/50 rounded-xl overflow-hidden">
            <CardHeader className={isMobile ? 'p-4' : 'p-4'}>
              <CardTitle className={`flex items-center gap-2 text-brand-primary ${isMobile ? 'text-base' : 'text-lg sm:text-xl'}`}>
                <ActiveIcon className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
                {activeDoc.title}
              </CardTitle>
              <CardDescription className={`text-brand-text-secondary ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {activeDoc.description}
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-0' : 'p-4 pt-0'}>
              <ScrollArea className={`${isMobile ? 'h-48' : isTablet ? 'h-64' : 'h-64 sm:h-80 lg:h-96'} pr-2 sm:pr-4`}>
                <div
                  className={`space-y-3 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-foreground prose prose-invert max-w-none`}
                  onClick={handleContentClick}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(formatMarkdownToHtml(activeDoc.content), {
                      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'a', 'br', 'div'],
                      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
                    }),
                  }}
                />
              </ScrollArea>
              <Button variant="glass" onClick={() => handleDownloadPDF(activeDoc.document_key)} className={`mt-4 ${isMobile ? 'w-full text-xs' : 'w-full sm:w-auto'}`} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Pobierz PDF
              </Button>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalTab;
