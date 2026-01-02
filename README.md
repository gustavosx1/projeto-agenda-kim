# Agenda Bianca - Aplicação de Calendário com React + Vite

Aplicação moderna de agendamento com suporte a eventos, notificações push e sincronização em tempo real com Supabase.

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/gustavosx1/projeto-agenda-kim.git
cd agenda-bianca
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas chaves do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_VAPID_PUBLIC_KEY=sua-chave-vapid-publica
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 📦 Build para Produção

```bash
npm run build
```

## 🔐 Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias (todas públicas e seguras):

- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase (segura para expor)
- `VITE_VAPID_PUBLIC_KEY` - Chave pública VAPID para Web Push (segura para expor)

**Nota:** As variáveis com prefixo `VITE_` são públicas por design no Vite e são expostas no bundle. Use apenas chaves que são seguras de expor publicamente.

## 🌐 Deploy no Netlify

O projeto inclui `netlify.toml` configurado para:
- Builds automáticos
- Variáveis de ambiente do Supabase
- Headers de segurança
- Configuração de secrets scanning

Simplesmente conecte seu repositório ao Netlify e configure as variáveis de ambiente no painel da Netlify.

## 📱 Funcionalidades

- ✅ Calendário semanal com vista de 7 dias
- ✅ Agendas (Publis) e Compromissos
- ✅ Notificações push web
- ✅ Autenticação com Supabase
- ✅ Formulários dinâmicos
- ✅ Sincronização em tempo real
- ✅ Responsivo para mobile

## 🛠️ Stack Tecnológico

- React 18+
- Vite
- Supabase (Auth + Database + Edge Functions)
- Web Push API
- Netlify

