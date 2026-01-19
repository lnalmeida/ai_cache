using AICacheAPI.Context;
using AICacheAPI.Data.Repositories;
using AICacheAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AICacheAPI.Tests;

public class AICacheRepositoryTests
{
    private DbContextOptions<AICacheDbContext> CreateNewContextOptions()
    {
        return new DbContextOptionsBuilder<AICacheDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task SaveAsync_WhenNew_ShouldAddResponse()
    {
        // Arrange
        var options = CreateNewContextOptions();
        var newResponse = new AIResponse { Prompt = "Test", PromptHash = "hash1", Response = "Response" };

        // Act
        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            await repository.SaveAsync(newResponse);
            await repository.SaveChangesAsync();
        }

        // Assert
        using (var context = new AICacheDbContext(options))
        {
            Assert.Equal(1, await context.AIResponses.CountAsync());
            Assert.Equal("Test", (await context.AIResponses.FirstAsync()).Prompt);
        }
    }

    [Fact]
    public async Task SaveAsync_WhenExisting_ShouldUpdateResponse()
    {
        // Arrange
        var options = CreateNewContextOptions();
        var originalResponse = new AIResponse { Prompt = "Original", PromptHash = "hash1", Response = "Original Response" };
        using (var context = new AICacheDbContext(options))
        {
            context.AIResponses.Add(originalResponse);
            await context.SaveChangesAsync();
        }

        var updatedResponse = new AIResponse { Prompt = "Updated", PromptHash = "hash1", Response = "Updated Response" };

        // Act
        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            await repository.SaveAsync(updatedResponse);
            await repository.SaveChangesAsync();
        }

        // Assert
        using (var context = new AICacheDbContext(options))
        {
            Assert.Equal(1, await context.AIResponses.CountAsync());
            var finalResponse = await context.AIResponses.FirstAsync();
            Assert.Equal("Updated Response", finalResponse.Response);
        }
    }

    [Fact]
    public async Task SearchPagedAsync_ShouldReturnCorrectPage()
    {
        // Arrange
        var options = CreateNewContextOptions();
        using (var context = new AICacheDbContext(options))
        {
            for (int i = 1; i <= 15; i++)
            {
                context.AIResponses.Add(new AIResponse { Prompt = $"Item {i}", Response = "Searchable content" });
            }
            await context.SaveChangesAsync();
        }

        // Act
        PagedResult<AIResponse> result;
        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            // Pede a segunda página, com 5 itens por página
            result = await repository.SearchPagedAsync("content", 2, 5);
        }

        // Assert
        Assert.NotNull(result);
        Assert.Equal(15, result.TotalCount);
        Assert.Equal(5, result.Items.Count());
        Assert.Equal("Item 6", result.Items.First().Prompt); // O primeiro item da segunda página
    }

    [Fact]
    public async Task GetByPromprHashAsync_ShouldReturnCorrectResponse()
    {
        // Arrange
        var options = CreateNewContextOptions();
        var targetHash = "findme";
        using (var context = new AICacheDbContext(options))
        {
            context.AIResponses.AddRange(
                new AIResponse { PromptHash = "hash1", Prompt = "Prompt 1" },
                new AIResponse { PromptHash = targetHash, Prompt = "Prompt To Find" },
                new AIResponse { PromptHash = "hash3", Prompt = "Prompt 3" }
            );
            await context.SaveChangesAsync();
        }

        // Act
        AIResponse? result;
        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            result = await repository.GetByPromprHashAsync(targetHash);
        }

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Prompt To Find", result.Prompt);
    }
}