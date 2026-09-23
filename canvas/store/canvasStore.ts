import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return new Promise((resolve) => {
      const request = indexedDB.open('canvas-db', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('keyval');
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('keyval', 'readonly');
        const store = tx.objectStore('keyval');
        const getReq = store.get(name);
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return new Promise((resolve) => {
      const request = indexedDB.open('canvas-db', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('keyval');
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('keyval', 'readwrite');
        const store = tx.objectStore('keyval');
        store.put(value, name);
        tx.oncomplete = () => resolve();
      };
      request.onerror = () => resolve();
    });
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return new Promise((resolve) => {
      const request = indexedDB.open('canvas-db', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('keyval');
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('keyval', 'readwrite');
        const store = tx.objectStore('keyval');
        store.delete(name);
        tx.oncomplete = () => resolve();
      };
      request.onerror = () => resolve();
    });
  },
};

export type ToolType = "select" | "move" | "pen" | "text" | "rect" | "pin" | "brush" | "zoom-in" | "zoom-out";

export interface CanvasLayer {
  id: string;
  type: "image" | "text" | "shape";
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth?: number; // original image resolution
  naturalHeight?: number; // original image resolution
  rotation: number;
  name: string;
  visible: boolean;
  locked: boolean;
  originalSrc?: string;

  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;

  // Shared color/style properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;

  // Shape properties
  shapeType?: "rect" | "circle" | "triangle";
}

export interface PinMarker {
  id: string;
  // Normalized coordinates (0-1) relative to image width/height
  normalizedX: number;
  normalizedY: number;
  layerId: string;
  description?: string;
  confirmed?: boolean;
  suggestions?: string[];
  isAnalyzing?: boolean;
  role?: "target" | "source";
  cropThumb?: string;
}

interface CanvasState {
  layers: CanvasLayer[];
  selectedLayerIds: string[];
  activeTool: ToolType;
  pins: PinMarker[];
  stageScale: number;
  stagePos: { x: number; y: number };
  // What the user is doing with pins
  pinMode: "edit" | "adjust" | "transfer" | null;

  // Loomic & AI State
  selectedModel: string;
  isGenerating: boolean;
  generationStatus: string;

  // Text Editor UI State
  textEditorOpen: boolean;
  textAnalysis: string;

  // Brush Tool Mode
  brushMode: "remove" | "text-edit" | null;
  textEditMask: string | null;

  // Canvas dimensions (physical size of container)
  canvasDimensions: { width: number; height: number };
  clipboard: CanvasLayer | null;

  setSelectedModel: (model: string) => void;
  setIsGenerating: (isGenerating: boolean, status?: string) => void;
  setPinRole: (id: string, role: "source" | "target") => void;
  setPinCropThumb: (id: string, thumb: string) => void;

  setTextEditorOpen: (open: boolean) => void;
  setTextAnalysis: (analysis: string) => void;
  setBrushMode: (mode: "remove" | "text-edit" | null) => void;
  setTextEditMask: (mask: string | null) => void;
  setCanvasDimensions: (width: number, height: number) => void;

  addLayer: (layer: Omit<CanvasLayer, "id">) => string;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<CanvasLayer>) => void;
  selectLayers: (ids: string[]) => void;
  toggleLayerSelection: (id: string) => void;
  setActiveTool: (tool: ToolType) => void;
  addPin: (pin: Omit<PinMarker, "id" | "normalizedX" | "normalizedY">, canvasX: number, canvasY: number, normX?: number, normY?: number) => void;
  updatePinDescription: (id: string, description: string) => void;
  updatePinSuggestions: (id: string, suggestions: string[]) => void;
  confirmPin: (id: string) => void;
  removePin: (id: string) => void;
  clearPins: () => void;
  setStageScale: (scale: number) => void;
  setStagePos: (pos: { x: number; y: number }) => void;
  setPinMode: (mode: "edit" | "adjust" | "transfer" | null) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  duplicateLayer: (id: string) => void;
  copySelectedLayer: (id?: string) => void;
  copyImageToClipboard: (id: string) => Promise<void>;
  pasteAt: (x: number, y: number) => void;
  updatePinAnalysisState: (id: string, isAnalyzing: boolean) => void;

  // Helper to calculate non-overlapping placement
  getNextPlacement: (
    width: number,
    height: number,
    prefX?: number,
    prefY?: number,
  ) => { x: number; y: number; width: number; height: number };
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      layers: [],
      selectedLayerIds: [],
      activeTool: "select",
      pins: [],
      stageScale: 1,
      stagePos: { x: 0, y: 0 },
      pinMode: null,
      selectedModel: "gemini-3.1-flash-image-preview",
      isGenerating: false,
      generationStatus: "",
      textEditorOpen: false,
      textAnalysis: "",
      brushMode: null,
      textEditMask: null,
      canvasDimensions: { width: 0, height: 0 },
      clipboard: null,

      setSelectedModel: (model) => set({ selectedModel: model }),
      setIsGenerating: (isGenerating, status = "") => set({ isGenerating, generationStatus: status }),
      setPinRole: (id, role) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, role } : p)),
        })),
      setPinCropThumb: (id, cropThumb) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, cropThumb } : p)),
        })),

      setTextEditorOpen: (open) => set({ textEditorOpen: open }),
      setTextAnalysis: (analysis) => set({ textAnalysis: analysis }),
      setBrushMode: (mode) => set({ brushMode: mode }),
      setTextEditMask: (mask) => set({ textEditMask: mask }),
      setCanvasDimensions: (width, height) => set({ canvasDimensions: { width, height } }),

      addLayer: (layer) => {
        const id = crypto.randomUUID();
        set((s) => ({ layers: [...s.layers, { ...layer, id }] }));
        return id;
      },

      getNextPlacement: (width, height, prefX, prefY) => {
        const state = get();
        const { layers, stageScale, stagePos, canvasDimensions } = state;
        const gap = 40 / stageScale; // 40px buffer gap in stage units

        const wScaled = width / stageScale;
        const hScaled = height / stageScale;

        let startX: number;
        let startY: number;

        if (prefX !== undefined && prefY !== undefined) {
          startX = prefX;
          startY = prefY;
        } else {
          startX = (canvasDimensions.width / 2 - width / 2) / stageScale - stagePos.x / stageScale;
          startY = (canvasDimensions.height / 2 - height / 2) / stageScale - stagePos.y / stageScale;
        }

        const collides = (x: number, y: number) => {
          return layers.some((l) => {
            const buffer = 20 / stageScale;
            return !(
              x + wScaled + buffer < l.x ||
              x > l.x + l.width + buffer ||
              y + hScaled + buffer < l.y ||
              y > l.y + l.height + buffer
            );
          });
        };

        let curX = startX;
        let curY = startY;
        const step = 50 / stageScale;
        const maxAttempts = 100;
        let attempts = 0;

        while (collides(curX, curY) && attempts < maxAttempts) {
          attempts++;
          curX += step;
          if (curX > startX + 1500 / stageScale) {
            curX = startX;
            curY += step;
          }
        }

        return { x: curX, y: curY, width: wScaled, height: hScaled };
      },

      removeLayer: (id) =>
        set((s) => ({
          layers: s.layers.filter((l) => l.id !== id),
          selectedLayerIds: s.selectedLayerIds.filter((sid) => sid !== id),
        })),

      updateLayer: (id, updates) =>
        set((s) => ({
          layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      selectLayers: (ids) => set({ selectedLayerIds: ids }),

      toggleLayerSelection: (id) =>
        set((s) => ({
          selectedLayerIds: s.selectedLayerIds.includes(id)
            ? s.selectedLayerIds.filter((sid) => sid !== id)
            : [...s.selectedLayerIds, id],
        })),

      setActiveTool: (tool) => set({ activeTool: tool }),

      addPin: (pin, canvasX, canvasY, normX, normY) =>
        set((s) => {
          const layer = s.layers.find((l) => l.id === pin.layerId);
          if (!layer) return s;

          let normalizedX = normX;
          let normalizedY = normY;

          if (normalizedX === undefined || normalizedY === undefined) {
            const rad = -(layer.rotation || 0) * (Math.PI / 180);
            const dx = canvasX - layer.x;
            const dy = canvasY - layer.y;
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
            normalizedX = rx / layer.width;
            normalizedY = ry / layer.height;
          }

          const role = s.pins.length === 0 ? "source" : s.pins.length === 1 ? "target" : undefined;

          const newPin: PinMarker = {
            ...pin,
            id: crypto.randomUUID(),
            normalizedX,
            normalizedY,
            role,
            confirmed: false,
          };

          let newMode = s.pinMode;
          if (newMode !== "adjust" && newMode !== "transfer") {
            newMode = "edit";
          }

          return {
            pins: [...s.pins, newPin],
            pinMode: newMode,
          };
        }),

      confirmPin: (id) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, confirmed: true } : p)),
        })),

      updatePinDescription: (id: string, description: string) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, description } : p)),
        })),

      updatePinSuggestions: (id: string, suggestions: string[]) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, suggestions } : p)),
        })),

      removePin: (id) =>
        set((s) => {
          const newPins = s.pins.filter((p) => p.id !== id);
          return { pins: newPins, pinMode: newPins.length > 0 ? "edit" : null };
        }),

      clearPins: () => set({ pins: [], pinMode: null }),

      setStageScale: (scale) => set({ stageScale: Math.max(0.05, Math.min(5, scale)) }),

      setStagePos: (pos) => set({ stagePos: pos }),

      setPinMode: (mode) => set({ pinMode: mode }),

      moveLayerUp: (id) =>
        set((s) => {
          const idx = s.layers.findIndex((l) => l.id === id);
          if (idx >= s.layers.length - 1) return s;
          const layers = [...s.layers];
          [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
          return { layers };
        }),

      moveLayerDown: (id) =>
        set((s) => {
          const idx = s.layers.findIndex((l) => l.id === id);
          if (idx <= 0) return s;
          const layers = [...s.layers];
          [layers[idx], layers[idx - 1]] = [layers[idx - 1], layers[idx]];
          return { layers };
        }),

      duplicateLayer: (id) => {
        const state = get();
        const layer = state.layers.find((l) => l.id === id);
        if (!layer) return;

        const placement = state.getNextPlacement(
          layer.width * state.stageScale,
          layer.height * state.stageScale,
          layer.x + layer.width + 20 / state.stageScale,
          layer.y
        );

        const newLayer = {
          ...layer,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          name: `${layer.name} (Kopia)`,
        };
        const newId = get().addLayer(newLayer);
        get().selectLayers([newId]);
      },

      copySelectedLayer: (id) => {
        const state = get();
        const targetId = id || state.selectedLayerIds[0];
        if (!targetId) return;
        const layer = state.layers.find((l) => l.id === targetId);
        if (layer) {
          set({ clipboard: { ...layer } });
        }
      },

      copyImageToClipboard: async (id: string) => {
        const state = get();
        const layer = state.layers.find(l => l.id === id);
        if (!layer || !layer.src) return;

        try {
          const response = await fetch(layer.src);
          const blob = await response.blob();
          const item = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([item]);
          
          set({ clipboard: { ...layer } });
        } catch (err) {
          set({ clipboard: { ...layer } });
        }
      },

      pasteAt: (x, y) => {
        const { clipboard } = get();
        if (!clipboard) return;

        const newLayer = {
          ...clipboard,
          x,
          y,
          name: `${clipboard.name} (Wklejony)`,
        };
        const newId = get().addLayer(newLayer);
        get().selectLayers([newId]);
      },
      updatePinAnalysisState: (id: string, isAnalyzing: boolean) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, isAnalyzing } : p)),
        })),
    }),
    {
      name: "canvas-persistence",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
