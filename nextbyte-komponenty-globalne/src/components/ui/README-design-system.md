# Design System Components

Ten plik zawiera genialny design system oparty na pięknym stylu z zarządzania kursami.

## Komponenty

### GradientCard
Karta z gradientem i blur effect
```tsx
<GradientCard variant="blue" blur>
  Zawartość karty
</GradientCard>
```

### SectionHeader
Header sekcji z ikoną, tytułem i opcjonalnym badge
```tsx
<SectionHeader 
  emoji="🎯" 
  title="Panel kontrolny"
  description="Zarządzaj kursem i jego strukturą"
  badge="Active"
  badgeVariant="primary"
/>
```

### ActionBar
Bar z akcjami - ładny gradient background
```tsx
<ActionBar 
  emoji="⚙️"
  title="Akcje szybkie"
  description="Zarządzaj kursami"
  variant="primary"
>
  <Button>Akcja 1</Button>
  <Button>Akcja 2</Button>
</ActionBar>
```

### StatCard
Karta statystyk z hover effect
```tsx
<StatCard 
  title="Kursy"
  value={42}
  icon={BookOpen}
  variant="blue"
/>
```

### FormSection
Sekcja formularza z kolorowymi gradientami
```tsx
<FormSection 
  title="Dodaj rozdział"
  emoji="📚"
  variant="blue"
>
  <Input placeholder="Tytuł" />
  <Button>Dodaj</Button>
</FormSection>
```

### GlassButton
Przycisk z glass effect
```tsx
<GlassButton variant="primary" size="lg">
  Zapisz zmiany
</GlassButton>
```

### DarkPageLayout
Layout strony z gradientowym tłem
```tsx
<DarkPageLayout>
  Zawartość strony
</DarkPageLayout>
```

### GlassContainer
Standardowy kontener z efektem glassmorphism - półprzezroczyste ciemne tło z mocnym blur effect i subtelnymi ramkami.

**Użycie jako klasa CSS:**
```tsx
<div className="glass-container p-6">
  Zawartość
</div>

{/* Warianty kolorystyczne */}
<div className="glass-container-primary p-6">Primary variant</div>
<div className="glass-container-blue p-6">Blue variant</div>
<div className="glass-container-purple p-6">Purple variant</div>
<div className="glass-container-green p-6">Green variant</div>
```

**Użycie w React z DesignSystemClasses:**
```tsx
import { DesignSystemClasses } from '@/components/ui/design-system';

<div className={DesignSystemClasses.glassContainer}>
  Zawartość
</div>

{/* Lub z dodatkowymi klasami */}
<div className={`${DesignSystemClasses.glassContainer} p-6`}>
  Zawartość z paddingiem
</div>

{/* Warianty */}
<div className={DesignSystemClasses.glassContainerPrimary}>Primary</div>
<div className={DesignSystemClasses.glassContainerBlue}>Blue</div>
<div className={DesignSystemClasses.glassContainerPurple}>Purple</div>
<div className={DesignSystemClasses.glassContainerGreen}>Green</div>
```

**Cechy glass-container:**
- ✅ Półprzezroczyste ciemne tło (bg-black/40)
- ✅ Mocny efekt blur (backdrop-blur-xl)
- ✅ Subtelna ramka w kolorze primary/20
- ✅ Duży cień dla głębi (shadow-xl)
- ✅ Zaokrąglone rogi (rounded-lg)
- ✅ Hover effects (jaśniejsza ramka przy najechaniu)
- ✅ Płynne przejścia (transition-all)

## Modal/Dialog Patterns

### Full-Height Modal Pattern
Dla dużych modali z treścią, które wykorzystują pełną przestrzeń:

```tsx
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-md border-brand-primary/30 shadow-2xl p-0 gap-0">
  {/* Sticky Header */}
  <DialogHeader className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm p-6 pb-4 border-b border-brand-primary/20">
    <DialogTitle className="text-2xl text-white font-bold">
      Tytuł modala
    </DialogTitle>
    <DialogDescription className="text-white/70 text-base">
      Opis modala
    </DialogDescription>
  </DialogHeader>
  
  {/* Scrollable Content */}
  <div className="px-6">
    {/* Treść modala */}
  </div>
  
  {/* Sticky Footer */}
  <div className="sticky bottom-0 z-10 flex justify-end gap-4 p-6 pt-6 bg-black/90 backdrop-blur-sm border-t border-brand-primary/30">
    <Button variant="outline" onClick={handleClose}>Anuluj</Button>
    <Button onClick={handleSave}>Zapisz</Button>
  </div>
</DialogContent>
```

**Kluczowe elementy:**
- `p-0 gap-0` usuwa domyślne paddingi DialogContent
- Sticky header i footer z właściwą dystrybucją paddingów
- Obszar treści używa tylko poziomych paddingów (`px-6`)
- Glassmorphism tła z backdrop blur
- Właściwe z-index dla sticky elementów

## CSS Classes

Możesz też używać gotowych klas CSS:

```css
.glass-card-blue
.glass-card-purple  
.glass-card-green
.btn-glass-primary
.dark-page-bg
.text-primary-gradient
.hover-lift
```

## Kolory/Warianty

- `blue` - niebieski gradient
- `purple` - fioletowy gradient  
- `green` - zielony gradient
- `orange` - pomarańczowy gradient
- `red` - czerwony gradient
- `primary` - główny brand color (brand-primary do niebieski)

## Przykład użycia

```tsx
import { 
  DarkPageLayout, 
  GradientCard, 
  SectionHeader, 
  ActionBar, 
  FormSection,
  GlassButton 
} from '@/components/ui/design-system';

function MyPage() {
  return (
    <DarkPageLayout>
      <SectionHeader 
        emoji="🚀"
        title="Moja strona"
        description="Opis strony"
        badge="New"
        badgeVariant="primary"
      />
      
      <ActionBar 
        emoji="⚙️"
        title="Panel kontrolny"
        variant="primary"
      >
        <GlassButton variant="blue">Akcja 1</GlassButton>
        <GlassButton variant="green">Akcja 2</GlassButton>
      </ActionBar>

      <div className="grid grid-cols-3 gap-6">
        <FormSection title="Sekcja 1" variant="blue">
          <Input className="glass-input-blue" />
        </FormSection>
        
        <FormSection title="Sekcja 2" variant="purple">
          <Input className="glass-input-purple" />
        </FormSection>
        
        <FormSection title="Sekcja 3" variant="green">
          <Input className="glass-input-green" />
        </FormSection>
      </div>
    </DarkPageLayout>
  );
}
```

Ten design system zapewnia:
✅ Consistent styling w całej aplikacji  
✅ Piękne gradienty i blur effects
✅ Responsive design
✅ Dark mode friendly
✅ Łatwe w użyciu komponenty
✅ Accessibility
✅ Animations i hover effects