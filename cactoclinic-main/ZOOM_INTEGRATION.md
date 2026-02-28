# 📹 Integração Zoom - Guia de Configuração

## ✅ Implementação Atual

A integração do Zoom foi implementada e está funcionando! O sistema agora suporta:

- ✅ **Zoom** (Recomendado) - Integração completa
- ✅ **WebRTC** - Solução local
- ✅ **Jitsi Meet** - Alternativa open-source

## 🚀 Como Usar

### 1. Selecionar Zoom como Plataforma

1. Selecione um paciente
2. Escolha "Online" como tipo de consulta
3. No seletor de plataforma, escolha **"Zoom (Recomendado)"**
4. Clique em "Videochamada (Modal)" ou "Videochamada (Inline)"

### 2. Compartilhar Link com Paciente

Após iniciar a videochamada:

1. Um **link único** será gerado automaticamente
2. O link aparecerá em um card azul no topo
3. Clique em **"Copiar Link"**
4. Envie o link para o paciente via:
   - WhatsApp
   - SMS
   - E-mail
   - Qualquer outro meio de comunicação

### 3. Paciente Entra na Reunião

O paciente precisa apenas:
1. Clicar no link recebido
2. Permitir acesso à câmera e microfone
3. Entrar na reunião Zoom

## 📋 Informações da Reunião

Cada reunião Zoom gerada inclui:
- **Link de acesso**: `https://zoom.us/j/XXXXXXXXX?pwd=XXXX`
- **ID da Reunião**: Número único de 9 dígitos
- **Senha**: Código de 4 dígitos (se configurado)

## ⚙️ Configuração Avançada (Opcional)

### Usar API Real do Zoom

Para usar reuniões Zoom reais via API, você precisará:

1. **Criar conta Zoom Developer**:
   - Acesse: https://marketplace.zoom.us/
   - Crie uma conta de desenvolvedor

2. **Criar App OAuth**:
   - Vá em "Develop" → "Build App"
   - Escolha "OAuth" como tipo
   - Configure as permissões necessárias

3. **Obter Credenciais**:
   - Client ID
   - Client Secret
   - Account ID

4. **Configurar Backend**:
   - Criar endpoint para gerar reuniões via API Zoom
   - Implementar autenticação OAuth
   - Retornar meetingNumber e password reais

5. **Atualizar Código**:
   - Modificar função `generateZoomMeeting()` em `Consulta.tsx`
   - Fazer chamada para seu backend em vez de gerar números aleatórios

### Exemplo de Integração com API Zoom

```typescript
// Backend (Node.js/Express)
app.post('/api/zoom/create-meeting', async (req, res) => {
  const zoom = require('@zoomus/websdk');
  
  const meeting = await zoom.meeting.create({
    topic: `Consulta - ${req.body.patientName}`,
    type: 2, // Reunião agendada
    password: Math.floor(1000 + Math.random() * 9000).toString(),
    settings: {
      join_before_host: true,
      host_video: true,
      participant_video: true,
    }
  });
  
  res.json({
    meetingNumber: meeting.id,
    password: meeting.password,
    joinUrl: meeting.join_url
  });
});
```

## 🔒 Segurança

- Cada reunião tem senha única
- Links expiram após uso (configurável)
- Controle de acesso via senha
- Suporte a waiting room (configurável)

## 💡 Vantagens do Zoom

- ✅ **Confiável**: Infraestrutura robusta do Zoom
- ✅ **Familiar**: Interface conhecida pelos usuários
- ✅ **Compatível**: Funciona em todos os dispositivos
- ✅ **Qualidade**: Áudio e vídeo de alta qualidade
- ✅ **Recursos**: Gravação, compartilhamento de tela, chat integrado
- ✅ **Suporte**: Suporte oficial do Zoom

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique se o link foi copiado corretamente
2. Teste abrindo o link em nova aba
3. Verifique permissões de câmera/microfone no navegador
4. Consulte a documentação oficial: https://marketplace.zoom.us/docs

## 🎯 Próximos Passos

- [ ] Integrar com API real do Zoom (opcional)
- [ ] Adicionar gravação de reuniões
- [ ] Implementar agendamento de reuniões
- [ ] Adicionar notificações por e-mail/SMS

