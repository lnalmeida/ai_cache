# AICacheAPI

AICacheAPI é um serviço de backend projetado para atuar como um cache inteligente para respostas de IA. Seu principal objetivo é armazenar e recuperar respostas geradas por modelos de linguagem ou outras fontes de IA, melhorando a performance, reduzindo custos com APIs externas e garantindo a consistência dos dados.

## Features Principais

- **Cache de Respostas:** Salva respostas de IA associadas a um prompt, tags, stack de tecnologia e nome de arquivo.
- **Busca Flexível:** Permite a busca por palavras-chave em todos os campos relevantes (`Prompt`, `Response`, `Tags`, etc.).
- **Recuperação por Hash:** Cada prompt é associado a um hash único (SHA256), permitindo a recuperação direta e rápida de uma resposta.
- **Paginação:** Todos os endpoints que retornam listas (`/all` e `/search`) são paginados para garantir a performance com grandes volumes de dados.
- **Rate Limiting:** Protege a API contra uso abusivo com uma política de limitação de taxa baseada no endereço de IP do cliente (30 requisições por minuto).

## Tech Stack

- **Framework:** .NET 9 / ASP.NET Core
- **ORM:** Entity Framework Core 9
- **Banco de Dados:** SQLite (configurado para desenvolvimento e testes)
- **Testes:**
  - **xUnit:** Framework de testes.
  - **Moq:** Para mocking em testes unitários.
  - **Microsoft.AspNetCore.Mvc.Testing:** Para testes de ponta a ponta (E2E).

## Estrutura do Projeto

O projeto segue uma arquitetura em camadas para separação de responsabilidades:

- **/Controllers:** Expõe os endpoints da API.
- **/Services:** Contém a lógica de negócio da aplicação.
- **/Data:**
  - **/Repositories:** Abstrai o acesso aos dados.
  - **/Context:** Define o `DbContext` do Entity Framework.
- **/Interfaces:** Define os contratos para os serviços e repositórios.
- **/Models:** Contém os modelos de dados e DTOs.
- **/tests:** Contém a suíte de testes automatizados (Unitários, Integração e E2E).

## API Endpoints

| Método | Endpoint                      | Descrição                                                                 |
| :----- | :---------------------------- | :------------------------------------------------------------------------ |
| `POST` | `/api/aicache/save`             | Salva ou atualiza uma resposta de IA.                                     |
| `GET`  | `/api/aicache/all`              | Retorna todos os registros de forma paginada.                             |
| `GET`  | `/api/aicache/search`           | Busca registros por palavra-chave de forma paginada.                      |
| `GET`  | `/api/aicache/hash/{*hash}`     | Retorna um registro específico pelo seu hash.                             |

## Como Executar

### Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### 1. Executar a Aplicação

Navegue até a pasta `src/` e execute o comando:
```sh
dotnet run
```
A API estará disponível em `https://localhost:<porta>` e `http://localhost:<porta>`.

### 2. Executar os Testes

Navegue até a pasta raiz do projeto (`api/`) e execute o comando:
```sh
dotnet test
```
Isso executará todos os testes unitários, de integração e E2E.
