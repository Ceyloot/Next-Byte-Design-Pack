import * as React from 'react';

export type UIStyleMode = 'flat' | 'glass' | 'liquid';

interface UIStyleContextProps {
  styleMode: UIStyleMode;
  setStyleMode: (mode: UIStyleMode) => void;
}

const UIStyleContext = React.createContext<UIStyleContextProps>({
  styleMode: 'liquid',
  setStyleMode: () => {},
});

export function UIStyleProvider({ children, initialMode = 'liquid' }: { children: React.ReactNode; initialMode?: UIStyleMode }) {
  const [styleMode, setStyleMode] = React.useState<UIStyleMode>(initialMode);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-ui-style', styleMode);
  }, [styleMode]);

  return (
    <UIStyleContext.Provider value={{ styleMode, setStyleMode }}>
      {children}
    </UIStyleContext.Provider>
  );
}

export function useUIStyle() {
  return React.useContext(UIStyleContext);
}
