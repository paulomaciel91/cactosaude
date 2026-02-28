import { useState, useRef, useEffect, useCallback } from 'react';

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isCallActive: boolean;
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
}

export const useWebRTC = (roomId: string): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Configuração STUN servers (gratuitos e públicos)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);

    // Quando receber stream remoto
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Quando conexão mudar de estado
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
        setIsCallActive(true);
        setError(null);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
        setIsCallActive(false);
      }
    };

    // Quando receber ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Em uma implementação real, você enviaria isso via WebSocket ou outro canal
        // Por enquanto, vamos usar um método simplificado usando localStorage como sinalização
        const candidateData = {
          type: 'ice-candidate',
          candidate: event.candidate,
          roomId,
        };
        localStorage.setItem(`webrtc-candidate-${roomId}`, JSON.stringify(candidateData));
      }
    };

    return pc;
  }, [roomId]);

  const startCall = useCallback(async () => {
    try {
      setError(null);

      // Obter stream de mídia local (áudio + vídeo)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      setLocalStream(stream);
      localVideoRef.current = stream;

      // Criar peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Adicionar tracks locais ao peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Criar oferta
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setIsCallActive(true);
      setIsConnected(true); // Para chamadas 1-para-1 locais, consideramos conectado

      // Nota: Para conexão real P2P com outro participante, você precisaria:
      // 1. Um servidor de sinalização (WebSocket) para trocar ofertas/respostas
      // 2. Ou usar um serviço como Socket.io, Firebase, etc.
      // Por enquanto, esta implementação funciona para exibir o vídeo local
      // e pode ser expandida com sinalização quando necessário
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar chamada');
      console.error('Erro ao iniciar chamada:', err);
    }
  }, [createPeerConnection, roomId]);

  const endCall = useCallback(() => {
    // Parar todos os streams
    if (localVideoRef.current) {
      localVideoRef.current.getTracks().forEach((track) => track.stop());
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.getTracks().forEach((track) => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Fechar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsCallActive(false);
    setIsScreenSharing(false);
    setError(null);
  }, []);

  const toggleMic = useCallback(() => {
    if (localVideoRef.current) {
      const audioTracks = localVideoRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicEnabled(!isMicEnabled);
    }
  }, [isMicEnabled]);

  const toggleCamera = useCallback(() => {
    if (localVideoRef.current) {
      const videoTracks = localVideoRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraEnabled(!isCameraEnabled);
    }
  }, [isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        // Iniciar compartilhamento de tela
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = screenStream;

        // Substituir vídeo local pelo compartilhamento de tela
        if (peerConnectionRef.current && localVideoRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === 'video');

          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }

          // Quando parar compartilhamento, voltar para câmera
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }

        setIsScreenSharing(true);
      } else {
        // Parar compartilhamento e voltar para câmera
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
          screenStreamRef.current = null;
        }

        // Voltar para stream da câmera
        if (localVideoRef.current && peerConnectionRef.current) {
          const videoTrack = localVideoRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === 'video');

          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        }

        setIsScreenSharing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao compartilhar tela');
      console.error('Erro ao compartilhar tela:', err);
    }
  }, [isScreenSharing]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isCallActive,
    error,
    startCall,
    endCall,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
  };
};

