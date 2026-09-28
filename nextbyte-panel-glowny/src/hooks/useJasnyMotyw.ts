import { useEffect, useState } from 'react';

/**
 * Czy aktywny motyw jest jasny — po jasności `--background` (> 50%).
 * Wspólne dla paska bocznego i pigułki: oba przyciemniają biały znak
 * NextByte w jasnym motywie, więc muszą to rozstrzygać tak samo.
 */
export const useJasnyMotyw = () => {
  const [jasny, setJasny] = useState(false);

  useEffect(() => {
    const sprawdz = () => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
      const m = bg.match(/(\d+(?:\.\d+)?)%\s*$/);
      setJasny(m ? Number(m[1]) > 50 : false);
    };
    sprawdz();
    const obserwator = new MutationObserver(sprawdz);
    obserwator.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
    window.addEventListener('themeChanged', sprawdz);
    return () => { obserwator.disconnect(); window.removeEventListener('themeChanged', sprawdz); };
  }, []);

  return jasny;
};
