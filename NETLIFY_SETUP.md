# Instruções de Deploy no Netlify

## 🔧 Configuração no Painel do Netlify

### 1. Variáveis de Ambiente
No painel do Netlify, acesse **Site settings → Build & deploy → Environment**

Adicione as seguintes variáveis de ambiente:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-chave-anonima-aqui
VITE_VAPID_PUBLIC_KEY = sua-chave-vapid-publica-aqui
```

### 2. Build Settings
Certifique-se de que os build settings estão configurados como:
- **Base directory:** (deixe em branco)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3. Deploy Hook (Opcional)
Se quiser fazer redeploys automáticos, crie um Deploy Hook em:
**Site settings → Build & deploy → Deploy notifications → Outgoing webhooks**

## 🔐 Segurança

### Por que as variáveis VITE_* são públicas?

No Vite, variáveis de ambiente com prefixo `VITE_` são **intencionalmente expostas no bundle JavaScript** porque são destinadas a serem públicas no cliente.

- `VITE_SUPABASE_ANON_KEY`: É uma chave **anônima** por design. Ela tem permissões limitadas apenas para leitura pública.
- `VITE_SUPABASE_URL`: É apenas a URL da sua aplicação.
- `VITE_VAPID_PUBLIC_KEY`: É uma chave **pública** para Web Push.

Nenhuma dessas variáveis pode fazer operações sensíveis. Para operações admin, use `SUPABASE_SERVICE_ROLE_KEY` (sem prefixo VITE_) apenas no servidor/edge functions.

### Configuração de Secrets Scanning

O arquivo `netlify.toml` já contém a configuração:
```toml
[[env]]
  variable = "SECRETS_SCAN_OMIT_KEYS"
  value = "VITE_SUPABASE_ANON_KEY,VITE_SUPABASE_URL,VITE_VAPID_PUBLIC_KEY"
```

Isso diz ao Netlify para ignorar os false positives de secrets scanning para essas variáveis públicas.

## ✅ Próximas Etapas

1. Commit e push do código para GitHub ✓
2. Conectar repositório no Netlify
3. Adicionar variáveis de ambiente no painel
4. Fazer o primeiro deploy

## 🚀 Após o Deploy

Para testar a aplicação em produção:
1. Acesse a URL do site no Netlify
2. Teste login, criar eventos, notificações
3. Verifique se os eventos sincronizam com Supabase

## 📊 Monitoramento

Você pode acompanhar:
- **Deploys**: Em Deployments
- **Logs de build**: Em Deploys → clique na versão
- **Erros de runtime**: Em Analytics → Error tracking
- **Performance**: Em Analytics → Lighthouse
