# Stage 1: Build a aplicação
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copia os arquivos de projeto e restaura as dependências primeiro para aproveitar o cache do Docker
COPY *.sln .
COPY src/*.csproj ./src/
COPY tests/*.csproj ./tests/  

RUN dotnet restore "AICacheAPI.sln"

# Copia o resto do código fonte
COPY . .

# Publica a aplicação em modo Release, garantindo que o projeto correto seja publicado
RUN dotnet publish "src/AICacheAPI.csproj" -c Release -o /app/out

# Stage 2: Cria a imagem final de runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Expõe a porta 8080 para o container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Copia os artefatos publicados do estágio de build
COPY --from=build /app/out .

# Define o ponto de entrada para a aplicação
ENTRYPOINT ["dotnet", "AICacheAPI.dll"]
