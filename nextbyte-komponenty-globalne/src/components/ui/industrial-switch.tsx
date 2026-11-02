import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { cn } from "@/lib/utils";

interface IndustrialSwitchProps {
  initialValue?: boolean;
  onToggle?: (val: boolean) => void;
  className?: string;
}

/**
 * NextByte Glassmorphism Switch
 * Theme-aware: kolor primary z motywu, glass surface, blur, glow-rim.
 * Zachowuje to samo API co poprzedni IndustrialSwitch.
 */
const IndustrialSwitch = ({
  initialValue = false,
  onToggle,
  className
}: IndustrialSwitchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useRef(`switch-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.checked = initialValue;
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle?.(e.target.checked);
  };

  return (
    <StyledWrapper className={cn(className)}>
      <div className="switch">
        <input
          ref={inputRef}
          className="switch-check"
          id={uniqueId.current}
          type="checkbox"
          defaultChecked={initialValue}
          onChange={handleChange}
        />
        <label className="switch-label" htmlFor={uniqueId.current}>
          Check
          <span />
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Responsive sizing */
  --switch-scale: 0.7;

  @media (min-width: 640px) {
    --switch-scale: 0.85;
  }

  @media (min-width: 1024px) {
    --switch-scale: 1;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: calc(120px * var(--switch-scale));
    height: calc(48px * var(--switch-scale));
    border-radius: 9999px;
    user-select: none;
    transform-origin: center;

    /* Glass surface – theme aware */
    background:
      linear-gradient(
        135deg,
        hsl(var(--primary) / 0.10) 0%,
        hsl(var(--card) / 0.40) 50%,
        hsl(var(--primary) / 0.05) 100%
      );
    /* Rozmycie i nasycenie z TOKENÓW PLATFORMY, nie z ręki: wpisane
       blur(24px) saturate(140%) znaczyło, że przełącznik jest jedyną
       powierzchnią, której suwak materiału w Bibliotece komponentów nie
       rusza. Reszta przepisu (gradient akcentu, rant, poświata) zostaje —
       to celowy wyróżnik tego przełącznika, a nie inny materiał.
       (Bez odwrotnych apostrofów — ten blok CSS jest szablonem JS.) */
    backdrop-filter: blur(var(--nb-szklo-rozmycie, 8.8px)) saturate(var(--nb-szklo-nasycenie, 130%));
    -webkit-backdrop-filter: blur(var(--nb-szklo-rozmycie, 8.8px)) saturate(var(--nb-szklo-nasycenie, 130%));
    border: 1px solid hsl(var(--primary) / 0.25);
    box-shadow:
      0 8px 32px hsl(var(--primary) / 0.18),
      0 0 0 1px hsl(var(--background) / 0.4) inset,
      0 1px 0 hsl(var(--foreground) / 0.06) inset;
    overflow: hidden;
  }

  /* Top primary glow-rim */
  .switch::after {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      hsl(var(--primary) / 0.6),
      transparent
    );
    pointer-events: none;
  }

  .switch-check {
    position: absolute;
    visibility: hidden;
    user-select: none;
  }

  .switch-label {
    cursor: pointer;
    display: block;
    height: 100%;
    width: 100%;
    text-indent: -9999px;
    user-select: none;
    position: relative;
  }

  /* OFF indicator (left) — active primary glow when unchecked */
  .switch-label:before {
    content: "";
    display: block;
    position: absolute;
    left: calc(10px * var(--switch-scale));
    top: 50%;
    transform: translateY(-50%);
    width: calc(8px * var(--switch-scale));
    height: calc(8px * var(--switch-scale));
    border-radius: 9999px;
    background: hsl(var(--primary));
    box-shadow:
      0 0 8px hsl(var(--primary) / 0.8),
      0 0 16px hsl(var(--primary) / 0.5);
    transition: all 0.25s ease-out;
    z-index: 2;
  }

  /* ON indicator (right) — dim when unchecked */
  .switch-label:after {
    content: "";
    display: block;
    position: absolute;
    right: calc(10px * var(--switch-scale));
    top: 50%;
    transform: translateY(-50%);
    width: calc(8px * var(--switch-scale));
    height: calc(8px * var(--switch-scale));
    border-radius: 9999px;
    background: hsl(var(--muted-foreground) / 0.35);
    box-shadow: none;
    transition: all 0.25s ease-out;
    z-index: 2;
  }

  /* Handle/Knob — glass pill with primary tint */
  .switch-label span {
    position: absolute;
    top: calc(4px * var(--switch-scale));
    left: calc(4px * var(--switch-scale));
    width: calc(52px * var(--switch-scale));
    height: calc(40px * var(--switch-scale));
    border-radius: 9999px;
    background:
      linear-gradient(
        180deg,
        hsl(var(--card) / 0.85) 0%,
        hsl(var(--card) / 0.65) 100%
      );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--primary) / 0.35);
    box-shadow:
      0 4px 16px hsl(var(--primary) / 0.25),
      0 1px 0 hsl(var(--foreground) / 0.10) inset,
      0 -1px 0 hsl(var(--background) / 0.30) inset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 3;
  }

  /* Knob highlight rim */
  .switch-label span:before {
    content: "";
    position: absolute;
    inset: 1px 1px auto 1px;
    height: 40%;
    border-radius: 9999px 9999px 50% 50%;
    background: linear-gradient(
      to bottom,
      hsl(var(--foreground) / 0.12),
      transparent
    );
    pointer-events: none;
  }

  .switch-label span:after {
    display: none;
  }

  /* Checked state — slide handle right */
  .switch-check:checked + .switch-label span {
    left: calc(64px * var(--switch-scale));
    border-color: hsl(var(--primary) / 0.55);
    box-shadow:
      0 4px 20px hsl(var(--primary) / 0.45),
      0 0 16px hsl(var(--primary) / 0.35),
      0 1px 0 hsl(var(--foreground) / 0.15) inset;
  }

  /* When checked: OFF dot dims, ON dot lights up */
  .switch-check:checked + .switch-label:before {
    background: hsl(var(--muted-foreground) / 0.35);
    box-shadow: none;
  }

  .switch-check:checked + .switch-label:after {
    background: hsl(var(--primary));
    box-shadow:
      0 0 8px hsl(var(--primary) / 0.8),
      0 0 16px hsl(var(--primary) / 0.5);
  }

  /* Active/pressed feedback */
  .switch-label:active span {
    transform: scale(0.96);
  }

  /* Hover lift */
  .switch:hover {
    border-color: hsl(var(--primary) / 0.4);
    box-shadow:
      0 10px 36px hsl(var(--primary) / 0.25),
      0 0 0 1px hsl(var(--background) / 0.4) inset,
      0 1px 0 hsl(var(--foreground) / 0.08) inset;
  }
`;

export default IndustrialSwitch;
