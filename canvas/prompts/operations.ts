/**
 * REJESTR OPERACJI — uniwersalne prompty per-sytuacja.
 *
 * Gemini (widząc zdjęcia + prompt) wybiera JEDNĄ operację (`id`). System ciągnie
 * jej definicję: które moduły-stałe się doklejają (`modules`), jaka jest jej
 * logika (`logic`, co znika / co zostaje / co jest dawcą) i jaka misja idzie do
 * modelu (`mission`). Stałe moduły (identity, position, scale, grain, fidelity)
 * są zawsze przed operacją; operacja włącza tylko te, które jej dotyczą.
 *
 * To odpowiednik Lovart MCoT: jedna scena → jedna wybrana ścieżka, nie sklejanka
 * wszystkiego naraz. Universal — żadnych typów obiektu na sztywno.
 */
import type { ModuleName } from './modules'

export type OperationId =
  | 'object_swap'
  | 'object_transfer'
  | 'insert'
  | 'character_swap'
  | 'character_transfer'
  | 'face_swap'
  | 'clothing'
  | 'remove'
  | 'background'
  | 'texture'
  | 'time_of_day'
  | 'season'
  | 'effect'
  | 'style'
  | 'fix'

export interface Operation {
  id: OperationId
  /** nazwa po polsku (UI) */
  nazwa: string
  /** jednozdaniowa logika: cel / dawca / co znika / co zostaje (po polsku) */
  logic: string
  /** hasła wyzwalające dla Gemini (bramka semantyczna) */
  triggers: string
  /** moduły-stałe, które ta operacja włącza (kolejność z assemble) */
  modules: ModuleName[]
  /** misja do modelu obrazu, po angielsku — trzon OPERATION (Gemini dopisuje konkret) */
  mission: string
}

const OBJECT_MODULES: ModuleName[] = ['IDENTITY', 'POSITION', 'SCALE', 'GRAIN', 'FIDELITY']
const GLOBAL_MODULES: ModuleName[] = ['GRAIN', 'FIDELITY']

export const OPERATIONS: Record<OperationId, Operation> = {
  object_swap: {
    id: 'object_swap',
    nazwa: 'Zamień obiekt',
    logic: 'Obiekt-cel (pineska na płótnie) znika z cieniem i clean-plate; dawca (pineska ref / słowo) wchodzi w jego miejsce we WŁASNYCH wymiarach i detalach.',
    triggers: 'zamień / podmień / zamiast X daj Y / zastąp',
    modules: OBJECT_MODULES,
    mission: 'Remove the target object entirely (with its shadow/reflection) and rebuild what was behind it. In its place, generate the replacement object from the reference at its own real size, turned to the destination camera angle. If someone was touching the old object, keep them intact and give the new object its own equivalent contacting part.',
  },
  object_transfer: {
    id: 'object_transfer',
    nazwa: 'Przenieś obiekt',
    logic: 'Ten sam obiekt w nowe miejsce; jedno zdjęcie → clean-plate na starym; z innego zdjęcia → przynosimy tylko obiekt. W wyniku dokładnie raz.',
    triggers: 'przenieś / przesuń / daj tu / ma być tu',
    modules: OBJECT_MODULES,
    mission: 'Move the marked object to the marked destination; it appears exactly once. If its old spot is in the destination photo, rebuild a clean plate there so no trace remains. Keep its identity and surface condition.',
  },
  insert: {
    id: 'insert',
    nazwa: 'Wstaw obiekt',
    logic: 'Dodaje obiekt, NIC nie usuwa — wszystkie istniejące zostają (ta sama liczba). „Obok" = tuż przy grupie.',
    triggers: 'wstaw / dodaj / umieść / postaw … tutaj',
    modules: OBJECT_MODULES,
    mission: 'Add the object at the marked spot without removing anything — every existing subject stays in place with the same count. Place it immediately beside the named neighbours, sharing the ground line.',
  },
  character_swap: {
    id: 'character_swap',
    nazwa: 'Zamień postać (pełna)',
    logic: 'Postać-cel znika; cała postać dawcy (tożsamość+ciało+ubiór) wpasowana w pozę/skalę/światło sceny. Inne osoby nietknięte.',
    triggers: 'zamień tę osobę / postać na …',
    modules: OBJECT_MODULES,
    mission: 'Replace the whole target person with the person from the reference — their identity, body and clothing — fitted into the destination scene\'s position, scale and light. Every other person stays untouched.',
  },
  character_transfer: {
    id: 'character_transfer',
    nazwa: 'Przenieś postać',
    logic: 'Ta sama osoba w nowe miejsce/na inne zdjęcie; tożsamość i ubiór zachowane; poza dostosowana do podłoża; raz.',
    triggers: 'przenieś tę osobę / postać …',
    modules: OBJECT_MODULES,
    mission: 'Bring the same person to the marked destination, keeping their identity and clothing; adapt their pose to the new ground; they appear exactly once, with a clean plate at the old spot if it is in this photo.',
  },
  face_swap: {
    id: 'face_swap',
    nazwa: 'Zamień twarz',
    logic: 'Zmienia tylko tożsamość (twarz, włosy). Poza, ciało, ubiór, kadr z płótna zostają.',
    triggers: 'zamień twarz / face swap / tożsamość',
    modules: ['GRAIN', 'FIDELITY'],
    mission: 'Give the marked person the face and identity (face, hair) of the reference person, redrawn at the head angle and gaze of the destination and in its light. Keep their pose, body, clothing and the framing. Other people keep their own faces.',
  },
  clothing: {
    id: 'clothing',
    nazwa: 'Zmień ubranie',
    logic: 'Wymienia strój; twarz/poza/sylwetka/dłonie/tło nietknięte.',
    triggers: 'zmień ubranie / strój / przebierz',
    modules: ['GRAIN', 'FIDELITY'],
    mission: 'Replace the marked person\'s outfit with the requested clothing, fitted to their body with natural folds in the scene light. Keep their face, pose, hands, hair and background untouched.',
  },
  remove: {
    id: 'remove',
    nazwa: 'Usuń obiekt',
    logic: 'Usuwa obiekt + cień/odbicie/ślady; odbudowa tła; sąsiedzi nietknięci.',
    triggers: 'usuń / wymaż / bez X',
    modules: ['FIDELITY'],
    mission: 'Remove the marked object with its shadow and reflection, and rebuild what logically lies behind and beneath it, continuing the scene\'s patterns and perspective. Neighbours stay.',
  },
  background: {
    id: 'background',
    nazwa: 'Zmień tło',
    logic: 'Pierwszy plan zamrożony; zmienia się tylko otoczenie; doświetlenie pod nowe tło.',
    triggers: 'zmień tło / otoczenie / scenerię',
    modules: ['FIDELITY'],
    mission: 'Keep the foreground subjects exactly in place, scale and pose; replace only the surroundings. Relight the subjects for the new environment and keep the horizon at the same height.',
  },
  texture: {
    id: 'texture',
    nazwa: 'Zmień fakturę',
    logic: 'Nowy materiał na tej samej geometrii 3D; kształt/perspektywa bez zmian.',
    triggers: 'zmień materiał / fakturę / teksturę',
    modules: ['FIDELITY'],
    mission: 'Apply the new material over the exact surface geometry, preserving all 3D shape, curvature and perspective; change only the surface and how it responds to the scene light.',
  },
  time_of_day: {
    id: 'time_of_day',
    nazwa: 'Pora dnia',
    logic: 'Zmienia światło/porę; geometria i obiekty bez zmian.',
    triggers: 'pora dnia / noc / zachód / świt',
    modules: GLOBAL_MODULES,
    mission: 'Transform the time of day (sun angle, sky, and artificial lights at night) while keeping all geometry, objects and framing intact.',
  },
  season: {
    id: 'season',
    nazwa: 'Pora roku',
    logic: 'Zmienia roślinność/pokrywę; architektura bez zmian.',
    triggers: 'pora roku / zima / lato / jesień / wiosna',
    modules: GLOBAL_MODULES,
    mission: 'Transform the season (foliage, ground cover, atmosphere) while keeping architecture, objects and layout intact.',
  },
  effect: {
    id: 'effect',
    nazwa: 'Efekt',
    logic: 'Dodaje cień/odbicie/poświatę/cząsteczki; obiekty bez zmian.',
    triggers: 'dodaj cień / odbicie / poświatę / mgłę / deszcz',
    modules: GLOBAL_MODULES,
    mission: 'Add the requested visual effect (shadows, reflections, glow or atmospheric particles) integrated with the existing scene light, without changing the objects.',
  },
  style: {
    id: 'style',
    nazwa: 'Styl',
    logic: 'Zmienia technikę artystyczną od krawędzi do krawędzi; geometria zostaje.',
    triggers: 'styl / akwarela / olej / anime / szkic',
    modules: ['FIDELITY'],
    mission: 'Change only the artistic style across the whole frame, keeping all geometry, objects, proportions and composition.',
  },
  fix: {
    id: 'fix',
    nazwa: 'Popraw',
    logic: 'Chirurgiczna mikro-zmiana tylko w zaznaczonym miejscu.',
    triggers: 'popraw / drobna zmiana',
    modules: ['GRAIN', 'FIDELITY'],
    mission: 'Make only the requested small change at the marked spot with the smallest possible intervention; the rest of the frame is reference material.',
  },
}

export const LISTA_OPERACJI = Object.values(OPERATIONS)
