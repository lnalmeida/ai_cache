using AICacheAPI.Models;
using System.Net;
using System.Net.Http.Json;
using AICacheAPI.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AICacheAPI.Tests;

public class AICacheControllerTests : IClassFixture<AICacheApiFactory>
{
    private readonly HttpClient _client;
    private readonly AICacheApiFactory _factory;

    public AICacheControllerTests(AICacheApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_WhenNoItems_ReturnsOkWithEmptyResult()
    {
        // Act
        var response = await _client.GetAsync("/api/aicache/all");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ServiceResult<PagedResult<AIResponse>>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Empty(result.Data.Items);
    }

    [Fact]
    public async Task Save_WithValidRequest_ReturnsOkWithSavedData()
    {
        // Arrange
        var request = new SaveRequest
        {
            Prompt = "This is a test prompt for E2E",
            Response = "This is a valid response for the end-to-end test.",
            FileName = "e2e.cs",
            Tags = "e2e, test",
            TechStack = "aspnetcore"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/aicache/save", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ServiceResult<AIResponse>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(request.Prompt, result.Data.Prompt);
        Assert.Equal("Registro salvo com sucesso", result.Message);
    }
    
    [Fact]
    public async Task Search_WhenItemsExist_ReturnsMatchingResults()
    {
        // Arrange
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AICacheAPI.Context.AICacheDbContext>();
            context.AIResponses.Add(new AIResponse { Prompt = "A prompt about dotnet", Response = "A response about dotnet.", PromptHash = "dotnet_hash" });
            await context.SaveChangesAsync();
        }

        // Act
        var response = await _client.GetAsync("/api/aicache/search?query=dotnet");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ServiceResult<PagedResult<AIResponse>>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data.Items);
        Assert.Equal("A prompt about dotnet", result.Data.Items.First().Prompt);
    }

    [Fact]
    public async Task GetByHash_WithSimpleHash_ReturnsCorrectItem()
    {
        // Arrange
        var targetHash = "simplehash123";
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AICacheAPI.Context.AICacheDbContext>();
            context.AIResponses.Add(new AIResponse { Prompt = "Simple Hash Prompt", PromptHash = targetHash });
            await context.SaveChangesAsync();
        }

        // Act
        var response = await _client.GetAsync($"/api/aicache/hash/{targetHash}");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ServiceResult<AIResponse>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(targetHash, result.Data.PromptHash);
    }

    [Fact]
    public async Task GetByHash_WithSlashInHash_ReturnsCorrectItem()
    {
        // Arrange
        // Hashes Base64 frequentemente contêm '/'. A rota precisa ser capaz de lidar com isso.
        var targetHashWithSlash = "hash/with/slash";
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AICacheAPI.Context.AICacheDbContext>();
            context.AIResponses.Add(new AIResponse { Prompt = "Slash Hash Prompt", PromptHash = targetHashWithSlash });
            await context.SaveChangesAsync();
        }

        // Act
        // A requisição precisa ser feita com o hash devidamente encodado para URL.
        var encodedHash = WebUtility.UrlEncode(targetHashWithSlash);
        var response = await _client.GetAsync($"/api/aicache/hash/{encodedHash}");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ServiceResult<AIResponse>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(targetHashWithSlash, result.Data.PromptHash);
    }
}
