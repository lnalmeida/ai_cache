# Estratégia de Testes - AICacheAPI

Este documento descreve a estratégia de testes adotada para garantir a qualidade, confiabilidade e manutenibilidade da `AICacheAPI`.

## Visão Geral

Adotamos uma abordagem de testes em duas camadas, focando em **Testes Unitários** para a lógica de negócio e **Testes de Integração** para a camada de acesso a dados.

---

## 1. Testes Unitários (`AICacheServiceTests`)

O objetivo dos testes unitários é validar a lógica de negócio da aplicação de forma rápida e isolada.

- **Alvo:** `AICacheService`.
- **Ferramentas:** xUnit e Moq.
- **Metodologia:** A camada de serviço é testada em completo isolamento. Suas dependências, como o `IAICacheRepository`, são substituídas por "dublês" (mocks) criados com a biblioteca Moq. Isso nos permite simular diferentes cenários (ex: o repositório encontra ou não um registro) sem a necessidade de um banco de dados.

### Cenários Cobertos:
- **Validação de Entrada:** Garante que o serviço recusa requisições com dados inválidos (ex: `Prompt` vazio, `Response` muito curta) antes de qualquer operação.
- **Criação vs. Atualização:** Testa o fluxo de `SaveCodeAsync`, verificando se ele corretamente cria um novo registro ou atualiza um existente.
- **Lógica de Busca:** Confirma que uma busca com `query` vazia no método `SearchPagedAsync` corretamente aciona a busca geral (`GetAllPromptsPagedAsync`).
- **Tratamento de Erro:** Verifica se o serviço retorna uma mensagem de falha graciosa ao buscar um hash que não existe.

---

## 2. Testes de Integração (`AICacheRepositoryTests`)

O objetivo dos testes de integração é validar a interação entre a nossa aplicação e o banco de dados, garantindo que as consultas do Entity Framework Core funcionem como esperado.

- **Alvo:** `AICacheRepository`.
- **Ferramentas:** xUnit e `Microsoft.EntityFrameworkCore.Sqlite` (em modo "in-memory").
- **Metodologia:** Em vez de mocks, usamos um banco de dados SQLite real que existe apenas em memória durante a execução de cada teste. Isso nos permite testar as consultas SQL geradas pelo EF Core em um ambiente de alta fidelidade. Cada teste é executado em um banco de dados completamente isolado para evitar interferências.

### Cenários Cobertos:
- **Persistência de Dados:** Confirma que o método `SaveAsync` salva e atualiza registros no banco de dados corretamente.
- **Funcionalidade do `LIKE`:** Valida que a consulta de busca (`SearchPagedAsync`) funciona corretamente, encontrando registros que contenham o termo de busca em qualquer um dos campos designados (incluindo o `Response`).
- **Lógica de Paginação:** Assegura que a paginação (`Skip` e `Take`) está funcionando, retornando o subconjunto correto de dados.
- **Ordenação:** Confirma que os resultados são retornados na ordem esperada (`OrderByDescending`).
- **Busca Direta por Hash:** Valida que o método `GetByPromprHashAsync` retorna o registro exato correspondente ao hash.

---

## Cobertura de Testes (Estimativa)

- **`AICacheService` (Lógica de Negócio):** ~90-95%
- **`AICacheRepository` (Acesso a Dados):** ~95-100%
- **`AICacheController` (API Endpoints):** 0% (geralmente coberto por testes E2E)

A **cobertura geral da lógica crítica** da aplicação está em torno de **80-85%**.

## Como Executar os Testes

Navegue até a pasta raiz da solução (`api/`) e execute o seguinte comando:

```sh
dotnet test
```
