import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  DollarSign,
  Activity,
  CreditCard,
  AlertCircle,
  Edit,
  User,
  Camera,
  Upload,
  Download,
  Trash2,
  Clock,
  History,
  Building2,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { MaskedInput } from "@/components/ui/masked-input";
import { validateCPF, validateEmail, validatePhone, validateDate, validateDateNotFuture } from "@/lib/masks";
import { StandardPagination } from "@/components/ui/standard-pagination";
import { patientService, Patient } from "@/lib/patientService";
import { SearchBar } from "@/components/SearchBar";
import { tissService } from "@/lib/tissService";

const Pacientes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [convenios, setConvenios] = useState<any[]>([]);

  // Aplicar filtro da URL ao carregar a página
  useEffect(() => {
    const typeFilter = searchParams.get('filter');
    if (typeFilter) {
      setFilterType(typeFilter);
    }
    
    // Aplicar busca da URL
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }

    // Carregar convênios
    const allConvenios = tissService.getAllConvenios();
    setConvenios(allConvenios.filter(c => c.ativo !== false));
  }, [searchParams]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [patientDocuments, setPatientDocuments] = useState<Array<{
    id: string;
    name: string;
    date: string;
    type: string;
    size: number;
  }>>([]);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    address: "",
    healthInsurance: "Particular",
    allergies: "",
    chronicDiseases: "",
    // Dados do Convênio TISS
    convenioId: "",
    convenioNome: "",
    carteirinha: "",
    validadeCarteirinha: "",
    plano: "",
    carencia: "",
    titular: "",
  });

  // Funções para upload de documentos
  const handleDocumentSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs = Array.from(files).map(file => {
      const fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > 50) {
        toast.error(`O arquivo ${file.name} excede o limite de 50MB`);
        return null;
      }

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        date: new Date().toLocaleDateString('pt-BR'),
        type: fileType,
        size: file.size
      };
    }).filter(doc => doc !== null) as Array<{
      id: string;
      name: string;
      date: string;
      type: string;
      size: number;
    }>;

    setPatientDocuments(prev => [...prev, ...newDocs]);
    toast.success(`${newDocs.length} documento(s) adicionado(s) com sucesso!`);
  };

  const handleDocumentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDocumentSelect(e.target.files);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleDragOverDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(true);
  };

  const handleDragLeaveDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
  };

  const handleDropDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    handleDocumentSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Função para capitalizar nome (primeira letra de cada palavra em maiúscula)
  const capitalizeName = (name: string): string => {
    if (!name || name.trim() === '') return '';
    return name
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ')
      .trim();
  };

  // Função para iniciar câmera (apenas abre o diálogo, a inicialização é feita no useEffect)
  const startCamera = () => {
    setCameraOpen(true);
  };

  // Função para parar câmera
  const stopCamera = () => {
    console.log("Parando câmera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Track parado:", track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
    setCameraLoading(false);
  };

  // Função para capturar foto da câmera
  const capturePhoto = () => {
    if (!videoRef.current) {
      toast.error("Vídeo não está disponível. Aguarde a câmera inicializar.");
      return;
    }

    const video = videoRef.current;
    
    // Verificar se o vídeo está pronto e tem dimensões válidas
    if (!video.videoWidth || !video.videoHeight) {
      toast.error("Aguarde a câmera inicializar completamente antes de capturar.");
      return;
    }

    // Verificar se o vídeo está reproduzindo
    if (video.readyState < 2) {
      toast.error("Aguarde a câmera carregar completamente.");
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Erro ao criar contexto do canvas.");
        return;
      }

      // Espelhar a imagem horizontalmente (já que o vídeo está espelhado)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Converter para base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      if (!dataUrl || dataUrl === 'data:,') {
        toast.error("Erro ao capturar a foto. Tente novamente.");
        return;
      }

      setPatientPhoto(dataUrl);
      stopCamera();
      toast.success("Foto capturada com sucesso!");
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      toast.error("Erro ao capturar a foto. Tente novamente.");
    }
  };

  // Iniciar câmera quando o diálogo abrir
  useEffect(() => {
    let isMounted = true;
    
    if (cameraOpen) {
      console.log("Iniciando câmera...");
      const initCamera = async () => {
        setCameraLoading(true);
        // Aguardar um pouco para garantir que o diálogo e o vídeo estejam renderizados
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted || !cameraOpen) {
          console.log("Câmera cancelada antes de iniciar");
          return;
        }
        
        try {
          console.log("Solicitando acesso à câmera...");
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          
          if (!isMounted || !cameraOpen) {
            console.log("Câmera cancelada após obter stream");
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          streamRef.current = stream;
          console.log("Stream obtido:", stream.id);
          
          // Aguardar um pouco para o vídeo estar disponível
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (videoRef.current && isMounted && cameraOpen) {
            videoRef.current.srcObject = stream;
            console.log("Stream atribuído ao vídeo");
            
            // Aguardar o vídeo estar pronto e ter dimensões válidas
            const checkVideoReady = () => {
              if (!isMounted || !cameraOpen) {
                return;
              }
              
              if (videoRef.current && 
                  videoRef.current.readyState >= 2 && 
                  videoRef.current.videoWidth > 0 && 
                  videoRef.current.videoHeight > 0) {
                setCameraLoading(false);
                console.log("Câmera pronta:", {
                  width: videoRef.current.videoWidth,
                  height: videoRef.current.videoHeight,
                  readyState: videoRef.current.readyState
                });
              } else {
                // Tentar novamente após um pequeno delay
                setTimeout(checkVideoReady, 100);
              }
            };
            
            videoRef.current.onloadedmetadata = () => {
              console.log("Metadata carregado");
              if (videoRef.current && isMounted && cameraOpen) {
                videoRef.current.play().then(() => {
                  console.log("Vídeo reproduzindo");
                  checkVideoReady();
                }).catch(err => {
                  console.error("Erro ao reproduzir vídeo:", err);
                  if (isMounted) {
                    setCameraLoading(false);
                  }
                });
              }
            };
            
            // Fallback: tentar reproduzir após um delay maior
            setTimeout(() => {
              if (videoRef.current && isMounted && cameraOpen) {
                if (videoRef.current.paused) {
                  videoRef.current.play().then(() => {
                    console.log("Vídeo reproduzindo (fallback)");
                    checkVideoReady();
                  }).catch(err => {
                    console.error("Erro ao reproduzir vídeo (fallback):", err);
                    if (isMounted) {
                      setCameraLoading(false);
                    }
                  });
                } else {
                  checkVideoReady();
                }
              }
            }, 1000);
          }
        } catch (error) {
          if (!isMounted) return;
          
          setCameraLoading(false);
          const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
          console.error("Erro ao acessar câmera:", error);
          
          if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
            toast.error("Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.");
          } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("DevicesNotFoundError")) {
            toast.error("Nenhuma câmera encontrada. Verifique se há uma câmera conectada.");
          } else {
            toast.error("Não foi possível acessar a câmera. Verifique as permissões.");
          }
          
          if (isMounted) {
            setCameraOpen(false);
          }
        }
      };
      
      initCamera();
    }
    
    return () => {
      isMounted = false;
      // Só parar a câmera se o diálogo realmente fechou
      if (!cameraOpen) {
        console.log("Cleanup: parando câmera");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraLoading(false);
      }
    };
  }, [cameraOpen]);

  // Limpar câmera ao desmontar componente
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Carregar pacientes do serviço
  const [patients, setPatients] = useState<Patient[]>(patientService.getAllPatients());

  // Atualizar pacientes quando houver mudanças
  useEffect(() => {
    const unsubscribe = patientService.onPatientsChange(() => {
      setPatients(patientService.getAllPatients());
    });
    return unsubscribe;
  }, []);

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) {
      const matchesFilter = filterType === "todos" || 
                           (filterType === "particular" && patient.healthInsurance === "Particular") ||
                           (filterType === "convenio" && patient.healthInsurance !== "Particular");
      return matchesFilter;
    }
    
    const searchLower = searchTerm.toLowerCase();
    // Verificar se é CPF (contém apenas números ou formato de CPF)
    const isCPF = /^[\d.\- ]+$/.test(searchTerm);
    
    let matchesSearch = false;
    if (isCPF) {
      // Buscar por CPF (comparar com e sem formatação)
      const searchCPF = searchTerm.replace(/\D/g, '');
      const patientCPF = patient.cpf ? patient.cpf.replace(/\D/g, '') : '';
      matchesSearch = patientCPF.includes(searchCPF);
    } else {
      // Buscar por nome ou email
      matchesSearch = patient.name.toLowerCase().includes(searchLower) ||
                     (patient.email && patient.email.toLowerCase().includes(searchLower));
    }
    
    const matchesFilter = filterType === "todos" || 
                         (filterType === "particular" && patient.healthInsurance === "Particular") ||
                         (filterType === "convenio" && patient.healthInsurance !== "Particular");
    return matchesSearch && matchesFilter;
  });

  // Paginação
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetar paginação quando o termo de busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  return (
    <TooltipProvider>
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <Users className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Gerenciamento completo de pacientes
            </p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto" onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Pacientes
              <Users className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1.284</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success font-medium">+8%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Pacientes Ativos
              <Activity className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">892</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success font-medium">+12%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Novos (Mês)
              <Calendar className="h-4 w-4 text-info" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success font-medium">+18%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Débitos Pendentes
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ 3.240</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-destructive font-medium">8</span> pacientes com débito
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <SearchBar
                placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                onChange={setSearchTerm}
                className="w-full"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="convenio">Convênio</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="scrollbar-hide-x">
          <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Paciente</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Plano</TableHead>
                <TableHead className="text-center font-semibold">Consultas</TableHead>
                <TableHead className="text-center font-semibold">Última Consulta</TableHead>
                <TableHead className="text-center font-semibold">Saldo</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/30 cursor-pointer border-b" onClick={() => setSelectedPatient(patient)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.photo} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.cpf}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {patient.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.healthInsurance === "Particular" ? "outline" : "default"}>
                      {patient.healthInsurance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">{patient.consultations}</span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {patient.lastConsultation}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${patient.balance < 0 ? 'text-destructive' : patient.balance > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                      R$ {Math.abs(patient.balance).toFixed(2)}
                      {patient.balance < 0 && " (débito)"}
                      {patient.balance > 0 && " (crédito)"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                        }}
                      >
                        <span className="hidden sm:inline">Ver Detalhes</span>
                        <span className="sm:hidden">Detalhes</span>
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-9 w-9 min-h-[44px] min-w-[44px] bg-info/10 text-info hover:bg-info/20 hover:text-info"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Abrir diretamente a tela de edição
                              setEditMode(true);
                              setSelectedPatient(patient);
                              // Converter data de nascimento de DD/MM/YYYY para YYYY-MM-DD
                              const birthDateFormatted = patient.birthDate 
                                ? patient.birthDate.split('/').reverse().join('-')
                                : "";
                              setFormData({
                                name: patient.name || "",
                                email: patient.email || "",
                                phone: patient.phone || "",
                                cpf: patient.cpf || "",
                                birthDate: birthDateFormatted,
                                address: patient.address || "",
                                healthInsurance: patient.healthInsurance || "Particular",
                                allergies: patient.allergies || "",
                                chronicDiseases: patient.chronicDiseases || "",
                              });
                              setPatientPhoto(patient.photo || null);
                              setOpenDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar paciente</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
          <StandardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPatients.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="paciente(s)"
          />
        </div>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => {
        if (!open) {
          setSelectedPatient(null);
          setPatientDocuments([]);
          setEditMode(false);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={selectedPatient?.photo} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {selectedPatient?.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-2xl font-bold text-foreground">{selectedPatient?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedPatient?.healthInsurance === "Particular" ? "outline" : "default"} className="text-xs">
                    {selectedPatient?.healthInsurance}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{selectedPatient?.cpf}</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            <Tabs defaultValue="dados" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="dados" className="space-y-4">
                {/* Foto e Informações Básicas */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                          <AvatarImage src={selectedPatient?.photo} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {selectedPatient?.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge variant={selectedPatient?.healthInsurance === "Particular" ? "outline" : "default"} className="text-xs">
                          {selectedPatient?.healthInsurance}
                        </Badge>
                      </div>
                      <div className="flex-1 grid gap-4 md:grid-cols-2">
                        <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold">Nome Completo</Label>
                          <p className="font-semibold text-sm">{selectedPatient?.name}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold">CPF</Label>
                          <p className="font-medium text-sm">{selectedPatient?.cpf}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold">Data de Nascimento</Label>
                          <p className="font-medium text-sm">{selectedPatient?.birthDate}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold">Idade</Label>
                          <p className="font-medium text-sm">{selectedPatient?.age}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </Label>
                          <p className="font-medium text-sm break-all">{selectedPatient?.email}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Telefone
                          </Label>
                          <p className="font-medium text-sm">{selectedPatient?.phone}</p>
                        </div>
                        <div className="md:col-span-2 space-y-1 p-3 rounded-lg bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Endereço
                          </Label>
                          <p className="font-medium text-sm">{selectedPatient?.address || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-5 w-5 text-success" />
                      Informações Médicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 p-4 rounded-lg bg-muted/30 border">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold">Alergias</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient?.allergies && selectedPatient.allergies !== "Nenhuma" ? (
                            <Badge variant="destructive" className="text-xs">
                              {selectedPatient.allergies}
                            </Badge>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma alergia registrada</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-muted/30 border">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold">Doenças Crônicas</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient?.chronicDiseases && selectedPatient.chronicDiseases !== "Nenhuma" ? (
                            <Badge variant="outline" className="text-xs">
                              {selectedPatient.chronicDiseases}
                            </Badge>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma doença crônica registrada</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historico" className="space-y-4">
                {/* Resumo de Consultas */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Resumo de Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total de Consultas</p>
                            <p className="text-2xl font-bold text-primary mt-1">{selectedPatient?.consultations || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                            <Clock className="h-6 w-6 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Última Consulta</p>
                            <p className="text-sm font-semibold mt-1">{selectedPatient?.lastConsultation || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Procedimentos Realizados */}
                <Card className="border-l-4 border-l-success">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-5 w-5 text-success" />
                      Procedimentos Realizados
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Lista de todos os procedimentos realizados pelo paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient?.procedures && selectedPatient.procedures.length > 0 ? (
                        selectedPatient.procedures.map((proc: string, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start p-4 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 flex-shrink-0">
                              <Activity className="h-5 w-5 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{proc}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Realizado em {selectedPatient?.lastConsultation}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">Concluído</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Activity className="h-16 w-16 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Nenhum procedimento registrado</p>
                          <p className="text-xs mt-1">Os procedimentos aparecerão aqui quando forem registrados</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline de Atendimentos */}
                <Card className="border-l-4 border-l-info">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-5 w-5 text-info" />
                      Timeline de Atendimentos
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Histórico cronológico de atendimentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPatient?.consultations > 0 ? (
                        <>
                          {[1, 2, 3].slice(0, Math.min(selectedPatient.consultations, 5)).map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                                  <Calendar className="h-5 w-5 text-info" />
                                </div>
                                {idx < Math.min(selectedPatient.consultations, 5) - 1 && (
                                  <div className="w-px h-full bg-border mt-2 min-h-[40px]"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-sm">Consulta #{selectedPatient.consultations - idx}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {selectedPatient?.lastConsultation} • {selectedPatient?.healthInsurance}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">Concluída</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                          {selectedPatient.consultations > 5 && (
                            <div className="text-center pt-2">
                              <p className="text-xs text-muted-foreground">
                                +{selectedPatient.consultations - 5} consulta(s) anterior(es)
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <History className="h-16 w-16 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Nenhum atendimento registrado</p>
                          <p className="text-xs mt-1">O histórico aparecerá aqui quando houver consultas</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financeiro" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Total de Consultas
                        <FileText className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-1">{selectedPatient?.consultations || 0}</div>
                      <p className="text-xs text-muted-foreground">Consultas realizadas</p>
                    </CardContent>
                  </Card>

                  <Card className={`border-l-4 ${selectedPatient?.balance < 0 ? 'border-l-destructive' : selectedPatient?.balance > 0 ? 'border-l-success' : 'border-l-muted'}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Saldo Financeiro
                        <DollarSign className={`h-4 w-4 ${selectedPatient?.balance < 0 ? 'text-destructive' : selectedPatient?.balance > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold mb-1 ${selectedPatient?.balance < 0 ? 'text-destructive' : selectedPatient?.balance > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        {selectedPatient?.balance < 0 ? '-' : selectedPatient?.balance > 0 ? '+' : ''}R$ {Math.abs(selectedPatient?.balance || 0).toFixed(2)}
                      </div>
                      <p className={`text-xs font-medium ${selectedPatient?.balance < 0 ? 'text-destructive' : selectedPatient?.balance > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        {selectedPatient?.balance < 0 ? 'Débito pendente' : selectedPatient?.balance > 0 ? 'Crédito disponível' : 'Sem pendências financeiras'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-info">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Documentos
                        <FileText className="h-4 w-4 text-info" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-info mb-1">{selectedPatient?.documents || 0}</div>
                      <p className="text-xs text-muted-foreground">Documentos anexados</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Histórico Financeiro */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Histórico Financeiro
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Movimentações financeiras do paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient?.balance !== 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                selectedPatient?.balance < 0 ? 'bg-destructive/10' : 'bg-success/10'
                              }`}>
                                <DollarSign className={`h-6 w-6 ${selectedPatient?.balance < 0 ? 'text-destructive' : 'text-success'}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {selectedPatient?.balance < 0 ? 'Débito Pendente' : 'Crédito Disponível'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {selectedPatient?.balance < 0 ? 'Valor a receber do paciente' : 'Valor disponível para o paciente'}
                                </p>
                              </div>
                            </div>
                            <div className={`text-xl font-bold ${selectedPatient?.balance < 0 ? 'text-destructive' : 'text-success'}`}>
                              R$ {Math.abs(selectedPatient?.balance || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <DollarSign className="h-16 w-16 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Nenhuma movimentação financeira registrada</p>
                          <p className="text-xs mt-1">O histórico financeiro aparecerá aqui quando houver movimentações</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-info" />
                      Documentos Anexados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Área de Upload */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDraggingDoc 
                          ? 'border-primary bg-primary/5 cursor-pointer' 
                          : 'border-muted hover:border-primary/50 cursor-pointer'
                      }`}
                      onDragOver={handleDragOverDoc}
                      onDragLeave={handleDragLeaveDoc}
                      onDrop={handleDropDoc}
                      onClick={() => documentInputRef.current?.click()}
                    >
                      <input
                        ref={documentInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleDocumentInputChange}
                        className="hidden"
                      />
                      <Upload className={`h-10 w-10 mx-auto mb-2 ${isDraggingDoc ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium mb-1">
                        {isDraggingDoc ? 'Solte os arquivos aqui' : 'Arraste documentos ou clique para fazer upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, PNG, JPG, DOC até 50MB
                      </p>
                    </div>

                    {/* Lista de Documentos */}
                    {patientDocuments.length > 0 || selectedPatient?.documents > 0 ? (
                      <div className="space-y-2">
                        {patientDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-info" />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.date} • {doc.type} • {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => toast.info("Visualizando documento")}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Baixar documento</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => {
                                      setPatientDocuments(prev => prev.filter(d => d.id !== doc.id));
                                      toast.success("Documento removido");
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remover documento</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                        {/* Documentos mockados do paciente */}
                        {selectedPatient?.documents > 0 && patientDocuments.length === 0 && (
                          <>
                            {[1, 2, 3].slice(0, selectedPatient.documents).map((doc) => (
                              <div key={doc} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-info" />
                                  <div>
                                    <p className="font-medium text-sm">Documento {doc}.pdf</p>
                                    <p className="text-xs text-muted-foreground">Adicionado em 15/01/2024</p>
                                  </div>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => toast.info("Visualizando documento")}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Baixar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Baixar documento</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum documento anexado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Patient Dialog */}
      <Dialog open={openDialog || editMode} onOpenChange={(open) => {
        if (!open) {
          setOpenDialog(false);
          setEditMode(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            cpf: "",
            birthDate: "",
            address: "",
            healthInsurance: "Particular",
            allergies: "",
            chronicDiseases: "",
          });
          setPatientPhoto(null);
          setPhotoFile(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="pb-4 border-b px-6 pt-6">
            <DialogTitle>{editMode ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Edite as informações do paciente" : "Cadastre um novo paciente no sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6 py-4 px-6">
            {/* Foto do Paciente */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={patientPhoto || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {formData.name ? formData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : "PA"}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("A imagem deve ter no máximo 5MB");
                        return;
                      }
                      setPhotoFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPatientPhoto(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {patientPhoto ? "Alterar Foto" : "Upload Foto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Foto
                </Button>
                {patientPhoto && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPatientPhoto(null);
                      setPhotoFile(null);
                      if (photoInputRef.current) {
                        photoInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados Pessoais e Contato
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Digite o nome completo"
                    value={formData.name}
                    onChange={(e) => {
                      // Permitir digitação livre, capitalizar apenas ao perder o foco
                      setFormData({ ...formData, name: e.target.value });
                    }}
                    onBlur={(e) => {
                      const capitalizedName = capitalizeName(e.target.value);
                      setFormData({ ...formData, name: capitalizedName });
                    }}
                    maxLength={100}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <MaskedInput
                    id="cpf"
                    mask="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(value) => setFormData({ ...formData, cpf: value })}
                    maxLength={14}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <MaskedInput
                    id="phone"
                    mask="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    maxLength={15}
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro, cidade/UF"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Plano de Saúde */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Plano de Saúde
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="healthInsurance">Plano de Saúde</Label>
                <Select
                  value={formData.healthInsurance}
                  onValueChange={(value) => setFormData({ ...formData, healthInsurance: value })}
                >
                  <SelectTrigger id="healthInsurance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Particular">Particular</SelectItem>
                    <SelectItem value="Unimed">Unimed</SelectItem>
                    <SelectItem value="Bradesco Saúde">Bradesco Saúde</SelectItem>
                    <SelectItem value="Amil">Amil</SelectItem>
                    <SelectItem value="SulAmérica">SulAmérica</SelectItem>
                    <SelectItem value="NotreDame Intermédica">NotreDame Intermédica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dados do Convênio TISS */}
            {formData.healthInsurance !== "Particular" && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Dados do Convênio TISS
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Convênio/Operadora *</Label>
                    <Select
                      value={formData.convenioId}
                      onValueChange={(value) => {
                        const convenio = convenios.find(c => c.id.toString() === value);
                        setFormData({
                          ...formData,
                          convenioId: value,
                          convenioNome: convenio?.nome || ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o convênio" />
                      </SelectTrigger>
                      <SelectContent>
                        {convenios.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Nenhum convênio cadastrado. Cadastre em Convênios → Configurações
                          </div>
                        ) : (
                          convenios.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nome} {c.codigoANS && `(${c.codigoANS})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número da Carteirinha *</Label>
                    <Input
                      placeholder="000000000000"
                      value={formData.carteirinha}
                      onChange={(e) => setFormData({ ...formData, carteirinha: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validade da Carteirinha *</Label>
                    <Input
                      type="date"
                      value={formData.validadeCarteirinha}
                      onChange={(e) => setFormData({ ...formData, validadeCarteirinha: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plano</Label>
                    <Input
                      placeholder="Ex: Plano Básico, Plano Premium..."
                      value={formData.plano}
                      onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Carência (opcional)</Label>
                    <Input
                      placeholder="Ex: 180 dias para cirurgias"
                      value={formData.carencia}
                      onChange={(e) => setFormData({ ...formData, carencia: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titular (se for dependente)</Label>
                    <Input
                      placeholder="CPF do titular"
                      value={formData.titular}
                      onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Informações Médicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                Informações Médicas
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Input
                    id="allergies"
                    placeholder="Ex: Penicilina, Dipirona..."
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="chronicDiseases">Doenças Crônicas</Label>
                  <Input
                    id="chronicDiseases"
                    placeholder="Ex: Hipertensão, Diabetes..."
                    value={formData.chronicDiseases}
                    onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  setEditMode(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    cpf: "",
                    birthDate: "",
                    address: "",
                    healthInsurance: "Particular",
                    allergies: "",
                    chronicDiseases: "",
                  });
                  setPatientPhoto(null);
                  setPhotoFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  // Validações
                  if (!formData.name || !formData.name.trim()) {
                    toast.error("Nome completo é obrigatório");
                    return;
                  }
                  if (!formData.email || !formData.email.trim()) {
                    toast.error("Email é obrigatório");
                    return;
                  }
                  if (!validateEmail(formData.email)) {
                    toast.error("Email inválido");
                    return;
                  }
                  if (!formData.phone || !formData.phone.trim()) {
                    toast.error("Telefone é obrigatório");
                    return;
                  }
                  if (!validatePhone(formData.phone)) {
                    toast.error("Telefone inválido. Use o formato (00) 00000-0000");
                    return;
                  }
                  if (!formData.cpf || !formData.cpf.trim()) {
                    toast.error("CPF é obrigatório");
                    return;
                  }
                  if (!validateCPF(formData.cpf)) {
                    toast.error("CPF inválido");
                    return;
                  }
                  if (!formData.birthDate) {
                    toast.error("Data de nascimento é obrigatória");
                    return;
                  }
                  if (!validateDate(formData.birthDate)) {
                    toast.error("Data de nascimento inválida");
                    return;
                  }
                  if (!validateDateNotFuture(formData.birthDate)) {
                    toast.error("Data de nascimento não pode ser no futuro");
                    return;
                  }
                  
                  // Capitalizar nome antes de salvar
                  const capitalizedName = capitalizeName(formData.name.trim());
                  
                  // Converter data de nascimento para formato DD/MM/YYYY
                  let birthDateFormatted = "";
                  if (formData.birthDate) {
                    const date = new Date(formData.birthDate + 'T00:00:00');
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    birthDateFormatted = `${day}/${month}/${year}`;
                  }

                  const patientData: Omit<Patient, 'id'> = {
                    name: capitalizedName,
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    cpf: formData.cpf.trim(),
                    birthDate: birthDateFormatted,
                    address: formData.address.trim(),
                    photo: patientPhoto || "",
                    healthInsurance: formData.healthInsurance,
                    consultations: editMode ? (selectedPatient?.consultations || 0) : 0,
                    lastConsultation: editMode ? (selectedPatient?.lastConsultation || "") : "",
                    procedures: editMode ? (selectedPatient?.procedures || []) : [],
                    balance: editMode ? (selectedPatient?.balance || 0) : 0,
                    documents: editMode ? (selectedPatient?.documents || 0) : 0,
                    allergies: formData.allergies.trim(),
                    chronicDiseases: formData.chronicDiseases.trim(),
                    // Dados do Convênio TISS
                    convenioId: formData.convenioId ? parseInt(formData.convenioId) : undefined,
                    convenioNome: formData.convenioNome || undefined,
                    carteirinha: formData.carteirinha || undefined,
                    validadeCarteirinha: formData.validadeCarteirinha || undefined,
                    plano: formData.plano || undefined,
                    carencia: formData.carencia || undefined,
                    titular: formData.titular || undefined,
                  };

                  if (editMode && selectedPatient) {
                    patientService.updatePatient(selectedPatient.id, patientData);
                    toast.success("Paciente atualizado com sucesso!");
                    setEditMode(false);
                    setSelectedPatient(null);
                  } else {
                    patientService.createPatient(patientData);
                    toast.success("Paciente cadastrado com sucesso!");
                    setOpenDialog(false);
                  }
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    cpf: "",
                    birthDate: "",
                    address: "",
                    healthInsurance: "Particular",
                    allergies: "",
                    chronicDiseases: "",
                  });
                  setPatientPhoto(null);
                  setPhotoFile(null);
                }}
              >
                {editMode ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </div>
          </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Diálogo Câmera */}
      <Dialog 
        open={cameraOpen} 
        onOpenChange={(open) => {
          // Só fechar se o usuário explicitamente fechar (não quando abrir)
          if (!open) {
            stopCamera();
          }
        }}
        modal={true}
      >
        <DialogContent 
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => {
            // Prevenir fechamento ao clicar fora durante o carregamento
            if (cameraLoading) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevenir fechamento com ESC durante o carregamento
            if (cameraLoading) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Tirar Foto</DialogTitle>
            <DialogDescription>
              Posicione o paciente na frente da câmera e clique em "Capturar"
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Espelhar para parecer espelho
                onLoadedMetadata={() => {
                  console.log("Vídeo metadata carregado no elemento");
                }}
                onCanPlay={() => {
                  console.log("Vídeo pode reproduzir");
                }}
              />
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-gray-900/90">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p className="text-sm">Iniciando câmera...</p>
                    <p className="text-xs mt-1 opacity-75">Aguarde alguns segundos</p>
                  </div>
                </div>
              )}
              {!cameraLoading && !streamRef.current && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-gray-900/80">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Câmera não disponível</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={stopCamera}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={cameraLoading || !streamRef.current}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-4 w-4 mr-2" />
                {cameraLoading ? "Aguarde..." : "Capturar Foto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};

export default Pacientes;