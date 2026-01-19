using AICacheAPI.Context;
using AICacheAPI.Data.Repositories;
using AICacheAPI.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AICacheAPI.Tests;

public class AICacheRepositoryTests
{
    private DbContextOptions<AICacheDbContext> CreateOptions(SqliteConnection connection)
    {
        return new DbContextOptionsBuilder<AICacheDbContext>()
            .UseSqlite(connection)
            .Options;
    }

    [Fact]
    public async Task SaveAsync_WhenNew_ShouldAddResponse()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();
        var options = CreateOptions(connection);
        using (var context = new AICacheDbContext(options)) context.Database.EnsureCreated();
        
        var newResponse = new AIResponse { Prompt = "Test", PromptHash = "hash1", Response = "Response" };

        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            await repository.SaveAsync(newResponse);
            await repository.SaveChangesAsync();
        }

        using (var context = new AICacheDbContext(options))
        {
            Assert.Equal(1, await context.AIResponses.CountAsync());
            Assert.Equal("Test", (await context.AIResponses.FirstAsync()).Prompt);
        }
    }

    [Fact]
    public async Task SaveAsync_WhenExisting_ShouldUpdateResponse()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();
        var options = CreateOptions(connection);
        using (var context = new AICacheDbContext(options))
        {
            context.Database.EnsureCreated();
            context.AIResponses.Add(new AIResponse { Prompt = "Original", PromptHash = "hash1", Response = "Original Response" });
            await context.SaveChangesAsync();
        }
        var updatedResponse = new AIResponse { Prompt = "Updated", PromptHash = "hash1", Response = "Updated Response" };

        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            await repository.SaveAsync(updatedResponse);
            await repository.SaveChangesAsync();
        }

        using (var context = new AICacheDbContext(options))
        {
            Assert.Equal(1, await context.AIResponses.CountAsync());
            Assert.Equal("Updated Response", (await context.AIResponses.FirstAsync()).Response);
        }
    }

    [Fact]
    public async Task SearchPagedAsync_ShouldReturnCorrectPage_AndHandleLike()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();
        var options = CreateOptions(connection);
        using (var context = new AICacheDbContext(options))
        {
            context.Database.EnsureCreated();
            for (int i = 1; i <= 15; i++)
            {
                var content = i % 2 == 0 ? "searchable content" : "other stuff";
                context.AIResponses.Add(new AIResponse { Prompt = $"Item {i}", Response = content, PromptHash = $"hash{i}"});
            }
            await context.SaveChangesAsync();
        }

        PagedResult<AIResponse> result;
        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            result = await repository.SearchPagedAsync("searchable", 1, 5);
        }

        Assert.NotNull(result);
        Assert.Equal(7, result.TotalCount);
        Assert.Equal(5, result.Items.Count());
        // CORREÇÃO: Verifica o item mais novo ("Item 14"), que deve estar na primeira página
        // devido à ordenação decrescente.
        Assert.Contains(result.Items, r => r.Prompt == "Item 14");
    }

    [Fact]
    public async Task GetByPromptHashAsync_ShouldReturnCorrectResponse()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();
        var options = CreateOptions(connection);
        var targetHash = "findme";
        using (var context = new AICacheDbContext(options))
        {
            context.Database.EnsureCreated();
            context.AIResponses.AddRange(
                new AIResponse { PromptHash = "hash1", Prompt = "Prompt 1" },
                new AIResponse { PromptHash = targetHash, Prompt = "Prompt To Find" },
                new AIResponse { PromptHash = "hash3", Prompt = "Prompt 3" }
            );
            await context.SaveChangesAsync();
        }

        AIResponse? result;
        using (var context = new AICacheDbContext(options))
        {
            var repository = new AICacheRepository(context);
            result = await repository.GetByPromptHashAsync(targetHash);
        }

        Assert.NotNull(result);
        Assert.Equal("Prompt To Find", result.Prompt);
    }
}