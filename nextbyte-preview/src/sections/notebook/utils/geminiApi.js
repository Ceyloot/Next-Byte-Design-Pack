/**
 * Utility functions for communicating with the Google Gemini API.
 */

import { trackUsage, calcCost } from './usageTracker';
import { trackGemini } from '../telebyte'; // TELEBYTE — usunąć z importem folderu

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export function normalizeModelName(model) {
  if (!model || typeof model !== 'string') return 'gemini-2.5-flash';
  const clean = model.trim();
  if (clean.includes('3.1') || clean.includes('3.0') || clean.includes('3-') || clean.includes('fake')) {
    return 'gemini-2.5-flash';
  }
  return clean;
}

/**
 * Post-processes model answer text to fix two formatting bugs the model
 * keeps producing despite prompt instructions: inline "* Label: desc * Label2: desc"
 * pseudo-lists (should be real Markdown list items), and excessive **bold** use.
 */
export function sanitizeAnswerFormatting(text) {
  if (!text) return text;

  let result = text.split('\n').map(line => {
    if (line.trim().startsWith('*') || line.trim().startsWith('-') || line.trim().startsWith('#')) return line;
    // Fix " * Item: desc * Item2: desc" inline pseudo-lists
    const starSegments = line.split(/ \* /);
    if (starSegments.length >= 3) {
      const itemSegments = starSegments.slice(1);
      const withColon = itemSegments.filter(s => /:/.test(s.slice(0, 40))).length;
      if (withColon >= Math.ceil(itemSegments.length / 2)) {
        const intro = starSegments[0].trim();
        const listMd = itemSegments.map(it => `- ${it.trim().replace(/\s*\.\s*$/, '')}`).join('\n');
        return `${intro}\n\n${listMd}`;
      }
    }
    // Fix "Text: - Item1: desc - Item2: desc" inline dash pseudo-lists
    const dashSegments = line.split(/ - /);
    if (dashSegments.length >= 3) {
      const itemSegments = dashSegments.slice(1);
      const withColon = itemSegments.filter(s => /:/.test(s.slice(0, 50))).length;
      if (withColon >= Math.ceil(itemSegments.length / 2)) {
        const intro = dashSegments[0].trim();
        const listMd = itemSegments.map(it => `- ${it.trim().replace(/\s*\.\s*$/, '')}`).join('\n');
        return `${intro}\n\n${listMd}`;
      }
    }
    return line;
  }).join('\n');

  let boldCount = 0;
  const MAX_BOLD = 0;
  result = result.replace(/\*\*(.+?)\*\*/g, (match, inner) => {
    boldCount++;
    return boldCount <= MAX_BOLD ? match : inner;
  });
  result = result.replace(/\*\*/g, '');

  return result;
}

/**
 * Helper to call the Gemini API generateContent endpoint.
 */
/**
 * Count tokens for a given payload without generating a response.
 * Returns the total token count (number).
 */
export async function countTokens(apiKey, model, contents, systemInstruction = null) {
  const cleanKey = (apiKey || '').trim();
  const effectiveModel = normalizeModelName(model);
  const url = `${GEMINI_API_BASE_URL}/${effectiveModel}:countTokens?key=${cleanKey}`;
  const body = { contents };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `countTokens HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.totalTokens || 0;
}

async function callGemini(apiKey, model, contents, systemInstruction = null, isJson = false, enableSearch = false, toolType = 'chat', ctx = 0) {
  const cleanKey = (apiKey || '').trim();
  const effectiveModel = normalizeModelName(model);
  const url = `${GEMINI_API_BASE_URL}/${effectiveModel}:generateContent?key=${cleanKey}`;
  
  const body = {
    contents: contents,
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (enableSearch) {
    body.tools = [
      {
        googleSearch: {}
      }
    ];
  }

  if (isJson) {
    body.generationConfig = {
      responseMimeType: "application/json",
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 16384,
    };
  } else {
    body.generationConfig = {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 16384,
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API HTTP error! status: ${response.status}`;
      if (response.status === 400 && (errorMessage.includes('API key') || errorMessage.includes('API_KEY'))) {
        throw new Error('Nieprawidłowy klucz Gemini API. Upewnij się, że wklejono właściwy klucz w Ustawieniach.');
      }
      if (response.status === 404 || errorMessage.includes('not found')) {
        throw new Error(`Model API (${effectiveModel}) nie został znaleziony. Przejdź do Ustawień i wybierz Gemini 2.5 Flash.`);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.usageMetadata) {
      const input  = data.usageMetadata.promptTokenCount     || 0;
      const output = data.usageMetadata.candidatesTokenCount || 0;
      const total  = data.usageMetadata.totalTokenCount || (input + output);
      trackUsage(effectiveModel, toolType, input, output, ctx);
      trackGemini(effectiveModel, toolType, input, output, ctx, enableSearch); // TELEBYTE
      const prev = parseInt(localStorage.getItem('notebook_total_tokens') || '0', 10);
      localStorage.setItem('notebook_total_tokens', (prev + total).toString());
      localStorage.setItem('notebook_last_tokens', total.toString());
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Niepoprawna odpowiedź z API (brak tekstu).');
    }
    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

/**
 * Generates an initial Notebook Study Guide / Summary for a source.
 */
export async function generateSourceSummary(apiKey, model, source) {
  const systemInstruction = `Jesteś profesjonalnym asystentem badawczym. Twoim zadaniem jest przeanalizowanie podanego źródła (transkrypcji filmu YouTube lub tekstu) i wygenerowanie pięknego, czytelnego przewodnika do nauki (Study Guide) w formacie Markdown.
Używaj bogatej struktury nagłówków, wypunktowań i pogrubień.
Wygeneruj:
1. **Krótkie Podsumowanie** (3-4 zdania).
2. **Kluczowe Pojęcia i Definicje** (słowniczek ważnych pojęć w formie tabeli lub listy z definicjami).
3. **Spis Treści / Rozdziały** (z przybliżonymi znacznikami czasu np. [01:23] jeśli źródło je posiada).
4. **Ciekawe Pytania i Odpowiedzi** (3-5 pytań, które wyjaśniają sedno materiału).
NIE generuj wykresów Mermaid chyba że użytkownik wyraźnie o to poprosi. Preferuj czytelne listy numerowane, tabele Markdown i wypunktowania.
Jeśli użytkownik prosi o wykres lub mapę myśli, wtedy użyj bloków kodu Mermaid ( \`\`\`mermaid ) z prostą, czytelną strukturą (max 8-12 węzłów).
WAŻNE DLA MERMAID: Zawsze używaj bezpiecznych nazw węzłów. Jeśli tekst w węźle ma spacje lub znaki specjalne, MUSISZ używać cudzysłowów lub nawiasów, np. A["tekst węzła"] lub B("inny tekst"). Unikaj nawiasów i przecinków w czystym tekście ID węzłów.

WAŻNE: ZAWSZE używaj formatu JSON!
Odpowiedź musi być poprawnym obiektem JSON z dwoma polami: "answer" oraz "citations".
Pisz w języku polskim.`;

  const prompt = `Przeanalizuj poniższe źródło o nazwie "${source.title}" (autor: ${source.author || 'Nieznany'}):\n\n${source.rawText}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  return callGemini(apiKey, model, contents, systemInstruction, false, false, 'summary');
}

/**
 * Generates an initial summary and 3 short preset questions for a set of sources.
 */
export async function generatePresetQuestions(apiKey, model, sources) {
  const summaries = sources.slice(0, 5).map((s, i) =>
    `Źródło ${i + 1}: "${s.title}"\nPoczątek: ${(s.rawText || '').slice(0, 500)}...`
  ).join('\n\n');

  const systemInstruction = `Jesteś asystentem badawczym analizującym zebrane materiały. Twoim zadaniem jest stworzenie krótkiego wprowadzenia dla użytkownika.
Zwróć TYLKO czysty JSON o następującej strukturze:
{
  "title": "Chwytliwy, krótki tytuł dla całości wiedzy (max 5-6 słów)",
  "summary": "Zwięzłe, płynne streszczenie o czym są te materiały (około 3-4 zdania). Napisane profesjonalnie, lekko.",
  "questions": [
    "Pierwsze krótkie pytanie, max 1 zdanie?",
    "Drugie krótkie pytanie, max 1 zdanie?",
    "Trzecie krótkie pytanie, max 1 zdanie?"
  ]
}
Pytania mają być bardzo krótkie, naturalne i dotyczyć sedna materiałów.`;

  const prompt = `Masz następujące źródła:\n\n${summaries}\n\nWygeneruj wprowadzenie.`;

  const contents = [{ role: 'user', parts: [{ text: prompt }] }];
  
  try {
    const raw = await callGemini(apiKey, model, contents, systemInstruction, true, false, 'questions');
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    
    const parsed = JSON.parse(cleaned.trim());
    if (parsed.summary && Array.isArray(parsed.questions)) {
      return {
        title: parsed.title || 'Podsumowanie źródeł',
        summary: parsed.summary,
        questions: parsed.questions.slice(0, 3)
      };
    }
  } catch (e) {
    console.warn('Preset questions generation failed:', e);
    return {
      title: 'Błąd generowania',
      summary: `Wystąpił błąd podczas analizy źródeł: ${e.message}. Sprawdź klucz API i odśwież stronę.`,
      questions: ['Spróbuj odświeżyć stronę (F5)', 'Sprawdź połączenie z API']
    };
  }
  
  return {
    title: 'Analiza w toku',
    summary: 'Nie udało się poprawnie sparsować odpowiedzi od modelu.',
    questions: ['Odśwież stronę (F5)']
  };
}

/**
 * Sends a chat message to Gemini with source documents loaded as context.
 * ragContext: string | null — gdy podany, zastępuje pełny kontekst źródeł (tryb RAG)
 * Returns { answer: string, citations: Array }
 */
const MAX_HISTORY_MESSAGES = 10;

function trimHistory(msgs) {
  if (msgs.length <= MAX_HISTORY_MESSAGES) return msgs;
  // Zawsze zachowaj ostatnie MAX_HISTORY_MESSAGES wiadomości
  return msgs.slice(-MAX_HISTORY_MESSAGES);
}

export async function sendChatMessage(apiKey, model, chatMessages, selectedSources, enableSearch = false, toolType = 'chat', ragContext = null, chatConfig = null) {
  const trimmedMessages = trimHistory(chatMessages);

  // RAG mode: użyj pobranych chunków zamiast pełnego tekstu źródeł
  if (ragContext) {
    const estimatedCtx = Math.round(ragContext.length / 4);
    const lastMsg = trimmedMessages[trimmedMessages.length - 1];
    const isToolCall = !!lastMsg?.hiddenPrompt;
    const contents = [];
    let isContextInjected = false;
    for (let i = 0; i < trimmedMessages.length; i++) {
      const msg = trimmedMessages[i];
      const role = msg.role === 'user' ? 'user' : 'model';
      let text = msg.hiddenPrompt || msg.content;
      if (role === 'user' && !isContextInjected) {
        text = `${ragContext}\nPytanie: ${text}`;
        isContextInjected = true;
      }
      const parts = [];
      if (role === 'user' && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att?.mimeType && att?.data) parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
          else if (att?.text) parts.push({ text: `[Załącznik "${att.name || 'plik'}"]\n${att.text}` });
        }
      }
      parts.push({ text });
      contents.push({ role, parts });
    }
    if (contents.length === 0) contents.push({ role: 'user', parts: [{ text: `${ragContext}\nPodsumuj te źródła.` }] });

    const ragSystemInstruction = isToolCall
      ? `Jesteś zaawansowanym asystentem badawczym AI. Wykonaj zadanie zlecone przez użytkownika dokładnie według podanych instrukcji, opierając się wyłącznie na dostarczonych fragmentach materiałów źródłowych. Pisz po polsku. Zwróć czysty tekst Markdown bez owijania go w format JSON.`
      : `Jesteś zaawansowanym asystentem badawczym AI o nazwie "NotebookLM". Odpowiadaj WYŁĄCZNIE na podstawie podanych fragmentów materiałów (RAG). Cytuj źródła w formacie [Nazwa, mm:ss] dla YouTube lub [Nazwa] dla innych. Pisz po polsku, używaj Markdown. Zrezygnuj z pogrubień (**). Zwróć poprawny JSON: {"answer":"...","citations":[...]}`;

    try {
      const rawText = await callGemini(apiKey, model, contents, ragSystemInstruction, !isToolCall, false, toolType, estimatedCtx);
      if (isToolCall) return { answer: sanitizeAnswerFormatting(rawText), citations: [] };
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();
      try {
        const parsed = JSON.parse(cleaned);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        return { answer: sanitizeAnswerFormatting(obj?.answer || cleaned), citations: Array.isArray(obj?.citations) ? obj.citations : [] };
      } catch {
        return { answer: sanitizeAnswerFormatting(cleaned), citations: [] };
      }
    } catch (error) {
      return { answer: `Błąd RAG: ${error.message}`, citations: [] };
    }
  }

  // Full-context mode (fallback gdy RAG niedostępny)
  const sourceIndex = selectedSources.map((src, idx) =>
    `  Źródło ${idx + 1}: "${src.title}" | sourceId: "${src.videoId || src.id}"`
  ).join('\n');
  let contextText = `Poniżej znajdują się materiały źródłowe udostępnione przez użytkownika. Użyj ich jako jedynej wiedzy bazowej.\n\nSPIS ŹRÓDEŁ (użyj tych sourceId w cytowaniach):\n${sourceIndex}\n\n`;

  selectedSources.forEach((src, idx) => {
    contextText += `=== ŹRÓDŁO ${idx + 1}: ${src.title} | sourceId: "${src.videoId || src.id}" ===\n`;
    
    let typLabel = 'Dokument tekstowy';
    if (src.fileKind === 'csv') {
      typLabel = 'Strukturyzowana Tabela (CSV)';
    } else if (src.fileKind === 'html') {
      typLabel = 'Strukturyzowana Tabela (HTML)';
    } else if (src.type === 'youtube') {
      typLabel = 'YouTube Video Transcript';
    } else if (src.fileKind === 'web') {
      typLabel = 'Strona internetowa (WWW)';
    }
    contextText += `Typ: ${typLabel}\n`;

    if (src.type === 'youtube') {
      contextText += `Autor: ${src.author}\n`;
      contextText += `Video ID: ${src.videoId}\n`;
    } else if (src.fileKind === 'web' && src.url) {
      contextText += `URL: ${src.url}\n`;
    }

    contextText += `Treść źródła:\n`;
    if (src.fileKind === 'csv') {
      contextText += `[UWAGA: Poniższe dane pochodzą z tabeli CSV. Każda linia reprezentuje osobny wiersz z wartościami przypisanymi do kolumn. Dokładnie analizuj te dane strukturyzowane, wykonuj na nich obliczenia, sumy i wyciągaj z nich precyzyjne informacje.]\n`;
    } else if (src.fileKind === 'html') {
      contextText += `[UWAGA: Poniższe dane pochodzą z tabeli HTML. Każda linia reprezentuje osobny wiersz z wartościami przypisanymi do kolumn. Dokładnie analizuj te dane strukturyzowane, wykonuj na nich obliczenia, sumy i wyciągaj z nich precyzyjne informacje.]\n`;
    }
    const MAX_SOURCE_CHARS = 120000;
    // For YouTube sources prefer transcript with timestamps so AI can cite correctly.
    // Falls back to rawText for non-video sources or legacy entries without transcript.
    let sourceBody = '';
    if (src.type === 'youtube' && Array.isArray(src.transcript) && src.transcript.length > 0) {
      sourceBody = src.transcript.map(t => `[${t.timeStr}] ${t.text}`).join('\n');
    } else {
      sourceBody = src.rawText || '';
    }
    contextText += sourceBody.length > MAX_SOURCE_CHARS
      ? `${sourceBody.slice(0, MAX_SOURCE_CHARS)}\n[... treść skrócona – źródło zawiera ${sourceBody.length.toLocaleString()} znaków łącznie ...]\n`
      : `${sourceBody}\n`;
    contextText += `====================================\n\n`;
  });

  const systemInstruction = `Jesteś zaawansowanym asystentem badawczym AI o nazwie "NotebookLM".
Odpowiadaj na pytania użytkownika WYŁĄCZNIE na podstawie podanych materiałów źródłowych. Masz dostęp do ${selectedSources.length} źródła/źródeł: ${selectedSources.map(s => `"${s.title}"`).join(', ')}.

INSTRUKCJE:
1. Odpowiadaj przede wszystkim na podstawie treści dostarczonych źródeł. Jeśli źródła mają odpowiedź — użyj ich i zacytuj. Jeśli nie mają — użyj własnej wiedzy ogólnej, ale wyraźnie zaznacz że to wiedza ogólna, nie z materiałów (np. "Z materiałów tego nie wynika, ale ogólnie...").
2. NIE odmawiaj odpowiedzi słowami "nie znalazłem" czy "brak danych". Zawsze daj coś użytecznego — jeśli nie masz konkretnej liczby, daj zakres, wskazówkę kierunkową lub ogólną zasadę. Lepiej coś realnego z ogólnej wiedzy niż nic.
3. Gdy pytanie dotyczy konkretnego tematu, znajdź odpowiedź W KAŻDYM z dostarczonych źródeł osobno, nie mieszaj informacji bez wyraźnego zaznaczenia z którego pochodzi.
4. Jeśli analizujesz dane z tabeli (CSV), bądź wyjątkowo precyzyjny w obliczeniach matematycznych, agregacjach i filtrowaniu (wyznaczaj dokładne sumy, średnie, wartości maksymalne/minimalne na podstawie wierszy).
5. Cytuj źródła w tekście w formacie [Nazwa, mm:ss] dla YouTube, [Nazwa, Wiersz X] dla tabeli CSV, lub [Nazwa] dla PDF/dokumentów/stron WWW. Strony WWW MUSZĄ być cytowane dokładnie tak samo jak inne źródła — nie pomijaj cytatów tylko dlatego, że źródło to strona internetowa bez znaczników czasu.
6. Pisz po polsku, używaj Markdown.
7. W transkrypcjach wideo treść jest poprzedzona znacznikiem czasu w formacie [mm:ss], np. "[3:42] tekst...". Gdy cytujesz fragment transkrypcji, użyj DOKŁADNIE tego znacznika czasu jako timeStr/timeSeconds w JSON cytatu. Nie podawaj 0:00 jeśli tekst pochodzi z innego momentu.
8. NIE zamieniaj osobistych preferencji autora ("ja przeważnie...", "moje ulubione", "lubię...", "cofam sobie...", "klikam sobie...") w uniwersalne instrukcje ("Ustaw...", "Zawsze rób...", "Zaleca się..."). Referuj to jako preferencję konkretnej osoby, np. "Autor przeważnie używa X" albo "W przypadku Porsche autor preferuje X". Nie generalizuj i nie zamieniaj tego w tutorial.
9. NIE dorabiaj konkretnych parametrów (nazw torów, temperatur, procentów paliwa, wartości liczbowych, ustawień zaawansowanych), których w źródle nie ma. Jeśli źródło mówi ogólnikowo — odpowiedz ogólnikowo. Jeśli źródło nie podaje wartości — napisz "źródło nie precyzuje", zamiast wstawiać prawdopodobną liczbę.
10. NIE strukturyzuj odpowiedzi w "system X-etapowy", "fazy", "kroki" itp., jeśli takiej struktury nie ma w źródle. Odpowiadaj w takim porządku i tonie, w jakim autor przedstawił temat.
11. Umieszczaj marker cytatu ([1], [2], [3]...) DOKŁADNIE NA KOŃCU zdania lub akapitu, który on cytuje. Każdy marker [N] w tekście odnosi się do N-tego elementu w tablicy citations (tzn. [1] odnosi się do citations[0], [2] do citations[1] itd.). TABLICA CITATIONS MUSI ZAWIERAĆ DOKŁADNIE TYLE ELEMENTÓW ILE JEST MARKERÓW [N] W TEKŚCIE. DLA KAŻDEGO MARKERA [N] ZBUDUJ PRAWIDŁOWY OBIEKT W TABLICY citations Z ODPOWIEDNIM sourceId, sourceTitle ORAZ DOSŁOWNYM CYTATEM Z TEGO KONKRETNEGO ŹRÓDŁA. Nie przypisuj różnych cytatów z różnych tematów do jednego pliku! Jeśli zdanie dotyczy LMP2 z pliku X, to cytat w citations MUSI wskazywać na plik X.
12. W komórkach tabel Markdown możesz używać <br> do łamania linii (tylko wewnątrz komórek tabeli, nie w zwykłym tekście). Nie mieszaj <br> z listami wypunktowanymi - jeśli treść komórki to lista, wystarczy oddzielić elementy pojedynczym <br>, bez myślników.
13. Gdy pytanie dotyczy konkretnych wartości liczbowych (np. setup simracingowy, ustawienia techniczne) i wartości NIE MA w materiałach źródłowych — NIE pisz "Brak wartości" ani "nie znaleziono". Zamiast tego podaj PRECYZYJNĄ wskazówkę w trzech elementach: (a) przyznaj że nie masz konkretnej wartości z materiałów, (b) podaj rzeczywisty zakres tego parametru w danej grze/symulacji jeśli go znasz z własnej wiedzy (np. "zakres 10–200 N/mm"), (c) powiedz GDZIE w tym zakresie szukać danego efektu — np. "jeśli chcesz więcej rotacji: ustaw bliżej dolnej granicy (okolice 30–50), jeśli chcesz stabilność i mniej rotacji: bliżej górnej (okolice 100–150)". Przykład: zamiast "Brak konkretnych wartości dla sprężyn" napisz: "Nie mam tej wartości z materiałów. Sprężyny w LMU mają zakres ok. 10–200 N/mm. Dla więcej rotacji i miękkości: okolice 30–60 N/mm. Dla stabilności i mniejszej rotacji: 80–130 N/mm. Zacznij od środka i testuj w krokach po 10." Użyj swojej wiedzy ogólnej o grze/symulacji żeby podać realistyczne zakresy — nie zmyślaj, ale nie bój się użyć wiedzy treningu.

DOBIERANIE FORMATU ODPOWIEDZI:
Domyślnie pisz zwykłym tekstem (akapity). Ustrukturyzowany format tylko gdy naprawdę pomaga — nie formatuj dla samego formatowania.

CAŁKOWITY ZAKAZ POGRUBIEŃ: Pod żadnym pozorem nie używaj pogrubień (znaków **). Zrezygnuj z formatowania pogrubieniem całkowicie we wszystkich tekstach, nagłówkach i listach. To absolutna reguła.

LISTY — NIE UPYCHAJ W JEDNYM AKAPICIE: Jeśli wymieniasz 3+ powiązane elementy (cechy, warianty, opcje), użyj PRAWDZIWEJ listy Markdown — każdy element w nowej linii zaczynającej się od "- " lub "1. ", NIGDY jako "* Element: opis * Element2: opis" sklejone w jednym ciągłym akapicie oddzielone gwiazdkami. Sklejanie wielu punktów w jednej linii przez "*" jest zabronione — to nie jest lista Markdown i wygląda jak ściana tekstu.

Dobieranie formatu do treści:
- **Instrukcje krok po kroku, procedury** → Numerowana lista lub nagłówki ## N. Tytuł (oddzielone pustą linią). Tytuł na osobnej linii.
- **Porównania, dane liczbowe, parametry** → Tabela Markdown.
- **Wyliczenia 3+ elementów** → Lista wypunktowana, bez pogrubiania całych punktów.
- **Odpowiedź faktyczna / wyjaśnienie** → Zwykłe akapity. Żadnych list ani nagłówków jeśli nie są potrzebne.
- **Relacje, hierarchie** → Mermaid TYLKO gdy użytkownik prosi lub dane są naprawdę złożone relacyjnie.

Nie generuj Mermaid automatycznie. W większości przypadków tekst jest czytelniejszy.

ZASADY DLA MERMAID (gdy już go używasz):
- ZABRONIONE JEST używanie cytatów w stylu [ID, czas] wewnątrz kodu Mermaid! Cytuj tylko w zwykłym tekście.
- Dla zwykłych wykresów, jeśli tekst węzła ma spacje, używaj cudzysłowów lub nawiasów, np. A["tekst węzła"].
- Diagramy muszą być PROSTE i CZYTELNE — max 8-12 węzłów. Lepiej mniej z sensownymi etykietami niż dużo nieczytelnych.
- Preferuj graph TD (top-down) lub graph LR (left-right) dla prostych relacji.
- UWAGA DLA MINDMAP: ZAWSZE zaczynaj pierwszą linię bloku od słowa kluczowego 'mindmap'. W mindmapach CAŁKOWICIE ZABRONIONE JEST używanie cudzysłowów " wokół węzłów (np. pisz 'Podsterowność', a NIE '"Podsterowność"'). Zamiast cudzysłowów, tekst ze spacjami otaczaj nawiasami: 'root((Pytania Testowe))' or 'id[Tekst ze spacją]'. Użycie cudzysłowu w mindmap wyrzuca błąd "Syntax error".

OBRAZY KONTEKSTOWE (OBOWIĄZKOWE DLA TEMATÓW WIZUALNYCH):
Gdy temat odpowiedzi dotyczy czegokolwiek wizualnego (rysunek, malowanie, cieniowanie, techniki artystyczne, architektura, biologia, anatomia, geografia, inżynieria, gotowanie, sport, taniec, rękodzieło, fotografia, design), MUSISZ wstawić 1-3 markerów obrazów w formacie:

![krótki opis po polsku](search:english keywords for image search)

ZASADY KRYTYCZNE:
- Marker MUSI być na OSOBNEJ LINII, otoczony PUSTYMI LINIAMI z obu stron
- Keywords ZAWSZE po angielsku (lepsze wyniki), opis po polsku
- Wstawiaj obraz PO akapicie który go opisuje
- Dla instrukcji krok-po-kroku: wstaw obraz po KAŻDYM kluczowym kroku
- NIE wstawiaj obrazów do czystych analiz danych, list porównawczych ani krótkich odpowiedzi faktograficznych
- Keywords muszą być KONKRETNE i OPISOWE, np. "pencil sphere shading light shadow technique tutorial" a nie "shading"

PRZYKŁAD użycia w odpowiedzi:
Cieniowanie kuli zaczynamy od określenia źródła światła i terminatora — linii oddzielającej stronę oświetloną od zaciemnionej.

![Cieniowanie kuli — przejście od światła do cienia](search:pencil sphere shading light to shadow drawing tutorial)

Następnie dodajemy cień rzucony na podłoże, pamiętając że jego krawędź rozmywa się z odległością.

KRYTYCZNE - FORMAT ODPOWIEDZI:
Zwróć WYŁĄCZNIE czysty JSON bez żadnych code fences ani dodatkowego tekstu:
{
  "answer": "Pełna odpowiedź w Markdown. Jeśli wygenerowałeś kod mermaid, upewnij się, że znak ucieczki dla nowej linii to \\\\n.",
  "citations": [
    {
      "sourceTitle": "Skrócony tytuł źródła (max 25 znaków)",
      "sourceId": "DOKŁADNA wartość sourceId z SPISU ŹRÓDEŁ powyżej, np. 'dQw4w9WgXcQ' dla YouTube lub UUID dla pliku",
      "timeStr": "TYLKO dla YouTube: mm:ss dokładnie z znacznika [mm:ss] w transkrypcji, np. '3:42'. Dla PDF/dokumentów tekstowych i stron WWW: pusty string ''. Dla tabel CSV/HTML: 'Wiersz N'. NIGDY nie wstawiaj tu sourceId ani UUID.",
      "timeSeconds": 222,
      "quote": "Dosłowny cytat ze źródła (max 100 znaków)"
    }
  ]
}`;

  const lastMsg = trimmedMessages[trimmedMessages.length - 1];
  const isToolCall = !!lastMsg?.hiddenPrompt;

  let finalSystemInstruction = systemInstruction;
  let isJsonMode = true;

  if (isToolCall) {
    finalSystemInstruction = `Jesteś zaawansowanym asystentem badawczym AI. Wykonaj zadanie zlecone przez użytkownika dokładnie według podanych instrukcji, opierając się wyłącznie na dostarczonych materiałach źródłowych. Pisz po polsku. Zwróć czysty tekst Markdown bez owijania go w format JSON.`;
    isJsonMode = false;
  } else if (enableSearch) {
    isJsonMode = false;
    finalSystemInstruction = `Jesteś zaawansowanym asystentem badawczym AI o nazwie "NotebookLM" z dostępem do wyszukiwarki Google.
Użytkownik wyraził zgodę na przeszukanie internetu, ponieważ potrzebne informacje nie znalazły się w jego materiałach źródłowych.
Odpowiedz na pytanie użytkownika, korzystając z wyszukiwarki Google oraz (jeśli to pomocne) z materiałów źródłowych.
Pisz po polsku, używaj Markdown. Zrezygnuj z formatowania pogrubieniem (**). Zwróć poprawny JSON z polami "answer" i "citations". Jeśli informacje pochodzą z wyszukiwarki internetowej, jako sourceTitle w cytatach podaj nazwę strony/źródła z sieci, a sourceId ustaw na "web".`;
  }

  if (chatConfig) {
    if (chatConfig.customPrompt) {
      finalSystemInstruction += `\n\nROLA / CEL KONWERSACJI:\n${chatConfig.customPrompt}`;
    }
    if (chatConfig.length === 'longer') {
      finalSystemInstruction += `\n\nDŁUGOŚĆ ODPOWIEDZI: Generuj obszerne, wyczerpujące odpowiedzi z pełnymi detalami i szerokim kontekstem.`;
    } else if (chatConfig.length === 'shorter') {
      finalSystemInstruction += `\n\nDŁUGOŚĆ ODPOWIEDZI: Bądź zwięzły i konkretny. Odpowiadaj w punktach i pigułkach informacyjnych.`;
    }
  }

  const contents = [];
  let isContextInjected = false;

  for (let i = 0; i < trimmedMessages.length; i++) {
    const msg = trimmedMessages[i];
    const role = msg.role === 'user' ? 'user' : 'model';
    let text = msg.hiddenPrompt || msg.content;

    if (role === 'user' && !isContextInjected) {
      text = `${contextText}\nPytanie: ${text}`;
      isContextInjected = true;
    }

    if (i === trimmedMessages.length - 1 && role === 'user' && enableSearch) {
      const sourceTitlesHint = selectedSources.map(s => s.title).join(' ').slice(0, 100);
      text = `[Kontekst wyszukiwania: pytasz w kontekście tematów takich jak: ${sourceTitlesHint}]\n` + text;
    }

    const parts = [];
    // Załączniki inline (obrazy/PDF/tekst) — tylko w wiadomościach użytkownika.
    // Gemini oczekuje ich PRZED tekstem, żeby lepiej powiązać "opisz to zdjęcie" z obrazem.
    if (role === 'user' && Array.isArray(msg.attachments)) {
      for (const att of msg.attachments) {
        if (att?.mimeType && att?.data) {
          parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
        } else if (att?.text) {
          parts.push({ text: `[Załącznik "${att.name || 'plik'}"]\n${att.text}` });
        }
      }
    }
    parts.push({ text });
    contents.push({ role, parts });
  }

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: `${contextText}\nPodsumuj te źródła.` }] });
  }

  const estimatedCtx = Math.round(contextText.length / 4);

  try {
    const rawText = await callGemini(apiKey, model, contents, finalSystemInstruction, isJsonMode, enableSearch, toolType, estimatedCtx);
    
    if (isToolCall) {
      return { answer: sanitizeAnswerFormatting(rawText), citations: [] };
    }

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
    
    try {
      const parsed = JSON.parse(cleaned);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      return { answer: sanitizeAnswerFormatting(obj?.answer || cleaned), citations: Array.isArray(obj?.citations) ? obj.citations : [] };
    } catch (parseError) {
      console.warn("JSON parse failed, attempting regex fallback", parseError);
      let fallbackText = cleaned;
      // Próba ratowania tekstu z zepsutego JSONa. Dopasowanie zachłanne (*, nie *?) —
      // gdy "answer" zawiera nieuciekłe cudzysłowy, non-greedy łapał tylko fragment
      // do pierwszego z nich i zwracał resztę surowego JSONa użytkownikowi.
      const ansMatch = fallbackText.match(/"answer"\s*:\s*"([\s\S]*)"\s*,\s*"citations"/)
        || fallbackText.match(/"answer"\s*:\s*"([\s\S]*)"\s*\}\s*$/);
      if (ansMatch) {
         fallbackText = ansMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      return { answer: sanitizeAnswerFormatting(fallbackText), citations: [] };
    }
  } catch (error) {
    console.error("API call failed", error);
    return { answer: `Wystąpił błąd podczas łączenia z AI: ${error.message}. Spróbuj odświeżyć stronę lub zadać pytanie inaczej.`, citations: [] };
  }
}

/**
 * Generates video transcription using Gemini API multimodal capability on YouTube URLs.
 */
export async function generateTranscriptViaGemini(apiKey, model, videoUrl) {
  // We use camelCase for JSON keys in REST API (fileData, fileUri)
  const systemInstruction = `Jesteś ekspertem ds. transkrypcji i analizy dźwiękowej.
Przeanalizuj wskazany film wideo z YouTube i stwórz dla niego dokładną transkrypcję słowo w słowo w języku polskim (lub oryginalnym języku filmu).
Zwróć transkrypcję WYŁĄCZNIE jako czysty, poprawny dokument JSON zawierający tablicę obiektów. Nie dodawaj żadnych wstępów, podsumowań ani oznaczeń kodu markdown (\`\`\`json ... \`\`\`). Zwróć sam czysty tekst JSON.
Struktura JSON ma wyglądać następująco:
[
  {
    "text": "Pierwsze zdanie wypowiedziane na filmie",
    "start": 0,
    "duration": 5
  },
  {
    "text": "Kolejne zdanie...",
    "start": 5,
    "duration": 3
  }
]
Wartość 'start' to czas rozpoczęcia w sekundach (liczba całkowita), a 'duration' to czas trwania w sekundach.
Upewnij się, że tekst jest poprawny ortograficznie i gramatycznie.`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          fileData: {
            mimeType: 'video/mp4',
            fileUri: videoUrl
          }
        },
        {
          text: 'Wygeneruj pełną transkrypcję tego filmu w formacie JSON zgodnie z instrukcją systemową.'
        }
      ]
    }
  ];

  // Call Gemini REST endpoint
  const text = await callGemini(apiKey, model, contents, systemInstruction, false, false, 'transcript');

  // Parse JSON from response
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Wygenerowana transkrypcja nie jest tablicą.');
    }
    return parsed;
  } catch (err) {
    console.error("JSON parsing of transcript failed:", cleaned, err);
    throw new Error('Nie udało się przekonwertować odpowiedzi AI na format transkrypcji.');
  }
}

/**
 * Mini-chat about a specific canvas node.
 * node: { title, keyPoints, detail, sources }
 * history: [{role:'user'|'assistant', content:string}]
 */
export async function sendNodeChatMessage(apiKey, model, node, history, userMessage) {
  const cleanKey = (apiKey || '').trim();
  const effectiveModel = normalizeModelName(model);
  const systemInstruction = `Jesteś pomocnikiem wiedzy. Użytkownik bada poniższy temat wyodrębniony automatycznie z jego materiałów źródłowych i chce pogłębić wiedzę na ten temat lub lepiej go zrozumieć.

TEMAT: "${node.title}"

KLUCZOWE PUNKTY:
${(node.keyPoints || []).map(p => `• ${p}`).join('\n') || '(brak)'}

PEŁNE OPRACOWANIE:
${node.detail || '(brak szczegółów)'}

ŹRÓDŁA: ${(node.sources || []).map(s => s.title).join(', ') || 'nieznane'}

Odpowiadaj konkretnie i zwięźle, bazując głównie na treści powyższego opracowania. Gdy pytanie wychodzi poza zakres tematu, zaznacz to krótko i i tak postaraj się pomóc. Pisz po polsku.

FORMATOWANIE — trzymaj się tych zasad bez wyjątku:
- Domyślnie pisz zwykłym ciągłym tekstem (akapity). Lista wypunktowana tylko gdy treść JEST listą (np. kroki, wyliczenie 3+ elementów).
- CAŁKOWITY ZAKAZ POGRUBIEŃ: Pod żadnym pozorem nie używaj pogrubień (znaków **). Zrezygnuj z formatowania pogrubieniem całkowicie we wszystkich tekstach.
- Nagłówki (##) tylko jeśli odpowiedź ma wyraźnie odrębne sekcje i przekracza 5 zdań.
- Krótkie odpowiedzi (do 3 zdań) pisz jako plain text — zero list, zero bold, zero nagłówków.`;

  const contents = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const url = `${GEMINI_API_BASE_URL}/${effectiveModel}:generateContent?key=${cleanKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  if (data.usageMetadata) {
    const input  = data.usageMetadata.promptTokenCount     || 0;
    const output = data.usageMetadata.candidatesTokenCount || 0;
    trackUsage(effectiveModel, 'canvas', input, output);
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  return sanitizeAnswerFormatting(text);
}

/**
 * Transcribe an audio Blob using Gemini's multimodal API.
 * Returns the transcribed text string.
 */
export async function transcribeAudio(apiKey, audioBlob, model = 'gemini-2.5-flash') {
  const cleanKey = (apiKey || '').trim();
  const effectiveModel = normalizeModelName(model);
  const mimeType = audioBlob.type || 'audio/webm';
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const contents = [{
    role: 'user',
    parts: [
      { inlineData: { mimeType, data: base64 } },
      { text: 'Przepisz dokładnie to co słyszysz w tym nagraniu audio. Zwróć TYLKO transkrypcję, bez żadnych komentarzy ani wyjaśnień.' }
    ]
  }];

  const url = `${GEMINI_API_BASE_URL}/${effectiveModel}:generateContent?key=${cleanKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Transcription failed: ${response.status}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}
