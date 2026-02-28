// Serviço de comunicação entre chat e suporte admin
// Em produção, isso seria uma API real com WebSockets ou similar

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
  ticketId?: string;
}

interface ChatTicket {
  id: string;
  clinic: string;
  clinicId: number;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "closed";
  createdAt: string;
  lastUpdate: string;
  assignedTo?: string;
  messages: Array<{
    author: string;
    message: string;
    timestamp: string;
    isAdmin?: boolean;
  }>;
}

// Armazenamento temporário - usando localStorage para persistência entre abas
const STORAGE_KEY = 'cactoChatTickets';
const MESSAGES_STORAGE_KEY = 'cactoChatMessages';

// Função para carregar tickets do localStorage
const loadTicketsFromStorage = (): ChatTicket[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro ao carregar tickets do localStorage:', e);
  }
  return [];
};

// Função para salvar tickets no localStorage
const saveTicketsToStorage = (tickets: ChatTicket[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    // Disparar evento customizado para sincronizar na mesma aba e outras abas
    window.dispatchEvent(new CustomEvent('chatTicketsUpdated', { detail: tickets }));
  } catch (e) {
    console.error('Erro ao salvar tickets no localStorage:', e);
  }
};

// Carregar tickets iniciais
let chatTickets: ChatTicket[] = loadTicketsFromStorage();
let chatMessages: Map<string, ChatMessage[]> = new Map();

// Carregar mensagens do localStorage
const loadMessagesFromStorage = (): Map<string, ChatMessage[]> => {
  const map = new Map<string, ChatMessage[]>();
  if (typeof window === 'undefined') return map;
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        map.set(key, (value as any[]).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      });
    }
  } catch (e) {
    console.error('Erro ao carregar mensagens do localStorage:', e);
  }
  return map;
};

// Salvar mensagens no localStorage
const saveMessagesToStorage = (messages: Map<string, ChatMessage[]>) => {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, any[]> = {};
    messages.forEach((msgs, key) => {
      obj[key] = msgs.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
    });
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Erro ao salvar mensagens no localStorage:', e);
  }
};

// Inicializar mensagens
chatMessages = loadMessagesFromStorage();

// Escutar mudanças no localStorage de outras abas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const newTickets = JSON.parse(e.newValue);
        chatTickets = newTickets;
        // Disparar evento para atualizar componentes
        window.dispatchEvent(new CustomEvent('chatTicketsUpdated', { detail: newTickets }));
      } catch (err) {
        console.error('Erro ao processar atualização de tickets:', err);
      }
    }
    if (e.key === MESSAGES_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const map = new Map<string, ChatMessage[]>();
        Object.entries(parsed).forEach(([key, value]) => {
          map.set(key, (value as any[]).map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        });
        chatMessages = map;
        // Disparar evento para atualizar componentes
        window.dispatchEvent(new CustomEvent('chatMessagesUpdated'));
      } catch (err) {
        console.error('Erro ao processar atualização de mensagens:', err);
      }
    }
  });
}

// Armazenar informações da clínica atual
let currentClinicInfo: { name: string; id: number } | null = null;

// Obter nome da clínica atual
const getCurrentClinic = () => {
  // Tentar obter do localStorage primeiro
  if (typeof window !== 'undefined') {
    const storedClinic = localStorage.getItem('currentClinic');
    if (storedClinic) {
      try {
        const parsed = JSON.parse(storedClinic);
        currentClinicInfo = parsed;
        return parsed;
      } catch (e) {
        console.error('Erro ao parsear clínica do localStorage:', e);
      }
    }
  }
  
  // Se não houver no localStorage, usar valor padrão ou armazenado
  if (currentClinicInfo) {
    return currentClinicInfo;
  }
  
  // Valor padrão
  return {
    name: "Minha Clínica",
    id: 999,
  };
};

// Função para definir a clínica atual (chamada quando o usuário faz login)
export const setCurrentClinic = (clinicName: string, clinicId: number) => {
  currentClinicInfo = { name: clinicName, id: clinicId };
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentClinic', JSON.stringify({ name: clinicName, id: clinicId }));
  }
};

export const chatService = {
  // Criar um novo ticket de chat
  createChatTicket: (firstMessage: string): string => {
    const clinic = getCurrentClinic();
    const ticketId = `CHAT-${Date.now()}`;
    
    const ticket: ChatTicket = {
      id: ticketId,
      clinic: clinic.name,
      clinicId: clinic.id,
      subject: `Chat iniciado - ${new Date().toLocaleString('pt-BR')}`,
      priority: "medium",
      status: "open",
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      assignedTo: undefined,
      messages: [
        {
          author: clinic.name,
          message: firstMessage,
          timestamp: new Date().toISOString(),
          isAdmin: false,
        },
      ],
    };

    chatTickets.push(ticket);
    chatMessages.set(ticketId, []);
    
    // Salvar no localStorage
    saveTicketsToStorage(chatTickets);
    saveMessagesToStorage(chatMessages);
    
    // Notificar admin sobre novo ticket (em produção seria via WebSocket ou polling)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newChatTicket', { detail: ticket }));
      // Também disparar evento de atualização geral
      window.dispatchEvent(new CustomEvent('chatTicketsUpdated', { detail: chatTickets }));
    }

    return ticketId;
  },

  // Enviar mensagem do usuário
  sendUserMessage: (ticketId: string, message: string): void => {
    const messages = chatMessages.get(ticketId) || [];
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
      ticketId,
    };
    
    messages.push(newMessage);
    chatMessages.set(ticketId, messages);

    // Atualizar ticket no admin
    const ticket = chatTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({
        author: getCurrentClinic().name,
        message: message,
        timestamp: new Date().toISOString(),
        isAdmin: false,
      });
      ticket.lastUpdate = new Date().toISOString();
      
      // Salvar no localStorage
      saveTicketsToStorage(chatTickets);
      saveMessagesToStorage(chatMessages);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chatMessageUpdate', { detail: { ticketId, ticket } }));
        window.dispatchEvent(new CustomEvent('chatTicketsUpdated', { detail: chatTickets }));
      }
    }
  },

  // Enviar mensagem do admin
  sendAdminMessage: (ticketId: string, message: string, adminName?: string): void => {
    const ticket = chatTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({
        author: adminName || "Suporte CactoSaude",
        message: message,
        timestamp: new Date().toISOString(),
        isAdmin: true,
      });
      ticket.lastUpdate = new Date().toISOString();
      ticket.status = ticket.status === "open" ? "in_progress" : ticket.status;

      // Adicionar mensagem ao chatMessages também para sincronização
      const messages = chatMessages.get(ticketId) || [];
      messages.push({
        id: Date.now().toString(),
        text: message,
        sender: "support",
        timestamp: new Date(),
        ticketId,
      });
      chatMessages.set(ticketId, messages);

      // Salvar no localStorage
      saveTicketsToStorage(chatTickets);
      saveMessagesToStorage(chatMessages);

      // Notificar usuário sobre nova mensagem do admin
      if (typeof window !== 'undefined') {
        // Disparar evento de mensagem recebida (para ChatWidget)
        window.dispatchEvent(new CustomEvent('adminMessageReceived', { 
          detail: { ticketId, message } 
        }));
        // Disparar evento de atualização de tickets (para AdminSuporte)
        window.dispatchEvent(new CustomEvent('chatTicketsUpdated', { detail: chatTickets }));
        // Disparar evento de atualização de mensagens (para ChatWidget sincronizar)
        window.dispatchEvent(new CustomEvent('chatMessagesUpdated'));
      }
    }
  },

  // Obter mensagens de um ticket
  getMessages: (ticketId: string): ChatMessage[] => {
    return chatMessages.get(ticketId) || [];
  },

  // Obter todos os tickets de chat (sempre carrega do localStorage para garantir sincronização)
  getAllChatTickets: (): ChatTicket[] => {
    // Sempre recarregar do localStorage para garantir sincronização entre abas
    const storedTickets = loadTicketsFromStorage();
    chatTickets = storedTickets;
    return chatTickets;
  },

  // Obter ticket específico
  getTicket: (ticketId: string): ChatTicket | undefined => {
    return chatTickets.find(t => t.id === ticketId);
  },

  // Fechar ticket
  closeTicket: (ticketId: string): void => {
    const ticket = chatTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = "closed";
      ticket.lastUpdate = new Date().toISOString();
      
      // Salvar no localStorage
      saveTicketsToStorage(chatTickets);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ticketClosed', { detail: { ticketId } }));
        window.dispatchEvent(new CustomEvent('chatTicketsUpdated', { detail: chatTickets }));
      }
    }
  },
};

