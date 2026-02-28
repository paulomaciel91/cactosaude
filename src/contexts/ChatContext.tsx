import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // Não carregar estado do localStorage - o chat só abre quando o usuário clicar em "Iniciar Chat"
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => {
    setIsChatOpen(true);
    // Não salvar no localStorage - o chat só abre quando o usuário clicar em "Iniciar Chat"
  };

  const closeChat = () => {
    setIsChatOpen(false);
    // Não salvar no localStorage - quando fechar, não deve abrir automaticamente
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
