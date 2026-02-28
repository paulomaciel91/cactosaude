import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Copy,
  LinkIcon,
  MonitorUp,
  MonitorOff,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface TelemedicinaProps {
  patientName: string;
  doctorName?: string;
  roomId?: string;
  onClose: () => void;
  onRoomCreated?: (roomId: string, roomLink: string) => void;
  isDoctor?: boolean; // Indica se é o médico (true) ou paciente (false)
}

export const Telemedicina = ({
  patientName,
  doctorName = "Dr. João Santos",
  roomId: initialRoomId,
  onClose,
  onRoomCreated,
  isDoctor = true,
}: TelemedicinaProps) => {
  const [roomId, setRoomId] = useState<string>(initialRoomId || "");
  const [roomLink, setRoomLink] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<number>(1);
  const hasSentOfferRef = useRef<boolean>(false);
  const hasReceivedOfferRef = useRef<boolean>(false);
  const isTogglingCameraRef = useRef<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const signalingChannelRef = useRef<BroadcastChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedMessageRef = useRef<string>("");
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const participantIdRef = useRef<string>(uuidv4());
  const handleOfferRef = useRef<((offer: RTCSessionDescriptionInit) => Promise<void>) | null>(null);
  const handleAnswerRef = useRef<((answer: RTCSessionDescriptionInit) => Promise<void>) | null>(null);
  const handleIceCandidateRef = useRef<((candidate: RTCIceCandidateInit) => Promise<void>) | null>(null);
  const sendSignalingMessageRef = useRef<((type: string, data: any) => void) | null>(null);

  // Sinalização usando localStorage + polling para funcionar entre diferentes abas
  // TODO: Quando o backend for criado, substituir por Supabase Realtime
  const initializeSignaling = useCallback(() => {
    if (!roomId) return;

    const storageKey = `telemedicina-signaling-${roomId}`;
    const participantKey = `telemedicina-participants-${roomId}`;

    // Criar canal de sinalização usando BroadcastChannel (para mesma aba)
    const channel = new BroadcastChannel(`telemedicina-${roomId}`);
    signalingChannelRef.current = channel;

    // Função para enviar mensagem via localStorage
    const sendMessage = (type: string, data: any) => {
      const message = {
        id: uuidv4(),
        type,
        data,
        from: participantIdRef.current,
        timestamp: Date.now(),
      };
      
      try {
        const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");
        messages.push(message);
        // Manter apenas últimas 50 mensagens
        const recentMessages = messages.slice(-50);
        localStorage.setItem(storageKey, JSON.stringify(recentMessages));
        
        // Também enviar via BroadcastChannel para mesma aba (se ainda estiver aberto)
        try {
          channel.postMessage(message);
        } catch (error: any) {
          // Se o canal estiver fechado, apenas logar (não é crítico, pois localStorage já foi atualizado)
          if (error.name !== "InvalidStateError") {
            console.warn("⚠️ Erro ao enviar mensagem via BroadcastChannel:", error);
          }
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    };

    // Função para processar mensagens
    const processMessage = async (message: any) => {
      // Ignorar mensagens próprias
      if (message.from === participantIdRef.current) {
        return;
      }
      
      // Ignorar mensagens já processadas
      if (!message.id || processedMessageIdsRef.current.has(message.id)) {
        return;
      }
      
      processedMessageIdsRef.current.add(message.id);
      // Manter apenas últimos 100 IDs para não consumir muita memória
      if (processedMessageIdsRef.current.size > 100) {
        const firstId = Array.from(processedMessageIdsRef.current)[0];
        processedMessageIdsRef.current.delete(firstId);
      }

      const { type, data } = message;
      console.log(`📨 Processando mensagem: ${type}`, { messageId: message.id, from: message.from });

      // Desserializar dados corretamente
      let processedData: any = data;
      
      if (type === "offer" || type === "answer") {
        // Criar RTCSessionDescription a partir dos dados serializados
        if (data && data.type && data.sdp) {
          processedData = {
            type: data.type,
            sdp: data.sdp,
          } as RTCSessionDescriptionInit;
          console.log(`✅ Dados ${type} desserializados`, { type: processedData.type, sdpLength: processedData.sdp?.length });
        } else {
          console.warn(`⚠️ Dados ${type} inválidos:`, data);
          return;
        }
      } else if (type === "ice-candidate") {
        // Criar RTCIceCandidateInit a partir dos dados serializados
        if (data && (data.candidate || data.candidate === null)) {
          processedData = {
            candidate: data.candidate,
            sdpMLineIndex: data.sdpMLineIndex,
            sdpMid: data.sdpMid,
          } as RTCIceCandidateInit;
        } else {
          console.warn("⚠️ Dados ice-candidate inválidos:", data);
          return;
        }
      }

      if (type === "offer" && handleOfferRef.current) {
        await handleOfferRef.current(processedData);
      } else if (type === "answer" && handleAnswerRef.current) {
        await handleAnswerRef.current(processedData);
      } else if (type === "ice-candidate" && handleIceCandidateRef.current) {
        await handleIceCandidateRef.current(processedData);
      } else if (type === "participant-joined") {
        setParticipants((prev) => {
          const newCount = prev + 1;
          if (newCount > prev) {
            toast.success("Participante entrou na sala");
          }
          return newCount;
        });
      } else if (type === "participant-left") {
        setParticipants((prev) => Math.max(1, prev - 1));
        toast.info("Participante saiu da sala");
      }
    };

    // Listener para BroadcastChannel (mesma aba)
    channel.onmessage = async (event) => {
      await processMessage(event.data);
    };

    // Polling para localStorage (diferentes abas)
    pollingIntervalRef.current = setInterval(() => {
      try {
        const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");
        // Processar apenas mensagens novas (não processadas)
        messages.forEach((msg: any) => {
          if (msg.id && !processedMessageIdsRef.current.has(msg.id) && msg.from !== participantIdRef.current) {
            // Processar mensagem de forma assíncrona
            processMessage(msg).catch((error) => {
              console.error("Erro ao processar mensagem:", error);
            });
          }
        });
      } catch (error) {
        console.error("Erro ao ler mensagens:", error);
      }
    }, 200); // Polling a cada 200ms para resposta mais rápida

    // Listener para storage events (mudanças em outras abas)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const messages = JSON.parse(e.newValue);
          // Processar todas as mensagens novas
          messages.forEach((msg: any) => {
            if (msg.id && !processedMessageIdsRef.current.has(msg.id) && msg.from !== participantIdRef.current) {
              processMessage(msg);
            }
          });
        } catch (error) {
          console.error("Erro ao processar storage event:", error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Notificar entrada na sala
    sendMessage("participant-joined", { roomId });

    // Atualizar lista de participantes
    const updateParticipants = () => {
      try {
        const participants = JSON.parse(localStorage.getItem(participantKey) || "[]");
        if (!participants.includes(participantIdRef.current)) {
          participants.push(participantIdRef.current);
          localStorage.setItem(participantKey, JSON.stringify(participants));
          console.log(`✅ Participante adicionado: ${participantIdRef.current}`);
        }
        const uniqueParticipants = [...new Set(participants)];
        setParticipants(uniqueParticipants.length);
        console.log(`👥 Total de participantes na sala: ${uniqueParticipants.length}`, uniqueParticipants);
        
        // Se há mais de 1 participante, tentar iniciar conexão imediatamente
        if (uniqueParticipants.length > 1 && localStreamRef.current && peerConnectionRef.current) {
          console.log("🚀 Detectados múltiplos participantes, tentando iniciar conexão...");
          // Aguardar um pouco para garantir que ambos estão prontos
          setTimeout(() => {
            if (!hasSentOfferRef.current && !hasReceivedOfferRef.current) {
              console.log("📤 Criando oferta inicial...");
              const pc = peerConnectionRef.current;
              if (localStreamRef.current) {
                const senders = pc.getSenders();
                localStreamRef.current.getTracks().forEach((track) => {
                  const sender = senders.find((s) => s.track === track);
                  if (!sender && track.readyState === "live") {
                    pc.addTrack(track, localStreamRef.current!);
                    console.log(`✅ Track ${track.kind} adicionado: ${track.id}`);
                  }
                });
              }
              
              const finalSenders = pc.getSenders();
              if (finalSenders.length > 0) {
                pc.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true,
                }).then(async (offer) => {
                  await pc.setLocalDescription(offer);
                  if (sendSignalingMessageRef.current) {
                    sendSignalingMessageRef.current("offer", offer);
                    console.log("📤 Oferta criada e enviada (detecção de participantes)");
                    hasSentOfferRef.current = true;
                    setConnectionStatus("connecting");
                    toast.info("Conectando com participante...");
                  }
                }).catch((error) => {
                  console.error("❌ Erro ao criar oferta (detecção de participantes):", error);
                });
              }
            }
          }, 500);
        }
      } catch (error) {
        console.error("Erro ao atualizar participantes:", error);
      }
    };
    
    updateParticipants();
    
    // Verificar participantes periodicamente
    const participantCheckInterval = setInterval(() => {
      updateParticipants();
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (participantCheckInterval) {
        clearInterval(participantCheckInterval);
      }
      // Notificar saída
      sendMessage("participant-left", { roomId });
      try {
        const participants = JSON.parse(localStorage.getItem(participantKey) || "[]");
        const updated = participants.filter((id: string) => id !== participantIdRef.current);
        localStorage.setItem(participantKey, JSON.stringify(updated));
        console.log(`👋 Participante removido: ${participantIdRef.current}`);
      } catch (error) {
        console.error("Erro ao remover participante:", error);
      }
    };
  }, [roomId]);

  // Criar ou usar sala existente
  useEffect(() => {
    if (!roomId) {
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      const link = `${window.location.origin}/telemedicina/${newRoomId}`;
      setRoomLink(link);
      if (onRoomCreated) {
        onRoomCreated(newRoomId, link);
      }
    } else {
      const link = `${window.location.origin}/telemedicina/${roomId}`;
      setRoomLink(link);
    }
  }, [roomId, onRoomCreated]);

  // Função helper para enviar mensagens via sinalização
  const sendSignalingMessage = useCallback((type: string, data: any) => {
    if (!roomId) {
      console.warn("⚠️ Tentando enviar mensagem sem roomId");
      return;
    }

    const storageKey = `telemedicina-signaling-${roomId}`;
    
    // Serializar dados corretamente para JSON
    let serializedData: any;
    if (data instanceof RTCSessionDescription) {
      serializedData = {
        type: data.type,
        sdp: data.sdp,
      };
    } else if (data instanceof RTCIceCandidate) {
      serializedData = {
        candidate: data.candidate,
        sdpMLineIndex: data.sdpMLineIndex,
        sdpMid: data.sdpMid,
      };
    } else if (data && typeof data === 'object') {
      // Se já é um objeto serializável, usar diretamente
      serializedData = {
        type: data.type,
        sdp: data.sdp,
        candidate: data.candidate,
        sdpMLineIndex: data.sdpMLineIndex,
        sdpMid: data.sdpMid,
        ...data,
      };
    } else {
      serializedData = data;
    }
    
    const message = {
      id: uuidv4(),
      type,
      data: serializedData,
      from: participantIdRef.current,
      timestamp: Date.now(),
    };
    
    try {
      const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");
      messages.push(message);
      // Manter apenas últimas 100 mensagens para garantir que não perdemos mensagens importantes
      const recentMessages = messages.slice(-100);
      localStorage.setItem(storageKey, JSON.stringify(recentMessages));
      console.log(`📤 Mensagem ${type} enviada`, { messageId: message.id, from: message.from });
      
      // Também enviar via BroadcastChannel para mesma aba (se ainda estiver aberto)
      try {
        if (signalingChannelRef.current) {
          signalingChannelRef.current.postMessage(message);
        }
      } catch (error: any) {
        // Se o canal estiver fechado, apenas logar (não é crítico, pois localStorage já foi atualizado)
        if (error.name !== "InvalidStateError") {
          console.warn("⚠️ Erro ao enviar mensagem via BroadcastChannel:", error);
        }
      }
    } catch (error: any) {
      console.error("❌ Erro ao enviar mensagem:", error);
      console.error("Dados que causaram erro:", { type, data });
    }
  }, [roomId]);

  // Inicializar sinalização quando roomId estiver disponível
  useEffect(() => {
    if (roomId) {
      const cleanup = initializeSignaling();
      return cleanup;
    }
  }, [roomId, initializeSignaling]);

  // Configurar WebRTC Peer Connection
  const createPeerConnection = useCallback(() => {
    // Fechar conexão anterior se existir
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Configuração completa de ICE servers (STUN + TURN) para conexão P2P real
    // IMPORTANTE: Para funcionar localmente, é necessário HTTPS ou localhost
    const configuration: RTCConfiguration = {
      iceServers: [
        // STUN servers (gratuitos, públicos)
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.voiparound.com" },
        { urls: "stun:stun.voipbuster.com" },
        { urls: "stun:stun.voipstunt.com" },
        { urls: "stun:stun.voxgratia.org" },
        // TURN servers públicos (limitados, mas funcionam para testes)
        // Nota: Para produção, use servidores TURN próprios ou pagos
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
      // Configurações adicionais para melhor conexão
      iceCandidatePoolSize: 10, // Coleta mais candidatos ICE
    };
    
    console.log("🔧 Configuração WebRTC criada com", configuration.iceServers.length, "servidores ICE");

    const pc = new RTCPeerConnection(configuration);

    // Adicionar stream local se disponível
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          pc.addTrack(track, localStreamRef.current!);
          console.log(`✅ Track ${track.kind} adicionado ao peer connection`);
        }
      });
    }

    // Receber stream remoto - CONFIGURAR ANTES DE QUALQUER OPERAÇÃO
    pc.ontrack = (event) => {
      console.log("📹 ========== EVENTO ONTRACK DISPARADO ==========");
      console.log("📹 Detalhes do evento:", {
        streams: event.streams?.length || 0,
        track: event.track?.kind,
        trackId: event.track?.id,
        trackState: event.track?.readyState,
        trackEnabled: event.track?.enabled,
        trackMuted: event.track?.muted,
        receiver: event.receiver?.track?.kind,
        transceiver: event.transceiver?.direction,
      });

      // Sempre usar o stream do evento se disponível
      let streamToUse: MediaStream | null = null;

      if (event.streams && event.streams.length > 0) {
        // Usar o primeiro stream disponível
        streamToUse = event.streams[0];
        console.log(`✅ Stream remoto encontrado: ${streamToUse.id} com ${streamToUse.getTracks().length} tracks`);
        
        // Verificar tracks existentes no stream
        streamToUse.getTracks().forEach((track) => {
          console.log(`  Track existente: ${track.kind}, id: ${track.id}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        });
      } else if (event.track) {
        // Se não há stream, criar um novo com o track recebido
        streamToUse = new MediaStream([event.track]);
        console.log(`✅ Criado novo stream com track ${event.track.kind}`);
      }

      if (streamToUse && streamToUse.getTracks().length > 0) {
        console.log("📹 Processando stream remoto:", {
          streamId: streamToUse.id,
          tracks: streamToUse.getTracks().map(t => ({ 
            kind: t.kind, 
            id: t.id, 
            enabled: t.enabled, 
            readyState: t.readyState,
            muted: t.muted,
          })),
        });

        // Combinar tracks do stream atual com os novos tracks
        setRemoteStream((prevStream) => {
          const combinedStream = new MediaStream();
          
          // Adicionar tracks do stream anterior (se existir)
          if (prevStream) {
            prevStream.getTracks().forEach((track) => {
              // Verificar se o track ainda está ativo
              if (track.readyState === "live") {
                combinedStream.addTrack(track);
                console.log(`✅ Track ${track.kind} mantido do stream anterior: ${track.id}`);
              }
            });
          }
          
          // Adicionar novos tracks do evento
          streamToUse.getTracks().forEach((track) => {
            const existingTrack = combinedStream.getTracks().find((t) => t.id === track.id);
            if (!existingTrack) {
              combinedStream.addTrack(track);
              console.log(`✅ Track ${track.kind} adicionado do evento ontrack: ${track.id}`);
            } else {
              console.log(`ℹ️ Track ${track.kind} já existe no stream combinado: ${track.id}`);
            }
          });
          
          // Adicionar listeners para rastrear mudanças nos tracks
          combinedStream.getTracks().forEach((track) => {
            if (!track.onended) {
              track.onended = () => {
                console.log(`🛑 Track ${track.kind} terminado: ${track.id}`);
              };
            }
            if (!track.onmute) {
              track.onmute = () => {
                console.log(`🔇 Track ${track.kind} mutado: ${track.id}`);
              };
            }
            if (!track.onunmute) {
              track.onunmute = () => {
                console.log(`🔊 Track ${track.kind} desmutado: ${track.id}`);
              };
            }
          });

          console.log("📹 Stream remoto combinado criado:", {
            streamId: combinedStream.id,
            tracks: combinedStream.getTracks().length,
            videoTracks: combinedStream.getVideoTracks().length,
            audioTracks: combinedStream.getAudioTracks().length,
          });

          return combinedStream;
        });
        
        console.log("✅ Stream remoto atualizado no estado - useEffect vai atualizar o vídeo");
        
        // Mostrar toast baseado no tipo de track recebido
        const videoTracks = streamToUse.getVideoTracks();
        const audioTracks = streamToUse.getAudioTracks();
        
        if (videoTracks.length > 0 && audioTracks.length > 0) {
          toast.success("Vídeo e áudio do participante conectados!");
        } else if (videoTracks.length > 0) {
          toast.success("Vídeo do participante conectado!");
        } else if (audioTracks.length > 0) {
          toast.success("Áudio do participante conectado!");
        }
      } else {
        console.warn("⚠️ Nenhum stream ou track disponível no evento ontrack");
      }
    };

    // Gerenciar candidatos ICE - CRÍTICO para conexão P2P
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate;
        console.log("🧊 Candidato ICE gerado:", {
          candidate: candidate.candidate?.substring(0, 80) || "null",
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
          type: candidate.type || "unknown",
        });
        
        // Enviar candidato via sinalização
        sendSignalingMessage("ice-candidate", candidate);
      } else {
        console.log("✅ Todos os candidatos ICE foram coletados (null candidate)");
        // Enviar candidato null para indicar fim da coleta
        sendSignalingMessage("ice-candidate", { candidate: null });
      }
    };
    
    // Log quando candidatos ICE são coletados
    pc.onicegatheringstatechange = () => {
      console.log(`🧊 Estado de coleta ICE: ${pc.iceGatheringState}`);
      if (pc.iceGatheringState === "complete") {
        console.log("✅ Coleta de candidatos ICE completa");
      }
    };

    // Gerenciar mudanças de conexão
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      const iceState = pc.iceConnectionState;
      console.log(`🔌 Estado da conexão: ${state}, ICE: ${iceState}`);
      
      if (state === "connected") {
        setConnectionStatus("connected");
        setIsConnected(true);
        console.log("✅✅✅ CONEXÃO ESTABELECIDA! ✅✅✅");
        toast.success("Conexão estabelecida!");
      } else if (state === "disconnected" || state === "failed") {
        setConnectionStatus("disconnected");
        setIsConnected(false);
        if (state === "failed") {
          console.error("❌ Conexão falhou");
          toast.error("Conexão falhou. Tentando reconectar...");
        } else {
          console.warn("⚠️ Conexão perdida");
          toast.error("Conexão perdida");
        }
      } else if (state === "connecting") {
        console.log("🔄 Conectando...");
        setConnectionStatus("connecting");
      } else if (state === "closed") {
        console.log("🛑 Conexão fechada");
        setConnectionStatus("disconnected");
        setIsConnected(false);
      }
    };
    
    // Gerenciar mudanças de ICE connection (mais específico)
    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      console.log(`🧊 Estado ICE: ${iceState}`);
      
      if (iceState === "connected" || iceState === "completed") {
        console.log("✅✅✅ ICE CONECTADO! ✅✅✅");
        if (pc.connectionState === "connected") {
          setConnectionStatus("connected");
          setIsConnected(true);
          toast.success("Conexão estabelecida!");
        }
      } else if (iceState === "failed") {
        console.error("❌ ICE falhou");
        setConnectionStatus("error");
        toast.error("Falha na conexão de rede");
      } else if (iceState === "disconnected") {
        console.warn("⚠️ ICE desconectado");
        setConnectionStatus("disconnected");
      } else if (iceState === "checking") {
        console.log("🔄 ICE verificando...");
        setConnectionStatus("connecting");
      }
    };

    // Gerenciar mudanças de sinalização
    pc.onsignalingstatechange = () => {
      console.log(`📡 Estado de sinalização: ${pc.signalingState}`);
    };


    peerConnectionRef.current = pc;
    return pc;
  }, [roomId, sendSignalingMessage]);

  // Iniciar mídia local
  const startLocalMedia = useCallback(async () => {
    try {
      // Parar stream anterior se existir
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // Solicitar mídia com configurações específicas para melhor qualidade
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsMicOn(true);
      setIsCameraOn(true);

      // Atualizar vídeo local imediatamente
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => {
          console.error("Erro ao reproduzir vídeo local:", err);
        });
      }

      // Criar peer connection ANTES de adicionar tracks
      const pc = createPeerConnection();
      
      // Aguardar um pouco para garantir que o peer connection está pronto
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Garantir que os tracks estão adicionados ANTES de criar a oferta
      if (localStreamRef.current) {
        const tracks = localStreamRef.current.getTracks();
        console.log(`📹 Adicionando ${tracks.length} tracks ao peer connection...`);
        
        tracks.forEach((track) => {
          if (track.readyState === "live") {
            try {
              // Verificar se já existe sender para este track
              const existingSender = pc.getSenders().find((s) => s.track === track);
              if (!existingSender) {
                pc.addTrack(track, localStreamRef.current!);
                console.log(`✅ Track ${track.kind} adicionado ao peer connection: ${track.id}`);
              } else {
                console.log(`ℹ️ Track ${track.kind} já está no peer connection: ${track.id}`);
              }
            } catch (error) {
              console.error(`❌ Erro ao adicionar track ${track.kind}:`, error);
            }
          } else {
            console.warn(`⚠️ Track ${track.kind} não está live: ${track.readyState}`);
          }
        });
      }

      // Verificar senders após adicionar tracks
      const senders = pc.getSenders();
      console.log(`📊 Total de senders no peer connection: ${senders.length}`);
      senders.forEach((sender, index) => {
        console.log(`  Sender ${index + 1}: ${sender.track?.kind} (${sender.track?.id})`);
      });

      // Aguardar um pouco antes de criar oferta para garantir que o canal está pronto
      setTimeout(async () => {
        try {
          // Verificar se ainda temos tracks antes de criar oferta
          if (!localStreamRef.current || localStreamRef.current.getTracks().length === 0) {
            console.error("❌ Nenhum track disponível para criar oferta");
            toast.error("Erro: nenhum stream de mídia disponível");
            return;
          }

          // Verificar novamente os senders
          const finalSenders = pc.getSenders();
          console.log(`📊 Senders finais antes de criar oferta: ${finalSenders.length}`);
          
          if (finalSenders.length === 0) {
            console.error("❌ Nenhum sender no peer connection após tentativas");
            toast.error("Erro: não foi possível adicionar tracks à conexão");
            return;
          }

          // Criar oferta
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          console.log("✅ Oferta criada:", {
            type: offer.type,
            sdpLength: offer.sdp?.length,
            hasAudio: offer.sdp?.includes("audio"),
            hasVideo: offer.sdp?.includes("video"),
          });
          
          await pc.setLocalDescription(offer);
          console.log("✅ Descrição local definida");

          // Enviar oferta via canal de sinalização
          sendSignalingMessage("offer", offer);
          hasSentOfferRef.current = true;
          console.log("📤 Oferta enviada via sinalização");

          setConnectionStatus("connecting");
          toast.success("Mídia local iniciada. Aguardando participante...");
        } catch (error: any) {
          console.error("❌ Erro ao criar oferta:", error);
          toast.error(`Erro ao iniciar conexão: ${error.message || "Erro desconhecido"}`);
          setConnectionStatus("error");
        }
      }, 500); // Reduzir delay para resposta mais rápida
    } catch (error: any) {
      console.error("Erro ao acessar mídia:", error);
      toast.error(
        error.name === "NotAllowedError"
          ? "Permissão de câmera/microfone negada. Permita o acesso nas configurações do navegador."
          : error.name === "NotFoundError"
          ? "Câmera ou microfone não encontrado. Verifique se os dispositivos estão conectados."
          : "Erro ao acessar câmera/microfone"
      );
      setConnectionStatus("error");
    }
  }, [createPeerConnection, roomId, sendSignalingMessage]);

  // Lidar com oferta recebida
  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      try {
        // Se já temos uma conexão, não processar nova oferta
        if (peerConnectionRef.current?.connectionState === "connected") {
          return;
        }

        hasReceivedOfferRef.current = true;

        // Se não temos mídia local ainda, iniciar primeiro
        if (!localStreamRef.current) {
          console.log("🎥 Iniciando mídia local ao receber oferta...");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          localStreamRef.current = stream;
          setLocalStream(stream);
          setIsMicOn(true);
          setIsCameraOn(true);
          console.log(`✅ Mídia local iniciada: ${stream.getTracks().length} tracks`);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch((err) => {
              console.error("Erro ao reproduzir vídeo:", err);
            });
          }
        }

        // Criar ou reutilizar peer connection
        let pc = peerConnectionRef.current;
        if (!pc) {
          console.log("🔄 Criando novo peer connection para processar oferta");
          pc = createPeerConnection();
          // Aguardar um pouco para garantir que o peer connection está pronto
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Garantir que os tracks locais estão adicionados ANTES de processar a oferta
        if (localStreamRef.current) {
          const tracks = localStreamRef.current.getTracks();
          console.log(`📹 Tracks locais disponíveis: ${tracks.length}`);
          
          tracks.forEach((track) => {
            if (track.readyState === "live") {
              try {
                const sender = pc.getSenders().find((s) => s.track === track);
                if (!sender) {
                  pc.addTrack(track, localStreamRef.current!);
                  console.log(`✅ Track ${track.kind} adicionado ao processar oferta: ${track.id}`);
                } else {
                  console.log(`ℹ️ Track ${track.kind} já está no peer connection: ${track.id}`);
                }
              } catch (error) {
                console.error(`❌ Erro ao adicionar track ${track.kind}:`, error);
              }
            } else {
              console.warn(`⚠️ Track ${track.kind} não está live: ${track.readyState}`);
            }
          });
        } else {
          console.warn("⚠️ Nenhum stream local disponível ao processar oferta");
        }
        
        // Verificar senders antes de processar oferta
        const sendersBefore = pc.getSenders();
        console.log(`📊 Senders antes de processar oferta: ${sendersBefore.length}`);
        sendersBefore.forEach((sender, index) => {
          console.log(`  Sender ${index + 1}: ${sender.track?.kind} (${sender.track?.id})`);
        });
        
        // Processar oferta remota
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("✅ Oferta remota processada", {
          type: offer.type,
          sdpLength: offer.sdp?.length,
          hasAudio: offer.sdp?.includes("audio"),
          hasVideo: offer.sdp?.includes("video"),
        });

        // Processar candidatos ICE pendentes agora que temos descrição remota
        if (pendingIceCandidatesRef.current.length > 0) {
          console.log(`📦 Processando ${pendingIceCandidatesRef.current.length} candidatos ICE pendentes após definir descrição remota...`);
          const candidates = [...pendingIceCandidatesRef.current];
          pendingIceCandidatesRef.current = [];
          
          for (const candidate of candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log("✅ Candidato ICE pendente processado:", candidate.candidate?.substring(0, 50) || "null");
            } catch (error: any) {
              if (error.name !== "OperationError" && error.name !== "InvalidStateError") {
                console.error("❌ Erro ao processar candidato ICE pendente:", error);
              }
            }
          }
        }

        // Verificar senders após processar oferta
        const sendersAfter = pc.getSenders();
        console.log(`📊 Senders após processar oferta: ${sendersAfter.length}`);
        sendersAfter.forEach((sender, index) => {
          console.log(`  Sender ${index + 1}: ${sender.track?.kind} (${sender.track?.id})`);
        });

        // Criar resposta
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        
        console.log("✅ Resposta criada:", {
          type: answer.type,
          sdpLength: answer.sdp?.length,
          hasAudio: answer.sdp?.includes("audio"),
          hasVideo: answer.sdp?.includes("video"),
        });
        
        await pc.setLocalDescription(answer);
        console.log("✅ Descrição local definida (resposta)");

        // Enviar resposta via canal de sinalização
        sendSignalingMessage("answer", answer);
        console.log("📤 Resposta enviada via sinalização");

        setConnectionStatus("connecting");
        toast.info("Conectando com participante...");
      } catch (error) {
        console.error("Erro ao processar oferta:", error);
        toast.error("Erro ao processar conexão");
        setConnectionStatus("error");
      }
    },
    [isCameraOn, isMicOn, createPeerConnection, roomId, sendSignalingMessage]
  );

  // Lidar com resposta recebida
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (!peerConnectionRef.current) {
        console.warn("⚠️ Peer connection não existe ao receber resposta");
        return;
      }

      const pc = peerConnectionRef.current;
      const currentState = pc.signalingState;
      console.log(`📡 Processando resposta. Estado atual: ${currentState}`);
      
      // Só processar resposta se estiver no estado correto
      if (currentState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Resposta processada com sucesso");
        
        // Processar candidatos ICE pendentes agora que temos descrição remota
        if (pendingIceCandidatesRef.current.length > 0) {
          console.log(`📦 Processando ${pendingIceCandidatesRef.current.length} candidatos ICE pendentes após receber resposta...`);
          const candidates = [...pendingIceCandidatesRef.current];
          pendingIceCandidatesRef.current = [];
          
          for (const candidate of candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log("✅ Candidato ICE pendente processado:", candidate.candidate?.substring(0, 50) || "null");
            } catch (error: any) {
              if (error.name !== "OperationError" && error.name !== "InvalidStateError") {
                console.error("❌ Erro ao processar candidato ICE pendente:", error);
              }
            }
          }
        }
        
        toast.success("Resposta recebida, estabelecendo conexão...");
      } else if (currentState === "stable") {
        // Se está estável, pode ser que já processamos, mas tentar novamente
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Resposta processada (estado estável)");
        
        // Processar candidatos ICE pendentes
        if (pendingIceCandidatesRef.current.length > 0) {
          const candidates = [...pendingIceCandidatesRef.current];
          pendingIceCandidatesRef.current = [];
          
          for (const candidate of candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error: any) {
              // Ignorar erros de operação
            }
          }
        }
      } else {
        console.warn(`⚠️ Estado incorreto para processar resposta: ${currentState}`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao processar resposta:", error);
      if (error.name === "InvalidStateError") {
        console.warn("⚠️ Estado inválido, tentando criar nova conexão...");
        // Tentar criar nova conexão se necessário
      } else {
        toast.error("Erro ao processar resposta da conexão");
      }
    }
  }, []);

  // Armazenar candidatos ICE pendentes
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Lidar com candidato ICE recebido - CRÍTICO para conexão P2P
  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        // Se candidato é null, significa fim da coleta
        if (!candidate.candidate) {
          console.log("✅ Recebido fim da coleta de candidatos ICE (null candidate)");
          return;
        }
        
        if (!peerConnectionRef.current) {
          console.warn("⚠️ Peer connection não existe ao receber candidato ICE, armazenando...");
          pendingIceCandidatesRef.current.push(candidate);
          return;
        }

        const pc = peerConnectionRef.current;
        const remoteDescription = pc.remoteDescription;
        const signalingState = pc.signalingState;
        
        console.log(`🧊 Processando candidato ICE:`, {
          candidate: candidate.candidate?.substring(0, 80) || "null",
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
          temDescricaoRemota: !!remoteDescription,
          estadoSinalizacao: signalingState,
        });
        
        // Se temos descrição remota ou candidato é null (fim dos candidatos), adicionar imediatamente
        if (remoteDescription || !candidate.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ Candidato ICE adicionado com sucesso:", candidate.candidate?.substring(0, 50) || "null");
          } catch (error: any) {
            // Ignorar erros de operação inválida (candidato já adicionado ou estado incorreto)
            if (error.name !== "OperationError" && error.name !== "InvalidStateError" && error.name !== "TypeError") {
              console.error("❌ Erro ao adicionar candidato ICE:", error);
            } else {
              console.log(`ℹ️ Candidato ICE ignorado (${error.name}):`, candidate.candidate?.substring(0, 50) || "null");
            }
          }
        } else {
          // Armazenar candidato para adicionar depois quando descrição remota estiver disponível
          console.log("⏳ Armazenando candidato ICE pendente (aguardando descrição remota)");
          pendingIceCandidatesRef.current.push(candidate);
        }
      } catch (error: any) {
        if (error.name !== "OperationError" && error.name !== "InvalidStateError") {
          console.error("❌ Erro ao processar candidato ICE:", error);
        }
      }
    },
    []
  );

  // Processar candidatos ICE pendentes quando descrição remota for definida
  useEffect(() => {
    if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription && pendingIceCandidatesRef.current.length > 0) {
      const pc = peerConnectionRef.current;
      const candidates = [...pendingIceCandidatesRef.current];
      pendingIceCandidatesRef.current = [];
      
      console.log(`📦 Processando ${candidates.length} candidatos ICE pendentes...`);
      candidates.forEach(async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ Candidato ICE pendente adicionado:", candidate.candidate?.substring(0, 50) || "null");
        } catch (error: any) {
          if (error.name !== "OperationError" && error.name !== "InvalidStateError") {
            console.error("❌ Erro ao adicionar candidato ICE pendente:", error);
          }
        }
      });
    }
  }, [remoteStream]); // Executar quando stream remoto for recebido (indica que descrição foi definida)

  // Atualizar refs das funções de handler
  useEffect(() => {
    handleOfferRef.current = handleOffer;
    handleAnswerRef.current = handleAnswer;
    handleIceCandidateRef.current = handleIceCandidate;
    sendSignalingMessageRef.current = sendSignalingMessage;
  }, [handleOffer, handleAnswer, handleIceCandidate, sendSignalingMessage]);

  // Verificar HTTPS/localhost - REQUISITO para WebRTC funcionar localmente
  useEffect(() => {
    const isSecure = window.location.protocol === "https:" || 
                     window.location.hostname === "localhost" || 
                     window.location.hostname === "127.0.0.1" ||
                     window.location.hostname.endsWith(".localhost");
    
    if (!isSecure) {
      console.warn("⚠️ WebRTC requer HTTPS ou localhost para funcionar corretamente!");
      toast.warning(
        "⚠️ WebRTC requer HTTPS ou localhost. Use 'npm run dev' com HTTPS ou acesse via localhost.",
        { duration: 10000 }
      );
    } else {
      console.log("✅ Ambiente seguro detectado (HTTPS/localhost)");
    }
  }, []);

  // Iniciar conexão quando componente montar
  useEffect(() => {
    let isMounted = true;
    
    const initializeMedia = async () => {
      if (roomId && !localStreamRef.current && isMounted) {
        await startLocalMedia();
        
        // Após iniciar mídia, verificar periodicamente se há outros participantes
        const checkParticipantsInterval = setInterval(() => {
          if (!isMounted) {
            clearInterval(checkParticipantsInterval);
            return;
          }

          // Verificar se já temos conexão estabelecida
          const connectionState = peerConnectionRef.current?.connectionState;
          if (connectionState === "connected" || connectionState === "closed") {
            console.log(`✅ Conexão estabelecida (${connectionState}), parando verificação`);
            clearInterval(checkParticipantsInterval);
            return;
          }

          const participantKey = `telemedicina-participants-${roomId}`;
          const storageKey = `telemedicina-signaling-${roomId}`;
          
          try {
            const participants = JSON.parse(localStorage.getItem(participantKey) || "[]");
            const uniqueParticipants = [...new Set(participants)];
            const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");
            
            // Verificar se há ofertas pendentes
            const hasPendingOffer = messages.some((msg: any) => 
              msg.type === "offer" && 
              msg.from !== participantIdRef.current &&
              !processedMessageIdsRef.current.has(msg.id)
            );
            
            console.log(`👥 Verificando conexão (${new Date().toLocaleTimeString()}):`, {
              participantes: uniqueParticipants.length,
              listaParticipantes: uniqueParticipants,
              meuId: participantIdRef.current,
              temOfertaPendente: hasPendingOffer,
              jaEnviouOferta: hasSentOfferRef.current,
              jaRecebeuOferta: hasReceivedOfferRef.current,
              estadoConexao: connectionState,
              temPeerConnection: !!peerConnectionRef.current,
              temLocalStream: !!localStreamRef.current,
            });
            
            // Se há oferta pendente, não criar nova - apenas processar a existente
            if (hasPendingOffer) {
              console.log("ℹ️ Há oferta pendente, aguardando processamento...");
              return;
            }
            
            // Se há mais de 1 participante e ainda não enviamos/recebemos oferta
            if (uniqueParticipants.length > 1 && peerConnectionRef.current && localStreamRef.current) {
              if (!hasReceivedOfferRef.current && !hasSentOfferRef.current) {
                console.log("🚀 Criando oferta inicial (verificação periódica)...");
                const pc = peerConnectionRef.current;
                
                // Garantir que os tracks estão adicionados
                const senders = pc.getSenders();
                localStreamRef.current.getTracks().forEach((track) => {
                  const sender = senders.find((s) => s.track === track);
                  if (!sender && track.readyState === "live") {
                    pc.addTrack(track, localStreamRef.current!);
                    console.log(`✅ Track ${track.kind} adicionado antes de criar oferta: ${track.id}`);
                  }
                });
                
                const finalSenders = pc.getSenders();
                console.log(`📊 Total de senders: ${finalSenders.length}`);
                if (finalSenders.length > 0) {
                  pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                  }).then(async (offer) => {
                    await pc.setLocalDescription(offer);
                    if (sendSignalingMessageRef.current) {
                      sendSignalingMessageRef.current("offer", offer);
                      console.log("📤 Oferta criada e enviada (verificação periódica)");
                      hasSentOfferRef.current = true;
                      setConnectionStatus("connecting");
                      toast.info("Conectando com participante...");
                    }
                  }).catch((error) => {
                    console.error("❌ Erro ao criar oferta (verificação periódica):", error);
                  });
                } else {
                  console.warn("⚠️ Nenhum sender disponível para criar oferta");
                }
              }
            } else if (uniqueParticipants.length === 1) {
              console.log("⏳ Aguardando outro participante entrar na sala...");
            }
          } catch (error) {
            console.error("❌ Erro ao verificar participantes:", error);
          }
        }, 1000); // Verificar a cada 1 segundo para resposta mais rápida

        // Limpar intervalo após 60 segundos (aumentado para dar mais tempo)
        setTimeout(() => {
          if (checkParticipantsInterval) {
            clearInterval(checkParticipantsInterval);
            console.log("⏰ Intervalo de verificação de participantes expirado");
          }
        }, 60000);
      }
    };

    initializeMedia();

    return () => {
      isMounted = false;
      console.log("🧹 Limpando recursos no unmount...");
      
      // Parar todos os tracks de mídia local
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`🛑 Track ${track.kind} parado no unmount`);
        });
        localStreamRef.current = null;
      }
      
      // Parar todos os tracks de compartilhamento de tela
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`🛑 Screen track ${track.kind} parado no unmount`);
        });
        screenStreamRef.current = null;
      }
      
      // Fechar peer connection
      if (peerConnectionRef.current) {
        // Parar todos os tracks dos senders
        peerConnectionRef.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
            console.log(`🛑 Sender track ${sender.track.kind} parado`);
          }
        });
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
        console.log("🛑 Peer connection fechado no unmount");
      }
      
      // Fechar canal de sinalização
      if (signalingChannelRef.current) {
        signalingChannelRef.current.close();
        signalingChannelRef.current = null;
        console.log("🛑 Canal de sinalização fechado no unmount");
      }
      
      // Parar polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log("🛑 Polling parado no unmount");
      }
      
      // Limpar elementos de vídeo
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        localVideoRef.current.pause();
        console.log("🛑 Vídeo local limpo no unmount");
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.pause();
        console.log("🛑 Vídeo remoto limpo no unmount");
      }
      
      console.log("✅ Limpeza completa no unmount");
    };
  }, [roomId, startLocalMedia]);

  // Atualizar vídeo local quando stream mudar ou câmera for ligada/desligada
  useEffect(() => {
    if (localVideoRef.current && localStream && !isScreenSharing) {
      // Sempre atualizar o srcObject para garantir que o vídeo seja atualizado
      // O overlay será controlado pelo CSS baseado no estado isCameraOn
      localVideoRef.current.srcObject = localStream;
      
      // Tentar reproduzir apenas se a câmera estiver ligada
      if (isCameraOn) {
        localVideoRef.current.play().catch((err) => {
          console.error("Erro ao reproduzir vídeo local:", err);
        });
      } else {
        // Se a câmera está desligada, pausar o vídeo
        localVideoRef.current.pause();
      }
    }
  }, [localStream, isScreenSharing, isCameraOn]);

  // Atualizar vídeo remoto quando stream mudar
  useEffect(() => {
    if (!remoteVideoRef.current) {
      return;
    }

    if (remoteStream) {
      const tracks = remoteStream.getTracks();
      const videoTracks = remoteStream.getVideoTracks();
      
      console.log("🔄 Atualizando vídeo remoto no elemento", {
        streamId: remoteStream.id,
        tracks: tracks.length,
        videoTracks: videoTracks.length,
        audioTracks: remoteStream.getAudioTracks().length,
        trackStates: tracks.map(t => ({ 
          kind: t.kind, 
          id: t.id, 
          enabled: t.enabled, 
          readyState: t.readyState,
          muted: t.muted,
        })),
      });
      
      // Verificar se há tracks de vídeo
      if (videoTracks.length === 0) {
        console.warn("⚠️ Stream remoto não tem tracks de vídeo ainda");
        // Ainda assim atualizar o elemento para quando os tracks chegarem
      }
      
      // Verificar se já está usando o mesmo stream
      const currentStream = remoteVideoRef.current.srcObject as MediaStream | null;
      const isSameStream = currentStream?.id === remoteStream.id;
      const hasSameTracks = currentStream?.getTracks().length === tracks.length;
      
      // Atualizar stream no elemento de vídeo se há tracks (vídeo ou áudio)
      const audioTracks = remoteStream.getAudioTracks();
      
      if (videoTracks.length > 0 || audioTracks.length > 0) {
        console.log("🔄 Atualizando srcObject do vídeo remoto...", {
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
        });
        
        // Se é um stream diferente ou tem tracks diferentes, atualizar
        if (!isSameStream || !hasSameTracks) {
          remoteVideoRef.current.srcObject = remoteStream;
          // Forçar atualização do elemento
          remoteVideoRef.current.load();
          console.log("✅ Stream atualizado no elemento de vídeo");
        } else {
          console.log("ℹ️ Stream já está conectado, verificando se está reproduzindo...");
        }
        
        // Garantir que o áudio não está mutado
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        
        // Aguardar um pouco antes de tentar reproduzir para garantir que o stream está pronto
        setTimeout(() => {
          if (remoteVideoRef.current && remoteVideoRef.current.srcObject === remoteStream) {
            // Verificar se o vídeo está pausado ou se há tracks de áudio para reproduzir
            if (remoteVideoRef.current.paused || remoteVideoRef.current.readyState < 2 || audioTracks.length > 0) {
              remoteVideoRef.current.play()
                .then(() => {
                  console.log("✅ Stream remoto reproduzindo com sucesso");
                  
                  // Verificar tracks de vídeo
                  if (videoTracks.length > 0) {
                    videoTracks.forEach((track) => {
                      console.log(`  ✅ Track de vídeo ativo: ${track.id}, enabled: ${track.enabled}, readyState: ${track.readyState}, muted: ${track.muted}`);
                    });
                  }
                  
                  // Verificar tracks de áudio
                  if (audioTracks.length > 0) {
                    console.log(`🎤 Tracks de áudio no stream remoto: ${audioTracks.length}`);
                    audioTracks.forEach((track) => {
                      console.log(`  🎤 Track de áudio: ${track.id}, enabled: ${track.enabled}, readyState: ${track.readyState}, muted: ${track.muted}`);
                    });
                  }
                  
                  // Verificar se o elemento está mutado
                  console.log(`🔊 Elemento de vídeo remoto - muted: ${remoteVideoRef.current.muted}, volume: ${remoteVideoRef.current.volume}`);
                })
                .catch((err) => {
                  console.error("❌ Erro ao reproduzir stream remoto:", err);
                  // Tentar novamente após um delay maior
                  setTimeout(() => {
                    if (remoteVideoRef.current && remoteVideoRef.current.srcObject === remoteStream) {
                      remoteVideoRef.current.muted = false;
                      remoteVideoRef.current.volume = 1.0;
                      remoteVideoRef.current.play()
                        .then(() => {
                          console.log("✅ Stream remoto reproduzindo (tentativa 2)");
                        })
                        .catch((e) => {
                          console.error("❌ Erro ao reproduzir stream remoto (tentativa 2):", e);
                        });
                    }
                  }, 1000);
                });
            } else {
              console.log("ℹ️ Stream já está reproduzindo");
              // Garantir que o áudio não está mutado mesmo se já está reproduzindo
              remoteVideoRef.current.muted = false;
              remoteVideoRef.current.volume = 1.0;
            }
          }
        }, 300);
      } else {
        // Se não há tracks, limpar o srcObject mas manter o elemento
        if (remoteVideoRef.current.srcObject) {
          console.log("🔄 Limpando srcObject (sem tracks)");
          remoteVideoRef.current.srcObject = null;
        }
      }
    } else {
      // Limpar vídeo se não há stream
      if (remoteVideoRef.current.srcObject) {
        console.log("🔄 Limpando vídeo remoto (sem stream)");
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.load();
      }
    }
  }, [remoteStream]);

  // Toggle microfone
  const toggleMic = useCallback(() => {
    try {
      if (!localStreamRef.current) {
        toast.warning("Stream de mídia não inicializado. Aguarde a câmera iniciar.");
        return;
      }

      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMicState = !isMicOn;
      
      console.log(`🎤 Alternando microfone: ${isMicOn ? "ligado" : "desligado"} → ${newMicState ? "ligado" : "desligado"}`);
      console.log(`🎤 Tracks de áudio encontrados: ${audioTracks.length}`);
      
      if (audioTracks.length > 0) {
        let updatedCount = 0;
        audioTracks.forEach((track) => {
          if (track.readyState === "live") {
            track.enabled = newMicState;
            updatedCount++;
            console.log(`✅ Track de áudio ${newMicState ? "habilitado" : "desabilitado"}: ${track.id}, enabled: ${track.enabled}`);
            
            // Atualizar também no peer connection se existir
            if (peerConnectionRef.current) {
              const sender = peerConnectionRef.current.getSenders().find((s) => s.track === track);
              if (sender && sender.track) {
                // O track já está no sender, apenas habilitar/desabilitar
                // O enabled do track já foi atualizado acima, então o sender vai transmitir automaticamente
                console.log(`✅ Sender de áudio encontrado: ${sender.track.id}, enabled: ${sender.track.enabled}`);
                
                // Verificar se o sender precisa ser atualizado
                if (sender.track.enabled !== newMicState) {
                  console.warn(`⚠️ Sender track enabled não corresponde ao estado desejado, atualizando...`);
                  sender.track.enabled = newMicState;
                }
              } else {
                console.warn(`⚠️ Sender de áudio não encontrado para track: ${track.id}`);
                // Tentar adicionar o track ao peer connection se não estiver lá
                try {
                  if (localStreamRef.current) {
                    peerConnectionRef.current.addTrack(track, localStreamRef.current);
                    console.log(`✅ Track de áudio adicionado ao peer connection: ${track.id}`);
                  }
                } catch (error) {
                  console.error(`❌ Erro ao adicionar track de áudio ao peer connection:`, error);
                }
              }
            }
          } else {
            console.warn(`⚠️ Track de áudio não está live: ${track.id} (estado: ${track.readyState})`);
          }
        });
        
        if (updatedCount > 0) {
          setIsMicOn(newMicState);
          toast.success(newMicState ? "Microfone ligado" : "Microfone desligado");
        } else {
          console.warn("⚠️ Nenhum track de áudio foi atualizado");
          toast.warning("Não foi possível atualizar o microfone");
        }
      } else {
        console.warn("⚠️ Nenhum track de áudio disponível no stream");
        toast.warning("Nenhum microfone disponível no stream atual");
      }
    } catch (error: any) {
      console.error("❌ Erro ao alternar microfone:", error);
      toast.error(`Erro ao ${!isMicOn ? "ligar" : "desligar"} microfone: ${error.message || "Erro desconhecido"}`);
    }
  }, [isMicOn]);

  // Toggle câmera
  const toggleCamera = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isTogglingCameraRef.current) {
      console.log("⏳ Toggle de câmera já em progresso, ignorando...");
      return;
    }

    if (isScreenSharing) {
      toast.warning("Pare de compartilhar a tela antes de alternar a câmera");
      return;
    }

    isTogglingCameraRef.current = true;
    const currentCameraState = isCameraOn;
    const newCameraState = !currentCameraState;
    
    console.log(`📹 Alternando câmera: ${currentCameraState ? "ligada" : "desligada"} → ${newCameraState ? "ligada" : "desligada"}`);
    
    try {
      if (!localStreamRef.current) {
        toast.warning("Stream de mídia não inicializado. Aguarde a inicialização.");
        isTogglingCameraRef.current = false;
        return;
      }

      const videoTracks = localStreamRef.current.getVideoTracks();
      console.log(`📹 Tracks de vídeo encontrados: ${videoTracks.length}`);
      
      if (newCameraState) {
        // Ligar câmera
        if (videoTracks.length > 0) {
          // Se já temos tracks de vídeo, apenas habilitar
          let enabledCount = 0;
          videoTracks.forEach((track) => {
            if (track.readyState === "live") {
              if (!track.enabled) {
                track.enabled = true;
                enabledCount++;
                console.log(`✅ Track de vídeo habilitado: ${track.id}`);
              } else {
                console.log(`ℹ️ Track de vídeo já estava habilitado: ${track.id}`);
              }
            } else {
              console.log(`⚠️ Track de vídeo não está live: ${track.id} (estado: ${track.readyState})`);
            }
          });
          
          if (enabledCount > 0) {
            // Atualizar vídeo local
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
              localVideoRef.current.play().catch((err) => {
                console.error("Erro ao reproduzir vídeo:", err);
              });
            }
            
            setIsCameraOn(true);
            toast.success("Câmera ligada");
          } else {
            console.log("⚠️ Nenhum track foi habilitado");
            toast.warning("Não foi possível habilitar a câmera");
          }
        } else {
          // Se não há tracks de vídeo, criar novos
          console.log("📹 Criando novos tracks de vídeo...");
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });
          
          videoStream.getVideoTracks().forEach((track) => {
            localStreamRef.current!.addTrack(track);
            console.log(`✅ Novo track de vídeo adicionado: ${track.id}`);
            
            // Adicionar ao peer connection
            if (peerConnectionRef.current) {
              const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "video");
              if (sender) {
                sender.replaceTrack(track).then(() => {
                  console.log(`✅ Track de vídeo substituído no peer connection`);
                }).catch((err) => {
                  console.error("❌ Erro ao substituir track de vídeo:", err);
                });
              } else {
                peerConnectionRef.current.addTrack(track, localStreamRef.current!);
                console.log(`✅ Track de vídeo adicionado ao peer connection`);
              }
            }
          });
          
          // Atualizar vídeo local
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            localVideoRef.current.play().catch((err) => {
              console.error("Erro ao reproduzir vídeo:", err);
            });
          }
          
          setIsCameraOn(true);
          toast.success("Câmera ligada");
        }
      } else {
        // Desligar câmera
        if (videoTracks.length > 0) {
          let disabledCount = 0;
          videoTracks.forEach((track) => {
            if (track.readyState === "live") {
              if (track.enabled) {
                track.enabled = false;
                disabledCount++;
                console.log(`🛑 Track de vídeo desabilitado: ${track.id}`);
              } else {
                console.log(`ℹ️ Track de vídeo já estava desabilitado: ${track.id}`);
              }
            }
          });
          
          if (disabledCount > 0) {
            // Não remover o srcObject, apenas desabilitar para manter o overlay funcionando
            setIsCameraOn(false);
            toast.info("Câmera desligada");
          } else {
            console.log("⚠️ Nenhum track foi desabilitado");
            setIsCameraOn(false);
            toast.info("Câmera desligada");
          }
        } else {
          console.log("⚠️ Nenhum track de vídeo disponível para desabilitar");
          setIsCameraOn(false);
          toast.info("Câmera desligada");
        }
      }
    } catch (error: any) {
      console.error("❌ Erro ao alternar câmera:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Permissão de câmera negada. Permita o acesso nas configurações do navegador.");
      } else {
        toast.error(`Erro ao ${newCameraState ? "ligar" : "desligar"} câmera: ${error.message || "Erro desconhecido"}`);
      }
      // Reverter estado em caso de erro
      setIsCameraOn(currentCameraState);
    } finally {
      isTogglingCameraRef.current = false;
    }
  }, [isCameraOn, isScreenSharing]);

  // Compartilhar tela
  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        if (!peerConnectionRef.current) {
          toast.warning("Aguarde a conexão ser estabelecida");
          return;
        }

        if (!localStreamRef.current) {
          toast.warning("Stream de mídia não inicializado");
          return;
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "monitor",
          } as any,
          audio: true,
        });

        screenStreamRef.current = stream;

        // Substituir track de vídeo
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
          toast.error("Nenhum track de vídeo disponível no compartilhamento");
          return;
        }

        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
          console.log("✅ Track de compartilhamento de tela substituído");
        } else {
          toast.warning("Não foi possível encontrar sender de vídeo");
        }

        // Atualizar vídeo local
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((err) => {
            console.error("Erro ao reproduzir vídeo:", err);
          });
        }

        setIsScreenSharing(true);
        setIsCameraOn(false); // Desligar câmera quando compartilhar tela
        toast.success("Compartilhando tela");

        // Quando o usuário parar de compartilhar
        videoTrack.onended = () => {
          console.log("📺 Compartilhamento de tela encerrado pelo usuário");
          toggleScreenShare();
        };
      } catch (error: any) {
        console.error("Erro ao compartilhar tela:", error);
        if (error.name === "NotAllowedError") {
          toast.info("Compartilhamento de tela cancelado");
        } else {
          toast.error("Erro ao compartilhar tela: " + (error.message || "Erro desconhecido"));
        }
      }
    } else {
      // Parar compartilhamento
      try {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => {
            track.stop();
            console.log(`🛑 Screen track ${track.kind} parado`);
          });
          screenStreamRef.current = null;
        }

        // Restaurar vídeo da câmera
        if (localStreamRef.current && peerConnectionRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack && videoTrack.readyState === "live") {
            const sender = peerConnectionRef.current
              .getSenders()
              .find((s) => s.track?.kind === "video");

            if (sender && videoTrack) {
              await sender.replaceTrack(videoTrack);
              console.log("✅ Track de câmera restaurado");
            }

            // Habilitar track de vídeo
            videoTrack.enabled = true;

            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
              localVideoRef.current.play().catch((err) => {
                console.error("Erro ao reproduzir vídeo:", err);
              });
            }

            setIsCameraOn(true);
          }
        }

        setIsScreenSharing(false);
        toast.info("Compartilhamento de tela encerrado");
      } catch (error: any) {
        console.error("Erro ao parar compartilhamento:", error);
        toast.error("Erro ao parar compartilhamento: " + (error.message || "Erro desconhecido"));
      }
    }
  }, [isScreenSharing]);

  // Copiar link da sala
  const copyRoomLink = useCallback(() => {
    if (roomLink) {
      navigator.clipboard.writeText(roomLink).then(() => {
        toast.success("Link copiado! Compartilhe com o paciente para que ele possa acessar a consulta.");
      }).catch((err) => {
        console.error("Erro ao copiar link:", err);
        toast.error("Erro ao copiar link. Tente novamente.");
      });
    } else {
      toast.error("Link ainda não está disponível. Aguarde um momento.");
    }
  }, [roomLink]);

  // Encerrar chamada
  const endCall = useCallback(() => {
    console.log("🔴 Encerrando chamada e limpando recursos...");
    
    // Primeiro, parar todos os tracks do peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
          console.log(`🛑 Sender track ${sender.track.kind} parado`);
        }
      });
      peerConnectionRef.current.getReceivers().forEach((receiver) => {
        if (receiver.track) {
          receiver.track.stop();
          console.log(`🛑 Receiver track ${receiver.track.kind} parado`);
        }
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log("🛑 Peer connection fechado");
    }
    
    // Parar todos os tracks de mídia local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState !== "ended") {
          track.stop();
          console.log(`🛑 Track local ${track.kind} parado (estado: ${track.readyState})`);
        }
      });
      localStreamRef.current = null;
    }
    
    // Parar todos os tracks de compartilhamento de tela
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState !== "ended") {
          track.stop();
          console.log(`🛑 Screen track ${track.kind} parado`);
        }
      });
      screenStreamRef.current = null;
    }
    
    // Parar todos os tracks do stream remoto
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        if (track.readyState !== "ended") {
          track.stop();
          console.log(`🛑 Remote track ${track.kind} parado`);
        }
      });
    }
    
    // Limpar elementos de vídeo e parar todos os streams
    if (localVideoRef.current) {
      const currentStream = localVideoRef.current.srcObject as MediaStream | null;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => {
          if (track.readyState !== "ended") {
            track.stop();
          }
        });
      }
      localVideoRef.current.srcObject = null;
      localVideoRef.current.pause();
      localVideoRef.current.load(); // Forçar reload
      console.log("🛑 Vídeo local limpo");
    }
    
    if (remoteVideoRef.current) {
      const currentStream = remoteVideoRef.current.srcObject as MediaStream | null;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => {
          if (track.readyState !== "ended") {
            track.stop();
          }
        });
      }
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.pause();
      remoteVideoRef.current.load(); // Forçar reload
      console.log("🛑 Vídeo remoto limpo");
    }
    
    // Notificar saída via sinalização ANTES de fechar o canal
    try {
      if (signalingChannelRef.current) {
        // Enviar mensagem diretamente via localStorage antes de fechar o canal
        const storageKey = `telemedicina-signaling-${roomId}`;
        const message = {
          id: uuidv4(),
          type: "participant-left",
          data: { roomId },
          from: participantIdRef.current,
          timestamp: Date.now(),
        };
        
        const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");
        messages.push(message);
        const recentMessages = messages.slice(-100);
        localStorage.setItem(storageKey, JSON.stringify(recentMessages));
        
        // Tentar enviar via BroadcastChannel se ainda estiver aberto
        try {
          signalingChannelRef.current.postMessage(message);
        } catch (e) {
          // Ignorar se o canal já estiver fechado
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem de saída:", error);
    }
    
    // Fechar canal de sinalização
    if (signalingChannelRef.current) {
      signalingChannelRef.current.close();
      signalingChannelRef.current = null;
      console.log("🛑 Canal de sinalização fechado");
    }
    
    // Parar polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("🛑 Polling parado");
    }
    
    // Limpar estado
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setIsMicOn(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
    
    // Limpar localStorage de participantes
    try {
      const participantKey = `telemedicina-participants-${roomId}`;
      const participants = JSON.parse(localStorage.getItem(participantKey) || "[]");
      const updated = participants.filter((id: string) => id !== participantIdRef.current);
      localStorage.setItem(participantKey, JSON.stringify(updated));
    } catch (error) {
      console.error("Erro ao limpar participantes:", error);
    }
    
    // Limpar mensagens processadas
    processedMessageIdsRef.current.clear();
    
    console.log("✅ Limpeza completa realizada - todos os tracks foram parados");
    onClose();
  }, [roomId, onClose, sendSignalingMessage, remoteStream]);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Conectado";
      case "connecting":
        return "Conectando...";
      case "error":
        return "Erro";
      default:
        return "Desconectado";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-[#404040] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">
              {isDoctor ? doctorName : patientName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div
                className={`h-2 w-2 rounded-full ${getConnectionStatusColor()} animate-pulse`}
              ></div>
              <p className="text-xs text-[#b0b0b0]">
                {getConnectionStatusText()}
              </p>
              {isDoctor && (
                <span className="text-xs text-[#b0b0b0]">• Atendendo: {patientName}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-[#2a2a2a] border-[#404040] text-white"
          >
            <Users className="h-3 w-3 mr-1" />
            {participants} {participants === 1 ? "participante" : "participantes"}
          </Badge>
          {isDoctor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomLink}
              className="h-9 px-4 text-white hover:bg-[#2a2a2a] rounded-full border border-[#404040]"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Copiar link</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={endCall}
            className="h-9 w-9 text-white hover:bg-[#ea4335]/20 hover:text-[#ea4335] rounded-full border border-[#404040] transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área de vídeo */}
      <div className="flex-1 relative bg-[#000000] min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Vídeo remoto */}
        <div className="relative bg-[#1a1a1a] rounded-lg overflow-hidden border-2 border-[#404040] min-h-[300px]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
            style={{ 
              display: remoteStream && (remoteStream.getVideoTracks().length > 0 || remoteStream.getAudioTracks().length > 0) ? 'block' : 'none',
              backgroundColor: '#000000'
            }}
          />
          {(!remoteStream || (remoteStream.getVideoTracks().length === 0 && remoteStream.getAudioTracks().length === 0)) && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
              <div className="text-center space-y-4">
                <div className="h-20 w-20 mx-auto rounded-full bg-[#2a2a2a] flex items-center justify-center">
                  <Users className="h-10 w-10 text-[#b0b0b0]" />
                </div>
                <p className="text-sm text-[#b0b0b0]">
                  {connectionStatus === "connecting" ? "Conectando..." : "Aguardando participante..."}
                </p>
                {connectionStatus === "connected" && !remoteStream && (
                  <p className="text-xs text-yellow-500">
                    Aguardando mídia do participante...
                  </p>
                )}
                {remoteStream && remoteStream.getVideoTracks().length === 0 && remoteStream.getAudioTracks().length > 0 && (
                  <p className="text-xs text-yellow-500">
                    Câmera do participante está desligada (áudio ativo)
                  </p>
                )}
                {remoteStream && remoteStream.getVideoTracks().length === 0 && remoteStream.getAudioTracks().length === 0 && (
                  <p className="text-xs text-yellow-500">
                    Câmera e microfone do participante estão desligados
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-black/50 text-white border-0">
              {isDoctor ? patientName : doctorName}
            </Badge>
          </div>
        </div>

        {/* Vídeo local */}
        <div className="relative bg-[#1a1a1a] rounded-lg overflow-hidden border-2 border-primary">
          {localStream && isCameraOn && !isScreenSharing ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : localStream && isScreenSharing ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="h-20 w-20 mx-auto rounded-full bg-[#2a2a2a] flex items-center justify-center">
                  {!isCameraOn ? (
                    <VideoOff className="h-10 w-10 text-[#b0b0b0]" />
                  ) : (
                    <Video className="h-10 w-10 text-[#b0b0b0]" />
                  )}
                </div>
                <p className="text-sm text-[#b0b0b0]">
                  {!isCameraOn ? "Câmera desligada" : "Iniciando câmera..."}
                </p>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-primary text-white border-0">
              {isDoctor ? doctorName : patientName}
            </Badge>
          </div>
          {localStream && !isCameraOn && !isScreenSharing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
              <VideoOff className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="px-8 py-5 bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-t border-[#404040] flex items-center justify-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={`h-14 w-14 rounded-full transition-all ${
            isMicOn
              ? "bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#404040]"
              : "bg-[#ea4335] hover:bg-[#d33b2c] text-white shadow-lg"
          }`}
          onClick={toggleMic}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-14 w-14 rounded-full transition-all ${
            isCameraOn
              ? "bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#404040]"
              : "bg-[#ea4335] hover:bg-[#d33b2c] text-white shadow-lg"
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isTogglingCameraRef.current) {
              toggleCamera();
            }
          }}
        >
          {isCameraOn ? (
            <Video className="h-6 w-6" />
          ) : (
            <VideoOff className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-14 w-14 rounded-full transition-all ${
            isScreenSharing
              ? "bg-primary hover:bg-primary/90 text-white shadow-lg"
              : "bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#404040]"
          }`}
          onClick={toggleScreenShare}
        >
          {isScreenSharing ? (
            <MonitorOff className="h-6 w-6" />
          ) : (
            <MonitorUp className="h-6 w-6" />
          )}
        </Button>

        <div className="h-10 w-px bg-[#404040] mx-2"></div>

        <Button
          variant="ghost"
          size="icon"
          className="h-14 w-14 rounded-full bg-[#ea4335] hover:bg-[#d33b2c] text-white shadow-lg transition-all"
          onClick={endCall}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      {/* Informações da sala */}
      <div className="px-6 py-3 bg-[#1a1a1a] border-t border-[#404040] flex items-center justify-between text-xs text-[#b0b0b0]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Wifi className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
            )}
            <span>Sala: {roomId.substring(0, 8)}...</span>
          </div>
        </div>
        <div className="text-[#666]">
          WebRTC • Preparado para Supabase Realtime
        </div>
      </div>
    </div>
  );
};

