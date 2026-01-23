# AICache

> 🇧🇷 Português | 🇺🇸 [English](README.en.md)

AICache é uma solução completa (API + Web) para **cache e catalogação de respostas de IA**.
Ela permite armazenar prompts, respostas, metadados (tags, tech stack, arquivo de origem) e depois
consultar esse histórico de forma rápida, paginada e com busca flexível.

## Visão Geral do Projeto

O projeto é dividido em dois módulos principais:

- `api/` — **AICacheAPI**: backend em .NET que expõe endpoints REST para salvar, buscar e recuperar respostas de IA.
- `web/` — **AICache Web**: frontend em React/TypeScript que consome a API, permitindo navegar, buscar e salvar prompts em uma interface amigável.

A ideia central é funcionar como um **"repositório pessoal de conversas/gerações de IA"**, otimizando:

- **Produtividade**: reaproveitar respostas já geradas.
- **Custo**: reduzir chamadas repetidas a APIs externas de IA.
- **Consistência**: manter um histórico versionado com metadados relevantes.

---

## Objetivos

- Fornecer uma **API simples e eficiente** para persistir respostas de IA.
- Permitir **busca rápida** por prompt, resposta, tags, tech stack ou arquivo.
- Expor uma **UI moderna** para visualização, filtro e cópia rápida de prompts e respostas.
- Aplicar **boas práticas de arquitetura, testes automatizados e observabilidade** em um projeto de pequeno porte.

---

## Arquitetura Geral

### Módulo API (`api/`)

**Tech Stack principal**:

- **Linguagem/Framework**: .NET 9 / ASP.NET Core
- **ORM**: Entity Framework Core 9
- **Banco de Dados**: SQLite (desenvolvimento e testes)
- **Testes**:
  - xUnit
  - Moq
  - Microsoft.AspNetCore.Mvc.Testing (testes E2E/integrados)

**Principais componentes** (pastas em `api/src`):

- `Controllers/`
  - `AICacheController.cs`: expõe os endpoints REST sob `api/AICache`.
- `Services/`
  - `AICacheService.cs`: contém a lógica de negócio (salvar, buscar, paginar, buscar por hash, etc.).
- `Data/` (pode aparecer como Context/Repositories dependendo da organização)
  - `AICacheDbContext`: mapeamento EF Core.
  - `AICacheRepository`: acesso ao banco (consultas, paginação, filtros).
- `Interfaces/`
  - `IAICacheRepository`, `IAICacheService`: contratos para permitir teste e inversão de dependência.
- `Models/`
  - `AIResponse.cs`: entidade persistida.
  - `PagedResult.cs`: modelo de paginação.
  - `SaveRequest.cs`: DTO de entrada para salvar prompts.

**Configuração de pipeline** (trechos importantes de `Program.cs`):

- **Controllers + OpenAPI**: `AddControllers()`, `AddEndpointsApiExplorer()`, `AddOpenApi()` + `MapOpenApi()` em dev.
- **Rate limiting global**:
  - Usa `PartitionedRateLimiter` com chave baseada no IP do cliente.
  - Janela fixa de **30 requisições/minuto** por IP, com fila limitada.
  - Respostas 429 com cabeçalho `Retry-After`.
- **Banco de Dados**:
  - `AddDbContext<AICacheDbContext>` com SQLite via connection string `AICache`.
  - `EnsureCreated()` em startup para garantir criação do schema.
- **CORS**:
  - Política permissiva por padrão: `AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()` (facilita desenvolvimento com o frontend).

### Endpoints principais da API

Todos os endpoints vivem sob o prefixo `api/AICache` (ver `AICacheController`).

- `POST /api/AICache/save`
  - Salva ou atualiza uma resposta de IA.
  - Corpo baseado em `SaveRequest` (prompt, response, tags, techStack, fileName, etc.).
- `GET /api/AICache/all`
  - Retorna todos os registros de forma **paginada**.
  - Query params: `page`, `pageSize`.
- `GET /api/AICache/search`
  - Busca registros por palavra-chave e/ou outros critérios.
  - Query params: `query`, `page`, `pageSize` (e eventualmente filtros extras).
- `GET /api/AICache/hash/{*hash}`
  - Retorna um registro específico pelo hash do prompt.
  - Usa `WebUtility.UrlDecode` para tratar hashes com caracteres especiais.

> Para mais detalhes específicos da API, consulte `api/README.md` e `api/tests/README.md`.

---

## Módulo Web (`web/`)

**Tech Stack principal**:

- **Linguagem**: TypeScript
- **Framework**: React 19 + Vite
- **UI / Design System**:
  - Radix UI (Dialog, Label, Slot)
  - Componentes próprios (Button, Card, Badge, Dialog, etc.) com TailwindCSS e `class-variance-authority`
- **Styling**:
  - TailwindCSS
  - CSS utilitário e temas claro/escuro
- **Outras libs**:
  - `lucide-react` (ícones)
  - `react-router-dom` (navegação futura/possível)
  - `sonner` (toast de notificações)
  - `axios` (HTTP client, se usado em outros módulos)

Scripts principais (`web/package.json`):

- `npm run dev` — inicia o Vite em modo desenvolvimento.
- `npm run build` — build de produção (`tsc -b` + `vite build`).
- `npm run lint` — ESLint com regras para TS/TSX.
- `npm run preview` — preview do build gerado.

### Estrutura do frontend

Pastas principais em `web/src`:

- `App.tsx`
  - Componente raiz da aplicação (shell principal do AICache Web).
  - Gerencia:
    - modo de visualização (cards / tabela),
    - diálogos de salvar e detalhes de prompt,
    - integração com hooks (`useTheme`, `useOffline`, `useCopyToClipboard`),
    - busca integrada com a API (`promptApiService`).
- `main.tsx`
  - Bootstrap da aplicação React.
  - Renderiza `<Toaster />` (sonner) + `<App />` dentro de `React.StrictMode`.
- `components/`
  - `dialogs/`
    - `PromptDetailDialog.tsx`: exibe detalhes completos de um prompt (metadados, resposta formatada, botão de copiar, etc.).
    - `SavePromptDialog.tsx`: formulário para salvar um novo prompt (prompt, resposta, tags, tech stack, nome de arquivo) usando a API.
  - `prompts/`
    - `PromptCard.tsx`: card individual com resumo do prompt, tags, tech stack, data e botões de cópia.
    - `PromptCardsView.tsx`: grid de cards.
    - `PromptTableView.tsx`: tabela responsiva com prompts, útil para visão densa.
  - `layout/`
    - `OfflineBanner.tsx`: alerta quando a aplicação está offline.
    - `ThemeToggle.tsx`: alternância entre tema claro/escuro.
    - `PWAInstallButton.tsx`: integração com instalação PWA (quando aplicável).
    - `Toast.tsx`: toast customizado para feedback de cópia.
  - `search/`
    - `SearchBar.tsx`: barra de busca com integração com a API e botão de "salvar novo".
    - `ViewModeToggle.tsx`: alterna entre visão em cards e tabela, exibindo contagem de resultados.
  - `ui/`
    - Componentes de baixo nível (Button, Card, Dialog, Badge, Input, Textarea, etc.) construídos sobre Radix + Tailwind.
- `contexts/`
  - `ThemeContext.tsx`, `ThemeProvider.tsx`: contexto de tema global.
- `hooks/`
  - `useTheme.ts`: hook para acessar e alterar o tema.
  - `useOffline.ts`: hook para detectar status de conexão.
  - `useCopyToClipboard.ts`: hook que encapsula lógica de cópia e estado de feedback.
- `services/`
  - `promptService.ts`: integração com a API (`promptApiService`), responsável por:
    - Montar URL base (`API_BASE_URL` / `VITE_API_BASE_URL`).
    - Construir query strings (`SearchParams`).
    - Transformar o modelo retornado pela API (strings CSV de `tags`/`techStack`) no modelo de frontend (`Prompt` com arrays).
    - Métodos principais: `savePrompt`, `getAllPrompts`, `searchPrompts`, `getPromptByHash`.
- `types/`
  - `prompt.ts`:
    - `Prompt`: modelo usado na UI (arrays de `tags` e `techStack`).
    - `SavePromptDTO`: DTO usado para enviar dados à API (tags/techStack em string CSV).

### Fluxos principais da UI

- **Listagem inicial**
  - Ao montar o `AICacheContent` (`App.tsx`), é chamado `promptApiService.getAllPrompts` (página 1, tamanho 20) e a lista é armazenada em `prompts`.
- **Busca**
  - `SearchBar` chama `onSearch`, que dispara `promptApiService.searchPrompts` com `query`, `page` e `pageSize`.
  - Caso a `query` esteja vazia, volta para `getAllPrompts`.
- **Salvar novo prompt**
  - `SavePromptDialog` mantém estado de formulário (prompt, response, tags, techStack, fileName).
  - Ao salvar:
    - Valida campos obrigatórios (prompt e response).
    - Monta `SavePromptDTO` com `tags`/`techStack` em formato CSV.
    - Chama `promptApiService.savePrompt`.
    - Em caso de sucesso: exibe `toast.success`, fecha o diálogo e chama `onSaveSuccess`, que refaz o `fetchPrompts`.
- **Detalhes do prompt**
  - Ao clicar em um card/linha, é aberto `PromptDetailDialog` com o prompt selecionado.
  - O componente normaliza `tags` e `techStack` para listas (aceita tanto arrays quanto strings CSV), exibindo badges e metadata.
  - Disponibiliza botões de copiar para prompt e resposta.

---

## Padrões e Boas Práticas Adotados

### API

- **Arquitetura em camadas** (Controller → Service → Repository → DbContext).
- **Inversão de dependência** via interfaces (`IAICacheService`, `IAICacheRepository`).
- **Rate limiting** com `PartitionedRateLimiter` baseado em IP.
- **Paginação** padrão para retornos de lista (`PagedResult`).
- **Hash único** para identificar prompts e permitir recuperação direta.
- **Testes automatizados** em três níveis (Unitários, Integração, E2E), descritos em `api/tests/README.md`.

### Web

- **Separação de responsabilidades** clara:
  - Serviços de API (`promptApiService`) concentrando chamadas HTTP e transformação de dados.
  - Componentes de UI desacoplados da lógica de dados.
  - Hooks customizados para estados transversais (tema, offline, clipboard).
- **TypeScript forte**:
  - Modelos de domínio (`Prompt`, `SavePromptDTO`, `SearchParams`, etc.) bem tipados.
- **Padronização visual**:
  - Tailwind + componentes reutilizáveis (`ui/*`).
  - Uso de `class-variance-authority` para variantes de componentes.
- **Feedback ao usuário**:
  - Toasts (`sonner`) para sucesso/erro de operações.
  - Toast customizado para cópia rápida.
  - Tratamento visual para estados de loading/erro em listagens.

### Git / Commits

- Commits seguem um padrão **semântico**, por exemplo:
  - `feat(web): ...` — novas funcionalidades no frontend.
  - `feat(api): ...` — novas funcionalidades na API.
  - `fix(api): ...` — correções.
  - `chore(web): ...` — tarefas de infraestrutura/housekeeping.
- Mensagens curtas, objetivas e focadas em um conjunto pequeno e coeso de mudanças.

---

## Como Rodar o Projeto

### 1. Subir a API (`api/`)

Pré-requisitos:

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

Passos:

```sh
cd api
# executar migrações se necessário (ex.: dotnet ef database update)
cd src
dotnet run
```

A API estará disponível em `http://localhost:<porta>` (ver saída do `dotnet run`).

Para rodar os testes:

```sh
cd api
dotnet test
```

### 2. Subir o frontend (`web/`)

Pré-requisitos:

- Node.js + npm (versão compatível com Vite/React 19)

Passos:

```sh
cd web
npm install
npm run dev
```

Por padrão, o Vite sobe em `http://localhost:3000`.

A URL base da API pode ser configurada via variável de ambiente Vite
(ex.: `VITE_API_BASE_URL`) ou, em desenvolvimento, usa um default
similar a `http://localhost:8080/api/AICache` configurado em `promptService.ts`.

Para build de produção e preview:

```sh
npm run build
npm run preview
```

---

## Próximos Passos / Possíveis Evoluções

- Autenticação e autorização para acesso ao cache.
- Exportação/backup dos prompts em formatos como JSON/Markdown.
- Filtros avançados por linguagem/stack/tags múltiplas.
- Métricas e observabilidade (ex.: Prometheus/Grafana) na API.
- Versionamento de respostas para o mesmo prompt ao longo do tempo.
