# 🔧 Configuração do Jitsi Meet

## ⚠️ Problema Atual

Se você está vendo a tela de pré-join ("Pedir para participar na reunião"), significa que:

1. **Ainda está usando Jitsi público** (`meet.jit.si`) - que não permite desabilitar pré-join via URL
2. **OU** o arquivo `.env` não está configurado corretamente

## ✅ Solução: Configurar Jitsi Próprio

### Passo 1: Criar arquivo `.env`

Na **raiz do projeto** (mesmo nível do `package.json`), crie um arquivo chamado `.env`:

```env
VITE_JITSI_DOMAIN=https://meet.seudominio.com.br
```

**⚠️ IMPORTANTE:**
- Substitua `https://meet.seudominio.com.br` pelo domínio do seu servidor Jitsi
- Não use aspas no valor
- Não deixe espaços antes ou depois do `=`
- O domínio deve começar com `https://`

### Passo 2: Verificar se o arquivo está correto

O arquivo `.env` deve estar na raiz do projeto:

```
clinic-cacto-boost-main/
├── .env                    ← AQUI
├── package.json
├── src/
├── jitsi-docker/
└── ...
```

### Passo 3: Reiniciar o servidor de desenvolvimento

**IMPORTANTE:** Após criar ou modificar o `.env`, você **DEVE** reiniciar o servidor:

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

### Passo 4: Verificar no Console do Navegador

Abra o Console do Navegador (F12 → Console) e procure por:

```
📋 Configuração Jitsi:
  - VITE_JITSI_DOMAIN: https://meet.seudominio.com.br
  - Domínio usado: https://meet.seudominio.com.br
  - É Jitsi próprio: true
```

Se aparecer `É Jitsi próprio: false`, significa que o `.env` não está sendo lido corretamente.

## 🔍 Troubleshooting

### Problema: Ainda mostra "meet.jit.si" na URL

**Causa:** O arquivo `.env` não está sendo lido.

**Soluções:**
1. Verifique se o arquivo está na raiz do projeto
2. Verifique se o nome do arquivo é exatamente `.env` (não `.env.local` ou `.env.example`)
3. Reinicie o servidor após criar/modificar o `.env`
4. Verifique se não há erros de sintaxe no `.env`

### Problema: Ainda aparece tela de pré-join mesmo com Jitsi próprio

**Causa:** O servidor Jitsi não está configurado para desabilitar pré-join.

**Solução:** Configure o servidor Jitsi conforme o guia em `jitsi-docker/DEPLOY.md`:
- Configure `ENABLE_PREJOIN_PAGE=0` no `.env` do Docker
- Edite `~/.jitsi-meet-cfg/web/config.js` e adicione:
  ```javascript
  config.prejoinPageEnabled = false;
  config.skipPrejoinPage = true;
  ```
- Reinicie o container: `docker compose restart web`

### Problema: Erro "Cannot read property 'trim' of undefined"

**Causa:** Versão antiga do código.

**Solução:** Atualize o código para a versão mais recente.

## 📝 Exemplo Completo

### Arquivo `.env` na raiz do projeto:

```env
VITE_JITSI_DOMAIN=https://meet.CactoSaude.com.br
```

### Verificação:

1. Abra o Console do Navegador (F12)
2. Recarregue a página
3. Procure por: `📋 Configuração Jitsi`
4. Verifique se `É Jitsi próprio: true`

## 🚀 Próximos Passos

Após configurar corretamente:

1. O sistema detectará automaticamente que é Jitsi próprio
2. Aplicará parâmetros para desabilitar pré-join
3. A videochamada entrará automaticamente (sem tela de pré-join)
4. A mensagem informativa não aparecerá mais

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs no Console do Navegador
2. Verifique os logs do servidor Jitsi: `docker compose logs web`
3. Verifique se o domínio está acessível: `curl https://meet.seudominio.com.br`

