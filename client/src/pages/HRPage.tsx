import { useState, useRef, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserPlus, Search, FileText, Clock, Calendar,
  Upload, Trash2, Eye, ChevronLeft, Camera, MapPin,
  Euro, Building2, Phone, Mail, CreditCard, Shield,
  CheckCircle2, XCircle, AlertTriangle, Image, FolderOpen, Plus, Pencil, Save, X,
  Download, Wallet, Banknote, ChevronRight, ArrowUpDown
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Position =
  | "director" | "supervisor" | "team_leader" | "backoffice"
  | "frontoffice" | "senior_driver" | "driver" | "extra";

type ContractType = "permanent" | "fixed_term" | "extra";

type DocType =
  | "id_card" | "residence_permit" | "driving_license" | "nib_proof"
  | "address_proof" | "contract" | "extra_contract" | "contract_annex"
  | "responsibility_term" | "work_accident_insurance" | "photo" | "other";

const POSITION_LABELS: Record<Position, string> = {
  director: "Director",
  supervisor: "Supervisor",
  team_leader: "Team Leader",
  backoffice: "Backoffice",
  frontoffice: "Frontoffice",
  senior_driver: "Condutor Sénior",
  driver: "Condutor",
  extra: "Extra",
};

const CONTRACT_LABELS: Record<ContractType, string> = {
  permanent: "Permanente",
  fixed_term: "Termo Certo",
  extra: "Extra",
};

const DOC_LABELS: Record<DocType, string> = {
  id_card: "Bilhete de Identidade",
  residence_permit: "Título de Residência",
  driving_license: "Carta de Condução",
  nib_proof: "Comprovativo NIB",
  address_proof: "Comprovativo de Morada",
  contract: "Contrato de Trabalho",
  extra_contract: "Contrato Extra",
  contract_annex: "Anexo de Contrato",
  responsibility_term: "Termo de Responsabilidade",
  work_accident_insurance: "Seguro de Acidentes de Trabalho",
  photo: "Fotografia",
  other: "Outro",
};

const MANDATORY_DOC_TYPES: DocType[] = [
  "photo", "id_card", "driving_license", "nib_proof",
  "address_proof", "contract", "responsibility_term",
];

const POSITION_COLORS: Record<Position, string> = {
  director: "bg-purple-100 text-purple-800",
  supervisor: "bg-blue-100 text-blue-800",
  team_leader: "bg-indigo-100 text-indigo-800",
  backoffice: "bg-cyan-100 text-cyan-800",
  frontoffice: "bg-teal-100 text-teal-800",
  senior_driver: "bg-green-100 text-green-800",
  driver: "bg-emerald-100 text-emerald-800",
  extra: "bg-amber-100 text-amber-800",
};

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function HRStatsBar() {
  const { data: stats } = trpc.rh.stats.useQuery();
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Total Ativos", value: stats.totalActive, icon: Users, color: "text-blue-600" },
        { label: "Permanentes", value: stats.totalPermanent, icon: Shield, color: "text-green-600" },
        { label: "Extras", value: stats.totalExtras, icon: Clock, color: "text-amber-600" },
        { label: "Horas este Mês", value: `${stats.monthlyHours.toFixed(1)}h`, icon: Calendar, color: "text-purple-600" },
      ].map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── CREATE EMPLOYEE DIALOG ───────────────────────────────────────────────────
function CreateEmployeeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: allUsers = [] } = trpc.users.list.useQuery();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", nif: "", nib: "",
    address: "", birthDate: "", nationality: "Portuguesa",
    position: "driver" as Position,
    extraLevel: 1,
    department: "",
    contractType: "permanent" as ContractType,
    contractStart: "", contractEnd: "",
    monthlySalary: "",
    mealAllowancePerDay: "",
    userId: null as number | null,
  });

  const create = trpc.rh.create.useMutation({
    onSuccess: () => {
      utils.rh.list.invalidate();
      utils.rh.stats.invalidate();
      toast.success("Colaborador criado com sucesso!");
      onClose();
      setForm({
        fullName: "", email: "", phone: "", nif: "", nib: "",
        address: "", birthDate: "", nationality: "Portuguesa",
        position: "driver", extraLevel: 1, department: "",
        contractType: "permanent", contractStart: "", contractEnd: "",
        monthlySalary: "", mealAllowancePerDay: "", userId: null,
      });
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Nome Completo *</Label>
            <Input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@empresa.pt" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+351 9XX XXX XXX" />
          </div>
          <div>
            <Label>NIF</Label>
            <Input value={form.nif} onChange={e => set("nif", e.target.value)} placeholder="123456789" />
          </div>
          <div>
            <Label>NIB / IBAN</Label>
            <Input value={form.nib} onChange={e => set("nib", e.target.value)} placeholder="PT50..." />
          </div>
          <div>
            <Label>Data de Nascimento</Label>
            <Input type="date" value={form.birthDate} onChange={e => set("birthDate", e.target.value)} />
          </div>
          <div>
            <Label>Nacionalidade</Label>
            <Input value={form.nationality} onChange={e => set("nationality", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Morada</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Rua, nº, cidade" />
          </div>
          <div>
            <Label>Posto *</Label>
            <Select value={form.position} onValueChange={v => set("position", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.position === "extra" && (
            <div>
              <Label>Nível Extra (1-5)</Label>
              <Select value={String(form.extraLevel)} onValueChange={v => set("extraLevel", parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>Nível {n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Departamento</Label>
            <Input value={form.department} onChange={e => set("department", e.target.value)} placeholder="Ex: Lisboa" />
          </div>
          <div>
            <Label>Tipo de Contrato</Label>
            <Select value={form.contractType} onValueChange={v => set("contractType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(CONTRACT_LABELS) as [ContractType, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Início do Contrato</Label>
            <Input type="date" value={form.contractStart} onChange={e => set("contractStart", e.target.value)} />
          </div>
          {form.contractType === "fixed_term" && (
            <div>
              <Label>Fim do Contrato</Label>
              <Input type="date" value={form.contractEnd} onChange={e => set("contractEnd", e.target.value)} />
            </div>
          )}
          {form.position !== "extra" && (
            <>
              <div>
                <Label>Salário Mensal (€)</Label>
                <Input type="number" value={form.monthlySalary} onChange={e => set("monthlySalary", e.target.value)} placeholder="1200.00" />
              </div>
              <div>
                <Label>Sub. Alimentação (€/dia)</Label>
                <Input type="number" value={form.mealAllowancePerDay} onChange={e => set("mealAllowancePerDay", e.target.value)} placeholder="6.00" />
              </div>
            </>
          )}
          <div className="col-span-2">
            <Label>Utilizador Associado</Label>
            <Select value={form.userId ? String(form.userId) : "none"} onValueChange={v => setForm(f => ({ ...f, userId: v === "none" ? null : parseInt(v) }))}>
              <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {allUsers.map((u: any) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name ?? u.email} ({u.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Liga este colaborador a um utilizador da plataforma (para picar ponto, etc.)</p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => create.mutate({
              ...form,
              extraLevel: form.position === "extra" ? form.extraLevel : undefined,
              contractEnd: form.contractType === "fixed_term" ? form.contractEnd : undefined,
              monthlySalary: form.monthlySalary || undefined,
              mealAllowancePerDay: form.mealAllowancePerDay || undefined,
              birthDate: form.birthDate || undefined,
              contractStart: form.contractStart || undefined,
              userId: form.userId ?? undefined,
            })}
            disabled={!form.fullName || create.isPending}
          >
            {create.isPending ? "A criar..." : "Criar Colaborador"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DOCUMENT UPLOAD (MULTI-FILE + CHECKLIST) ───────────────────────────────
function DocumentsTab({ employeeId }: { employeeId: number }) {
  const utils = trpc.useUtils();
  const { data: docs = [] } = trpc.rh.documents.list.useQuery({ employeeId });
  const { data: checklist = [] } = trpc.rh.documents.checklist.useQuery({ employeeId });
  const [uploading, setUploading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<DocType | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<DocType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<DocType>("id_card");

  const uploadBatch = trpc.rh.documents.uploadBatch.useMutation({
    onSuccess: () => {
      utils.rh.documents.list.invalidate({ employeeId });
      utils.rh.documents.checklist.invalidate({ employeeId });
      utils.rh.documents.allStatus.invalidate();
      toast.success("Documentos carregados!");
      setUploading(false);
      setUploadingCategory(null);
    },
    onError: (e) => { toast.error(e.message); setUploading(false); setUploadingCategory(null); },
  });

  const del = trpc.rh.documents.delete.useMutation({
    onSuccess: () => {
      utils.rh.documents.list.invalidate({ employeeId });
      utils.rh.documents.checklist.invalidate({ employeeId });
      utils.rh.documents.allStatus.invalidate();
      toast.success("Documento eliminado");
    },
  });

  const handleMultiFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadingCategory(activeDocTypeRef.current);
    const files: { fileBase64: string; mimeType: string; fileName: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      files.push({ fileBase64: base64, mimeType: file.type, fileName: file.name });
    }
    uploadBatch.mutate({ employeeId, docType: activeDocTypeRef.current, files });
    if (fileRef.current) fileRef.current.value = "";
  };

  const triggerUpload = (docType: DocType) => {
    activeDocTypeRef.current = docType;
    fileRef.current?.click();
  };

  // Group docs by category
  type DocItem = (typeof docs)[number];
  const docsByType = useMemo(() => {
    const map = new Map<string, DocItem[]>();
    for (const d of docs) {
      if (!map.has(d.docType)) map.set(d.docType, []);
      map.get(d.docType)!.push(d);
    }
    return map;
  }, [docs]);

  const completedCount = checklist.filter(c => c.present).length;
  const totalMandatory = checklist.length;
  const progressPct = totalMandatory > 0 ? Math.round((completedCount / totalMandatory) * 100) : 0;

  const isImage = (mime?: string | null) => mime?.startsWith("image/");

  return (
    <div className="space-y-5">
      <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleMultiFile} />

      {/* Checklist de documentos obrigatórios */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Checklist de Documentos Obrigatórios
            </CardTitle>
            <Badge variant={completedCount === totalMandatory ? "default" : "secondary"} className={completedCount === totalMandatory ? "bg-green-100 text-green-700" : ""}>
              {completedCount}/{totalMandatory}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPct} className="h-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checklist.map((item) => (
              <div
                key={item.docType}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  item.present ? "border-green-200 bg-green-50/50" : "border-orange-200 bg-orange-50/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.present ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  )}
                  <span className="text-sm">{DOC_LABELS[item.docType as DocType]}</span>
                </div>
                {!item.present && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => triggerUpload(item.docType as DocType)}>
                    <Plus className="w-3 h-3 mr-1" /> Carregar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Galeria por categoria */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Documentos por Categoria</h3>
        {(Object.entries(DOC_LABELS) as [DocType, string][]).map(([type, label]) => {
          const typeDocs = docsByType.get(type) || [];
          const isExpanded = expandedCategory === type;
          const isMandatory = MANDATORY_DOC_TYPES.includes(type);
          const hasFiles = typeDocs.length > 0;

          return (
            <Card key={type} className={`overflow-hidden ${!hasFiles && !isMandatory ? "opacity-60" : ""}`}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedCategory(isExpanded ? null : type)}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className={`w-4 h-4 ${hasFiles ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{label}</span>
                  {isMandatory && <Badge variant="outline" className="text-[10px] h-4 px-1">Obrigatório</Badge>}
                  {hasFiles && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{typeDocs.length}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {uploading && uploadingCategory === type ? (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7" onClick={(e) => { e.stopPropagation(); triggerUpload(type); }}>
                      <Upload className="w-3 h-3 mr-1" /> Carregar
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-3 pb-3">
                  {typeDocs.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Sem documentos nesta categoria</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => triggerUpload(type)}>
                        <Upload className="w-3 h-3 mr-1" /> Carregar ficheiros
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3">
                      {typeDocs.map((doc) => (
                        <div key={doc.id} className="group relative border rounded-lg overflow-hidden bg-muted/30">
                          {/* Preview */}
                          {isImage(doc.mimeType) ? (
                            <div
                              className="aspect-[4/3] bg-cover bg-center cursor-pointer"
                              style={{ backgroundImage: `url(${doc.fileUrl})` }}
                              onClick={() => setPreviewUrl(doc.fileUrl)}
                            />
                          ) : (
                            <div
                              className="aspect-[4/3] flex items-center justify-center cursor-pointer"
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                            >
                              <FileText className="w-10 h-10 text-muted-foreground" />
                            </div>
                          )}
                          {/* Info */}
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{doc.label || doc.fileKey?.split("/").pop()}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString("pt-PT")}</p>
                          </div>
                          {/* Actions overlay */}
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="w-6 h-6" onClick={() => isImage(doc.mimeType) ? setPreviewUrl(doc.fileUrl) : window.open(doc.fileUrl, "_blank")}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="secondary" className="w-6 h-6 text-destructive" onClick={() => del.mutate({ id: doc.id })}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Image preview dialog */}
      {previewUrl && (
        <Dialog open onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl p-2">
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── CAMERA CAPTURE COMPONENT ─────────────────────────────────────────────────
function CameraCapture({ onCapture, onCancel }: { onCapture: (base64: string, mimeType: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(s => { if (active) { setStream(s); if (videoRef.current) videoRef.current.srcObject = s; } })
      .catch(() => toast.error("Não foi possível aceder à câmara"));
    return () => { active = false; stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    stream?.getTracks().forEach(t => t.stop());
  };

  const confirm = () => {
    if (!preview) return;
    const base64 = preview.split(",")[1];
    onCapture(base64, "image/jpeg");
  };

  const retake = () => {
    setPreview(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(s => { setStream(s); if (videoRef.current) videoRef.current.srcObject = s; });
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border bg-black aspect-video object-cover" />
          <div className="flex gap-2">
            <Button onClick={takePhoto} className="flex-1"><Camera className="w-4 h-4 mr-2" /> Tirar Foto</Button>
            <Button onClick={onCancel} variant="outline">Cancelar</Button>
          </div>
        </>
      ) : (
        <>
          <img src={preview} alt="Preview" className="w-full rounded-lg border aspect-video object-cover" />
          <div className="flex gap-2">
            <Button onClick={confirm} className="flex-1 bg-green-600 hover:bg-green-700">Confirmar</Button>
            <Button onClick={retake} variant="outline">Repetir</Button>
            <Button onClick={onCancel} variant="outline">Cancelar</Button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ─── TIME RECORDS TAB ─────────────────────────────────────────────────────────
function TimeRecordsTab({ employeeId }: { employeeId: number }) {
  const utils = trpc.useUtils();
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const { data: records = [] } = trpc.rh.timeRecords.list.useQuery({ employeeId });
  const { data: monthly } = trpc.rh.timeRecords.monthlyHours.useQuery({ employeeId, year, month });
  const [cameraMode, setCameraMode] = useState<"check_in" | "check_out" | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  const checkIn = trpc.rh.timeRecords.checkIn.useMutation({
    onSuccess: () => {
      utils.rh.timeRecords.list.invalidate();
      utils.rh.timeRecords.monthlyHours.invalidate();
      toast.success("Check-in registado com foto e GPS!");
      setCameraMode(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const checkOut = trpc.rh.timeRecords.checkOut.useMutation({
    onSuccess: (data) => {
      utils.rh.timeRecords.list.invalidate();
      utils.rh.timeRecords.monthlyHours.invalidate();
      toast.success(`Check-out registado! ${data.hoursWorked}h trabalhadas`);
      setCameraMode(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const submitWithPhoto = (base64: string, mimeType: string) => {
    const doSubmit = (lat?: number, lng?: number) => {
      const payload: any = {
        employeeId,
        photoBase64: base64,
        mimeType,
        latitude: lat ? String(lat) : undefined,
        longitude: lng ? String(lng) : undefined,
        locationName: lat ? `${lat.toFixed(6)}, ${lng!.toFixed(6)}` : undefined,
      };
      if (cameraMode === "check_in") checkIn.mutate(payload);
      else checkOut.mutate(payload);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => doSubmit(pos.coords.latitude, pos.coords.longitude),
        () => doSubmit(),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      doSubmit();
    }
  };

  const openGoogleMaps = (lat: string, lng: string) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Camera capture mode */}
      {cameraMode && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {cameraMode === "check_in" ? "Foto de Entrada" : "Foto de Saída"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CameraCapture
              onCapture={submitWithPhoto}
              onCancel={() => setCameraMode(null)}
            />
            {(checkIn.isPending || checkOut.isPending) && (
              <p className="text-sm text-muted-foreground text-center mt-2 animate-pulse">A registar ponto com foto e GPS...</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Buttons */}
      {!cameraMode && (
        <div className="flex gap-3">
          <Button
            onClick={() => setCameraMode("check_in")}
            disabled={checkIn.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Camera className="w-4 h-4 mr-2" /> Entrada (Foto + GPS)
          </Button>
          <Button
            onClick={() => setCameraMode("check_out")}
            disabled={checkOut.isPending}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <Camera className="w-4 h-4 mr-2" /> Saída (Foto + GPS)
          </Button>
        </div>
      )}

      {monthly && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{monthly.totalHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Horas trabalhadas este mês</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records list */}
      <div className="space-y-2">
        {records.slice(0, 30).map((r) => {
          const isExpanded = expandedRecord === r.id;
          const hasCoords = r.latitude && r.longitude;
          return (
            <div
              key={r.id}
              className="border rounded-lg overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedRecord(isExpanded ? null : r.id)}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${r.type === "check_in" ? "bg-green-500" : "bg-red-500"}`} />
                  {r.photoUrl && (
                    <img src={r.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{r.type === "check_in" ? "Entrada" : "Saída"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.recordedAt).toLocaleString("pt-PT")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasCoords && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <MapPin className="w-3 h-3" /> GPS
                    </Badge>
                  )}
                  {r.photoUrl && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Camera className="w-3 h-3" /> Foto
                    </Badge>
                  )}
                  {r.hoursWorked && <p className="text-sm font-semibold">{parseFloat(String(r.hoursWorked)).toFixed(1)}h</p>}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t bg-muted/10">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    {/* Photo */}
                    {r.photoUrl && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Foto</p>
                        <img
                          src={r.photoUrl}
                          alt="Foto do ponto"
                          className="w-full max-w-[200px] rounded-lg border cursor-pointer hover:opacity-80"
                          onClick={(e) => { e.stopPropagation(); window.open(r.photoUrl!, "_blank"); }}
                        />
                      </div>
                    )}
                    {/* GPS */}
                    {hasCoords && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Localização GPS</p>
                        <div className="space-y-2">
                          <div className="text-xs bg-background p-2 rounded border font-mono">
                            <p>Lat: {r.latitude}</p>
                            <p>Lng: {r.longitude}</p>
                            {r.locationName && <p className="mt-1 text-muted-foreground">{r.locationName}</p>}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={(e) => { e.stopPropagation(); openGoogleMaps(String(r.latitude), String(r.longitude)); }}
                          >
                            <MapPin className="w-3 h-3 mr-1" /> Ver no Google Maps
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {r.hoursWorked && (
                    <div className="text-xs text-muted-foreground">
                      Horas trabalhadas: <span className="font-semibold text-foreground">{parseFloat(String(r.hoursWorked)).toFixed(2)}h</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {records.length === 0 && <p className="text-center text-muted-foreground py-8">Sem registos de ponto</p>}
      </div>
    </div>
  );
}

// ─── SCHEDULES TAB ────────────────────────────────────────────────────────────
function SchedulesTab({ employeeId }: { employeeId: number }) {
  const utils = trpc.useUtils();
  const { data: schedules = [] } = trpc.rh.schedules.list.useQuery({ employeeId });
  const upsert = trpc.rh.schedules.upsert.useMutation({
    onSuccess: () => { utils.rh.schedules.list.invalidate({ employeeId }); toast.success("Horário guardado!"); },
  });

  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const getSchedule = (weekday: number) => schedules.find(s => s.weekday === weekday);

  return (
    <div className="space-y-3">
      {DAYS.map((day, idx) => {
        const s = getSchedule(idx);
        return (
          <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="w-10 text-sm font-medium text-muted-foreground">{day}</div>
            <Input
              type="time"
              defaultValue={s?.startTime ?? "09:00"}
              className="w-28"
              id={`start-${idx}`}
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="time"
              defaultValue={s?.endTime ?? "18:00"}
              className="w-28"
              id={`end-${idx}`}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const start = (document.getElementById(`start-${idx}`) as HTMLInputElement).value;
                const end = (document.getElementById(`end-${idx}`) as HTMLInputElement).value;
                upsert.mutate({ employeeId, weekday: idx, startTime: start, endTime: end, isWorkDay: true });
              }}
            >
              Guardar
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ─── EMPLOYEE DETAIL ──────────────────────────────────────────────────────────
function EmployeeDetail({ employeeId, onBack }: { employeeId: number; onBack: () => void }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.rh.byId.useQuery({ id: employeeId });
  const { data: allUsers = [] } = trpc.users.list.useQuery();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const updateEmployee = trpc.rh.update.useMutation({
    onSuccess: () => {
      utils.rh.byId.invalidate({ id: employeeId });
      utils.rh.list.invalidate();
      toast.success("Colaborador atualizado!");
      setEditing(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const photoRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = trpc.rh.uploadPhoto.useMutation({
    onSuccess: () => { utils.rh.byId.invalidate({ id: employeeId }); toast.success("Foto atualizada!"); },
    onError: (e) => toast.error(e.message),
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      uploadPhoto.mutate({ employeeId, fileBase64: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    if (!data) return;
    const emp = data.employee;
    setEditForm({
      fullName: emp.fullName ?? "",
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      nif: emp.nif ?? "",
      nib: emp.nib ?? "",
      address: emp.address ?? "",
      birthDate: emp.birthDate ? new Date(emp.birthDate).toISOString().split("T")[0] : "",
      nationality: emp.nationality ?? "",
      position: emp.position ?? "driver",
      extraLevel: emp.extraLevel ?? 1,
      department: emp.department ?? "",
      contractType: emp.contractType ?? "permanent",
      contractStart: emp.contractStart ? new Date(emp.contractStart).toISOString().split("T")[0] : "",
      contractEnd: emp.contractEnd ? new Date(emp.contractEnd).toISOString().split("T")[0] : "",
      monthlySalary: emp.monthlySalary ? String(emp.monthlySalary) : "",
      mealAllowancePerDay: emp.mealAllowancePerDay ? String(emp.mealAllowancePerDay) : "",
      userId: emp.userId ?? null,
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateEmployee.mutate({
      id: employeeId,
      fullName: editForm.fullName || undefined,
      email: editForm.email || undefined,
      phone: editForm.phone || undefined,
      nif: editForm.nif || undefined,
      nib: editForm.nib || undefined,
      address: editForm.address || undefined,
      birthDate: editForm.birthDate || undefined,
      nationality: editForm.nationality || undefined,
      position: editForm.position || undefined,
      extraLevel: editForm.position === "extra" ? editForm.extraLevel : undefined,
      department: editForm.department || undefined,
      contractType: editForm.contractType || undefined,
      contractStart: editForm.contractStart || undefined,
      contractEnd: editForm.contractType === "fixed_term" ? editForm.contractEnd || undefined : undefined,
      monthlySalary: editForm.monthlySalary || undefined,
      mealAllowancePerDay: editForm.mealAllowancePerDay || undefined,
      userId: editForm.userId,
    });
  };

  const ef = (k: string, v: any) => setEditForm(f => ({ ...f, [k]: v }));

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">A carregar...</div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Colaborador não encontrado</div>;

  const emp = data.employee;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Voltar</Button>
        <h2 className="text-xl font-semibold">{emp.fullName}</h2>
        <Badge className={POSITION_COLORS[emp.position as Position]}>{POSITION_LABELS[emp.position as Position]}</Badge>
        <div className="flex-1" />
        {!editing ? (
          <Button variant="outline" onClick={startEditing}>
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateEmployee.isPending}>
              <Save className="w-4 h-4 mr-2" /> {updateEmployee.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile card — VIEW MODE */}
      {!editing ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={emp.photoUrl ?? undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {emp.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full"
                  onClick={() => photoRef.current?.click()}
                >
                  <Camera className="w-3 h-3" />
                </Button>
                <input ref={photoRef} type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
                {emp.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{emp.email}</span>
                  </div>
                )}
                {emp.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{emp.phone}</span>
                  </div>
                )}
                {emp.nif && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span>NIF: {emp.nif}</span>
                  </div>
                )}
                {emp.nib && (
                  <div className="flex items-center gap-2 text-sm">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span>NIB: {emp.nib}</span>
                  </div>
                )}
                {emp.address && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{emp.address}</span>
                  </div>
                )}
                {emp.nationality && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span>{emp.nationality}</span>
                  </div>
                )}
                {emp.birthDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Nasc: {new Date(emp.birthDate).toLocaleDateString("pt-PT")}</span>
                  </div>
                )}
                {emp.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{emp.department}</span>
                  </div>
                )}
                {emp.monthlySalary && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <Euro className="w-4 h-4" />
                    <span>{parseFloat(String(emp.monthlySalary)).toFixed(2)}€/mês</span>
                  </div>
                )}
                {emp.contractType && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>{CONTRACT_LABELS[emp.contractType as ContractType]}</span>
                  </div>
                )}
                {emp.contractStart && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Desde {new Date(emp.contractStart).toLocaleDateString("pt-PT")}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Linked user */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Utilizador Associado:</span>
                {emp.userId ? (
                  <Badge variant="secondary">{allUsers.find((u: any) => u.id === emp.userId)?.name ?? "User #" + emp.userId}</Badge>
                ) : (
                  <span className="text-sm text-orange-500">Nenhum</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* EDIT MODE */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar Dados do Colaborador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={emp.photoUrl ?? undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {(editForm.fullName || emp.fullName).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full"
                  onClick={() => photoRef.current?.click()}
                >
                  <Camera className="w-3 h-3" />
                </Button>
                <input ref={photoRef} type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input value={editForm.fullName} onChange={e => ef("fullName", e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={editForm.email} onChange={e => ef("email", e.target.value)} placeholder="email@empresa.pt" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={editForm.phone} onChange={e => ef("phone", e.target.value)} placeholder="+351 9XX XXX XXX" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>NIF</Label>
                <Input value={editForm.nif} onChange={e => ef("nif", e.target.value)} placeholder="123456789" />
              </div>
              <div>
                <Label>NIB / IBAN</Label>
                <Input value={editForm.nib} onChange={e => ef("nib", e.target.value)} placeholder="PT50..." />
              </div>
              <div className="col-span-2">
                <Label>Morada</Label>
                <Input value={editForm.address} onChange={e => ef("address", e.target.value)} placeholder="Rua, nº, cidade" />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <Input type="date" value={editForm.birthDate} onChange={e => ef("birthDate", e.target.value)} />
              </div>
              <div>
                <Label>Nacionalidade</Label>
                <Input value={editForm.nationality} onChange={e => ef("nationality", e.target.value)} />
              </div>
              <div>
                <Label>Posto *</Label>
                <Select value={editForm.position} onValueChange={v => ef("position", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editForm.position === "extra" && (
                <div>
                  <Label>Nível Extra (1-5)</Label>
                  <Select value={String(editForm.extraLevel)} onValueChange={v => ef("extraLevel", parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>Nível {n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Departamento</Label>
                <Input value={editForm.department} onChange={e => ef("department", e.target.value)} placeholder="Ex: Lisboa" />
              </div>
              <div>
                <Label>Tipo de Contrato</Label>
                <Select value={editForm.contractType} onValueChange={v => ef("contractType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(CONTRACT_LABELS) as [ContractType, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Início do Contrato</Label>
                <Input type="date" value={editForm.contractStart} onChange={e => ef("contractStart", e.target.value)} />
              </div>
              {editForm.contractType === "fixed_term" && (
                <div>
                  <Label>Fim do Contrato</Label>
                  <Input type="date" value={editForm.contractEnd} onChange={e => ef("contractEnd", e.target.value)} />
                </div>
              )}
              {editForm.position !== "extra" && (
                <>
                  <div>
                    <Label>Salário Mensal (€)</Label>
                    <Input type="number" value={editForm.monthlySalary} onChange={e => ef("monthlySalary", e.target.value)} placeholder="1200.00" />
                  </div>
                  <div>
                    <Label>Sub. Alimentação (€/dia)</Label>
                    <Input type="number" value={editForm.mealAllowancePerDay} onChange={e => ef("mealAllowancePerDay", e.target.value)} placeholder="6.00" />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <Label>Utilizador Associado</Label>
                <Select value={editForm.userId ? String(editForm.userId) : "none"} onValueChange={v => ef("userId", v === "none" ? null : parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {allUsers.map((u: any) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name ?? u.email} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="documents">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="documents"><FileText className="w-4 h-4 mr-2" />Documentos</TabsTrigger>
          <TabsTrigger value="timerecords"><Clock className="w-4 h-4 mr-2" />Ponto</TabsTrigger>
          <TabsTrigger value="schedules"><Calendar className="w-4 h-4 mr-2" />Horário</TabsTrigger>
        </TabsList>
        <TabsContent value="documents" className="mt-4"><DocumentsTab employeeId={employeeId} /></TabsContent>
        <TabsContent value="timerecords" className="mt-4"><TimeRecordsTab employeeId={employeeId} /></TabsContent>
        <TabsContent value="schedules" className="mt-4"><SchedulesTab employeeId={employeeId} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─── EXTRA RATES DIALOG ───────────────────────────────────────────────────────
function ExtraRatesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: rates = [] } = trpc.rh.extraRates.list.useQuery();
  const update = trpc.rh.extraRates.update.useMutation({
    onSuccess: () => { utils.rh.extraRates.list.invalidate(); toast.success("Taxa atualizada!"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Taxas Horárias — Extras</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {rates.map((r) => (
            <div key={r.level} className="flex items-center gap-3">
              <Badge variant="outline" className="w-20 justify-center">Nível {r.level}</Badge>
              <Input
                type="number"
                step="0.01"
                defaultValue={String(r.hourlyRate)}
                className="flex-1"
                id={`rate-${r.level}`}
              />
              <span className="text-sm text-muted-foreground">€/h</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const val = (document.getElementById(`rate-${r.level}`) as HTMLInputElement).value;
                  update.mutate({ level: r.level, hourlyRate: val });
                }}
              >
                OK
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// ─── PAYROLL TAB ──────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function PayrollPage({ onBack }: { onBack: () => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [sortField, setSortField] = useState<string>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [accountantEmail, setAccountantEmail] = useState("");

  const pdfMutation = trpc.rh.payrollPdf.useMutation();
  const emailMutation = trpc.rh.sendPayrollEmail.useMutation();
  const payslipMutation = trpc.rh.payslipPdf.useMutation();
  const allPayslipsMutation = trpc.rh.allPayslipsPdf.useMutation();
  const [generatingPayslips, setGeneratingPayslips] = useState(false);
  const [payslipResults, setPayslipResults] = useState<Array<{ fullName: string; url: string }> | null>(null);
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);

  const { data: payroll = [], isLoading } = trpc.rh.payroll.useQuery({ year, month });

  const sorted = useMemo(() => {
    return [...payroll].sort((a: any, b: any) => {
      const va = a[sortField] ?? "";
      const vb = b[sortField] ?? "";
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [payroll, sortField, sortDir]);

  const totals = useMemo(() => {
    return payroll.reduce((acc: any, r: any) => ({
      totalHours: acc.totalHours + r.totalHours,
      baseSalary: acc.baseSalary + r.baseSalary,
      extraPayment: acc.extraPayment + r.extraPayment,
      overtimePayment: acc.overtimePayment + r.overtimePayment,
      nightPayment: acc.nightPayment + (r.nightPayment ?? 0),
      weekendPayment: acc.weekendPayment + (r.weekendPayment ?? 0),
      thirteenthProvision: acc.thirteenthProvision + r.thirteenthProvision,
      fourteenthProvision: acc.fourteenthProvision + (r.fourteenthProvision ?? 0),
      mealAllowance: acc.mealAllowance + (r.mealAllowance ?? 0),
      totalPayment: acc.totalPayment + r.totalPayment,
    }), { totalHours: 0, baseSalary: 0, extraPayment: 0, overtimePayment: 0, nightPayment: 0, weekendPayment: 0, thirteenthProvision: 0, fourteenthProvision: 0, mealAllowance: 0, totalPayment: 0 });
  }, [payroll]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{children} <ArrowUpDown className="w-3 h-3" /></span>
    </th>
  );

  const fmt = (v: number) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportPayrollCSV = () => {
    const headers = ["Nome","Posto","Departamento","NIF","NIB","Horas","Dias","Salário Base","Pag. Extra","H.Extra","Pag. H.Extra","H.Noturnas","Pag. Noturnas","H.FDS","Pag. FDS","Prov. 13º","Prov. 14º","Sub. Alim.","Total"];
    const rows = sorted.map((r: any) => [
      r.fullName, r.position, r.department ?? "", r.nif ?? "", r.nib ?? "",
      r.totalHours, r.daysWorked, fmt(r.baseSalary), fmt(r.extraPayment),
      r.overtimeHours, fmt(r.overtimePayment),
      r.nightHours ?? 0, fmt(r.nightPayment ?? 0),
      r.weekendHours ?? 0, fmt(r.weekendPayment ?? 0),
      fmt(r.thirteenthProvision), fmt(r.fourteenthProvision ?? 0),
      fmt(r.mealAllowance ?? 0), fmt(r.totalPayment)
    ]);
    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `folha_ordenados_${year}_${String(month).padStart(2,"0")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportTimesheetCSV = () => {
    const headers = ["Nome","Posto","Departamento","Horas Totais","Dias Trabalhados","Horas Extra","Valor/Hora"];
    const rows = sorted.map((r: any) => [
      r.fullName, r.position, r.department ?? "",
      r.totalHours, r.daysWorked, r.overtimeHours, fmt(r.hourlyRate)
    ]);
    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `folha_ponto_${year}_${String(month).padStart(2,"0")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Voltar</Button>
        <Wallet className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Folha de Ordenados</h2>
      </div>

      {/* Month/Year selector + Export buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={String(month)} onValueChange={v => setMonth(parseInt(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportTimesheetCSV}>
          <Download className="w-4 h-4 mr-2" /> Folha de Ponto
        </Button>
        <Button variant="outline" size="sm" onClick={exportPayrollCSV}>
          <Download className="w-4 h-4 mr-2" /> Folha de Ordenados
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={generatingPdf}
          onClick={async () => {
            setGeneratingPdf(true);
            try {
              const result = await pdfMutation.mutateAsync({ year, month });
              window.open(result.url, "_blank");
              toast.success("PDF gerado com sucesso!");
            } catch (e: any) { toast.error(e.message ?? "Erro ao gerar PDF"); }
            setGeneratingPdf(false);
          }}
        >
          <FileText className="w-4 h-4 mr-2" /> {generatingPdf ? "A gerar..." : "PDF"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={generatingPayslips}
          onClick={async () => {
            setGeneratingPayslips(true);
            try {
              const result = await allPayslipsMutation.mutateAsync({ year, month });
              setPayslipResults(result.payslips);
              toast.success(`${result.count} recibos gerados!`);
            } catch (e: any) { toast.error(e.message ?? "Erro ao gerar recibos"); }
            setGeneratingPayslips(false);
          }}
        >
          <FileText className="w-4 h-4 mr-2" /> {generatingPayslips ? "A gerar..." : "Todos os Recibos"}
        </Button>
        <Button
          size="sm"
          disabled={sendingEmail}
          onClick={() => setEmailDialog(true)}
        >
          <Mail className="w-4 h-4 mr-2" /> Enviar ao Contabilista
        </Button>
      </div>

      {/* Email dialog */}
      {emailDialog && (
        <Dialog open onOpenChange={() => setEmailDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Folha ao Contabilista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email do contabilista</label>
                <Input
                  type="email"
                  placeholder="contabilista@exemplo.pt"
                  value={accountantEmail}
                  onChange={e => setAccountantEmail(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Será enviado um email com o PDF da folha de ordenados de {MONTH_NAMES[month - 1]} {year} em anexo.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEmailDialog(false)}>Cancelar</Button>
                <Button
                  disabled={!accountantEmail || sendingEmail}
                  onClick={async () => {
                    setSendingEmail(true);
                    try {
                      await emailMutation.mutateAsync({ year, month, email: accountantEmail });
                      toast.success(`Folha enviada para ${accountantEmail}!`);
                      setEmailDialog(false);
                    } catch (e: any) { toast.error(e.message ?? "Erro ao enviar email"); }
                    setSendingEmail(false);
                  }}
                >
                  {sendingEmail ? "A enviar..." : "Enviar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payslip results dialog */}
      {payslipResults && (
        <Dialog open onOpenChange={() => setPayslipResults(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recibos de Vencimento — {MONTH_NAMES[month - 1]} {year}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{payslipResults.length} recibos gerados com sucesso</p>
              {payslipResults.map((ps, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30">
                  <span className="text-sm font-medium">{ps.fullName}</span>
                  <Button variant="outline" size="sm" onClick={() => window.open(ps.url, "_blank")}>
                    <Download className="w-3 h-3 mr-1" /> PDF
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setPayslipResults(null)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Salários Base</p>
            <p className="text-xl font-bold">{fmt(totals.baseSalary)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Prov. 13º + 14º</p>
            <p className="text-xl font-bold">{fmt(totals.thirteenthProvision + totals.fourteenthProvision)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sub. Alimentação</p>
            <p className="text-xl font-bold">{fmt(totals.mealAllowance)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Noturnas + FDS</p>
            <p className="text-xl font-bold">{fmt(totals.nightPayment + totals.weekendPayment)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Extras + H.Extra</p>
            <p className="text-xl font-bold">{fmt(totals.extraPayment + totals.overtimePayment)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total a Pagar</p>
            <p className="text-xl font-bold text-primary">{fmt(totals.totalPayment)}€</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">A calcular...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Banknote className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum colaborador ativo encontrado</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <SortHeader field="fullName">Nome</SortHeader>
                    <SortHeader field="position">Posto</SortHeader>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Dept.</th>
                    <SortHeader field="totalHours">Horas</SortHeader>
                    <SortHeader field="daysWorked">Dias</SortHeader>
                    <SortHeader field="baseSalary">Sal. Base</SortHeader>
                    <SortHeader field="extraPayment">Extra</SortHeader>
                    <SortHeader field="overtimeHours">H. Extra</SortHeader>
                    <SortHeader field="overtimePayment">Pag. H.Extra</SortHeader>
                    <SortHeader field="nightPayment">Noturnas</SortHeader>
                    <SortHeader field="weekendPayment">FDS</SortHeader>
                    <SortHeader field="thirteenthProvision">Prov. 13º</SortHeader>
                    <SortHeader field="fourteenthProvision">Prov. 14º</SortHeader>
                    <SortHeader field="mealAllowance">Sub. Alim.</SortHeader>
                    <SortHeader field="totalPayment">Total</SortHeader>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r: any) => (
                    <tr key={r.employeeId} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{r.fullName}</td>
                      <td className="px-3 py-2">
                        <Badge className={`text-xs ${POSITION_COLORS[r.position as Position]}`}>
                          {POSITION_LABELS[r.position as Position]}
                          {r.isExtra && r.extraLevel ? ` N${r.extraLevel}` : ""}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{r.department ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmt(r.totalHours)}h</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.daysWorked}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.baseSalary) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? fmt(r.extraPayment) + "€" : "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.overtimeHours) + "h"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.overtimePayment) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.nightPayment ?? 0) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.weekendPayment ?? 0) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.thirteenthProvision) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.fourteenthProvision ?? 0) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.isExtra ? "—" : fmt(r.mealAllowance ?? 0) + "€"}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-primary">{fmt(r.totalPayment)}€</td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={generatingFor === r.employeeId}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setGeneratingFor(r.employeeId);
                            try {
                              const result = await payslipMutation.mutateAsync({ year, month, employeeId: r.employeeId });
                              window.open(result.url, "_blank");
                            } catch (err: any) { toast.error(err.message ?? "Erro ao gerar recibo"); }
                            setGeneratingFor(null);
                          }}
                        >
                          {generatingFor === r.employeeId ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 bg-muted/30 font-semibold">
                  <tr>
                    <td className="px-3 py-2" colSpan={3}>Totais</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.totalHours)}h</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.baseSalary)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.extraPayment)}€</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.overtimePayment)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.nightPayment)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.weekendPayment)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.thirteenthProvision)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.fourteenthProvision)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(totals.mealAllowance)}€</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-primary">{fmt(totals.totalPayment)}€</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function HRPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [showPayroll, setShowPayroll] = useState(false);

  const { data: employees = [], isLoading } = trpc.rh.list.useQuery({
    isActive: true,
    position: filterPosition !== "all" ? filterPosition : undefined,
  });
  const { data: docStatus = {} } = trpc.rh.documents.allStatus.useQuery();

  const filtered = employees.filter(({ employee: e }) => {
    const matchesSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (e.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.department ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesAccount = filterAccount === "all" ? true
      : filterAccount === "with" ? !!e.userId
      : !e.userId;
    return matchesSearch && matchesAccount;
  });

  if (showPayroll) {
    return <PayrollPage onBack={() => setShowPayroll(false)} />;
  }

  if (selectedId !== null) {
    return <EmployeeDetail employeeId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const exportEmployeesCSV = () => {
    const headers = ["Nome","Email","Telefone","NIF","NIB","Morada","Posto","Departamento","Contrato","Salário","Conta Ativa"];
    const rows = filtered.map(({ employee: e }) => [
      e.fullName, e.email ?? "", e.phone ?? "", e.nif ?? "", e.nib ?? "",
      e.address ?? "", POSITION_LABELS[e.position as Position] ?? e.position,
      e.department ?? "", CONTRACT_LABELS[(e.contractType ?? "permanent") as ContractType] ?? e.contractType,
      e.monthlySalary ? parseFloat(String(e.monthlySalary)).toFixed(2) : "",
      e.userId ? "Sim" : "Não"
    ]);
    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `lista_funcionarios_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Gestão de colaboradores, ponto e documentação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportEmployeesCSV}>
            <Download className="w-4 h-4 mr-2" /> Exportar Lista
          </Button>
          <Button variant="outline" onClick={() => setShowPayroll(true)}>
            <Wallet className="w-4 h-4 mr-2" /> Ordenados
          </Button>
          <Button variant="outline" onClick={() => setShowRates(true)}>
            <Euro className="w-4 h-4 mr-2" /> Taxas Extra
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Novo Colaborador
          </Button>
        </div>
      </div>

      <HRStatsBar />

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pesquisar colaborador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Todos os postos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os postos</SelectItem>
            {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAccount} onValueChange={setFilterAccount}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Conta" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as contas</SelectItem>
            <SelectItem value="with">Com conta</SelectItem>
            <SelectItem value="without">Sem conta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">A carregar colaboradores...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum colaborador encontrado</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Adicionar primeiro colaborador
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ employee: emp }) => (
            <Card
              key={emp.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedId(emp.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={emp.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {emp.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{emp.fullName}</p>
                    <Badge className={`text-xs mt-1 ${POSITION_COLORS[emp.position as Position]}`}>
                      {POSITION_LABELS[emp.position as Position]}
                      {emp.position === "extra" && emp.extraLevel ? ` N${emp.extraLevel}` : ""}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {emp.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {emp.email}
                    </p>
                  )}
                  {emp.department && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {emp.department}
                    </p>
                  )}
                  {emp.monthlySalary && (
                    <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                      <Euro className="w-3 h-3" /> {parseFloat(String(emp.monthlySalary)).toFixed(2)}€/mês
                    </p>
                  )}
                  {emp.userId ? (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Conta ativa
                    </p>
                  ) : (
                    <p className="text-xs text-orange-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Sem conta
                    </p>
                  )}
                  {/* Doc status badge */}
                  {(() => {
                    const status = (docStatus as Record<number, { total: number; present: number; missing: string[] }>)[emp.id];
                    const missing = status ? status.total - status.present : 7;
                    if (missing === 0) return (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Docs completos
                      </p>
                    );
                    return (
                      <p className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {missing} doc{missing > 1 ? "s" : ""} em falta
                      </p>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEmployeeDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <ExtraRatesDialog open={showRates} onClose={() => setShowRates(false)} />
    </div>
  );
}
