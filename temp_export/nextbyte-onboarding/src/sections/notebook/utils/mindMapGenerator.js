import { normalizeModelName } from './geminiApi';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGeminiRaw(apiKey, model, prompt, systemInstruction) {
  const cleanKey = (apiKey || '').trim();
  const effectiveModel = normalizeModelName(model);
  const url = `${GEMINI_API_BASE_URL}/${effectiveModel}:generateContent?key=${cleanKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return text;
}

export function prepareFullSourcesText(sources, maxCharsPerSource = 120000) {
  if (!sources || sources.length === 0) return 'Brak źródeł w notatniku.';
  let accumulated = '';
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const title = s.title || `Źródło ${i + 1}`;
    const id = s.videoId || s.id;
    let body = '';
    if (s.type === 'youtube' && Array.isArray(s.transcript) && s.transcript.length > 0) {
      body = s.transcript.map(t => `[${t.timeStr || '0:00'}] ${t.text}`).join('\n');
    } else {
      body = s.rawText || '';
    }
    const snippet = body.length > maxCharsPerSource
      ? body.slice(0, maxCharsPerSource) + `\n[...treść skrócona – łącznie ${body.length} znaków...]`
      : body;
    accumulated += `=== ŹRÓDŁO ${i + 1}: "${title}" | sourceId: "${id}" | typ: ${s.type || 'dokument'} ===\n${snippet}\n====================================\n\n`;
  }
  return accumulated;
}

function timeStrToSeconds(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export async function generateMindMapFromSources(apiKey, model, sources) {
  const sourcesText = prepareFullSourcesText(sources);
  const systemInstruction = `Jesteś ekspertem syntezy wiedzy. Twoim zadaniem jest dokładna analiza dostarczonych materiałów źródłowych i wygenerowanie czytelnej, hierarchicznej Mapy Myśli (Mind Map) opartej WYŁĄCZNIE na REALNYCH faktach, pojęciach, liczbach, rozdziałach i wiedzy z tekstu.

Zwróć TYLKO czysty obiekt JSON o strukturze:
{
  "title": "Główny temat całości materiałów",
  "nodes": [
    {
      "id": "root",
      "title": "Główny Temat Źródeł",
      "description": "Zwięzły opis całości analizowanej wiedzy (2-3 zdania).",
      "parentId": null,
      "type": "root",
      "sourceTitle": null,
      "sourceId": null,
      "timeStr": null,
      "startSeconds": null
    },
    {
      "id": "node_1",
      "title": "Nazwa Konkretnego Pojęcia / Tematu z Tekstu",
      "description": "Precyzyjny opis oparty bezpośrednio na faktach ze źródła.",
      "parentId": "root",
      "type": "concept",
      "sourceTitle": "Dokładna nazwa źródła z którego wzięto to pojęcie",
      "sourceId": "sourceId z nagłówka źródła",
      "timeStr": "02:45",
      "startSeconds": 165
    }
  ]
}

ZASADY:
1. Wygeneruj od 10 do 18 wartościowych węzłów.
2. Każdy węzeł MUSI odnosić się do konkretnych informacji zawartych w udostępnionym tekście.
3. Jeśli treść pochodzi z filmu YouTube ze znacznikami czasu [mm:ss], MUSISZ podać 'timeStr' (np. "02:45") oraz przeliczone sekundy 'startSeconds' (165).
4. Wszystkie nazwy źródeł ('sourceTitle') oraz identyfikatory ('sourceId') muszą dokładnie odpowiadać źródłom z tekstu.
5. Pisz po polsku, merytorycznie, zwięźle i precyzyjnie.`;

  const prompt = `Oto materiały źródłowe:\n\n${sourcesText}\n\nWygeneruj strukturę Mapy Myśli opartą bezpośrednio na tej treści.`;
  const rawJson = await callGeminiRaw(apiKey, model, prompt, systemInstruction);

  try {
    const parsed = JSON.parse(rawJson);
    if (parsed.nodes && Array.isArray(parsed.nodes)) {
      const processedNodes = parsed.nodes.map(n => ({
        ...n,
        startSeconds: n.startSeconds ?? timeStrToSeconds(n.timeStr)
      }));
      return { title: parsed.title || 'Mapa Myśli', nodes: processedNodes };
    }
  } catch (e) {
    console.error('Failed to parse mind map JSON', e);
  }
  throw new Error('Nie udało się wygenerować mapy myśli z treści źródeł.');
}

export async function generateFlashcardsFromSources(apiKey, model, sources, topic = null) {
  const sourcesText = prepareFullSourcesText(sources);
  const systemInstruction = `Jesteś mentorem naukowym. Tworzysz najwyższej jakości fiszki do aktywnego zapamiętywania (Active Recall / Spaced Repetition) oparte WYŁĄCZNIE na podanych materiałach źródłowych.

Zwróć TYLKO czystą tablicę JSON obiektów:
[
  {
    "id": "fc_1",
    "question": "Konkretne pytanie testujące zrozumienie faktów, liczb lub definicji z tekstu?",
    "answer": "Zwięzła, wyczerpująca odpowiedź oparta bezpośrednio na źródle (1-3 zdania).",
    "category": "Nazwa działu / pojęcia",
    "sourceTitle": "Tytuł źródła",
    "sourceId": "Id źródła",
    "timeStr": "03:15",
    "startSeconds": 195
  }
]

ZASADY:
- Wygeneruj 10-15 wartościowych fiszek na podstawie realnych faktów.
- Jeśli treść pochodzi z YouTube, podaj 'timeStr' oraz 'startSeconds'.
- Pisz po polsku, unikaj ogólników.`;

  let prompt = `Oto materiały źródłowe:\n\n${sourcesText}`;
  if (topic) prompt += `\n\nSkup się szczególnie na wątku: "${topic}".`;
  prompt += `\n\nWygeneruj fiszki w JSON.`;

  const rawJson = await callGeminiRaw(apiKey, model, prompt, systemInstruction);
  try {
    const parsed = JSON.parse(rawJson);
    const list = Array.isArray(parsed) ? parsed : (parsed.flashcards || []);
    if (list.length > 0) {
      return list.map(fc => ({
        ...fc,
        startSeconds: fc.startSeconds ?? timeStrToSeconds(fc.timeStr)
      }));
    }
  } catch (e) {
    console.error('Failed to parse flashcards JSON', e);
  }
  throw new Error('Nie udało się wygenerować fiszek z treści źródeł.');
}

export async function generateQuizFromSources(apiKey, model, sources, topic = null) {
  const sourcesText = prepareFullSourcesText(sources);
  const systemInstruction = `Jesteś autorem egzaminów i quizów wiedzy. Tworzysz pytania sprawdzające zrozumienie materiałów źródłowych.

Zwróć TYLKO czystą tablicę JSON obiektów:
[
  {
    "id": "q_1",
    "question": "Merytoryczne pytanie wielokrotnego wyboru sprawdzające wiedzę z tekstu?",
    "options": [
      "A) Opcja 1",
      "B) Opcja 2",
      "C) Opcja 3",
      "D) Opcja 4"
    ],
    "correctIndex": 0,
    "explanation": "Szczegółowe wyjaśnienie dlaczego ta odpowiedź jest poprawna w kontekście materiałów źródłowych.",
    "sourceTitle": "Tytuł źródła",
    "sourceId": "Id źródła",
    "timeStr": "05:40",
    "startSeconds": 340
  }
]

ZASADY:
- Wygeneruj 8-10 merytorycznych pytań.
- Opieraj pytania i opcje na faktycznych treściach podanych w źródłach.
- 'correctIndex' to indeks poprawnej opcji (0-3).
- Wyjaśnienie musi podawać konkretne uzasadnienie ze źródła.
- Pisz po polsku.`;

  let prompt = `Oto materiały źródłowe:\n\n${sourcesText}`;
  if (topic) prompt += `\n\nSkup się szczególnie na temacie: "${topic}".`;
  prompt += `\n\nWygeneruj test w JSON.`;

  const rawJson = await callGeminiRaw(apiKey, model, prompt, systemInstruction);
  try {
    const parsed = JSON.parse(rawJson);
    const list = Array.isArray(parsed) ? parsed : (parsed.quiz || []);
    if (list.length > 0) {
      return list.map(q => ({
        ...q,
        startSeconds: q.startSeconds ?? timeStrToSeconds(q.timeStr)
      }));
    }
  } catch (e) {
    console.error('Failed to parse quiz JSON', e);
  }
  throw new Error('Nie udało się wygenerować testu z treści źródeł.');
}
