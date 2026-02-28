import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { chatService } from "@/lib/chatService";
import { useChat } from "@/contexts/ChatContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
}

export const ChatWidget = () => {
  const location = useLocation();
  const { isChatOpen, openChat, closeChat } = useChat();
  // Inicializar isOpen baseado no contexto para evitar dessincronização
  const [isOpen, setIsOpen] = useState(() => isChatOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [wasManuallyClosed, setWasManuallyClosed] = useState(false);
  
  // Não mostrar o chat widget no painel admin (admin tem seu próprio chat interno)
  // Também não mostrar na tela de telemedicina (tela do paciente)
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTelemedicinaRoute = location.pathname.startsWith('/telemedicina/');
  const isVideoCallRoute = location.pathname.startsWith('/video/');
  const isConsultaFinalizadaRoute = location.pathname === '/consulta-finalizada';
  
  // Função para obter a chave do localStorage baseada na data atual
  const getTodayStorageKey = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `chatMessages_${today}`;
  };

  // Função para carregar mensagens do localStorage
  const loadMessagesFromStorage = (): Message[] => {
    try {
      const storageKey = getTodayStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Converter timestamps de string para Date
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens do localStorage:', error);
    }
    // Mensagem inicial se não houver histórico
    return [
      {
        id: "1",
        text: "Olá! Como posso ajudá-lo hoje?",
        sender: "support",
        timestamp: new Date(),
      },
    ];
  };

  // Função para salvar mensagens no localStorage
  const saveMessagesToStorage = (msgs: Message[]) => {
    try {
      const storageKey = getTodayStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (error) {
      console.error('Erro ao salvar mensagens no localStorage:', error);
    }
  };

  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage());
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Salvar mensagens no localStorage sempre que houver mudanças
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = getTodayStorageKey();
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.error('Erro ao salvar mensagens no localStorage:', error);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Sincronizar com o contexto global do chat e recarregar histórico quando abrir
  useEffect(() => {
    // Se o contexto está aberto, abrir o chat (quando o usuário clicar em "Iniciar Chat")
    if (isChatOpen && !isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setWasManuallyClosed(false); // Resetar a flag quando abrir explicitamente
      
      // Quando abrir o chat, recarregar mensagens do dia atual do localStorage
      const loadedMessages = loadMessagesFromStorage();
      setMessages(loadedMessages);
      
      // Tentar recuperar ticketId do localStorage se existir
      const storedTicketId = localStorage.getItem('currentChatTicketId');
      if (storedTicketId) {
        setTicketId(storedTicketId);
        
        // Carregar mensagens do ticket do chatService também
        const ticketMessages = chatService.getMessages(storedTicketId);
        if (ticketMessages.length > 0) {
          const formattedMessages: Message[] = ticketMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
          }));
          
          // Combinar com mensagens do localStorage, evitando duplicatas
          const combinedMessages = [...loadedMessages];
          formattedMessages.forEach(msg => {
            if (!combinedMessages.find(m => m.id === msg.id)) {
              combinedMessages.push(msg);
            }
          });
          
          // Ordenar por timestamp
          combinedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          setMessages(combinedMessages);
        }
      }
    } else if (!isChatOpen && isOpen) {
      // Quando o contexto fecha, fechar o chat também
      setIsOpen(false);
      setIsMinimized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen]);


  // Carregar ticketId do localStorage ao montar
  useEffect(() => {
    const storedTicketId = localStorage.getItem('currentChatTicketId');
    if (storedTicketId) {
      setTicketId(storedTicketId);
    }
  }, []);

  // Escutar mensagens do admin e verificar mensagens do chatService periodicamente
  useEffect(() => {
    const handleAdminMessage = (event: CustomEvent) => {
      const { ticketId: receivedTicketId, message } = event.detail;
      
      // Verificar se é para o ticket atual ou se não há ticket ainda
      const currentTicketId = ticketId || localStorage.getItem('currentChatTicketId');
      if (!currentTicketId || receivedTicketId === currentTicketId) {
        const supportMessage: Message = {
          id: Date.now().toString(),
          text: message,
          sender: "support",
          timestamp: new Date(),
        };
        
        setMessages((prev) => {
          // Verificar se a mensagem já existe (evitar duplicatas)
          if (prev.find(m => m.text === message && m.sender === "support" && 
            Math.abs(m.timestamp.getTime() - supportMessage.timestamp.getTime()) < 5000)) {
            return prev;
          }
          
          const updated = [...prev, supportMessage];
          // Salvar no localStorage
          const storageKey = getTodayStorageKey();
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (error) {
            console.error('Erro ao salvar mensagens no localStorage:', error);
          }
          return updated;
        });
        
        toast.info("Nova mensagem do suporte!");
        // Abrir automaticamente quando receber mensagem do admin
        openChat(); // Abrir o contexto do chat
        setIsOpen(true);
        setIsMinimized(false);
        setWasManuallyClosed(false); // Resetar flag ao receber mensagem
        
        // Se não havia ticketId, definir o recebido
        if (!ticketId && receivedTicketId) {
          setTicketId(receivedTicketId);
          localStorage.setItem('currentChatTicketId', receivedTicketId);
        }
      }
    };

    // Função para verificar mensagens do chatService
    const checkChatServiceMessages = () => {
      const currentTicketId = ticketId || localStorage.getItem('currentChatTicketId');
      if (currentTicketId) {
        const ticketMessages = chatService.getMessages(currentTicketId);
        if (ticketMessages.length > 0) {
          setMessages((prev) => {
            // Converter todas as mensagens do chatService (user e support)
            const allServiceMessages: Message[] = ticketMessages.map(msg => ({
              id: msg.id,
              text: msg.text,
              sender: msg.sender as "user" | "support",
              timestamp: msg.timestamp,
            }));
            
            // Combinar com mensagens existentes, evitando duplicatas
            const combined = [...prev];
            allServiceMessages.forEach(newMsg => {
              // Verificar se a mensagem já existe por ID ou por conteúdo + timestamp
              const exists = combined.find(m => 
                m.id === newMsg.id || 
                (m.text === newMsg.text && 
                 m.sender === newMsg.sender && 
                 Math.abs(m.timestamp.getTime() - newMsg.timestamp.getTime()) < 5000)
              );
              if (!exists) {
                combined.push(newMsg);
              }
            });
            
            // Ordenar por timestamp
            combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            
            // Salvar no localStorage apenas se houver mudanças
            if (combined.length !== prev.length || 
                combined.some((m, i) => !prev[i] || m.id !== prev[i].id)) {
              const storageKey = getTodayStorageKey();
              try {
                localStorage.setItem(storageKey, JSON.stringify(combined));
              } catch (error) {
                console.error('Erro ao salvar mensagens no localStorage:', error);
              }
            }
            
            return combined;
          });
        }
      }
    };

    // Escutar evento de mensagem do admin
    window.addEventListener('adminMessageReceived' as any, handleAdminMessage as EventListener);
    
    // Escutar evento de atualização de mensagens do chatService
    const handleChatMessagesUpdated = () => {
      checkChatServiceMessages();
    };
    window.addEventListener('chatMessagesUpdated' as any, handleChatMessagesUpdated as EventListener);
    
    // Escutar mudanças no localStorage de mensagens
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cactoChatMessages' && e.newValue) {
        checkChatServiceMessages();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mensagens periodicamente (polling)
    const intervalId = setInterval(() => {
      checkChatServiceMessages();
    }, 2000);

    // Verificar imediatamente ao montar
    checkChatServiceMessages();

    return () => {
      window.removeEventListener('adminMessageReceived' as any, handleAdminMessage as EventListener);
      window.removeEventListener('chatMessagesUpdated' as any, handleChatMessagesUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [ticketId, isChatOpen]);

  // EARLY RETURNS APENAS DEPOIS DE TODOS OS HOOKS
  if (isAdminRoute || isTelemedicinaRoute || isVideoCallRoute || isConsultaFinalizadaRoute) {
    return null;
  }

  // Só renderizar o widget se o chat estiver aberto (quando o usuário clicar em "Iniciar Chat")
  // Não mostrar o botão flutuante automaticamente
  if (!isChatOpen && !isOpen) {
    return null;
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    const messageText = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Atualizar mensagens e salvar no localStorage
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      const storageKey = getTodayStorageKey();
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error('Erro ao salvar mensagens no localStorage:', error);
      }
      return updated;
    });

    // Criar ticket se ainda não existe
    if (!ticketId) {
      const newTicketId = chatService.createChatTicket(messageText);
      setTicketId(newTicketId);
      // Salvar ticketId no localStorage
      localStorage.setItem('currentChatTicketId', newTicketId);
      toast.success("Chamado criado! Nossa equipe entrará em contato em breve.");
    } else {
      // Enviar mensagem para o ticket existente
      chatService.sendUserMessage(ticketId, messageText);
    }

    // Simular confirmação automática
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Mensagem recebida! Nossa equipe de suporte analisará sua solicitação e responderá em breve.",
        sender: "support",
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const final = [...prev, supportMessage];
        const storageKey = getTodayStorageKey();
        try {
          localStorage.setItem(storageKey, JSON.stringify(final));
        } catch (error) {
          console.error('Erro ao salvar mensagens no localStorage:', error);
        }
        return final;
      });
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Não mostrar botão flutuante automaticamente - o widget só aparece quando o usuário clicar em "Iniciar Chat" */}

      {/* Widget flutuante - aparece apenas quando minimizado */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => {
              setIsMinimized(false);
            }}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
            size="icon"
            title="Abrir chat"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat aberto e não minimizado */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 z-50 w-[350px] sm:w-[400px]">
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-3 bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-base">Chat de Suporte</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => {
                  setIsMinimized(true);
                  // Quando minimizar, o widget flutuante aparecerá
                }}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Fechar o chat completamente - o histórico já está salvo no localStorage
                  setWasManuallyClosed(true);
                  setIsMinimized(false);
                  setIsOpen(false);
                  closeChat();
                  // O histórico permanece salvo com a chave do dia atual
                  // Quando abrir novamente, será carregado automaticamente
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {!isMinimized && (
          <>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
      )}
    </>
  );
};

