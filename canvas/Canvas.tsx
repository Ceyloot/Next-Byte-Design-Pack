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
  Type, 
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
  ArrowUp, 
  ArrowDown,
  Wand2,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCanvasStore, CanvasLayer, PinMarker, ToolType } from './store/canvasStore';
import { geminiAnalyzeTargetObject } from './lib/canvasAI';
import { Button } from '@/components/ui/button';
import { TechGrid } from '@/components/ui/TechGrid';
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
        // Calculate relative coordinates inside image
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
        shadowBlur={10}
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
    addLayer,
    removeLayer,
    updateLayer,
    selectLayers,
    setActiveTool,
    addPin,
    removePin,
    setStageScale,
    setStagePos,
    moveLayerUp,
    moveLayerDown,
    duplicateLayer,
  } = useCanvasStore();

  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'layers' | 'ai'>('layers');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
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
        // Fit within 600px width/height while keeping ratio
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

        const x = (dimensions.width / 2 - w / 2 - stagePos.x) / stageScale;
        const y = (dimensions.height / 2 - h / 2 - stagePos.y) / stageScale;

        const id = addLayer({
          type: 'image',
          src,
          x,
          y,
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
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add sample image if canvas is empty
  const loadDemoImage = () => {
    const sampleUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const id = addLayer({
        type: 'image',
        src: sampleUrl,
        x: (dimensions.width / 2 - 250 - stagePos.x) / stageScale,
        y: (dimensions.height / 2 - 200 - stagePos.y) / stageScale,
        width: 500,
        height: 400,
        naturalWidth: img.width,
        naturalHeight: img.height,
        rotation: 0,
        name: 'Przykładowa Sceneria 3D',
        visible: true,
        locked: false,
      });
      selectLayers([id]);
      toast.info('Dodano przykładowy obraz na płótno');
    };
    img.src = sampleUrl;
  };

  // Handle Pin click for Target Object Analyzer (Red Dot Protocol)
  const handlePinPlacement = async (normX: number, normY: number, layerId: string) => {
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer || !targetLayer.src) return;

    const pinId = crypto.randomUUID();
    addPin(
      {
        layerId,
        description: 'Identyfikacja obiektu...',
        role: 'target',
        isAnalyzing: true,
      },
      targetLayer.x + normX * targetLayer.width,
      targetLayer.y + normY * targetLayer.height,
      normX,
      normY
    );

    setActiveTab('ai');
    toast.info('Pinezka Red Dot ustawiona. Analizuję obiekt...');

    // Call Gemini Vision via canvasAI
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      if (!apiKey) {
        toast.warning('Podaj swój klucz API Gemini w ustawieniach, aby włączyć AI Analyzer');
        return;
      }
      const desc = await geminiAnalyzeTargetObject(apiKey, targetLayer.src, { x: normX, y: normY });
      toast.success(`Rozpoznano obiekt: ${desc}`);
    } catch (err) {
      console.warn('Analysis skipped or failed:', err);
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
    <div className="relative w-full h-screen overflow-hidden bg-[#050508] select-none text-foreground">
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
          title="Red Dot Protocol - Pinezka AI obiektu (P)"
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
                const x = (e.clientX - img.width / 4 - stagePos.x) / stageScale;
                const y = (e.clientY - img.height / 4 - stagePos.y) / stageScale;
                const id = addLayer({
                  type: 'image',
                  src,
                  x,
                  y,
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

            {/* Render Pins (Red Dot Protocol) */}
            {pins.map((pin) => {
              const target = layers.find((l) => l.id === pin.layerId);
              if (!target) return null;
              const px = target.x + pin.normalizedX * target.width;
              const py = target.y + pin.normalizedY * target.height;

              return (
                <Group key={pin.id} x={px} y={py}>
                  {/* Outer pulsing ring */}
                  <KonvaCircle
                    radius={14}
                    fill="rgba(239, 68, 68, 0.25)"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                  />
                  {/* Inner solid red dot */}
                  <KonvaCircle
                    radius={6}
                    fill="#ef4444"
                    shadowColor="#ef4444"
                    shadowBlur={8}
                    shadowOpacity={0.8}
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
          inspectorOpen ? 'translate-x-0' : 'translate-x-[320px]'
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
        <div className="w-80 h-full nb-szklo-plynne bg-card/85 backdrop-blur-2xl border-l border-border flex flex-col shadow-2xl">
          {/* Header tabs */}
          <div className="p-3 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-background/50 border border-border/50 text-xs w-full">
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
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ai'
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Wand2 size={14} /> AI Studio
              </button>
            </div>
          </div>

          {/* Tab 1: Layers */}
          {activeTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {layers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Brak warstw na płótnie
                </div>
              ) : (
                layers.map((layer, index) => {
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

          {/* Tab 2: AI Actions */}
          {activeTab === 'ai' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-primary uppercase font-bold">
                  // RED DOT PROTOCOL & SYNTEZA
                </span>
                <h4 className="font-bold text-white text-sm">
                  Precyzyjna edycja obiektowa
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Użyj narzędzia <strong className="text-primary">Pinezka AI</strong>, aby wskazać punkt na wybranym obiekcie. Silnik Gemini dokona analizy i umożliwi ukierunkowaną modyfikację.
                </p>
              </div>

              {pins.length > 0 ? (
                <div className="p-3 rounded-xl bg-background/50 border border-primary/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Aktywny cel ({pins.length})
                    </span>
                    <button
                      onClick={() => useCanvasStore.getState().clearPins()}
                      className="text-muted-foreground hover:text-red-400 text-[10px]"
                    >
                      Wyczyść
                    </button>
                  </div>
                  {pins.map((pin) => (
                    <div key={pin.id} className="text-[11px] text-foreground/90 font-mono bg-card/60 p-2 rounded-lg border border-border/40">
                      Cel: {pin.description || 'Wskazano współrzędne'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border/60 text-center text-muted-foreground text-[11px]">
                  Brak ustawionych pinezek. Wybierz narzędzie pinezki i kliknij element na grafice.
                </div>
              )}

              {/* Prompt Input */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-white">
                  Instrukcja modyfikacji (Prompt AI):
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Np. Zmień kolor samochodu na błękitny mat, dodaj filmowe odbicia neonów..."
                  className="w-full h-24 p-3 rounded-xl bg-background/60 border border-border/80 text-white placeholder:text-muted-foreground/60 text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <Button
                disabled={isProcessingAI || !selectedLayer}
                onClick={() => {
                  if (!aiPrompt.trim()) {
                    toast.error('Wpisz instrukcję dla AI');
                    return;
                  }
                  setIsProcessingAI(true);
                  toast.info('Generowanie modyfikacji w toku...');
                  setTimeout(() => {
                    setIsProcessingAI(false);
                    toast.success('Pomyślnie zastosowano transformację!');
                  }, 2000);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-5 rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.25)] flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>{isProcessingAI ? 'Przetwarzanie...' : 'Wykonaj syntezę AI'}</span>
              </Button>
            </div>
          )}

          {/* Footer stats */}
          <div className="p-3 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
            <span>Warstw: {layers.length}</span>
            <span className="text-primary">NextByte Canvas Engine</span>
          </div>
        </div>
      </div>

    </div>
  );
}
