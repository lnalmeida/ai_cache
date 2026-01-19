# Estratégia de Testes - AICacheAPI

Este documento descreve a estratégia de testes adotada para garantir a qualidade, confiabilidade e manutenibilidade da `AICacheAPI`.

## Visão Geral

Adotamos uma abordagem de testes em três camadas, focando em **Testes Unitários** para a lógica de negócio, **Testes de Integração** para a camada de dados, e **Testes de Ponta a Ponta (E2E)** para os controllers da API.

---

## 1. Testes Unitários (`AICacheServiceTests`)

O objetivo é validar a lógica de negócio da aplicação de forma rápida e isolada.

- **Alvo:** `AICacheService`.
- **Ferramentas:** xUnit e Moq.
- **Metodologia:** A camada de serviço é testada em completo isolamento. Suas dependências (como o `IAICacheRepository`) são substituídas por "dublês" (mocks) para simular o comportamento do banco de dados.

### Cenários Cobertos:
- Validação de entrada em `SaveCodeAsync`.
- Diferença entre criação e atualização de registros.
- Lógica de fallback da busca para `GetAll`.
- Tratamento de falha para hashes não encontrados.

---

## 2. Testes de Integração (`AICacheRepositoryTests`)

O objetivo é validar a interação entre a aplicação e o banco de dados, garantindo que as consultas do Entity Framework Core funcionem como esperado.

- **Alvo:** `AICacheRepository`.
- **Ferramentas:** xUnit e `Microsoft.EntityFrameworkCore.Sqlite` (em modo "in-memory").
- **Metodologia:** Usamos um banco de dados SQLite real que existe apenas em memória durante a execução de cada teste. Isso nos permite testar as consultas SQL geradas pelo EF Core em um ambiente de alta fidelidade.

### Cenários Cobertos:
- Persistência e atualização de dados.
- Funcionalidade da busca com `LIKE` em múltiplos campos.
- Lógica de paginação (`Skip` e `Take`) e ordenação.
- Busca direta por hash.

---

## 3. Testes de Ponta a Ponta (E2E) (`AICacheControllerTests`)

O objetivo é validar o fluxo completo da aplicação, desde a requisição HTTP até a resposta, garantindo que todas as camadas funcionem corretamente em conjunto.

- **Alvo:** `AICacheController`.
- **Ferramentas:** xUnit e `Microsoft.AspNetCore.Mvc.Testing`.
- **Metodologia:** Usamos a `WebApplicationFactory` para hospedar a API em memória. Os testes enviam requisições HTTP reais para os endpoints e validam os códigos de status e o conteúdo das respostas JSON. O banco de dados de produção é substituído por um banco de dados SQLite em memória.

### Cenários Cobertos:
- **Fluxo Completo:** Testa os endpoints `GET /all`, `POST /save`, e `GET /search`.
- **Roteamento Especial:** Valida que a rota `GET /hash/{*hash}` funciona corretamente, mesmo com hashes que contêm caracteres especiais como `/`, testando a decodificação de URL.
- **Manipulação de Banco de Dados:** Insere dados diretamente no banco de teste para preparar cenários de busca específicos.

---

## Cobertura de Testes (Estimativa)

- **`AICacheService` (Lógica de Negócio):** ~90-95%
- **`AICacheRepository` (Acesso a Dados):** ~95-100%
- **`AICacheController` (Integração E2E):** ~80-90%

A **cobertura geral da lógica crítica** da aplicação agora está em torno de **90-95%**.

## Como Executar os Testes

Navegue até a pasta raiz da solução (`api/`) e execute o seguinte comando:

```sh
dotnet test
```
