# Sistema de Anexos - Agenda Bianca

## 📋 Visão Geral

O sistema de anexos permite que usuários façam upload de arquivos PDF, DOC, DOCX e TXT ao criar ou editar publicações (agendas). Os arquivos são armazenados como dados base64 no banco de dados PostgreSQL.

## 🔧 Arquitetura

### Componentes Envolvidos

#### 1. `src/utils/fileUtils.js` - Funções Utilitárias
Fornece funções auxiliares para manipulação de arquivos:

- **`fileToBase64(file)`** - Converte um arquivo individual para base64
- **`filesToBase64Array(files)`** - Converte múltiplos arquivos para array de base64
- **`isFileAllowed(file)`** - Valida extensão do arquivo (.pdf, .doc, .docx, .txt)
- **`getFileName(filePath)`** - Extrai nome do arquivo de uma URL ou caminho
- **`uploadFilesToStorage(files, userId, eventId)`** - Função placeholder para upload futuro em Supabase Storage
- **`deleteFileFromStorage(fileUrl)`** - Função placeholder para deleção em Supabase Storage

#### 2. `src/components/eventoForm.jsx` - Formulário de Eventos
Componente responsável pela interface de seleção e gerenciamento de arquivos:

```jsx
// Estados relacionados a arquivos
const [form, setForm] = useState({
  // ... outros campos
  anexo: initialData.anexo || [], // Array de base64 strings
});
const [uploadingFiles, setUploadingFiles] = useState(false);
const [selectedFiles, setSelectedFiles] = useState([]); // Info visual dos arquivos
```

**Fluxo:**
1. Usuário seleciona arquivo via `<input type="file" multiple>`
2. `handleFileSelect()` processa os arquivos:
   - Filtra por extensão permitida
   - Valida tamanho (máximo 10MB)
   - Converte para base64
   - Armazena no estado `form.anexo`
   - Mantém lista visual em `selectedFiles`
3. Usuário pode remover arquivo antes de salvar
4. Ao enviar formulário, base64 é incluído no objeto `form.anexo`

**Validações:**
- Apenas .pdf, .doc, .docx, .txt são aceitos
- Máximo 10MB por arquivo (futura implementação)
- Mensagens de erro amigáveis ao usuário

#### 3. `src/pages/expandDay.jsx` - Visualização de Detalhes
Exibe e permite download dos anexos:

```jsx
// Helper para extrair nome do arquivo de data URL
function getFileNameFromDataUrl(dataUrl) {
  // Extrai extensão do mime type
  // Retorna "Arquivo.pdf", "Arquivo.docx", etc.
}

// Renderização de anexos no modal
{selectedEvent.raw?.anexo && selectedEvent.raw.anexo.length > 0 && (
  <div>
    {selectedEvent.raw.anexo.map((file, idx) => (
      <a href={file} download={fileName}>
        Baixar
      </a>
    ))}
  </div>
)}
```

**Recursos:**
- Detecta tipo de arquivo automaticamente
- Link de download para cada arquivo
- Interface limpa e responsiva

#### 4. `src/services/agendaService.js` & `src/pages/criarEvento.jsx`/`editEvento.jsx`
Integração com banco de dados:

```javascript
// Base64 strings são armazenados no campo 'anexo' (text[])
const agendaData = {
  // ... outros campos
  anexo: formData.anexo, // Array de base64 strings
};

await createAgenda(agendaData);
```

### Banco de Dados

**Schema:**
```sql
CREATE TABLE agendas (
  -- ... outros campos
  anexo text[],  -- Array de strings (base64 ou URLs)
  -- ... outros campos
);
```

**Características:**
- Campo `anexo` é um array de texto
- Cada item pode ser:
  - Base64 data URL: `data:application/pdf;base64,JVBERi0xLjQK...`
  - URL pública (futura integração com Supabase Storage)
  - Caminho relativo (futura implementação)

## 🔄 Fluxo de Dados

### Criação de Evento com Anexos

```
Usuário seleciona arquivo
    ↓
handleFileSelect() processa
    ↓
Converte para base64
    ↓
Armazena em form.anexo
    ↓
Usuário clica "Salvar"
    ↓
createAgenda({ ..., anexo: [...base64...] })
    ↓
Banco de dados armazena array de base64
```

### Visualização de Evento com Anexos

```
User abre evento
    ↓
expandDay carrega dados
    ↓
Detecta anexos em selectedEvent.raw.anexo
    ↓
getFileNameFromDataUrl() extrai extensão
    ↓
Renderiza links de download
    ↓
Usuário clica "Baixar"
    ↓
Browser faz download usando data URL
```

## 📁 Estrutura de Pastas

```
src/
  components/
    eventoForm.jsx          ← Seleção e gerenciamento de arquivos
  pages/
    expandDay.jsx           ← Exibição e download de anexos
    criarEvento.jsx         ← Integração ao criar
    editEvento.jsx          ← Integração ao editar
  services/
    agendaService.js        ← Persistência no BD
  utils/
    fileUtils.js            ← Funções utilitárias
```

## 🎨 Interface Utilizador

### Ao Criar/Editar Evento

**Antes de selecionar arquivos:**
```
📎 Anexar arquivo (PDF, DOC, DOCX, TXT)
[Escolher arquivo]
```

**Após selecionar:**
```
📎 Anexar arquivo (PDF, DOC, DOCX, TXT)
[Escolher arquivo]

✓ 2 arquivo(s) selecionado(s):
  📄 documento.pdf (2.5 MB)     [Remover]
  📄 contrato.docx (150 KB)     [Remover]
```

### Ao Visualizar Evento

```
📎 Anexos:
  📄 documento.pdf       [Baixar]
  📄 contrato.docx      [Baixar]
```

## 🚀 Tecnologias Utilizadas

- **React Hooks:** `useState`, `useCallback` para gerenciamento de estado
- **FileReader API:** Leitura de arquivos e conversão para base64
- **Data URLs:** Armazenamento de arquivos como `data:` URLs
- **PostgreSQL:** Banco de dados com suporte a arrays
- **Supabase:** Banco de dados e autenticação

## 🔐 Considerações de Segurança

### Implementadas
- ✅ Validação de extensão de arquivo
- ✅ Filtro de tipos MIME (no futuro com upload em Storage)
- ✅ Limite de tamanho (10MB no código)

### Recomendações Futuras
- ⚠️ Validação de tamanho máximo total por usuário
- ⚠️ Varredura de antivírus para uploads em Storage
- ⚠️ Quotas de armazenamento por usuário
- ⚠️ Criptografia de dados sensíveis
- ⚠️ Auditoria de downloads

## 📈 Migração Futura para Supabase Storage

Quando escalar, migrar para:

```javascript
// Usar uploadFilesToStorage() para armazenar em bucket público
const urls = await uploadFilesToStorage(files, userId, eventId);

// Armazenar URLs públicas em vez de base64
const agendaData = {
  // ...
  anexo: urls, // Array de URLs públicas
};
```

**Benefícios:**
- Melhor performance (não carrega base64 no cliente)
- Histórico de versões
- Controle de acesso granular
- Limite de tamanho por arquivo maior
- Integração com CDN

## 🐛 Troubleshooting

### Arquivo não baixa
- Verificar se o navegador permite downloads de data URLs
- Validar se o arquivo foi convertido corretamente para base64

### Erro "Nenhum arquivo permitido"
- Confirmar extensão do arquivo (.pdf, .doc, .docx, .txt)
- Verificar se o arquivo tem tipo MIME correto

### Formulário lento ao adicionar arquivo grande
- Isso é esperado com base64 em memória
- Migrar para Supabase Storage resolverá

## 📚 Referências

- [MDN: FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [MDN: Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [PostgreSQL Array Types](https://www.postgresql.org/docs/current/arrays.html)
