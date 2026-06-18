import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Mostrado a quem tem login e está associado a um colaborador SEM foto de perfil.
 * Explica que a foto será o perfil (alterável depois) e é OBRIGATÓRIA para picar
 * o ponto. Pode adiar ("Mais tarde") — a obrigatoriedade é garantida no servidor
 * ao tentar dar entrada no ponto.
 */
export default function ProfilePhotoPrompt() {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const upload = trpc.rh.uploadMyPhoto.useMutation({
    onSuccess: () => {
      toast.success("Foto de perfil guardada!");
      utils.auth.me.invalidate();
      stopCamera();
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  useEffect(() => {
    if (!open || preview) return;
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => toast.error("Não consegui aceder à câmara. Verifica as permissões."));
    return () => { active = false; };
  }, [open, preview]);

  useEffect(() => () => stopCamera(), []); // cleanup ao desmontar

  const capture = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setPreview(c.toDataURL("image/jpeg", 0.85));
    stopCamera();
  };

  const confirm = () => {
    if (!preview) return;
    upload.mutate({ fileBase64: preview.split(",")[1], mimeType: "image/jpeg" });
  };

  const retake = () => { setPreview(null); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { stopCamera(); setOpen(false); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Foto de perfil</DialogTitle>
          <DialogDescription>
            Vamos tirar uma foto para o teu perfil. Podes trocá-la mais tarde, mas é
            <strong> obrigatória para picar o ponto</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div className="w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="pré-visualização" className="w-full h-full object-cover" />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2 w-full">
            {!preview ? (
              <Button className="flex-1" onClick={capture} disabled={!stream}>
                <Camera className="w-4 h-4 mr-2" /> Tirar foto
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={retake} disabled={upload.isPending}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Repetir
                </Button>
                <Button className="flex-1" onClick={confirm} disabled={upload.isPending}>
                  {upload.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Usar esta foto
                </Button>
              </>
            )}
          </div>
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { stopCamera(); setOpen(false); }}
          >
            Mais tarde
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
