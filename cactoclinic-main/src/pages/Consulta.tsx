import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill-custom.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Stethoscope, 
  Save, 
  Printer, 
  User, 
  Video, 
  Upload, 
  FileText, 
  CheckCircle,
  Search,
  Copy,
  LinkIcon,
  ExternalLink,
  Activity,
  Clock,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  FileSignature,
  ClipboardList,
  History,
  Pill,
  Download,
  X,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  PhoneOff,
  FileCheck,
  Building2,
  UserCheck,
  Calendar,
  MapPin,
  Radio,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import jsPDF from 'jspdf';
import { SearchBar } from "@/components/SearchBar";
import { PrescriptionBuilder } from "@/components/PrescriptionBuilder";
import { PrescriptionHistory } from "@/components/PrescriptionHistory";
import { Telemedicina } from "@/components/Telemedicina";
import { prescriptionService } from "@/lib/prescriptionService";
import { patientService } from "@/lib/patientService";
import { canViewModule } from "@/lib/permissionService";
import { tissService } from "@/lib/tissService";

// Função auxiliar para adicionar texto a campos de texto sem duplicação
const appendToText = (prevText: string, newText: string): string => {
  if (!newText || !newText.trim()) return prevText || '';
  
  // Normalizar texto: remover espaços extras e quebras de linha
  const normalizedText = newText.replace(/\s+/g, ' ').trim();
  
  if (!normalizedText) return prevText || '';
  
  const currentText = (prevText || '').trim();
  
  // Verificar se o novo texto já está no texto anterior (evitar duplicação)
  if (currentText && currentText.includes(normalizedText)) {
    return currentText;
  }
  
  // Adicionar novo texto ao final
  return currentText ? `${currentText} ${normalizedText}` : normalizedText;
};

// Função auxiliar para adicionar texto ao ReactQuill sem duplicação
const appendToQuill = (prevHtml: string, newText: string): string => {
  if (!newText || !newText.trim()) return prevHtml || '';
  
  // Normalizar texto: remover espaços extras e quebras de linha
  const normalizedText = newText.replace(/\s+/g, ' ').trim();
  
  if (!normalizedText) return prevHtml || '';
  
  // Se não há HTML anterior, criar novo parágrafo
  if (!prevHtml || prevHtml === '<p><br></p>' || prevHtml.trim() === '') {
    return `<p>${normalizedText}</p>`;
  }
  
  // Extrair texto do HTML anterior (remover tags temporariamente)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = prevHtml;
  const prevText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Verificar se o novo texto já está no HTML anterior (evitar duplicação)
  if (prevText.includes(normalizedText)) {
    return prevHtml;
  }
  
  // Tentar adicionar ao último parágrafo ao invés de criar um novo
  // Isso evita múltiplos parágrafos desnecessários
  const lastParagraphMatch = prevHtml.match(/<p[^>]*>([^<]*)<\/p>\s*$/);
  if (lastParagraphMatch) {
    const lastParagraphContent = lastParagraphMatch[1].trim();
    if (lastParagraphContent && lastParagraphContent !== '') {
      // Adicionar ao último parágrafo existente
      return prevHtml.replace(/<p[^>]*>([^<]*)<\/p>\s*$/, `<p>${lastParagraphContent} ${normalizedText}</p>`);
    } else {
      // Substituir último parágrafo vazio
      return prevHtml.replace(/<p[^>]*>([^<]*)<\/p>\s*$/, `<p>${normalizedText}</p>`);
    }
  }
  
  // Se não encontrou parágrafo, adicionar como novo parágrafo
  return prevHtml + `<p>${normalizedText}</p>`;
};

// Hook para transcrição de áudio
const useSpeechRecognition = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const transcriptRef = useRef<string>('');
  const allResultsRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);
  const lastProcessedIndexRef = useRef<number>(0); // Rastrear último índice processado para evitar duplicação
  const lastSentTextRef = useRef<string>(''); // Rastrear último texto enviado para evitar duplicação

  // Atualizar a referência do callback sempre que mudar
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    // Verificar se está em um iframe
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      console.warn('⚠️ Detectado que está rodando dentro de um iframe');
      console.warn('⚠️ A Web Speech API pode não funcionar dentro de iframes devido a políticas de segurança');
      toast.warning("A transcrição de áudio pode não funcionar dentro de iframes. Tente abrir a página diretamente.");
    }

    // Verificar se o navegador suporta Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Web Speech API não suportada neste navegador');
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }

    // Verificar se está em contexto seguro (HTTPS ou localhost)
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecureContext) {
      console.error('❌ Contexto não seguro - Web Speech API requer HTTPS ou localhost');
      toast.error("A transcrição de áudio requer HTTPS ou localhost.");
      return;
    }

    // Criar reconhecimento apenas uma vez
    if (!isInitializedRef.current) {
      console.log('Inicializando SpeechRecognition...');
      console.log('Contexto seguro:', isSecureContext);
      console.log('Em iframe:', isInIframe);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        console.log('✅ Reconhecimento INICIADO com sucesso');
        transcriptRef.current = '';
        allResultsRef.current = [];
        lastProcessedIndexRef.current = 0; // Resetar último índice processado
        lastSentTextRef.current = ''; // Resetar último texto enviado
        setIsListening(true);
        toast.success("Gravando... Fale agora.");
      };

      recognition.onresult = (event: any) => {
        // Verificar se há resultados
        if (!event.results || event.results.length === 0) {
          return;
        }
        
        // Armazenar todos os resultados
        allResultsRef.current = Array.from(event.results);
        
        let newFinalText = '';
        
        // Processar APENAS resultados NOVOS desde o último índice processado
        const startIndex = Math.max(event.resultIndex, lastProcessedIndexRef.current);
        
        for (let i = startIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result || !result[0]) {
            continue;
          }
          
          const text = result[0].transcript.trim();
          const isFinal = result.isFinal;
          
          // Processar apenas resultados finais novos
          if (isFinal && text) {
            newFinalText += (newFinalText ? ' ' : '') + text;
            lastProcessedIndexRef.current = i + 1;
          }
        }

        // Processar apenas texto final novo
        if (newFinalText) {
          // Normalizar espaços: remover múltiplos espaços e quebras de linha extras
          const normalizedText = newFinalText.replace(/\s+/g, ' ').trim();
          
          // Acumular texto
          transcriptRef.current += (transcriptRef.current ? ' ' : '') + normalizedText;
          
          // Normalizar texto acumulado também
          transcriptRef.current = transcriptRef.current.replace(/\s+/g, ' ').trim();
          
          // Extrair apenas o texto novo comparando com o último enviado
          let textToSend = '';
          if (!lastSentTextRef.current) {
            // Primeira vez: enviar todo o texto acumulado
            textToSend = transcriptRef.current;
          } else {
            // Verificar se o texto acumulado começa com o último enviado
            if (transcriptRef.current.startsWith(lastSentTextRef.current)) {
              // Extrair apenas a parte nova
              textToSend = transcriptRef.current.slice(lastSentTextRef.current.length).trim();
            } else {
              // Se não começa com o último enviado, pode ser que foi resetado
              // Enviar todo o texto acumulado
              textToSend = transcriptRef.current;
            }
          }
          
          // Chamar callback apenas se houver texto novo
          if (textToSend && onTranscriptRef.current) {
            try {
              // Enviar apenas o texto novo para evitar duplicação
              onTranscriptRef.current(textToSend);
              lastSentTextRef.current = transcriptRef.current;
            } catch (error) {
              console.error('❌ Erro ao chamar callback:', error);
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Erro no reconhecimento:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error("Permissão de microfone negada. Permita o acesso nas configurações do navegador.");
        } else if (event.error === 'no-speech') {
          console.warn('⚠️ Nenhuma fala detectada');
          // Não mostrar erro para no-speech, apenas log
        } else if (event.error === 'aborted') {
          console.log('⏹️ Reconhecimento abortado');
          // Não mostrar erro para aborted
        } else {
          toast.error(`Erro no reconhecimento: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // O onresult já processou todos os resultados finais
        // No onend, apenas garantir que não há texto pendente não processado
        // Mas NÃO chamar o callback novamente para evitar duplicação
        
        // Limpar referências
        allResultsRef.current = [];
        
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      isInitializedRef.current = true;
      console.log('✅ SpeechRecognition inicializado');
    }

    // Cleanup apenas quando o componente for desmontado
    return () => {
      // Não fazer nada no cleanup - deixar o reconhecimento vivo
      // O reconhecimento será abortado apenas quando o componente for desmontado completamente
      console.log('🧹 Componente desmontando - cleanup do useEffect');
    };
  }, []); // Array vazio = executa apenas uma vez na montagem

  const startListening = () => {
    console.log('🎤 Tentando iniciar gravação...');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition não disponível');
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }

    if (!recognitionRef.current) {
      console.error('❌ Reconhecimento não inicializado');
      toast.error("Reconhecimento não inicializado. Recarregue a página.");
      return;
    }

    // Verificar se já está escutando
    if (isListening) {
      console.warn('⚠️ Já está escutando');
      return;
    }

    // Feedback visual imediato
    setIsListening(true);
    toast.success("Iniciando gravação...");

    try {
      console.log('🔄 Resetando texto e iniciando...');
      transcriptRef.current = '';
      allResultsRef.current = [];
      lastProcessedIndexRef.current = 0;
      lastSentTextRef.current = '';
      
      // Tentar iniciar imediatamente
      recognitionRef.current.start();
      console.log('✅ Comando start() executado');
      
      // Toast será atualizado no onstart quando realmente iniciar
    } catch (error: any) {
      console.error('❌ Erro ao iniciar:', error);
      setIsListening(false);
      
      if (error.name === 'InvalidStateError' || error.message?.includes('already started')) {
        console.log('⚠️ Reconhecimento já iniciado, tentando reiniciar...');
        try {
          recognitionRef.current.stop();
          console.log('⏹️ Parado com sucesso, aguardando para reiniciar...');
        } catch (e) {
          console.warn('Aviso ao parar:', e);
        }
        
        // Reduzir delay para resposta mais rápida
        setTimeout(() => {
          try {
            console.log('🔄 Reiniciando reconhecimento...');
            transcriptRef.current = '';
            allResultsRef.current = [];
            lastProcessedIndexRef.current = 0;
            setIsListening(true);
            recognitionRef.current.start();
            console.log('✅ Reinício executado');
            toast.success("Gravando... Fale agora.");
          } catch (e: any) {
            console.error('❌ Erro ao reiniciar:', e);
            toast.error("Erro ao iniciar gravação. Tente novamente.");
            setIsListening(false);
          }
        }, 100); // Reduzido de 300ms para 100ms
      } else {
        toast.error("Erro ao iniciar gravação: " + (error.message || error.name || 'Erro desconhecido'));
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    console.log('⏹️ Tentando parar gravação...');
    
    if (!recognitionRef.current) {
      console.warn('⚠️ Reconhecimento não disponível para parar');
      setIsListening(false);
      return;
    }

    if (!isListening) {
      console.warn('⚠️ Já não está escutando');
      return;
    }

    try {
      console.log('🛑 Parando reconhecimento...');
      recognitionRef.current.stop();
      console.log('✅ Comando stop() executado');
      
      // O setIsListening será chamado no onend
      // Mas vamos garantir que seja atualizado também aqui
      setIsListening(false);
      
        // Não processar novamente aqui - o onend já processou
        // Apenas aguardar para garantir que onend terminou
        setTimeout(() => {
          console.log('✅ Gravação finalizada completamente');
          // Não chamar callback novamente aqui para evitar duplicação
        }, 100);
      
      toast.success("Gravação finalizada.");
    } catch (e: any) {
      console.error('❌ Erro ao parar:', e);
      setIsListening(false);
      toast.error("Erro ao parar gravação.");
    }
  };

  return { isListening, startListening, stopListening };
};

// Componente de botão de transcrição
const AudioTranscriptionButton = ({ 
  onTranscript, 
  className = "",
  disabled = false
}: { 
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}) => {
  const { isListening, startListening, stopListening } = useSpeechRecognition(onTranscript);

  const handleToggle = () => {
    if (disabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={className}
      disabled={disabled}
    >
      {isListening ? (
        <>
          <Radio className="h-4 w-4 mr-2 animate-pulse" />
          Gravando...
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          Transcrever Áudio
        </>
      )}
    </Button>
  );
};

const Consulta = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [consultationType, setConsultationType] = useState("presencial");
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [videoCallInline, setVideoCallInline] = useState(false);
  const [telemedicinaOpen, setTelemedicinaOpen] = useState(false);
  const [telemedicinaInline, setTelemedicinaInline] = useState(false);
  const [telemedicinaRoomId, setTelemedicinaRoomId] = useState<string>("");
  const [telemedicinaRoomLink, setTelemedicinaRoomLink] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingRoomName, setMeetingRoomName] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [jitsiError, setJitsiError] = useState(false);
  const [cid10Search, setCid10Search] = useState("");
  const [selectedCid10, setSelectedCid10] = useState("");
  
  // Estados para Assinatura Digital
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  
  // Estados para Sinais Vitais
  const [pressure, setPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  
  // Estados para Anexos
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    file: File;
    date: string;
    type: string;
    size: number;
  }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  
  // Estados para Prontuário
  const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
  const [selectedProntuario, setSelectedProntuario] = useState<any>(null);
  
  // Estados para campos de texto que precisam de transcrição
  const [exameFisicoEstadoGeral, setExameFisicoEstadoGeral] = useState("");
  const [condutaPlanoTerapeutico, setCondutaPlanoTerapeutico] = useState("");
  const [queixaPrincipal, setQueixaPrincipal] = useState("");
  const [historiaDoencaAtual, setHistoriaDoencaAtual] = useState("");
  const [historiaPatologicaPregressa, setHistoriaPatologicaPregressa] = useState("");
  const [historiaFamiliar, setHistoriaFamiliar] = useState("");
  const [medicacoesUso, setMedicacoesUso] = useState("");
  const [habitosVida, setHabitosVida] = useState("");
  
  // Estados para Atestado/Declaração
  const [atestadoMedico, setAtestadoMedico] = useState("");
  const [declaracaoComparecimento, setDeclaracaoComparecimento] = useState("");
  const [relatorioMedico, setRelatorioMedico] = useState("");
  const [solicitacoesEspeciais, setSolicitacoesEspeciais] = useState("");
  
  // Templates padrão (usados se não houver template customizado)
  const defaultPrescricaoTemplate = '';
  const defaultAtestadoTemplate = 'Atesto para os devidos fins que o(a) paciente {NOME_PACIENTE}, portador(a) do CPF {CPF_PACIENTE}, esteve sob meus cuidados médicos nesta data.';
  const defaultDeclaracaoTemplate = 'Declaro para os devidos fins que o(a) paciente {NOME_PACIENTE}, portador(a) do CPF {CPF_PACIENTE}, compareceu à consulta médica nesta data.';
  
  // Estados para Templates Editáveis
  const [prescricaoTemplate, setPrescricaoTemplate] = useState(() => {
    const saved = localStorage.getItem('prescricaoTemplate');
    return saved !== null ? saved : defaultPrescricaoTemplate;
  });
  const [atestadoTemplate, setAtestadoTemplate] = useState(() => {
    const saved = localStorage.getItem('atestadoTemplate');
    return saved !== null ? saved : defaultAtestadoTemplate;
  });
  const [declaracaoTemplate, setDeclaracaoTemplate] = useState(() => {
    const saved = localStorage.getItem('declaracaoTemplate');
    return saved !== null ? saved : defaultDeclaracaoTemplate;
  });
  
  // Estados para Dialogs de Edição de Templates
  const [editPrescricaoTemplateOpen, setEditPrescricaoTemplateOpen] = useState(false);
  const [editAtestadoTemplateOpen, setEditAtestadoTemplateOpen] = useState(false);
  const [editDeclaracaoTemplateOpen, setEditDeclaracaoTemplateOpen] = useState(false);
  
  // Função para salvar template de prescrição
  const savePrescricaoTemplate = () => {
    localStorage.setItem('prescricaoTemplate', prescricaoTemplate);
    setEditPrescricaoTemplateOpen(false);
    toast.success("Template de prescrição salvo com sucesso!");
  };
  
  // Função para salvar template de atestado
  const saveAtestadoTemplate = () => {
    localStorage.setItem('atestadoTemplate', atestadoTemplate);
    setEditAtestadoTemplateOpen(false);
    toast.success("Template de atestado salvo com sucesso!");
  };
  
  // Função para salvar template de declaração
  const saveDeclaracaoTemplate = () => {
    localStorage.setItem('declaracaoTemplate', declaracaoTemplate);
    setEditDeclaracaoTemplateOpen(false);
    toast.success("Template de declaração salvo com sucesso!");
  };

  const procedureTemplates = [
    { id: "1", name: "Consulta de Rotina", content: "Paciente comparece para consulta de rotina. Sem queixas significativas." },
    { id: "2", name: "Retorno Pós-Operatório", content: "Paciente em retorno pós-operatório. Evolução satisfatória." },
    { id: "3", name: "Avaliação Pré-Operatória", content: "Paciente em avaliação pré-operatória. Exames solicitados." },
    { id: "4", name: "Consulta de Emergência", content: "Paciente atendido em caráter de emergência." },
  ];

  // Carregar pacientes do serviço
  const [patients, setPatients] = useState<any[]>([]);
  
  useEffect(() => {
    const allPatients = patientService.getAllPatients();
    // Converter pacientes do serviço para o formato esperado
    const formattedPatients = allPatients.map(p => ({
      id: p.id,
      name: p.name,
      photo: p.photo || "",
      healthInsurance: p.healthInsurance || "Particular",
      age: p.birthDate ? `${new Date().getFullYear() - parseInt(p.birthDate.split('/')[2])} anos` : "N/A",
      cpf: p.cpf,
      phone: p.phone,
      email: p.email,
      allergies: p.allergies ? (Array.isArray(p.allergies) ? p.allergies : p.allergies.split(',').map((a: string) => a.trim())) : [],
      chronicDiseases: p.chronicDiseases ? (Array.isArray(p.chronicDiseases) ? p.chronicDiseases : p.chronicDiseases.split(',').map((d: string) => d.trim())) : [],
      // Dados do Convênio TISS
      convenioId: p.convenioId,
      convenioNome: p.convenioNome,
      carteirinha: p.carteirinha,
      validadeCarteirinha: p.validadeCarteirinha,
      plano: p.plano,
      carencia: p.carencia,
      titular: p.titular,
    }));
    setPatients(formattedPatients);
  }, []);

  // CID-10 Mock Database
  const cid10Database = [
    { code: "I10", description: "Hipertensão essencial (primária)" },
    { code: "E11", description: "Diabetes mellitus tipo 2" },
    { code: "J00", description: "Rinofaringite aguda (resfriado comum)" },
    { code: "J06.9", description: "Infecção aguda das vias aéreas superiores" },
    { code: "K21.0", description: "Doença do refluxo gastroesofágico com esofagite" },
    { code: "M54.5", description: "Dor lombar baixa" },
    { code: "R51", description: "Cefaleia" },
    { code: "R05", description: "Tosse" },
    { code: "R50.9", description: "Febre não especificada" },
    { code: "A09", description: "Diarreia e gastroenterite" },
    { code: "J02.9", description: "Faringite aguda não especificada" },
    { code: "N39.0", description: "Infecção do trato urinário" },
  ];

  // Mock consultation history
  const consultationHistory = [
    {
      id: 1,
      date: "15/01/2024",
      time: "14:30",
      type: "online",
      professional: "Dr. João Santos",
      diagnosis: "Hipertensão essencial (I10)",
      status: "completed",
      prontuario: {
        queixaPrincipal: "Dor de cabeça frequente há 2 semanas",
        historiaDoencaAtual: "Paciente relata cefaleia diária, principalmente ao acordar, com intensidade moderada",
        exameFisico: "PA: 150/95 mmHg, FC: 78 bpm, Temp: 36.8°C",
        diagnostico: "Hipertensão essencial (I10)",
        conduta: "Prescrição de Losartana 50mg 1x ao dia. Retorno em 30 dias para reavaliação.",
        medicamentos: "Losartana 50mg - 1 comprimido ao dia",
        exames: "Hemograma completo, Creatinina, TGO/TGP"
      }
    },
    {
      id: 2,
      date: "08/01/2024",
      time: "10:00",
      type: "presencial",
      professional: "Dra. Maria Costa",
      diagnosis: "Consulta de rotina",
      status: "completed",
      prontuario: {
        queixaPrincipal: "Consulta de rotina",
        historiaDoencaAtual: "Paciente assintomático, em acompanhamento regular",
        exameFisico: "PA: 120/80 mmHg, FC: 72 bpm, Temp: 36.5°C",
        diagnostico: "Consulta de rotina - sem alterações",
        conduta: "Manter acompanhamento regular. Próxima consulta em 3 meses.",
        medicamentos: "Nenhuma alteração na medicação atual",
        exames: "Nenhum exame solicitado"
      }
    },
    {
      id: 3,
      date: "20/12/2023",
      time: "16:00",
      type: "presencial",
      professional: "Dr. João Santos",
      diagnosis: "Diabetes mellitus tipo 2 (E11)",
      status: "completed",
      prontuario: {
        queixaPrincipal: "Aumento da sede e urina frequente",
        historiaDoencaAtual: "Sintomas iniciados há aproximadamente 1 mês, com piora progressiva",
        exameFisico: "PA: 130/85 mmHg, FC: 82 bpm, Temp: 36.7°C, Glicemia capilar: 280 mg/dL",
        diagnostico: "Diabetes mellitus tipo 2 (E11)",
        conduta: "Iniciar Metformina 500mg 2x ao dia. Orientação nutricional. Retorno em 15 dias.",
        medicamentos: "Metformina 500mg - 1 comprimido 2x ao dia",
        exames: "Hemoglobina glicada, Glicemia de jejum, Creatinina, Microalbuminúria"
      }
    },
  ];
  
  // Arquivos históricos mockados
  const historicalFiles = [
    { id: "1", name: "Hemograma Completo", date: "15/01/2024", type: "PDF", size: 245000 },
    { id: "2", name: "Raio-X Tórax", date: "10/01/2024", type: "DICOM", size: 1250000 },
    { id: "3", name: "Ultrassom Abdominal", date: "05/01/2024", type: "PDF", size: 890000 },
  ];

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const searchLower = searchQuery.toLowerCase();
    // Verificar se é CPF (contém apenas números ou formato de CPF)
    const isCPF = /^[\d.\- ]+$/.test(searchQuery);
    
    return patients.filter(patient => {
      if (isCPF) {
        // Buscar por CPF (comparar com e sem formatação)
        const searchCPF = searchQuery.replace(/\D/g, '');
        const patientCPF = patient.cpf ? patient.cpf.replace(/\D/g, '') : '';
        return patientCPF.includes(searchCPF);
      } else {
        // Buscar por nome
        return patient.name.toLowerCase().includes(searchLower);
      }
    });
  }, [searchQuery, patients]);

  // Filter CID-10 based on search
  const filteredCid10 = useMemo(() => {
    if (!cid10Search) return cid10Database.slice(0, 5);
    return cid10Database.filter(cid =>
      cid.code.toLowerCase().includes(cid10Search.toLowerCase()) ||
      cid.description.toLowerCase().includes(cid10Search.toLowerCase())
    );
  }, [cid10Search]);

  // Função para classificar IMC
  const getImcClassification = useCallback((imc: number): { text: string; color: string } => {
    if (imc < 18.5) {
      return { text: "Abaixo do peso", color: "text-blue-600" };
    } else if (imc < 25) {
      return { text: "Peso normal", color: "text-green-600" };
    } else if (imc < 30) {
      return { text: "Sobrepeso", color: "text-yellow-600" };
    } else if (imc < 35) {
      return { text: "Obesidade Grau I", color: "text-orange-600" };
    } else if (imc < 40) {
      return { text: "Obesidade Grau II", color: "text-red-600" };
    } else {
      return { text: "Obesidade Grau III", color: "text-red-700" };
    }
  }, []);

  // Calcular IMC automaticamente
  const imc = useMemo(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (!weightNum || !heightNum || heightNum <= 0) {
      return null;
    }
    
    // Converter altura de cm para metros
    const heightInMeters = heightNum / 100;
    const calculatedImc = weightNum / (heightInMeters * heightInMeters);
    
    return {
      value: calculatedImc.toFixed(1),
      classification: getImcClassification(calculatedImc)
    };
  }, [weight, height, getImcClassification]);

  const handleSave = () => {
    toast.success("Consulta salva com sucesso!");
  };

  // Função para remover tags HTML e limpar texto
  const stripHtml = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Função para imprimir Prescrição Médica (formato padrão brasileiro)
  const handlePrintPrescricao = () => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente antes de imprimir.");
      return;
    }

    if (!prescriptionNotes || !prescriptionNotes.trim()) {
      toast.error("A prescrição está vazia. Preencha antes de imprimir.");
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receita Médica - ${selectedPatient.name}</title>
  <style>
    @media print {
      @page {
        margin: 2cm 1.5cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .patient-info {
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .patient-info p {
      margin: 5px 0;
      font-size: 11pt;
    }
    .prescription-content {
      margin: 30px 0;
      min-height: 300px;
      line-height: 1.8;
      font-size: 11pt;
      white-space: pre-wrap;
    }
    .signature-section {
      margin-top: 60px;
      text-align: right;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 300px;
      margin: 50px auto 5px auto;
      padding-top: 5px;
    }
    .doctor-info {
      text-align: center;
      font-size: 10pt;
      margin-top: 10px;
    }
    .date-location {
      text-align: right;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .footer {
      margin-top: 40px;
      font-size: 9pt;
      text-align: center;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    .signature-image {
      max-width: 200px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Receita Médica</h1>
  </div>

  <div class="date-location">
    <p>${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${selectedPatient.name}</p>
    <p><strong>Idade:</strong> ${selectedPatient.age}</p>
    <p><strong>CPF:</strong> ${selectedPatient.cpf}</p>
  </div>

  <div class="prescription-content">
${stripHtml(prescriptionNotes)}
  </div>

  ${signature ? `
  <div class="signature-section">
    <img src="${signature}" alt="Assinatura" class="signature-image" />
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  ` : `
  <div class="signature-section">
    <div class="signature-line"></div>
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  `}

  <div class="footer">
    <p>Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      };
    } else {
      toast.error("Por favor, permita pop-ups para imprimir o documento.");
    }
  };

  // Função para imprimir Atestado Médico (formato padrão brasileiro)
  const handlePrintAtestado = () => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente antes de imprimir.");
      return;
    }

    if (!atestadoMedico || !atestadoMedico.trim()) {
      toast.error("O atestado está vazio. Preencha antes de imprimir.");
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Atestado Médico - ${selectedPatient.name}</title>
  <style>
    @media print {
      @page {
        margin: 2.5cm 2cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 20pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 3px;
      text-decoration: underline;
    }
    .content {
      text-align: justify;
      margin: 40px 0;
      line-height: 2;
      font-size: 12pt;
      text-indent: 40px;
      white-space: pre-wrap;
    }
    .patient-info {
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .patient-info p {
      margin: 8px 0;
      font-size: 11pt;
    }
    .signature-section {
      margin-top: 80px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 350px;
      margin: 60px auto 5px auto;
      padding-top: 5px;
    }
    .doctor-info {
      text-align: center;
      font-size: 11pt;
      margin-top: 10px;
    }
    .date-location {
      text-align: right;
      margin-bottom: 30px;
      font-size: 11pt;
    }
    .signature-image {
      max-width: 250px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Atestado Médico</h1>
  </div>

  <div class="date-location">
    <p>${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="content">
    <p>${(atestadoTemplate || defaultAtestadoTemplate).replace(/{NOME_PACIENTE}/g, '<strong>' + selectedPatient.name + '</strong>').replace(/{CPF_PACIENTE}/g, selectedPatient.cpf).replace(/{IDADE_PACIENTE}/g, selectedPatient.age)}</p>
    
    <p>${stripHtml(atestadoMedico)}</p>
  </div>

  ${signature ? `
  <div class="signature-section">
    <img src="${signature}" alt="Assinatura" class="signature-image" />
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  ` : `
  <div class="signature-section">
    <div class="signature-line"></div>
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  `}
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      };
    } else {
      toast.error("Por favor, permita pop-ups para imprimir o documento.");
    }
  };

  // Função para imprimir Declaração de Comparecimento (formato padrão brasileiro)
  const handlePrintDeclaracao = () => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente antes de imprimir.");
      return;
    }

    if (!declaracaoComparecimento || !declaracaoComparecimento.trim()) {
      toast.error("A declaração está vazia. Preencha antes de imprimir.");
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Declaração de Comparecimento - ${selectedPatient.name}</title>
  <style>
    @media print {
      @page {
        margin: 2.5cm 2cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      text-align: justify;
      margin: 40px 0;
      line-height: 2;
      font-size: 12pt;
      text-indent: 40px;
      white-space: pre-wrap;
    }
    .patient-info {
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .patient-info p {
      margin: 8px 0;
      font-size: 11pt;
    }
    .signature-section {
      margin-top: 80px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 350px;
      margin: 60px auto 5px auto;
      padding-top: 5px;
    }
    .doctor-info {
      text-align: center;
      font-size: 11pt;
      margin-top: 10px;
    }
    .date-location {
      text-align: right;
      margin-bottom: 30px;
      font-size: 11pt;
    }
    .signature-image {
      max-width: 250px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Declaração de Comparecimento</h1>
  </div>

  <div class="date-location">
    <p>${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="content">
    <p>${(declaracaoTemplate || defaultDeclaracaoTemplate).replace(/{NOME_PACIENTE}/g, '<strong>' + selectedPatient.name + '</strong>').replace(/{CPF_PACIENTE}/g, selectedPatient.cpf).replace(/{IDADE_PACIENTE}/g, selectedPatient.age)}</p>
    
    <p>${stripHtml(declaracaoComparecimento)}</p>
  </div>

  ${signature ? `
  <div class="signature-section">
    <img src="${signature}" alt="Assinatura" class="signature-image" />
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  ` : `
  <div class="signature-section">
    <div class="signature-line"></div>
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  `}
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      };
    } else {
      toast.error("Por favor, permita pop-ups para imprimir o documento.");
    }
  };

  // Função para imprimir Relatório Médico
  const handlePrintRelatorio = () => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente antes de imprimir.");
      return;
    }

    if (!relatorioMedico || !relatorioMedico.trim()) {
      toast.error("O relatório está vazio. Preencha antes de imprimir.");
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório Médico - ${selectedPatient.name}</title>
  <style>
    @media print {
      @page {
        margin: 2cm 1.5cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
    }
    .patient-info {
      margin-bottom: 25px;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 5px;
    }
    .patient-info p {
      margin: 5px 0;
      font-size: 10pt;
    }
    .report-content {
      margin: 30px 0;
      line-height: 1.8;
      font-size: 11pt;
      text-align: justify;
      white-space: pre-wrap;
    }
    .signature-section {
      margin-top: 60px;
      text-align: right;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 300px;
      margin: 50px 0 5px auto;
      padding-top: 5px;
    }
    .doctor-info {
      text-align: right;
      font-size: 10pt;
      margin-top: 10px;
    }
    .date-location {
      text-align: right;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .signature-image {
      max-width: 200px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório Médico</h1>
  </div>

  <div class="date-location">
    <p>${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${selectedPatient.name}</p>
    <p><strong>Idade:</strong> ${selectedPatient.age}</p>
    <p><strong>CPF:</strong> ${selectedPatient.cpf}</p>
  </div>

  <div class="report-content">
${stripHtml(relatorioMedico)}
  </div>

  ${signature ? `
  <div class="signature-section">
    <img src="${signature}" alt="Assinatura" class="signature-image" />
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  ` : `
  <div class="signature-section">
    <div class="signature-line"></div>
    <div class="doctor-info">
      <p><strong>Dr. João Santos</strong></p>
      <p>CRM: 123456 - SP</p>
    </div>
  </div>
  `}
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      };
    } else {
      toast.error("Por favor, permita pop-ups para imprimir o documento.");
    }
  };

  const handlePrint = () => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente antes de imprimir.");
      return;
    }

    // Criar conteúdo HTML para impressão
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Consulta Médica - ${selectedPatient.name}</title>
  <style>
    @media print {
      @page {
        margin: 1.5cm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #15803d;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #15803d;
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .patient-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 5px;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 12px;
    }
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #15803d;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e5e7eb;
      text-transform: uppercase;
    }
    .section-content {
      font-size: 12px;
      padding-left: 10px;
      margin-top: 5px;
      white-space: pre-wrap;
    }
    .vital-signs {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .vital-item {
      text-align: center;
      padding: 8px;
      background-color: #f9fafb;
      border-radius: 4px;
    }
    .vital-label {
      font-size: 10px;
      color: #666;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .vital-value {
      font-size: 14px;
      font-weight: bold;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
      background-color: #e5e7eb;
      color: #374151;
    }
    .badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .badge-outline {
      background-color: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    .signature-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .signature-image {
      max-width: 200px;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table td {
      padding: 5px;
      border: 1px solid #e5e7eb;
      font-size: 11px;
    }
    table th {
      padding: 8px 5px;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      font-weight: bold;
      font-size: 11px;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONSULTA MÉDICA</h1>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="info-label">Data da Consulta</div>
        <div class="info-value">${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div>
        <div class="info-label">Tipo de Consulta</div>
        <div class="info-value">
          <span class="badge">${consultationType === 'online' ? 'Online' : 'Presencial'}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="patient-info">
    <div>
      <div class="info-label">Paciente</div>
      <div class="info-value">${selectedPatient.name}</div>
    </div>
    <div>
      <div class="info-label">Idade / CPF</div>
      <div class="info-value">${selectedPatient.age} • ${selectedPatient.cpf}</div>
    </div>
    <div>
      <div class="info-label">Convênio</div>
      <div class="info-value">${selectedPatient.healthInsurance}</div>
    </div>
    <div>
      <div class="info-label">Contato</div>
      <div class="info-value">${selectedPatient.phone}</div>
    </div>
    <div>
      <div class="info-label">Alergias</div>
      <div class="info-value">
        ${selectedPatient.allergies.map((a: string) => `<span class="badge badge-danger">${a}</span>`).join(' ')}
      </div>
    </div>
    <div>
      <div class="info-label">Condições Crônicas</div>
      <div class="info-value">
        ${selectedPatient.chronicDiseases.map((d: string) => `<span class="badge badge-outline">${d}</span>`).join(' ')}
      </div>
    </div>
  </div>

  ${pressure || heartRate || temperature || weight || height ? `
  <div class="section">
    <div class="section-title">Sinais Vitais</div>
    <div class="vital-signs">
      ${pressure ? `
      <div class="vital-item">
        <div class="vital-label">PA</div>
        <div class="vital-value">${pressure}</div>
        <div style="font-size: 9px; color: #666;">mmHg</div>
      </div>
      ` : ''}
      ${heartRate ? `
      <div class="vital-item">
        <div class="vital-label">FC</div>
        <div class="vital-value">${heartRate}</div>
        <div style="font-size: 9px; color: #666;">bpm</div>
      </div>
      ` : ''}
      ${temperature ? `
      <div class="vital-item">
        <div class="vital-label">Temp</div>
        <div class="vital-value">${temperature}</div>
        <div style="font-size: 9px; color: #666;">°C</div>
      </div>
      ` : ''}
      ${weight ? `
      <div class="vital-item">
        <div class="vital-label">Peso</div>
        <div class="vital-value">${weight}</div>
        <div style="font-size: 9px; color: #666;">kg</div>
      </div>
      ` : ''}
      ${height ? `
      <div class="vital-item">
        <div class="vital-label">Altura</div>
        <div class="vital-value">${height}</div>
        <div style="font-size: 9px; color: #666;">cm</div>
      </div>
      ` : ''}
    </div>
    ${imc ? `
    <div style="margin-top: 15px; padding: 10px; background-color: #f0f9ff; border-left: 3px solid #15803d; border-radius: 4px;">
      <strong>IMC:</strong> ${imc.value} kg/m² - <strong>${imc.classification.text}</strong>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${exameFisicoEstadoGeral ? `
  <div class="section">
    <div class="section-title">Exame Físico</div>
    <div class="section-content">
      <strong>Estado Geral:</strong> ${exameFisicoEstadoGeral}
    </div>
  </div>
  ` : ''}

  ${selectedCid10 ? `
  <div class="section">
    <div class="section-title">Diagnóstico</div>
    <div class="section-content">
      <strong>CID-10:</strong> ${selectedCid10}
    </div>
  </div>
  ` : ''}

  ${condutaPlanoTerapeutico ? `
  <div class="section">
    <div class="section-title">Conduta / Plano Terapêutico</div>
    <div class="section-content">${condutaPlanoTerapeutico}</div>
  </div>
  ` : ''}

  ${queixaPrincipal || historiaDoencaAtual || historiaPatologicaPregressa || historiaFamiliar || medicacoesUso || habitosVida ? `
  <div class="section">
    <div class="section-title">Anamnese</div>
    ${queixaPrincipal ? `
    <div style="margin-bottom: 10px;">
      <strong>Queixa Principal (QP):</strong>
      <div class="section-content">${queixaPrincipal}</div>
    </div>
    ` : ''}
    ${historiaDoencaAtual ? `
    <div style="margin-bottom: 10px;">
      <strong>História da Doença Atual (HDA):</strong>
      <div class="section-content">${historiaDoencaAtual}</div>
    </div>
    ` : ''}
    ${historiaPatologicaPregressa ? `
    <div style="margin-bottom: 10px;">
      <strong>História Patológica Pregressa (HPP):</strong>
      <div class="section-content">${historiaPatologicaPregressa}</div>
    </div>
    ` : ''}
    ${historiaFamiliar ? `
    <div style="margin-bottom: 10px;">
      <strong>História Familiar (HF):</strong>
      <div class="section-content">${historiaFamiliar}</div>
    </div>
    ` : ''}
    ${medicacoesUso ? `
    <div style="margin-bottom: 10px;">
      <strong>Medicações em Uso:</strong>
      <div class="section-content">${medicacoesUso}</div>
    </div>
    ` : ''}
    ${habitosVida ? `
    <div style="margin-bottom: 10px;">
      <strong>Hábitos de Vida:</strong>
      <div class="section-content">${habitosVida}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${clinicalNotes ? `
  <div class="section">
    <div class="section-title">Evolução Clínica</div>
    <div class="section-content">${clinicalNotes.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}</div>
  </div>
  ` : ''}

  ${prescriptionNotes ? `
  <div class="section">
    <div class="section-title">Prescrição Médica</div>
    <div class="section-content">${prescriptionNotes.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}</div>
  </div>
  ` : ''}

  ${signature ? `
  <div class="signature-section">
    <div class="section-title">Assinatura Digital</div>
    <img src="${signature}" alt="Assinatura" class="signature-image" />
    <div style="margin-top: 15px;">
      <div><strong>Dr. João Santos</strong></div>
      <div>CRM: 123456 - SP</div>
      <div style="margin-top: 10px; font-size: 10px; color: #666;">
        Documento assinado digitalmente em ${new Date().toLocaleString('pt-BR')}
      </div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
    <p>CactoSaude - Sistema de Gestão Médica</p>
  </div>
</body>
</html>
    `;

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar o carregamento completo antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Fechar a janela após impressão (ou cancelamento)
          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 500);
      };
    } else {
      toast.error("Por favor, permita pop-ups para imprimir o documento.");
    }
  };

  // Função para obter coordenadas corretas do canvas
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Função para iniciar desenho na assinatura
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevenir scroll em dispositivos touch
    if ('touches' in e) {
      e.preventDefault();
    }

    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Função para desenhar na assinatura
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    // Prevenir scroll em dispositivos touch
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Função para parar de desenhar
  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // Função para limpar assinatura
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Função para verificar se há assinatura no canvas
  const hasSignature = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Verificar se há pixels não brancos (verificar RGB, ignorar alpha)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Se algum pixel não for branco (255, 255, 255), há assinatura
      if (r < 255 || g < 255 || b < 255) {
        return true;
      }
    }
    
    return false;
  };

  // Função para salvar assinatura
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasSignature()) {
      toast.error("Por favor, desenhe sua assinatura antes de confirmar.");
      return;
    }

    const dataURL = canvas.toDataURL('image/png');
    setSignature(dataURL);
    setIsSigned(true);
    setSignatureDialogOpen(false);
    toast.success("Documento assinado com sucesso!");
  };

  // Função para baixar documento
  const handleDownloadDocument = () => {
    if (!isSigned) {
      toast.error("Por favor, assine o documento antes de baixar.");
      return;
    }

    // Criar um documento HTML com o conteúdo da prescrição e assinatura
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Prescrição Médica</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .prescription-content {
              margin-bottom: 40px;
            }
            .signature-section {
              margin-top: 60px;
              border-top: 2px solid #ccc;
              padding-top: 20px;
            }
            .signature-image {
              max-width: 300px;
              margin: 20px 0;
            }
            .doctor-info {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Prescrição Médica</h1>
          <div class="prescription-content">
            ${prescriptionNotes || '<p>Nenhuma prescrição registrada.</p>'}
          </div>
          <div class="signature-section">
            <h3>Assinatura Digital</h3>
            ${signature ? `<img src="${signature}" alt="Assinatura" class="signature-image" />` : ''}
            <div class="doctor-info">
              <p><strong>Dr. João Santos</strong></p>
              <p>CRM: 123456 - SP</p>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescricao_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Documento baixado com sucesso!");
  };

  // Configurar canvas quando o dialog abrir
  useEffect(() => {
    if (signatureDialogOpen) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Configurar estilo do desenho
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [signatureDialogOpen]);

  // Funções para upload de arquivos
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => {
      const fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > 50) {
        toast.error(`O arquivo ${file.name} excede o limite de 50MB`);
        return null;
      }

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        file: file,
        date: new Date().toLocaleDateString('pt-BR'),
        type: fileType,
        size: file.size
      };
    }).filter(file => file !== null) as Array<{
      id: string;
      name: string;
      file: File;
      date: string;
      type: string;
      size: number;
    }>;

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} arquivo(s) adicionado(s) com sucesso!`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDownloadFile = (file: { id: string; name: string; file: File; date: string; type: string; size: number }) => {
    const url = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Download de ${file.name} iniciado`);
  };

  const handleDownloadHistoricalFile = (file: typeof historicalFiles[0]) => {
    // Criar um arquivo mockado para download
    const content = `Este é um arquivo mockado: ${file.name}\nData: ${file.date}\nTipo: ${file.type}`;
    const blob = new Blob([content], { type: file.type === 'PDF' ? 'application/pdf' : 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name}.${file.type.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Download de ${file.name} iniciado`);
  };

  const handleDeleteFileClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteFileDialogOpen(true);
  };

  const handleDeleteFileConfirm = () => {
    if (fileToDelete) {
      const fileName = uploadedFiles.find(f => f.id === fileToDelete)?.name || 'arquivo';
      setUploadedFiles(prev => prev.filter(f => f.id !== fileToDelete));
      setDeleteFileDialogOpen(false);
      setFileToDelete(null);
      toast.success(`Arquivo "${fileName}" removido com sucesso`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleViewProntuario = (consultation: any) => {
    setSelectedProntuario(consultation);
    setProntuarioDialogOpen(true);
  };

  // Jitsi Meet - Modo Público
  const jitsiDomain = 'https://meet.jit.si';
  
  // Nome da clínica do cabeçalho (mesmo usado no Header.tsx)
  // Este nome será exibido com espaçamento igual ao cabeçalho
  const clinicName = "Clínica Vida Saudável";
  
  // Função para gerar nome da sala a partir do nome da clínica (para URL)
  // Remove espaços e caracteres especiais para evitar erros 403
  const getRoomName = () => {
    // Remove acentos, espaços e caracteres especiais para URL
    return clinicName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9]/g, '') // Remove caracteres especiais e espaços
      .toLowerCase()
      .trim();
  };

  // Função para obter nome da clínica formatado (com espaços para exibição)
  const getClinicDisplayName = () => {
    // Mantém espaços para exibição, apenas remove acentos
    return clinicName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove caracteres especiais, mas mantém espaços
      .trim()
      .replace(/\s+/g, ' '); // Normaliza múltiplos espaços
  };

  const generateMeetingLink = () => {
    // Nome da sala sem espaços para URL (evita erro 403)
    const roomName = getRoomName();
    setMeetingRoomName(roomName); // Salvar nome sem espaços para uso na URL
    const link = `${jitsiDomain}/${roomName}`;
    setMeetingLink(link);
    return link;
  };


  // Função para gerar URL do Jitsi público
  const getJitsiUrl = (roomName: string) => {
    // URL mínima sem parâmetros para evitar erro 403
    // O Jitsi público pode rejeitar URLs com muitos parâmetros
    // Usar apenas o nome da sala sem parâmetros adicionais
    const url = `${jitsiDomain}/${roomName}`;
    
    return url;
  };

  const startVideoCall = (inline: boolean = false) => {
    if (!selectedPatient) {
      toast.error("Selecione um paciente antes de iniciar a videochamada.");
      return;
    }
    
    // Gerar link da reunião Jitsi
    generateMeetingLink();
    
    // Pequeno delay para garantir que tudo foi configurado
    setTimeout(() => {
      if (inline) {
        setVideoCallInline(true);
      } else {
        setVideoCallOpen(true);
      }
      
      setCallStartTime(new Date());
      toast.success("Videochamada Jitsi iniciada!");
    }, 100);
  };

  const stopVideoCall = useCallback(() => {
    // Limpar estados imediatamente para remover o iframe e evitar tela de loading
    // Fecha tanto o modal quanto o inline
    setMeetingRoomName("");
    setMeetingLink("");
    setVideoCallOpen(false);
    setVideoCallInline(false);
    setCallStartTime(null);
    setJitsiError(false);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration("00:00:00");
    toast.success("Videochamada encerrada");
  }, []);
  

  // Timer para duração da chamada
  const [callDuration, setCallDuration] = useState("00:00:00");
  
  useEffect(() => {
    if (callStartTime && (videoCallOpen || videoCallInline)) {
      callTimerRef.current = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - callStartTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCallDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      setCallDuration("00:00:00");
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStartTime, videoCallOpen, videoCallInline]);

  // Encerrar videochamada quando mudar para consulta presencial
  useEffect(() => {
    if (consultationType === "presencial") {
      if (videoCallOpen || videoCallInline) {
        stopVideoCall();
      }
      if (telemedicinaOpen || telemedicinaInline) {
        setTelemedicinaOpen(false);
        setTelemedicinaInline(false);
        setTelemedicinaRoomId("");
        setTelemedicinaRoomLink("");
      }
    }
  }, [consultationType, videoCallOpen, videoCallInline, telemedicinaOpen, telemedicinaInline, stopVideoCall]);

  // Detectar quando o usuário sai da reunião do Jitsi (através do botão de desligar dentro do iframe)
  useEffect(() => {
    if (!videoCallOpen && !videoCallInline) return;

    const handleMessage = (event: MessageEvent) => {
      // Verificar se a mensagem vem do Jitsi
      if (event.origin.includes('meet.jit.si') || event.origin.includes('jitsi')) {
        // Log para debug (apenas primeiras mensagens para não poluir o console)
        if (Math.random() < 0.1) {
          console.log('📨 Mensagem recebida do Jitsi:', event.data);
        }
        
        // Detectar eventos do Jitsi relacionados ao fim da chamada
        if (event.data) {
          const data = event.data;
          
          // Verificar diferentes formatos de eventos do Jitsi
          const eventType = data.type || data.name || data.event || data.eventName;
          const eventName = typeof data === 'string' ? data : eventType;
          
          // Eventos que indicam que o usuário saiu da reunião
          if (
            eventName === 'video-conference-left' ||
            eventName === 'endpointTextMessageReceived' ||
            data.type === 'endpointTextMessageReceived' ||
            (typeof data === 'string' && (data.includes('left') || data.includes('leave'))) ||
            (data.eventName && data.eventName.includes('left')) ||
            (data.eventName && data.eventName.includes('leave'))
          ) {
            console.log('✅ Usuário saiu da reunião do Jitsi via postMessage');
            stopVideoCall();
            return;
          }
          
          // Verificar se é uma mensagem de texto indicando saída
          if (data.text && typeof data.text === 'string') {
            if (data.text.toLowerCase().includes('left') || 
                data.text.toLowerCase().includes('saiu') ||
                data.text.toLowerCase().includes('leave')) {
              console.log('✅ Detectada saída via mensagem de texto');
              stopVideoCall();
              return;
            }
          }
          
          // Verificar se é um objeto com informações de saída
          if (data.eventName === 'video-conference-left' || 
              data.name === 'video-conference-left' ||
              data.event === 'video-conference-left') {
            console.log('✅ Detectada saída via evento nomeado');
            stopVideoCall();
            return;
          }
          
          // Detectar erros de conexão através de mensagens
          if (data.error || 
              (typeof data === 'string' && (data.includes('refused') || data.includes('recusada') || data.includes('error')))) {
            console.log('⚠️ Erro de conexão detectado via postMessage');
            setJitsiError(true);
            setTimeout(() => {
              stopVideoCall();
            }, 2000);
            return;
          }
        }
      }
    };

    // Adicionar listener para mensagens do Jitsi
    window.addEventListener('message', handleMessage);

    // Monitorar mudanças na visibilidade do iframe e detectar quando o usuário sai
    const checkIframeVisibility = setInterval(() => {
      const iframes = document.querySelectorAll('iframe[title="Jitsi Meet Video Call"]');
      if (iframes.length === 0 && (videoCallOpen || videoCallInline)) {
        // Iframe foi removido, provavelmente o usuário saiu
        console.log('✅ Iframe removido, fechando videochamada');
        stopVideoCall();
        return;
      }
      
      // Verificar se o iframe está visível mas não está mais na reunião
      iframes.forEach((iframe) => {
        const iframeElement = iframe as HTMLIFrameElement;
        try {
          // Tentar detectar mudanças no iframe através de eventos
          if (iframeElement.contentWindow) {
            // Verificar se há erros ou mudanças de estado
            iframeElement.onload = () => {
              // Se o iframe recarregar, pode indicar que o usuário saiu
              const currentSrc = iframeElement.src;
              // Verificar se a URL mudou para uma página de saída
              if (currentSrc && (
                currentSrc.includes('close') || 
                currentSrc.includes('leave') ||
                currentSrc.includes('exit') ||
                (!currentSrc.includes('meet.jit.si') && currentSrc !== 'about:blank')
              )) {
                console.log('✅ URL do iframe mudou para página de saída, fechando videochamada');
                stopVideoCall();
              }
            };
          }
        } catch (e) {
          // CORS pode bloquear acesso ao iframe, isso é normal
        }
      });
    }, 500);
    
    // Também adicionar um listener direto no iframe quando ele carregar
    const iframes = document.querySelectorAll('iframe[title="Jitsi Meet Video Call"]');
    iframes.forEach((iframe) => {
      const iframeElement = iframe as HTMLIFrameElement;
      iframeElement.addEventListener('load', () => {
        // Quando o iframe carrega, tentar injetar código para detectar saída
        try {
          iframeElement.contentWindow?.postMessage({
            type: 'listen-for-leave',
            action: 'start-monitoring'
          }, '*');
        } catch (e) {
          // CORS pode bloquear, mas tentamos mesmo assim
        }
      });
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(checkIframeVisibility);
    };
  }, [videoCallOpen, videoCallInline, stopVideoCall]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado para a área de transferência!");
  };

  const openVideoCallInNewTab = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = procedureTemplates.find(t => t.id === templateId);
    if (template) {
      setClinicalNotes(template.content);
      toast.success(`Template "${template.name}" aplicado`);
    }
  };

  const isPatientSelected = useMemo(() => !!selectedPatient, [selectedPatient]);

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <Stethoscope className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Consulta</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Atendimento Presencial e Online Integrado
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={consultationType} onValueChange={setConsultationType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Presencial
                </div>
              </SelectItem>
              <SelectItem value="online">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Online (Jitsi)
                </div>
              </SelectItem>
              <SelectItem value="telemedicina">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Telemedicina
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {consultationType === "online" && (
            <>
              <Button 
                onClick={() => startVideoCall(false)} 
                variant="default"
                disabled={!isPatientSelected}
              >
                <Video className="mr-2 h-4 w-4" />
                Videochamada (Modal)
              </Button>
              <Button 
                onClick={() => startVideoCall(true)} 
                variant="outline"
                disabled={!isPatientSelected}
              >
                <Video className="mr-2 h-4 w-4" />
                Videochamada (Inline)
              </Button>
            </>
          )}
          {consultationType === "telemedicina" && (
            <>
              <Button 
                onClick={() => setTelemedicinaOpen(true)} 
                variant="default"
                disabled={!isPatientSelected}
                className="bg-primary hover:bg-primary/90"
              >
                <Video className="mr-2 h-4 w-4" />
                Telemedicina (Modal)
              </Button>
              <Button 
                onClick={() => setTelemedicinaInline(true)} 
                variant="outline"
                disabled={!isPatientSelected}
              >
                <Video className="mr-2 h-4 w-4" />
                Telemedicina (Inline)
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            disabled={!isPatientSelected}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          {selectedPatient && selectedPatient.convenioId && selectedPatient.healthInsurance !== "Particular" && canViewModule("Convênios") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Navegar para Convênios e abrir dialog de nova guia com dados preenchidos
                navigate('/convenios', { 
                  state: { 
                    generateGuia: true,
                    patientData: {
                      pacienteId: selectedPatient.id,
                      pacienteNome: selectedPatient.name,
                      pacienteCpf: selectedPatient.cpf,
                      pacienteCarteirinha: selectedPatient.carteirinha || '',
                      pacienteValidadeCarteirinha: selectedPatient.validadeCarteirinha || '',
                      convenioId: selectedPatient.convenioId,
                      convenioNome: selectedPatient.convenioNome || selectedPatient.healthInsurance,
                      profissionalNome: "Dr. João Santos",
                      profissionalCrm: "123456",
                      profissionalCrmEstado: "SP",
                      profissionalCbo: "225110",
                      dataAtendimento: new Date().toISOString().split('T')[0],
                      cid10: selectedCid10 || '',
                      cid10Descricao: cid10Database.find(c => c.code === selectedCid10)?.description || '',
                      indicacaoClinica: queixaPrincipal || historiaDoencaAtual || '',
                    }
                  } 
                });
                toast.success("Redirecionando para criar Guia TISS...");
              }}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar Guia TISS
            </Button>
          )}
          <Button onClick={handleSave} size="sm" disabled={!isPatientSelected}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Patient Search Bar - Dynamic */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <SearchBar
              placeholder="Buscar paciente por nome ou CPF..."
              value={searchQuery}
              onChange={setSearchQuery}
              inputHeight="large"
              className="w-full"
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-[100] max-h-[400px] overflow-auto">
                {filteredPatients.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Nenhum paciente encontrado.
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setSearchQuery("");
                          toast.success(`Paciente ${patient.name} selecionado`);
                        }}
                        className="cursor-pointer hover:bg-accent/20 transition-all p-4 border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-4 w-full">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src={patient.photo} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{patient.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Badge variant="secondary" className="text-xs font-medium">
                                {patient.healthInsurance}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {patient.age}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {patient.phone}
                              </span>
                            </div>
                          </div>
                          {selectedPatient?.id === patient.id && (
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Paciente selecionado: {selectedPatient.name}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedPatient(null)}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Call Dialog - Modal - Jitsi Público */}
      <Dialog open={videoCallOpen} onOpenChange={(open) => {
        if (!open) {
          // Usar stopVideoCall para fechar tanto modal quanto inline
          stopVideoCall();
        }
      }}>
        <DialogContent className="max-w-7xl w-full h-[92vh] p-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#404040] rounded-3xl overflow-hidden shadow-2xl [&>button]:hidden">
          <div className="h-full flex flex-col">
            {/* Header melhorado */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-[#404040] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">{selectedPatient?.name || "Paciente"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xs text-[#b0b0b0]">Videochamada ativa</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-full border border-[#404040]">
                  <Clock className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-sm font-semibold text-white">{callDuration}</span>
                </div>
                {meetingLink && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          copyToClipboard(meetingLink);
                          toast.success("Link copiado! Compartilhe com o paciente.");
                        }}
                        className="h-9 px-4 text-white hover:bg-[#2a2a2a] rounded-full border border-[#404040]"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        <span className="text-xs font-medium">Copiar link</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar link da reunião para compartilhar</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopVideoCall}
                  className="h-9 w-9 text-white hover:bg-[#ea4335]/20 hover:text-[#ea4335] rounded-full border border-[#404040] transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Área de vídeo - Tela cheia */}
            <div className="flex-1 relative bg-[#000000] min-h-0 overflow-hidden">
              {meetingRoomName && meetingRoomName.trim() !== "" ? (
                !jitsiError ? (
                  <iframe
                    key={meetingRoomName}
                    src={getJitsiUrl(meetingRoomName)}
                    allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                    className="w-full h-full border-0"
                    style={{ display: 'block' }}
                    title="Jitsi Meet Video Call"
                    allowFullScreen
                    onLoad={() => {
                      setJitsiError(false);
                      console.log('✅ Jitsi carregado com sucesso');
                      
                      // Verificar após um delay se o iframe realmente carregou corretamente
                      setTimeout(() => {
                        try {
                          const iframe = document.querySelector('iframe[title="Jitsi Meet Video Call"]') as HTMLIFrameElement;
                          if (iframe && iframe.contentWindow) {
                            // Tentar detectar se há erro de conexão
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (iframeDoc && iframeDoc.body) {
                              const bodyText = iframeDoc.body.innerText || iframeDoc.body.textContent || '';
                              if (bodyText.includes('conexão') || bodyText.includes('recusada') || bodyText.includes('refused') || bodyText.includes('error')) {
                                console.log('⚠️ Erro detectado no conteúdo do iframe');
                                setJitsiError(true);
                                // Fechar automaticamente após 3 segundos se houver erro
                                setTimeout(() => {
                                  stopVideoCall();
                                }, 3000);
                              }
                            }
                          }
                        } catch (e) {
                          // CORS pode bloquear acesso ao iframe, isso é normal
                          console.log('⚠️ Não foi possível verificar conteúdo do iframe (CORS)');
                        }
                      }, 2000);
                    }}
                    onError={() => {
                      setJitsiError(true);
                      toast.error("Erro ao carregar Jitsi Meet. Fechando automaticamente...");
                      // Fechar automaticamente após 2 segundos em caso de erro
                      setTimeout(() => {
                        stopVideoCall();
                      }, 2000);
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
                    <div className="text-center space-y-6 max-w-lg px-8">
                      <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-[#ea4335] to-[#d33b2c] flex items-center justify-center shadow-lg">
                        <Video className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white mb-3">Erro ao conectar</p>
                        <p className="text-sm text-[#b0b0b0] mb-6">
                          Não foi possível carregar o Jitsi Meet. A conexão foi recusada.
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button
                            variant="default"
                            onClick={() => {
                              stopVideoCall();
                            }}
                            className="bg-[#ea4335] hover:bg-[#d33b2c] text-white px-6"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Fechar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setJitsiError(false);
                              window.open(getJitsiUrl(meetingRoomName), '_blank', 'noopener,noreferrer');
                            }}
                            className="border-[#404040] text-white hover:bg-[#2a2a2a] px-6"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir em Nova Aba
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse shadow-2xl">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-[#1a1a1a] animate-ping"></div>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">Iniciando videochamada...</p>
                      <p className="text-sm text-[#b0b0b0] mt-2">Conectando ao Jitsi Meet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controles inferiores melhorados */}
            <div className="px-8 py-5 bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-t border-[#404040] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">JS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Dr. João Santos</p>
                  <p className="text-xs text-[#b0b0b0]">Você</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-14 w-14 rounded-full transition-all ${
                        isMicOn 
                          ? 'bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#404040]' 
                          : 'bg-[#ea4335] hover:bg-[#d33b2c] text-white shadow-lg'
                      }`}
                      onClick={() => setIsMicOn(!isMicOn)}
                    >
                      {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMicOn ? 'Desativar microfone' : 'Ativar microfone'}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-14 w-14 rounded-full transition-all ${
                        isCameraOn 
                          ? 'bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#404040]' 
                          : 'bg-[#ea4335] hover:bg-[#d33b2c] text-white shadow-lg'
                      }`}
                      onClick={() => setIsCameraOn(!isCameraOn)}
                    >
                      {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCameraOn ? 'Desativar câmera' : 'Ativar câmera'}</p>
                  </TooltipContent>
                </Tooltip>
                <div className="h-10 w-px bg-[#404040] mx-1"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-14 w-14 rounded-full bg-[#ea4335] hover:bg-[#d33b2c] text-white shadow-lg transition-all"
                      onClick={stopVideoCall}
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Encerrar chamada</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                {meetingLink && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#404040]"
                        onClick={() => window.open(getJitsiUrl(meetingRoomName), '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Abrir em nova aba</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Data Sidebar - Compact */}
        <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Dados do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-250px)]">
              {!selectedPatient ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <User className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Selecione um paciente
                  </p>
                </div>
              ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedPatient.photo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">{selectedPatient.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {selectedPatient.healthInsurance}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Idade / CPF</p>
                    <p className="text-sm font-medium">{selectedPatient.age} • {selectedPatient.cpf}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contato</p>
                    <p className="text-sm font-medium">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Alergias</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.map((allergy: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Condições</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.chronicDiseases.map((disease: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        </div>

        {/* Main Consultation Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6 overflow-auto">
              {/* Video Call Inline - Com controles */}
              {videoCallInline && consultationType === "online" && (
                <div className="mb-6 rounded-2xl overflow-hidden border-2 border-[#404040] bg-[#000000] relative shadow-xl flex flex-col" style={{ height: '600px' }}>
                  {/* Header com controles */}
                  <div className="px-4 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-[#404040] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{selectedPatient?.name || "Paciente"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                          <p className="text-xs text-[#b0b0b0]">Videochamada ativa</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a2a2a] rounded-full border border-[#404040]">
                        <Clock className="h-3 w-3 text-green-400" />
                        <span className="text-xs font-semibold text-white">{callDuration}</span>
                      </div>
                      {meetingLink && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                copyToClipboard(meetingLink);
                                toast.success("Link copiado! Compartilhe com o paciente.");
                              }}
                              className="h-8 px-3 text-white hover:bg-[#2a2a2a] rounded-full border border-[#404040]"
                            >
                              <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                              <span className="text-xs font-medium">Copiar link</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copiar link da reunião</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={stopVideoCall}
                            className="h-8 w-8 text-white hover:bg-[#ea4335]/20 hover:text-[#ea4335] rounded-full border border-[#404040]"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fechar videochamada</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Área de vídeo */}
                  <div className="flex-1 relative bg-[#000000] min-h-0">
                    {meetingRoomName && meetingRoomName.trim() !== "" ? (
                      !jitsiError ? (
                        <iframe
                          key={meetingRoomName}
                          src={getJitsiUrl(meetingRoomName)}
                          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                          className="w-full h-full border-0"
                          style={{ display: 'block' }}
                          title="Jitsi Meet Video Call"
                          allowFullScreen
                          onLoad={() => {
                            setJitsiError(false);
                            console.log('✅ Jitsi inline carregado com sucesso');
                            
                            // Verificar após um delay se o iframe realmente carregou corretamente
                            setTimeout(() => {
                              try {
                                const iframe = document.querySelector('iframe[title="Jitsi Meet Video Call"]') as HTMLIFrameElement;
                                if (iframe && iframe.contentWindow) {
                                  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                  if (iframeDoc && iframeDoc.body) {
                                    const bodyText = iframeDoc.body.innerText || iframeDoc.body.textContent || '';
                                    if (bodyText.includes('conexão') || bodyText.includes('recusada') || bodyText.includes('refused') || bodyText.includes('error')) {
                                      console.log('⚠️ Erro detectado no conteúdo do iframe inline');
                                      setJitsiError(true);
                                      setTimeout(() => {
                                        stopVideoCall();
                                      }, 3000);
                                    }
                                  }
                                }
                              } catch (e) {
                                console.log('⚠️ Não foi possível verificar conteúdo do iframe inline (CORS)');
                              }
                            }, 2000);
                          }}
                          onError={() => {
                            setJitsiError(true);
                            toast.error("Erro ao carregar Jitsi Meet. Fechando automaticamente...");
                            setTimeout(() => {
                              stopVideoCall();
                            }, 2000);
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
                          <div className="text-center space-y-4 max-w-md px-6">
                            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-[#ea4335] to-[#d33b2c] flex items-center justify-center shadow-lg">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-white mb-2">Erro ao conectar</p>
                            <p className="text-sm text-[#b0b0b0] mb-4">
                              A conexão com o Jitsi foi recusada
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => stopVideoCall()}
                                className="bg-[#ea4335] hover:bg-[#d33b2c] text-white"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Fechar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setJitsiError(false);
                                  window.open(getJitsiUrl(meetingRoomName), '_blank', 'noopener,noreferrer');
                                }}
                                className="border-[#404040] text-white hover:bg-[#2a2a2a]"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir em Nova Aba
                              </Button>
                            </div>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
                        <div className="text-center text-white space-y-4">
                          <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                            <Video className="h-10 w-10 text-white" />
                          </div>
                          <p className="text-lg font-semibold">Preparando videochamada...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Telemedicina Inline - Com controles */}
              {telemedicinaInline && consultationType === "telemedicina" && selectedPatient && (
                <div className="mb-6 rounded-2xl overflow-hidden border-2 border-primary bg-[#000000] relative shadow-xl flex flex-col" style={{ height: '600px' }}>
                  <Telemedicina
                    patientName={selectedPatient.name}
                    doctorName="Dr. João Santos"
                    roomId={telemedicinaRoomId}
                    isDoctor={true}
                    onClose={() => {
                      setTelemedicinaInline(false);
                      setTelemedicinaRoomId("");
                      setTelemedicinaRoomLink("");
                    }}
                    onRoomCreated={(roomId, roomLink) => {
                      setTelemedicinaRoomId(roomId);
                      setTelemedicinaRoomLink(roomLink);
                      toast.success("Sala de telemedicina criada! Compartilhe o link com o paciente.");
                    }}
                  />
                </div>
              )}

              <Tabs defaultValue="prontuario" className="w-full">
                <TabsList className="grid w-full grid-cols-7 mb-4 h-auto p-1 gap-0">
                  <TabsTrigger value="prontuario" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Prontuário</TabsTrigger>
                  <TabsTrigger value="anamnese" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Anamnese</TabsTrigger>
                  <TabsTrigger value="historico" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Histórico</TabsTrigger>
                  <TabsTrigger value="evolucao" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Evolução</TabsTrigger>
                  <TabsTrigger value="prescricao" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Prescrição</TabsTrigger>
                  <TabsTrigger value="atestado" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Atestado</TabsTrigger>
                  <TabsTrigger value="anexos" className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">Anexos</TabsTrigger>
                </TabsList>

                {/* Tab: Prontuário (Overview + Vital Signs + Physical Exam + Diagnosis) */}
                <TabsContent value="prontuario" className="space-y-4" key={`prontuario-${selectedPatient?.id || 'none'}`}>
                  {/* Templates */}
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-primary" />
                        Templates de Procedimentos
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Preencha rapidamente com templates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={selectedTemplate} 
                        onValueChange={(value) => {
                          setSelectedTemplate(value);
                          applyTemplate(value);
                        }}
                        disabled={!isPatientSelected}
                      >
                        <SelectTrigger className="bg-background" disabled={!isPatientSelected}>
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-[100]">
                          {procedureTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Sinais Vitais */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-5 w-5 text-red-500" />
                        Sinais Vitais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                        <div className="grid gap-2">
                          <Label htmlFor="pressure" className="flex items-center gap-1 font-semibold text-sm">
                            <Heart className="h-3 w-3 text-red-500" /> PA
                          </Label>
                          <Input 
                            id="pressure" 
                            placeholder="120/80" 
                            className="text-center font-mono" 
                            value={pressure}
                            onChange={(e) => setPressure(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                          <span className="text-xs text-muted-foreground text-center">mmHg</span>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="heartRate" className="flex items-center gap-1 font-semibold text-sm">
                            <Activity className="h-3 w-3 text-red-500" /> FC
                          </Label>
                          <Input 
                            id="heartRate" 
                            placeholder="72" 
                            className="text-center font-mono" 
                            value={heartRate}
                            onChange={(e) => setHeartRate(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                          <span className="text-xs text-muted-foreground text-center">bpm</span>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="temp" className="flex items-center gap-1 font-semibold text-sm">
                            <Thermometer className="h-3 w-3 text-red-500" /> Temp
                          </Label>
                          <Input 
                            id="temp" 
                            placeholder="36.5" 
                            className="text-center font-mono" 
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                          <span className="text-xs text-muted-foreground text-center">°C</span>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="weight" className="flex items-center gap-1 font-semibold text-sm">
                            <Weight className="h-3 w-3 text-red-500" /> Peso
                          </Label>
                          <Input 
                            id="weight" 
                            placeholder="70" 
                            className="text-center font-mono" 
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                          <span className="text-xs text-muted-foreground text-center">kg</span>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="height" className="flex items-center gap-1 font-semibold text-sm">
                            <Ruler className="h-3 w-3 text-red-500" /> Altura
                          </Label>
                          <Input 
                            id="height" 
                            placeholder="170" 
                            className="text-center font-mono" 
                            type="number"
                            step="0.1"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                          <span className="text-xs text-muted-foreground text-center">cm</span>
                        </div>
                      </div>
                      
                      {/* Exibição do IMC */}
                      {imc && (
                        <div className="mt-4 p-3 bg-accent/20 rounded-lg border border-red-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-xs text-muted-foreground">IMC (Índice de Massa Corporal)</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-red-500">{imc.value}</span>
                                <span className="text-xs text-muted-foreground">kg/m²</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={imc.classification.color}>
                                {imc.classification.text}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Exame Físico */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-purple-500" />
                        Exame Físico
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm">Estado Geral</Label>
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setExameFisicoEstadoGeral(prev => appendToText(prev || '', text));
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <Textarea
                          placeholder="BEG, LOC, corado, hidratado..."
                          rows={2}
                          className="resize-none"
                          value={exameFisicoEstadoGeral}
                          onChange={(e) => setExameFisicoEstadoGeral(e.target.value)}
                          disabled={!isPatientSelected}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diagnóstico com CID-10 Autocompletar */}
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-500" />
                        Diagnóstico (CID-10)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cid10" className="font-semibold text-sm">
                          Buscar CID-10
                        </Label>
                        <div className="relative z-0">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                          <Input
                            id="cid10"
                            placeholder="Digite código ou descrição..."
                            value={cid10Search}
                            onChange={(e) => setCid10Search(e.target.value)}
                            className="pl-10 pr-10 relative z-0"
                            disabled={!isPatientSelected}
                          />
                          {cid10Search && (
                            <button
                              type="button"
                              onClick={() => setCid10Search("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
                              disabled={!isPatientSelected}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {cid10Search && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-[100] max-h-[300px] overflow-auto">
                              {filteredCid10.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  Nenhum CID-10 encontrado.
                                </div>
                              ) : (
                                <div className="py-2">
                                  {filteredCid10.map((cid) => (
                                    <div
                                      key={cid.code}
                                      onClick={() => {
                                        setSelectedCid10(`${cid.code} - ${cid.description}`);
                                        setCid10Search("");
                                        toast.success("CID-10 selecionado");
                                      }}
                                      className="cursor-pointer hover:bg-accent/20 transition-all p-3 border-b last:border-b-0"
                                    >
                                      <div className="flex items-start gap-3">
                                        <Badge variant="outline" className="font-mono text-xs">
                                          {cid.code}
                                        </Badge>
                                        <p className="text-sm flex-1">{cid.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedCid10 && (
                          <div className="mt-2 p-3 bg-accent/20 rounded-lg border flex items-center justify-between">
                            <span className="text-sm font-medium">{selectedCid10}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedCid10("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm">Conduta / Plano Terapêutico</Label>
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setCondutaPlanoTerapeutico(prev => appendToText(prev || '', text));
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <Textarea
                          placeholder="Descreva a conduta e o plano terapêutico..."
                          rows={4}
                          className="resize-none"
                          value={condutaPlanoTerapeutico}
                          onChange={(e) => setCondutaPlanoTerapeutico(e.target.value)}
                          disabled={!isPatientSelected}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Anamnese */}
                <TabsContent value="anamnese" className="space-y-4" key={`anamnese-${selectedPatient?.id || 'none'}`}>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-500" />
                        Anamnese Estruturada
                      </CardTitle>
                      <CardDescription>
                        Informações detalhadas sobre a condição do paciente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="complaint" className="font-semibold text-sm">
                              Queixa Principal (QP)
                            </Label>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setQueixaPrincipal(prev => appendToText(prev || '', text));
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                          <Textarea
                            id="complaint"
                            placeholder="Ex: Dor abdominal há 2 dias..."
                            rows={3}
                            className="resize-none"
                            value={queixaPrincipal}
                            onChange={(e) => setQueixaPrincipal(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="history" className="font-semibold text-sm">
                              História da Doença Atual (HDA)
                            </Label>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setHistoriaDoencaAtual(prev => appendToText(prev || '', text));
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                          <Textarea
                            id="history"
                            placeholder="Início, duração, características..."
                            rows={3}
                            className="resize-none"
                            value={historiaDoencaAtual}
                            onChange={(e) => setHistoriaDoencaAtual(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pastHistory" className="font-semibold text-sm">
                              História Patológica Pregressa (HPP)
                            </Label>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setHistoriaPatologicaPregressa(prev => appendToText(prev || '', text));
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                          <Textarea
                            id="pastHistory"
                            placeholder="Doenças anteriores, cirurgias..."
                            rows={3}
                            className="resize-none"
                            value={historiaPatologicaPregressa}
                            onChange={(e) => setHistoriaPatologicaPregressa(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="familyHistory" className="font-semibold text-sm">
                              História Familiar (HF)
                            </Label>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setHistoriaFamiliar(prev => appendToText(prev || '', text));
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                          <Textarea
                            id="familyHistory"
                            placeholder="Doenças na família..."
                            rows={3}
                            className="resize-none"
                            value={historiaFamiliar}
                            onChange={(e) => setHistoriaFamiliar(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="medications" className="font-semibold text-sm">
                              Medicações em Uso
                            </Label>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setMedicacoesUso(prev => appendToText(prev || '', text));
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                          <Textarea
                            id="medications"
                            placeholder="Liste todas as medicações..."
                            rows={3}
                            className="resize-none"
                            value={medicacoesUso}
                            onChange={(e) => setMedicacoesUso(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="habits" className="font-semibold text-sm">
                              Hábitos de Vida
                            </Label>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setHabitosVida(prev => appendToText(prev || '', text));
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                          <Textarea
                            id="habits"
                            placeholder="Tabagismo, etilismo, atividade física..."
                            rows={3}
                            className="resize-none"
                            value={habitosVida}
                            onChange={(e) => setHabitosVida(e.target.value)}
                            disabled={!isPatientSelected}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Evolução */}
                <TabsContent value="evolucao" className="space-y-4" key={`evolucao-${selectedPatient?.id || 'none'}`}>
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-5 w-5 text-green-500" />
                        Evolução Clínica
                      </CardTitle>
                      <CardDescription>
                        Registro detalhado da evolução e observações clínicas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-end">
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setClinicalNotes(prev => {
                                  return appendToQuill(prev || '', text);
                                });
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <ReactQuill 
                            theme="snow"
                            value={clinicalNotes}
                            onChange={setClinicalNotes}
                            placeholder="Digite suas anotações clínicas detalhadas..."
                            style={{ minHeight: '300px' }}
                            readOnly={!isPatientSelected}
                            modules={{
                              toolbar: isPatientSelected ? [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'color': [] }, { 'background': [] }],
                                ['clean']
                              ] : false
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Histórico - Timeline */}
                <TabsContent value="historico" className="space-y-4">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-5 w-5 text-amber-500" />
                        Histórico Completo
                      </CardTitle>
                      <CardDescription>
                        Timeline de todas as consultas e procedimentos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!selectedPatient ? (
                        <div className="text-center space-y-4 py-12">
                          <Clock className="h-16 w-16 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-lg font-semibold text-muted-foreground">
                              Selecione um paciente
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              O histórico aparecerá após selecionar um paciente
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {consultationHistory.map((consultation, idx) => (
                            <div key={consultation.id} className="flex gap-4">
                              {/* Timeline indicator */}
                              <div className="flex flex-col items-center">
                                <div className={`rounded-full p-2 ${
                                  consultation.type === 'online' 
                                    ? 'bg-primary/20' 
                                    : 'bg-purple-500/20'
                                }`}>
                                  {consultation.type === 'online' ? (
                                    <Video className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Building2 className="h-4 w-4 text-purple-500" />
                                  )}
                                </div>
                                {idx < consultationHistory.length - 1 && (
                                  <div className="w-px h-full bg-border mt-2"></div>
                                )}
                              </div>

                              {/* Consultation details */}
                              <div className="flex-1 pb-6">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant={consultation.type === 'online' ? 'default' : 'secondary'} className="text-xs">
                                        {consultation.type === 'online' ? 'Online' : 'Presencial'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {consultation.date} às {consultation.time}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-sm">{consultation.professional}</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewProntuario(consultation)}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ver Prontuário
                                  </Button>
                                </div>
                                <div className="bg-accent/20 rounded-lg p-3 border">
                                  <p className="text-sm">
                                    <span className="font-semibold">Diagnóstico:</span> {consultation.diagnosis}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Prescrição */}
                <TabsContent value="prescricao" className="space-y-4">
                  <Card className="border-l-4 border-l-cyan-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Pill className="h-5 w-5 text-cyan-500" />
                        Prescrições e Receitas
                      </CardTitle>
                      <CardDescription>
                        Prescrições médicas e receituário
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Tabs internas para alternar entre editor livre e prescrição digital */}
                      <Tabs defaultValue="digital" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="digital">Prescrição Digital</TabsTrigger>
                          <TabsTrigger value="livre">Editor Livre</TabsTrigger>
                        </TabsList>

                        {/* Prescrição Digital */}
                        <TabsContent value="digital" className="space-y-4">
                          {!selectedPatient ? (
                            <div className="text-center py-12">
                              <Pill className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">
                                Selecione um paciente para criar uma prescrição digital
                              </p>
                            </div>
                          ) : (
                      <div className="space-y-4">
                              <PrescriptionBuilder
                                patientId={selectedPatient.id}
                                patientName={selectedPatient.name}
                                patientCpf={selectedPatient.cpf}
                                patientAllergies={Array.isArray(selectedPatient.allergies) 
                                  ? selectedPatient.allergies 
                                  : (selectedPatient.allergies ? [selectedPatient.allergies] : [])}
                                patientConditions={Array.isArray(selectedPatient.chronicDiseases) 
                                  ? selectedPatient.chronicDiseases 
                                  : (selectedPatient.chronicDiseases ? [selectedPatient.chronicDiseases] : [])}
                                doctorName="Dr. João Santos"
                                doctorCrm="123456"
                                doctorCrmState="SP"
                                onSave={(prescription) => {
                                  toast.success("Prescrição digital criada com sucesso!");
                                }}
                              />
                              
                              <Separator />
                              
                              <PrescriptionHistory
                                patientCpf={selectedPatient.cpf}
                                patientName={selectedPatient.name}
                              />
                            </div>
                          )}
                        </TabsContent>

                        {/* Editor Livre */}
                        <TabsContent value="livre" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePrintPrescricao}
                              disabled={!isPatientSelected || !prescriptionNotes || !prescriptionNotes.trim()}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Imprimir Receita
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditPrescricaoTemplateOpen(true)}
                                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar template da prescrição</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                            <AudioTranscriptionButton
                              onTranscript={(text) => {
                                if (text && text.trim()) {
                                  setPrescriptionNotes(prev => {
                                    return appendToQuill(prev || '', text);
                                  });
                                }
                              }}
                              disabled={!isPatientSelected}
                            />
                          </div>
                        <div className="space-y-2">
                          <div className="border rounded-md overflow-hidden">
                            <ReactQuill 
                              theme="snow"
                              value={prescriptionNotes}
                              onChange={setPrescriptionNotes}
                              placeholder="Digite a prescrição médica..."
                              style={{ minHeight: '300px' }}
                              readOnly={!isPatientSelected}
                              modules={{
                                toolbar: isPatientSelected ? [
                                  [{ 'header': [1, 2, false] }],
                                  ['bold', 'italic', 'underline'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['clean']
                                ] : false
                              }}
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Digital Signature */}
                        <div className="space-y-3">
                          <Label className="font-semibold text-sm flex items-center gap-2">
                            <FileSignature className="h-4 w-4 text-cyan-500" />
                            Assinatura Digital
                          </Label>
                          <div className="p-4 bg-accent/20 rounded-lg border space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  JS
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">Dr. João Santos</p>
                                <p className="text-xs text-muted-foreground">CRM: 123456 - SP</p>
                              </div>
                              {isSigned ? (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  <FileCheck className="h-3 w-3 mr-1" />
                                  Assinado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                            {signature && (
                              <div className="p-2 bg-white rounded border">
                                <img src={signature} alt="Assinatura" className="max-w-full h-20 object-contain" />
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSignatureDialogOpen(true)}
                                disabled={!isPatientSelected}
                              >
                                <FileSignature className="h-4 w-4 mr-2" />
                                {isSigned ? "Reassinar Documento" : "Assinar Documento"}
                              </Button>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleDownloadDocument}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Baixar documento assinado</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        {/* Dialog de Assinatura Digital */}
                        <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileSignature className="h-5 w-5 text-cyan-500" />
                                Assinatura Digital
                              </DialogTitle>
                              <DialogDescription>
                                Desenhe sua assinatura no campo abaixo usando o mouse ou o dedo (em dispositivos touch)
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="border-2 border-dashed border-muted rounded-lg p-4 bg-white">
                                <canvas
                                  ref={canvasRef}
                                  width={700}
                                  height={200}
                                  className="w-full max-w-full border rounded cursor-crosshair touch-none"
                                  style={{ maxWidth: '100%', height: 'auto' }}
                                  onMouseDown={startDrawing}
                                  onMouseMove={draw}
                                  onMouseUp={stopDrawing}
                                  onMouseLeave={stopDrawing}
                                  onTouchStart={startDrawing}
                                  onTouchMove={draw}
                                  onTouchEnd={stopDrawing}
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <Button
                                  variant="outline"
                                  onClick={clearSignature}
                                >
                                  Limpar
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSignatureDialogOpen(false)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={saveSignature}
                                  >
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Confirmar Assinatura
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Atestado/Declaração */}
                <TabsContent value="atestado" className="space-y-4">
                  <Card className="border-l-4 border-l-teal-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-teal-500" />
                        Atestado/Declaração
                      </CardTitle>
                      <CardDescription>
                        Emissão de atestados médicos, declarações e relatórios
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Atestados Médicos */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="font-semibold text-sm">Atestados Médicos</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePrintAtestado}
                              disabled={!isPatientSelected || !atestadoMedico || !atestadoMedico.trim()}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-7 px-2 text-xs"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Imprimir
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditAtestadoTemplateOpen(true)}
                                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-7 px-2"
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar template do atestado</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setAtestadoMedico(prev => {
                                  return appendToQuill(prev || '', text);
                                });
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <ReactQuill 
                            theme="snow"
                            value={atestadoMedico}
                            onChange={setAtestadoMedico}
                            placeholder="Digite o conteúdo do atestado médico..."
                            style={{ minHeight: '200px' }}
                            readOnly={!isPatientSelected}
                            modules={{
                              toolbar: isPatientSelected ? [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['clean']
                              ] : false
                            }}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Declarações de Comparecimento */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="font-semibold text-sm">Declarações de Comparecimento</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePrintDeclaracao}
                              disabled={!isPatientSelected || !declaracaoComparecimento || !declaracaoComparecimento.trim()}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-7 px-2 text-xs"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Imprimir
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditDeclaracaoTemplateOpen(true)}
                                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-7 px-2"
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar template da declaração</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setDeclaracaoComparecimento(prev => {
                                  return appendToQuill(prev || '', text);
                                });
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <ReactQuill 
                            theme="snow"
                            value={declaracaoComparecimento}
                            onChange={setDeclaracaoComparecimento}
                            placeholder="Digite o conteúdo da declaração de comparecimento..."
                            style={{ minHeight: '200px' }}
                            readOnly={!isPatientSelected}
                            modules={{
                              toolbar: isPatientSelected ? [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['clean']
                              ] : false
                            }}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Relatórios Médicos */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="font-semibold text-sm">Relatórios Médicos</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePrintRelatorio}
                              disabled={!isPatientSelected || !relatorioMedico || !relatorioMedico.trim()}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-7 px-2 text-xs"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Imprimir
                            </Button>
                          </div>
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setRelatorioMedico(prev => {
                                  return appendToQuill(prev || '', text);
                                });
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <ReactQuill 
                            theme="snow"
                            value={relatorioMedico}
                            onChange={setRelatorioMedico}
                            placeholder="Digite o conteúdo do relatório médico..."
                            style={{ minHeight: '200px' }}
                            readOnly={!isPatientSelected}
                            modules={{
                              toolbar: isPatientSelected ? [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'color': [] }, { 'background': [] }],
                                ['clean']
                              ] : false
                            }}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Solicitações Especiais/Declaração */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm">Solicitações Especiais/Declaração</Label>
                          <AudioTranscriptionButton
                            onTranscript={(text) => {
                              if (text && text.trim()) {
                                setSolicitacoesEspeciais(prev => {
                                  return appendToQuill(prev || '', text);
                                });
                              }
                            }}
                            disabled={!isPatientSelected}
                          />
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <ReactQuill 
                            theme="snow"
                            value={solicitacoesEspeciais}
                            onChange={setSolicitacoesEspeciais}
                            placeholder="Digite o conteúdo da solicitação especial ou declaração..."
                            style={{ minHeight: '200px' }}
                            readOnly={!isPatientSelected}
                            modules={{
                              toolbar: isPatientSelected ? [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['clean']
                              ] : false
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Anexos */}
                <TabsContent value="anexos" className="space-y-4">
                  <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Upload className="h-5 w-5 text-indigo-500" />
                        Exames e Anexos
                      </CardTitle>
                      <CardDescription>
                        Upload de documentos, exames e imagens
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Área de Upload */}
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            !isPatientSelected 
                              ? 'cursor-not-allowed opacity-50' 
                              : isDragging 
                                ? 'border-primary bg-primary/5 cursor-pointer' 
                                : 'border-muted hover:border-primary/50 cursor-pointer'
                          }`}
                          onDragOver={isPatientSelected ? handleDragOver : undefined}
                          onDragLeave={isPatientSelected ? handleDragLeave : undefined}
                          onDrop={isPatientSelected ? handleDrop : undefined}
                          onClick={() => isPatientSelected && fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg,.dicom,.dcm"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={!isPatientSelected}
                          />
                          <Upload className={`h-12 w-12 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-sm font-medium mb-1">
                            {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para fazer upload'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, PNG, JPG, DICOM até 50MB
                          </p>
                        </div>

                        {/* Arquivos Enviados */}
                        {uploadedFiles.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <Label className="font-semibold text-sm mb-3 block">
                                Arquivos Enviados ({uploadedFiles.length})
                              </Label>
                              <div className="space-y-2">
                                {uploadedFiles.map((file) => (
                                  <div key={file.id} className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg border">
                                    <FileText className="h-8 w-8 text-indigo-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {file.date} • {file.type} • {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDownloadFile(file)}
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Baixar arquivo</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleDeleteFileClick(file.id)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Remover arquivo</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        <Separator />

                        {/* Histórico de Exames Anteriores */}
                        <div>
                          <Label className="font-semibold text-sm mb-3 block">
                            Histórico de Exames Anteriores
                          </Label>
                          <div className="space-y-2">
                            {historicalFiles.map((file) => (
                              <div key={file.id} className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg border">
                                <FileText className="h-8 w-8 text-indigo-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.date} • {file.type} • {formatFileSize(file.size)}
                                  </p>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDownloadHistoricalFile(file)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Baixar arquivo</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Visualização de Prontuário */}
      <Dialog open={prontuarioDialogOpen} onOpenChange={setProntuarioDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Prontuário - {selectedProntuario?.date} às {selectedProntuario?.time}
            </DialogTitle>
          </DialogHeader>
          {selectedProntuario?.prontuario && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Profissional</Label>
                  <p className="font-semibold text-sm">{selectedProntuario.professional}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Consulta</Label>
                  <Badge variant={selectedProntuario.type === 'online' ? 'default' : 'secondary'} className="text-xs">
                    {selectedProntuario.type === 'online' ? 'Online' : 'Presencial'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Queixa Principal</Label>
                  <p className="text-sm">{selectedProntuario.prontuario.queixaPrincipal}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">História da Doença Atual</Label>
                  <p className="text-sm">{selectedProntuario.prontuario.historiaDoencaAtual}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Exame Físico</Label>
                  <p className="text-sm">{selectedProntuario.prontuario.exameFisico}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Diagnóstico</Label>
                  <p className="text-sm font-semibold text-primary">{selectedProntuario.prontuario.diagnostico}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Conduta</Label>
                  <p className="text-sm">{selectedProntuario.prontuario.conduta}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Medicamentos Prescritos</Label>
                  <p className="text-sm">{selectedProntuario.prontuario.medicamentos}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Exames Solicitados</Label>
                  <p className="text-sm">{selectedProntuario.prontuario.exames}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProntuarioDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    try {
                      const doc = new jsPDF();
                      const pageWidth = doc.internal.pageSize.getWidth();
                      const pageHeight = doc.internal.pageSize.getHeight();
                      const margin = 20;
                      const maxWidth = pageWidth - (margin * 2);
                      let yPosition = margin;

                      // Função auxiliar para adicionar texto com quebra de linha
                      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
                        doc.setFontSize(fontSize);
                        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                        doc.setTextColor(color[0], color[1], color[2]);
                        
                        const lines = doc.splitTextToSize(text, maxWidth);
                        lines.forEach((line: string) => {
                          if (yPosition > pageHeight - margin - 10) {
                            doc.addPage();
                            yPosition = margin;
                          }
                          doc.text(line, margin, yPosition);
                          yPosition += fontSize * 0.5;
                        });
                        yPosition += 5;
                      };

                      // Cabeçalho
                      addText('PRONTUÁRIO MÉDICO', 18, true, [21, 128, 61]);
                      yPosition += 5;
                      
                      // Linha divisória
                      doc.setDrawColor(21, 128, 61);
                      doc.setLineWidth(0.5);
                      doc.line(margin, yPosition, pageWidth - margin, yPosition);
                      yPosition += 10;

                      // Informações do cabeçalho
                      addText(`Data e Hora: ${selectedProntuario.date} às ${selectedProntuario.time}`, 10, false);
                      addText(`Profissional: ${selectedProntuario.professional}`, 10, false);
                      addText(`Tipo de Consulta: ${selectedProntuario.type === 'online' ? 'Online' : 'Presencial'}`, 10, false);
                      yPosition += 5;

                      // Queixa Principal
                      addText('QUEIXA PRINCIPAL', 12, true);
                      addText(selectedProntuario.prontuario.queixaPrincipal, 10, false);
                      yPosition += 5;

                      // História da Doença Atual
                      addText('HISTÓRIA DA DOENÇA ATUAL', 12, true);
                      addText(selectedProntuario.prontuario.historiaDoencaAtual, 10, false);
                      yPosition += 5;

                      // Exame Físico
                      addText('EXAME FÍSICO', 12, true);
                      addText(selectedProntuario.prontuario.exameFisico, 10, false);
                      yPosition += 5;

                      // Diagnóstico (destacado)
                      addText('DIAGNÓSTICO', 12, true);
                      addText(selectedProntuario.prontuario.diagnostico, 11, true, [21, 128, 61]);
                      yPosition += 5;

                      // Conduta
                      addText('CONDUTA', 12, true);
                      addText(selectedProntuario.prontuario.conduta, 10, false);
                      yPosition += 5;

                      // Medicamentos Prescritos
                      addText('MEDICAMENTOS PRESCRITOS', 12, true);
                      addText(selectedProntuario.prontuario.medicamentos, 10, false);
                      yPosition += 5;

                      // Exames Solicitados
                      addText('EXAMES SOLICITADOS', 12, true);
                      addText(selectedProntuario.prontuario.exames, 10, false);
                      yPosition += 10;

                      // Rodapé
                      doc.setFontSize(8);
                      doc.setTextColor(100, 100, 100);
                      const footerText = `Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude - Sistema de Gestão Médica`;
                      const footerY = pageHeight - 15;
                      doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

                      // Salvar PDF automaticamente
                      const fileName = `prontuario_${selectedProntuario.date.replace(/\//g, '-')}.pdf`;
                      doc.save(fileName);
                      toast.success("Prontuário baixado em PDF com sucesso!");
                    } catch (error) {
                      console.error('Erro ao gerar PDF:', error);
                      toast.error("Erro ao gerar PDF. Tente novamente.");
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Prontuário (PDF)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Remoção de Arquivo */}
      <AlertDialog open={deleteFileDialogOpen} onOpenChange={setDeleteFileDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o arquivo "{uploadedFiles.find(f => f.id === fileToDelete)?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFileConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover Arquivo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Edição de Template de Prescrição */}
      <Dialog open={editPrescricaoTemplateOpen} onOpenChange={setEditPrescricaoTemplateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Editar Template de Prescrição
            </DialogTitle>
            <DialogDescription>
              Personalize o template da prescrição médica. Use as variáveis: {"{NOME_PACIENTE}"}, {"{CPF_PACIENTE}"}, {"{IDADE_PACIENTE}"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template (deixe vazio para usar o padrão)</Label>
              <Textarea
                value={prescricaoTemplate}
                onChange={(e) => setPrescricaoTemplate(e.target.value)}
                placeholder="Digite o template personalizado da prescrição..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: {"{NOME_PACIENTE}"}, {"{CPF_PACIENTE}"}, {"{IDADE_PACIENTE}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPrescricaoTemplate('');
                localStorage.removeItem('prescricaoTemplate');
                toast.success("Template resetado para o padrão!");
              }}
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditPrescricaoTemplateOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={savePrescricaoTemplate}>
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Template de Atestado */}
      <Dialog open={editAtestadoTemplateOpen} onOpenChange={setEditAtestadoTemplateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-teal-500" />
              Editar Template de Atestado
            </DialogTitle>
            <DialogDescription>
              Personalize o template do atestado médico. Use as variáveis: {"{NOME_PACIENTE}"}, {"{CPF_PACIENTE}"}, {"{IDADE_PACIENTE}"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Textarea
                value={atestadoTemplate}
                onChange={(e) => setAtestadoTemplate(e.target.value)}
                placeholder={defaultAtestadoTemplate}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: {"{NOME_PACIENTE}"}, {"{CPF_PACIENTE}"}, {"{IDADE_PACIENTE}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAtestadoTemplate(defaultAtestadoTemplate);
                localStorage.setItem('atestadoTemplate', defaultAtestadoTemplate);
                toast.success("Template resetado para o padrão!");
              }}
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditAtestadoTemplateOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveAtestadoTemplate}>
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Template de Declaração */}
      <Dialog open={editDeclaracaoTemplateOpen} onOpenChange={setEditDeclaracaoTemplateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-teal-500" />
              Editar Template de Declaração
            </DialogTitle>
            <DialogDescription>
              Personalize o template da declaração de comparecimento. Use as variáveis: {"{NOME_PACIENTE}"}, {"{CPF_PACIENTE}"}, {"{IDADE_PACIENTE}"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Textarea
                value={declaracaoTemplate}
                onChange={(e) => setDeclaracaoTemplate(e.target.value)}
                placeholder={defaultDeclaracaoTemplate}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: {"{NOME_PACIENTE}"}, {"{CPF_PACIENTE}"}, {"{IDADE_PACIENTE}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeclaracaoTemplate(defaultDeclaracaoTemplate);
                localStorage.setItem('declaracaoTemplate', defaultDeclaracaoTemplate);
                toast.success("Template resetado para o padrão!");
              }}
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditDeclaracaoTemplateOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveDeclaracaoTemplate}>
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Telemedicina WebRTC */}
      <Dialog open={telemedicinaOpen} onOpenChange={(open) => {
        setTelemedicinaOpen(open);
        if (!open) {
          setTelemedicinaRoomId("");
          setTelemedicinaRoomLink("");
        }
      }}>
        <DialogContent className="max-w-7xl w-full h-[92vh] p-0 bg-transparent border-0 [&>button]:hidden">
          {selectedPatient && (
            <Telemedicina
              patientName={selectedPatient.name}
              doctorName="Dr. João Santos"
              roomId={telemedicinaRoomId}
              isDoctor={true}
              onClose={() => {
                setTelemedicinaOpen(false);
                setTelemedicinaRoomId("");
                setTelemedicinaRoomLink("");
              }}
              onRoomCreated={(roomId, roomLink) => {
                setTelemedicinaRoomId(roomId);
                setTelemedicinaRoomLink(roomLink);
                toast.success("Sala de telemedicina criada! Compartilhe o link com o paciente.");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Consulta;
