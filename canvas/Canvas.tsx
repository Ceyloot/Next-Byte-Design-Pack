import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Stage, 
  Layer, 
  Image as KonvaImage, 
  Text as KonvaText, 
  Rect as KonvaRect, 
  Circle as KonvaCircle, 
  Transformer, 
  Group 
} from 'react-konva';
import useImage from 'use-image';
import { 
  MousePointer, 
  Hand, 
  MapPin, 
  Paintbrush, 
  Square, 
  Upload, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Layers as LayersIcon, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Wand2,
  Key,
  Check,
  RefreshCw,
  ArrowRightLeft,
  Crosshair
} from 'lucide-react';
import { useCanvasStore, CanvasLayer, PinMarker, ToolType } from './store/canvasStore';
import { geminiAnalyzeTargetObject } from './lib/canvasAI';
import { generateGoogleImage, NANO_BANANA_MODELS } from './lib/googleGenAI';
import { JsonPromptEngine } from './lib/jsonPromptEngine';
import { cropImageAtPoint, createDualTransferMask, createBlobMaskAtPoint } from './lib/maskUtils';
import { Button } from '../button';
import { TechGrid } from '../TechGrid';
import { toast } from 'sonner';

/**
 * Image Layer with selection & transformer support
 */
const ImageLayerItem: React.FC<{
  layer: CanvasLayer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasLayer>) => void;
  onPinClick?: (normX: number, normY: number) => void;
  activeTool: ToolType;
}> = ({ layer, isSelected, onSelect, onChange, onPinClick, activeTool }) => {
  const [image] = useImage(layer.src || '', 'anonymous');
  const shapeRef = useRef<any>(null);

  const handleClick = (e: any) => {
    if (activeTool === 'pin' && onPinClick && shapeRef.current) {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (pointer) {
        const transform = shapeRef.current.getAbsoluteTransform().copy().invert();
        const localPos = transform.point(pointer);
        const normX = Math.max(0, Math.min(1, localPos.x / layer.width));
        const normY = Math.max(0, Math.min(1, localPos.y / layer.height));
        onPinClick(normX, normY);
      }
      return;
    }
    onSelect();
  };

  if (!layer.visible) return null;

  return (
    <Group
      id={layer.id}
      x={layer.x}
      y={layer.y}
      rotation={layer.rotation}
      draggable={!layer.locked && (activeTool === 'select' || activeTool === 'move')}
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      ref={shapeRef}
    >
      <KonvaImage
        image={image}
        width={layer.width}
        height={layer.height}
        stroke={isSelected ? 'hsl(204, 91%, 70%)' : undefined}
        strokeWidth={isSelected ? 2 : 0}
        shadowColor="rgba(0,0,0,0.5)"
        shadowBlur={12}
        shadowOpacity={0.4}
        cornerRadius={8}
      />
    </Group>
  );
};

export function Canvas() {
  const {
    layers,
    selectedLayerIds,
    activeTool,
    pins,
    stageScale,
    stagePos,
    selectedModel,
    isGenerating,
    generationStatus,
    addLayer,
    removeLayer,
    updateLayer,
    selectLayers,
    setActiveTool,
    addPin,
    removePin,
    clearPins,
    setStageScale,
    setStagePos,
    setSelectedModel,
    setIsGenerating,
    setPinRole,
    setPinCropThumb,
    updatePinDescription,
    getNextPlacement,
  } = useCanvasStore();

  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'layers'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [quality, setQuality] = useState<'standard' | 'hd' | 'ultra'>('hd');
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Konva Transformer
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    if (selectedLayerIds.length === 0) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }
    const selectedNodes = selectedLayerIds
      .map((id) => stageRef.current.findOne('#' + id))
      .filter(Boolean);
    trRef.current.nodes(selectedNodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedLayerIds, layers]);

  // Handle Zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.15, Math.min(5, newScale));

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Upload image to canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = (h / w) * maxDim;
            w = maxDim;
          } else {
            w = (w / h) * maxDim;
            h = maxDim;
          }
        }

        const placement = getNextPlacement(w, h);

        const id = addLayer({
          type: 'image',
          src,
          x: placement.x,
          y: placement.y,
          width: w,
          height: h,
          naturalWidth: img.width,
          naturalHeight: img.height,
          rotation: 0,
          name: file.name.replace(/\.[^/.]+$/, '') || 'Obraz',
          visible: true,
          locked: false,
        });

        selectLayers([id]);
        toast.success(`Załadowano obraz: ${file.name}`);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add sample demo image
  const loadDemoImage = () => {
    const sampleUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const id = addLayer({
        type: 'image',
        src: sampleUrl,
        x: (dimensions.width / 2 - 250 - stagePos.x) / stageScale,
        y: (dimensions.height / 2 - 200 - stagePos.y) / stageScale,
        width: 500,
        height: 380,
        naturalWidth: img.width,
        naturalHeight: img.height,
        rotation: 0,
        name: 'Przykładowy Produkt',
        visible: true,
        locked: false,
      });
      selectLayers([id]);
      toast.info('Dodano przykładowy obraz na płótno');
    };
    img.src = sampleUrl;
  };

  // Handle Pin click for Surgical Object Selection (Loomic Protocol)
  const handlePinPlacement = async (normX: number, normY: number, layerId: string) => {
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer || !targetLayer.src) return;

    // Pin 1 is source, Pin 2 is target
    const role: 'source' | 'target' = pins.length === 0 ? 'source' : 'target';

    const pinId = crypto.randomUUID();
    addPin(
      {
        layerId,
        description: 'Identyfikacja obiektu...',
        role,
        isAnalyzing: true,
      },
      targetLayer.x + normX * targetLayer.width,
      targetLayer.y + normY * targetLayer.height,
      normX,
      normY
    );

    setActiveTab('ai');
    toast.info(`Pinezka (${role === 'source' ? 'Źródło' : 'Cel'}) ustawiona`);

    // 1. Generate zoom thumbnail
    try {
      const thumb = await cropImageAtPoint(targetLayer.src, normX, normY, 256);
      setPinCropThumb(pinId, thumb);
    } catch (e) {
      console.warn('Crop thumb generation failed:', e);
    }

    // 2. Identify object with Gemini Vision
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      if (apiKey) {
        const desc = await geminiAnalyzeTargetObject(apiKey, targetLayer.src, { x: normX, y: normY });
        updatePinDescription(pinId, desc);
        toast.success(`Rozpoznano obiekt: ${desc}`);
      }
    } catch (err) {
      console.warn('Object analysis failed:', err);
    }
  };

  // Real Loomic Execution Engine
  const handleExecuteAI = async () => {
    const selectedLayer = layers.find((l) => selectedLayerIds.includes(l.id)) || layers[0];
    if (!selectedLayer || !selectedLayer.src) {
      toast.error('Zaznacz obraz na płótnie, na którym chcesz wykonać operację');
      return;
    }

    let apiKey = localStorage.getItem('gemini_api_key') || '';
    if (!apiKey) {
      const keyInput = window.prompt('Wprowadź swój klucz API Google Gemini (wymagany do silnika Nano-Banana):');
      if (!keyInput) {
        toast.warning('Operacja anulowana — brak klucza API');
        return;
      }
      apiKey = keyInput.trim();
      localStorage.setItem('gemini_api_key', apiKey);
    }

    setIsGenerating(true, 'Analizuję układ i kompiluję prompt Loomic...');

    try {
      const sourcePin = pins.find((p) => p.role === 'source') || (pins.length > 1 ? pins[0] : undefined);
      const targetPin = pins.find((p) => p.role === 'target') || (pins.length === 1 ? pins[0] : pins[1]);

      let action: 'transfer' | 'addition' | 'removal' | 'swap' | 'general_edit' = 'general_edit';
      if (sourcePin && targetPin) {
        action = 'transfer';
      } else if (targetPin) {
        action = 'addition';
      }

      // 1. Compile structured prompt (Solves duplication / double house bug!)
      const plan = JsonPromptEngine.compile({
        action,
        userInstruction: aiPrompt.trim() || 'Przenieś wskazany obiekt w nowe miejsce, zachowując spójność tła',
        sourcePin,
        targetPin,
        sourceObjectName: sourcePin?.description,
        targetObjectName: targetPin?.description,
      });

      setIsGenerating(true, `Generuję w Nano-Banana (${plan.actionSummary})...`);
      toast.info(`Rozpoczynam: ${plan.actionSummary}`);

      // 2. Prepare Inpainting Mask
      let maskImage: string | undefined = undefined;
      const naturalW = selectedLayer.naturalWidth || selectedLayer.width;
      const naturalH = selectedLayer.naturalHeight || selectedLayer.height;

      if (plan.requiresDualMask && sourcePin && targetPin) {
        const dual = createDualTransferMask(
          naturalW,
          naturalH,
          { x: sourcePin.normalizedX, y: sourcePin.normalizedY },
          { x: targetPin.normalizedX, y: targetPin.normalizedY },
          0.2
        );
        maskImage = dual.combinedMask;
      } else if (targetPin) {
        maskImage = createBlobMaskAtPoint(
          naturalW,
          naturalH,
          targetPin.normalizedX * naturalW,
          targetPin.normalizedY * naturalH,
          naturalW * 0.18,
          naturalH * 0.18
        );
      }

      // 3. Execute Google GenAI (Nano-Banana)
      const result = await generateGoogleImage({
        apiKey,
        model: selectedModel,
        prompt: plan.compiledPrompt,
        inputImages: [selectedLayer.src],
        maskImage,
        aspectRatio: plan.recommendedAspectRatio,
        quality,
      });

      setIsGenerating(true, 'Umieszczam wygenerowany kadr na płótnie...');

      // 4. Place result on Canvas
      const img = new Image();
      img.onload = () => {
        const placement = getNextPlacement(selectedLayer.width, selectedLayer.height);

        const newId = addLayer({
          type: 'image',
          src: result.imageUrl,
          x: placement.x,
          y: placement.y,
          width: selectedLayer.width,
          height: selectedLayer.height,
          naturalWidth: img.width,
          naturalHeight: img.height,
          rotation: 0,
          name: `${action === 'transfer' ? 'Relokacja' : 'Synteza'} (${selectedModel.includes('3.1') ? 'NB-2' : 'NB'})`,
          visible: true,
          locked: false,
        });

        selectLayers([newId]);
        clearPins();
        setIsGenerating(false, '');
        toast.success(`Gotowe! Wygenerowano w ${Math.round(result.durationMs / 1000)}s`);
      };
      img.src = result.imageUrl;

    } catch (err: any) {
      console.error('AI Generation Failed:', err);
      setIsGenerating(false, '');
      toast.error(err.message || 'Wystąpił błąd podczas generowania');
    }
  };

  // Export Canvas Image
  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `nextbyte-canvas-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Pobrano zrzut płótna w wysokiej rozdzielczości');
  };

  const selectedLayer = layers.find((l) => selectedLayerIds.includes(l.id));

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050508] select-none text-foreground font-sans">
      {/* Background Subtle Tech Grid */}
      <TechGrid opacity={0.03} oczko={36} />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ================= FLOATING TOP/CENTER TOOLBAR ================= */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl nb-szklo bg-card/75 backdrop-blur-2xl border-border/80 shadow-2xl">
        <button
          onClick={() => setActiveTool('select')}
          className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
            activeTool === 'select' 
              ? 'bg-primary text-black shadow-[0_0_12px_hsl(var(--primary)/0.4)]' 
              : 'text-muted-foreground hover:text-white hover:bg-muted/30'
          }`}
          title="Zaznaczanie i transformacja (V)"
        >
          <MousePointer size={18} />
          <span className="hidden sm:inline">Wskaźnik</span>
        </button>

        <button
          onClick={() => setActiveTool('move')}
          className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
            activeTool === 'move' 
              ? 'bg-primary text-black shadow-[0_0_12px_hsl(var(--primary)/0.4)]' 
              : 'text-muted-foreground hover:text-white hover:bg-muted/30'
          }`}
          title="Przesuwanie płótna (H)"
        >
          <Hand size={18} />
          <span className="hidden sm:inline">Rączka</span>
        </button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        <button
          onClick={() => setActiveTool('pin')}
          className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
            activeTool === 'pin' 
              ? 'bg-primary text-black shadow-[0_0_12px_hsl(var(--primary)/0.4)]' 
              : 'text-muted-foreground hover:text-white hover:bg-muted/30'
          }`}
          title="Loomic Pin Protocol - Wskaż obiekt lub cel (P)"
        >
          <MapPin size={18} />
          <span className="hidden sm:inline">Pinezka AI</span>
        </button>

        <button
          onClick={() => setActiveTool('brush')}
          className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
            activeTool === 'brush' 
              ? 'bg-primary text-black shadow-[0_0_12px_hsl(var(--primary)/0.4)]' 
              : 'text-muted-foreground hover:text-white hover:bg-muted/30'
          }`}
          title="Pędzel inpaintingu / maski (B)"
        >
          <Paintbrush size={18} />
          <span className="hidden sm:inline">Pędzel</span>
        </button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 border border-primary/30"
          title="Dodaj obraz z dysku"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">Dodaj obraz</span>
        </button>

        <button
          onClick={handleExport}
          className="p-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-muted/30 transition-all flex items-center gap-1.5"
          title="Eksportuj obraz PNG"
        >
          <Download size={18} />
        </button>
      </div>

      {/* ================= FLOATING ZOOM & VIEW CONTROLS ================= */}
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-2 p-1.5 rounded-xl nb-szklo bg-card/60 backdrop-blur-xl border-border/70 text-xs font-mono">
        <button
          onClick={() => setStageScale(Math.max(0.2, stageScale - 0.15))}
          className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-white transition-colors"
          title="Pomniejsz"
        >
          <ZoomOut size={16} />
        </button>
        <span className="px-2 font-bold text-white min-w-[50px] text-center">
          {Math.round(stageScale * 100)}%
        </span>
        <button
          onClick={() => setStageScale(Math.min(4, stageScale + 0.15))}
          className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-white transition-colors"
          title="Powiększ"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => {
            setStageScale(1);
            setStagePos({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-white transition-colors border-l border-border/40 pl-2 ml-1"
          title="Reset widoku"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* ================= BOTTOM BAR: ENGINE & STATUS ================= */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-3 px-4 py-2 rounded-xl nb-szklo bg-card/60 backdrop-blur-xl border-border/70 text-xs">
        <span className="flex items-center gap-1.5 text-primary font-mono font-semibold">
          <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400'}`} />
          {NANO_BANANA_MODELS.find(m => m.id === selectedModel)?.displayName || 'Nano Banana'}
        </span>
        <span className="text-muted-foreground/60">•</span>
        <span className="text-muted-foreground font-mono text-[11px]">
          {isGenerating ? generationStatus || 'Przetwarzanie...' : 'Gotowy'}
        </span>
      </div>

      {/* ================= MAIN INTERACTIVE KONVA STAGE ================= */}
      <div 
        className="w-full h-full cursor-crosshair"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result as string;
              const img = new Image();
              img.onload = () => {
                const placement = getNextPlacement(img.width / 2, img.height / 2);
                const id = addLayer({
                  type: 'image',
                  src,
                  x: placement.x,
                  y: placement.y,
                  width: img.width / 2,
                  height: img.height / 2,
                  naturalWidth: img.width,
                  naturalHeight: img.height,
                  rotation: 0,
                  name: file.name.replace(/\.[^/.]+$/, '') || 'Upuszczony Obraz',
                  visible: true,
                  locked: false,
                });
                selectLayers([id]);
                toast.success(`Upuszczono obraz: ${file.name}`);
              };
              img.src = src;
            };
            reader.readAsDataURL(file);
          }
        }}
      >
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          draggable={activeTool === 'move'}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
          onClick={(e) => {
            if (e.target === stageRef.current) {
              selectLayers([]);
            }
          }}
        >
          {/* Background Stage Canvas Layer */}
          <Layer>
            {layers.map((layer) => (
              <ImageLayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                onSelect={() => selectLayers([layer.id])}
                onChange={(updates) => updateLayer(layer.id, updates)}
                onPinClick={(normX, normY) => handlePinPlacement(normX, normY, layer.id)}
                activeTool={activeTool}
              />
            ))}

            {/* Render Pins (Loomic Surgical Pin Protocol) */}
            {pins.map((pin, idx) => {
              const target = layers.find((l) => l.id === pin.layerId);
              if (!target) return null;
              const px = target.x + pin.normalizedX * target.width;
              const py = target.y + pin.normalizedY * target.height;

              const isSource = pin.role === 'source';
              const strokeColor = isSource ? '#00a8ff' : '#d946ef';
              const fillColor = isSource ? 'rgba(0, 168, 255, 0.25)' : 'rgba(217, 70, 239, 0.25)';

              return (
                <Group key={pin.id} x={px} y={py}>
                  {/* Outer pulsing ring */}
                  <KonvaCircle
                    radius={16}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2}
                  />
                  {/* Inner solid badge */}
                  <KonvaCircle
                    radius={8}
                    fill={strokeColor}
                    shadowColor={strokeColor}
                    shadowBlur={8}
                    shadowOpacity={0.8}
                  />
                  {/* Pin Number */}
                  <KonvaText
                    text={String(idx + 1)}
                    fontSize={10}
                    fontStyle="bold"
                    fill="#FFFFFF"
                    x={-3}
                    y={-5}
                  />
                </Group>
              );
            })}

            {/* Transformer for selected item */}
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) return oldBox;
                return newBox;
              }}
              borderStroke="hsl(204, 91%, 70%)"
              borderStrokeWidth={1.5}
              anchorStroke="hsl(204, 91%, 70%)"
              anchorFill="#050508"
              anchorSize={9}
              anchorCornerRadius={3}
            />
          </Layer>
        </Stage>
      </div>

      {/* ================= EMPTY STATE HELPER ================= */}
      {layers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="pointer-events-auto p-8 rounded-3xl nb-szklo max-w-md text-center space-y-5 border-border/70 shadow-2xl bg-card/70 backdrop-blur-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <LayersIcon size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Twoje płótno jest puste
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Przeciągnij i upuść grafikę na płótno, wgraj plik z dysku lub skorzystaj z przykładowego projektu, aby rozpocząć edycję.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-black font-bold text-xs rounded-xl"
              >
                <Upload size={15} className="mr-1.5" /> Dodaj obraz
              </Button>
              <Button
                variant="outline"
                onClick={loadDemoImage}
                className="border-border text-xs rounded-xl text-white"
              >
                Załaduj Demo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RIGHT SIDEBAR INSPECTOR ================= */}
      <div 
        className={`absolute top-0 right-0 bottom-0 z-40 transition-all duration-300 flex ${
          inspectorOpen ? 'translate-x-0' : 'translate-x-[360px]'
        }`}
      >
        {/* Toggle Inspector Tab Handle */}
        <button
          onClick={() => setInspectorOpen(!inspectorOpen)}
          className="self-center -ml-8 p-1.5 rounded-l-xl nb-szklo bg-card border-r-0 border-border text-muted-foreground hover:text-white transition-colors"
          title={inspectorOpen ? 'Zwiń panel' : 'Rozwiń panel'}
        >
          {inspectorOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Panel Content */}
        <div className="w-[360px] h-full nb-szklo-plynne bg-card/90 backdrop-blur-2xl border-l border-border flex flex-col shadow-2xl">
          {/* Header tabs */}
          <div className="p-3 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-background/50 border border-border/50 text-xs w-full">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ai'
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Wand2 size={14} /> Loomic AI Studio
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'layers'
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <LayersIcon size={14} /> Warstwy ({layers.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Loomic AI Studio */}
          {activeTab === 'ai' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
              {/* Model Selector Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                    // SILNIK NANO-BANANA (GOOGLE GENAI)
                  </span>
                  <button
                    onClick={() => {
                      const cur = localStorage.getItem('gemini_api_key') || '';
                      const key = window.prompt('Wprowadź lub zmień klucz API Google Gemini:', cur);
                      if (key !== null) {
                        localStorage.setItem('gemini_api_key', key.trim());
                        toast.success('Zaktualizowano klucz API Gemini');
                      }
                    }}
                    className="text-muted-foreground hover:text-white flex items-center gap-1 text-[10px]"
                    title="Ustawienia klucza API"
                  >
                    <Key size={12} /> Klucz API
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {NANO_BANANA_MODELS.map((m) => {
                    const isSelected = selectedModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/15 border-primary/50 text-white shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                            : 'bg-background/40 border-border/40 hover:border-border text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{m.displayName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold bg-primary/20 text-primary border border-primary/30">
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                          {m.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality & Resolution Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/90">Jakość renderu:</label>
                <div className="flex items-center gap-1.5">
                  {(['standard', 'hd', 'ultra'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                        quality === q
                          ? 'bg-primary text-black border-primary'
                          : 'bg-background/50 border-border/60 text-muted-foreground hover:text-white'
                      }`}
                    >
                      {q === 'standard' ? '1K (Szybki)' : q === 'hd' ? '2K (HD)' : '4K (Ultra)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Pins & Surgical Roles */}
              <div className="space-y-2 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <Crosshair size={14} className="text-primary" />
                    Pinezki i cele ({pins.length})
                  </span>
                  {pins.length > 0 && (
                    <button
                      onClick={() => clearPins()}
                      className="text-muted-foreground hover:text-red-400 text-[10px]"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>

                {pins.length > 0 ? (
                  <div className="space-y-2">
                    {pins.map((pin, index) => {
                      const isSource = pin.role === 'source';
                      return (
                        <div
                          key={pin.id}
                          className="p-2.5 rounded-xl bg-background/60 border border-border/60 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Zoom Crop Thumbnail */}
                              <div className="w-10 h-10 rounded-lg bg-black border border-border overflow-hidden flex-shrink-0">
                                {pin.cropThumb ? (
                                  <img src={pin.cropThumb} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                                    P{index + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-white text-[11px]">
                                  Pinezka {index + 1}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono block">
                                  X: {Math.round(pin.normalizedX * 100)}%, Y: {Math.round(pin.normalizedY * 100)}%
                                </span>
                              </div>
                            </div>

                            {/* Role Toggle Badge */}
                            <button
                              onClick={() => setPinRole(pin.id, isSource ? 'target' : 'source')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                isSource
                                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30'
                                  : 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40 hover:bg-fuchsia-500/30'
                              }`}
                              title="Kliknij, aby przełączyć rolę (Źródło vs Cel)"
                            >
                              <ArrowRightLeft size={10} />
                              {isSource ? 'ŹRÓDŁO' : 'CEL'}
                            </button>
                          </div>

                          {/* Editable Description */}
                          <input
                            type="text"
                            value={pin.description || ''}
                            onChange={(e) => updatePinDescription(pin.id, e.target.value)}
                            placeholder="Opis obiektu pod pinezką..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-card/60 border border-border/80 text-white placeholder:text-muted-foreground/60 text-[11px] focus:outline-none focus:border-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-border/60 text-center text-muted-foreground text-[11px] space-y-1">
                    <p>Brak ustawionych pinezek.</p>
                    <p className="text-[10px] opacity-75">
                      Wybierz narzędzie <strong>Pinezka AI</strong> i kliknij obiekt (P1 = Źródło, P2 = Cel).
                    </p>
                  </div>
                )}
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5 pt-1 border-t border-border/50">
                <label className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Instrukcja dla AI (Prompt):</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Format Loomic JSON</span>
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    pins.length >= 2
                      ? 'Np. Przenieś domek w nowe miejsce, usuń go ze wzgórza i odbuduj tło lasu...'
                      : 'Np. Dodaj kamienną studnię z drewnianym daszkiem, dopasuj oświetlenie...'
                  }
                  className="w-full h-24 p-3 rounded-xl bg-background/60 border border-border/80 text-white placeholder:text-muted-foreground/50 text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Main Execute Button */}
              <Button
                disabled={isGenerating || !selectedLayer}
                onClick={handleExecuteAI}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-5 rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.25)] flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{generationStatus || 'Generowanie...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>
                      {pins.length >= 2
                        ? 'Wykonaj chirurgiczną relokację (Loomic)'
                        : 'Wykonaj syntezę Nano-Banana'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Tab 2: Layers */}
          {activeTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {layers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Brak warstw na płótnie
                </div>
              ) : (
                layers.map((layer) => {
                  const isSel = selectedLayerIds.includes(layer.id);
                  return (
                    <div
                      key={layer.id}
                      onClick={() => selectLayers([layer.id])}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSel
                          ? 'bg-primary/10 border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                          : 'bg-background/40 border-border/40 hover:border-border hover:bg-background/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {layer.src ? (
                            <img src={layer.src} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Square size={16} className="text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSel ? 'text-white' : 'text-foreground/80'}`}>
                            {layer.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {Math.round(layer.width)} × {Math.round(layer.height)} px
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                          className="p-1 hover:text-white rounded"
                          title={layer.visible ? 'Ukryj warstwę' : 'Pokaż warstwę'}
                        >
                          {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-red-400" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { locked: !layer.locked });
                          }}
                          className="p-1 hover:text-white rounded"
                          title={layer.locked ? 'Odblokuj' : 'Zablokuj'}
                        >
                          {layer.locked ? <Lock size={14} className="text-yellow-400" /> : <Unlock size={14} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                            toast.info(`Usunięto warstwę: ${layer.name}`);
                          }}
                          className="p-1 hover:text-red-400 rounded"
                          title="Usuń warstwę"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer stats */}
          <div className="p-3 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
            <span>Warstw: {layers.length}</span>
            <span className="text-primary">NextByte Loomic Engine</span>
          </div>
        </div>
      </div>

    </div>
  );
}
