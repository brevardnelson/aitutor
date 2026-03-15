import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Undo2, Send, Loader2 } from 'lucide-react';

interface Stroke {
  points: { x: number; y: number; pressure: number }[];
}

interface HandwritingCanvasProps {
  onRecognised: (text: string) => void;
  disabled?: boolean;
}

const HandwritingCanvas = ({ onRecognised, disabled }: HandwritingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);
  const isDrawing = useRef(false);
  const [isRecognising, setIsRecognising] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
    };
  }, []);

  const redraw = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of strokeList) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        ctx.lineWidth = Math.max(1.5, p.pressure * 4);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }, []);

  const strokesRef = useRef<Stroke[]>([]);
  strokesRef.current = strokes;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const w = container.clientWidth;
      const h = 200;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      redraw(strokesRef.current);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || isRecognising) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pt = getCanvasPoint(e);
    currentStroke.current = { points: [pt] };
  }, [disabled, isRecognising, getCanvasPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();
    const pt = getCanvasPoint(e);
    currentStroke.current.points.push(pt);

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pts = currentStroke.current.points;
    if (pts.length < 2) return;
    const prev = pts[pts.length - 2];
    ctx.strokeStyle = '#1e293b';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.5, pt.pressure * 4);
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }, [getCanvasPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();
    isDrawing.current = false;
    if (currentStroke.current.points.length >= 1) {
      if (currentStroke.current.points.length === 1) {
        const pt = currentStroke.current.points[0];
        currentStroke.current.points.push({ ...pt, x: pt.x + 0.5, y: pt.y + 0.5 });
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineCap = 'round';
          ctx.lineWidth = Math.max(1.5, pt.pressure * 4);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ctx.lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      setStrokes(prev => {
        const next = [...prev, currentStroke.current!];
        setHasContent(true);
        return next;
      });
    }
    currentStroke.current = null;
  }, []);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setHasContent(false);
    redraw([]);
  }, [redraw]);

  const handleUndo = useCallback(() => {
    setStrokes(prev => {
      const next = prev.slice(0, -1);
      setHasContent(next.length > 0);
      redraw(next);
      return next;
    });
  }, [redraw]);

  const handleRecognise = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;

    setIsRecognising(true);
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
      }
      const dataUrl = tempCanvas.toDataURL('image/png');
      const imageBase64 = dataUrl.split(',')[1];

      const token = localStorage.getItem('caribbeanAI_token');
      const res = await fetch('/api/ocr/handwriting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Recognition failed' }));
        throw new Error(err.error || 'Recognition failed');
      }

      const { text } = await res.json();
      if (text && text.trim()) {
        onRecognised(text.trim());
      } else {
        throw new Error('Could not recognise any text. Try writing more clearly.');
      }
    } catch (err: unknown) {
      console.error('Handwriting recognition error:', err);
      onRecognised('');
      const message = err instanceof Error ? err.message : 'Could not recognise handwriting. Please try again or type your answer.';
      alert(message);
    } finally {
      setIsRecognising(false);
    }
  }, [hasContent, onRecognised]);

  return (
    <div className="w-full space-y-2">
      <div
        ref={containerRef}
        className="relative rounded-lg border-2 border-dashed border-blue-300 bg-white overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair w-full"
          style={{ height: 200 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!hasContent && !isRecognising && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Write your answer here using stylus, mouse, or finger</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={!hasContent || isRecognising || disabled}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!hasContent || isRecognising || disabled}
        >
          <Eraser className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          size="sm"
          onClick={handleRecognise}
          disabled={!hasContent || isRecognising || disabled}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRecognising ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Recognising...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Recognise
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default HandwritingCanvas;
