using AICacheAPI.Interfaces;
using AICacheAPI.Models;
using AICacheAPI.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AICacheAPI.Tests;

public class AICacheServiceTests
{
    private readonly Mock<IAICacheRepository> _mockRepo;
    private readonly Mock<ILogger<AICacheService>> _mockLogger;
    private readonly AICacheService _service;

    public AICacheServiceTests()
    {
        _mockRepo = new Mock<IAICacheRepository>();
        _mockLogger = new Mock<ILogger<AICacheService>>();
        _service = new AICacheService(_mockRepo.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task SaveCodeAsync_WithValidRequest_ShouldReturnSuccess()
    {
        // Arrange
        var request = new SaveRequest
        {
            Prompt = "This is a valid prompt",
            Response = "This is a valid response with more than 10 characters",
            FileName = "test.cs",
            Tags = "csharp, test",
            TechStack = ".net"
        };

        _mockRepo.Setup(repo => repo.GetByPromptHashAsync(It.IsAny<string>()))
            .ReturnsAsync((AIResponse?)null); // Simula que não existe registro
        _mockRepo.Setup(repo => repo.SaveAsync(It.IsAny<AIResponse>()))
            .ReturnsAsync((AIResponse res) => res);

        // Act
        var result = await _service.SaveCodeAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Registro salvo com sucesso", result.Message);
    }
    
    [Fact]
    public async Task SaveCodeAsync_WhenRecordExists_ShouldUpdateAndReturnSuccess()
    {
        // Arrange
        var request = new SaveRequest
        {
            Prompt = "This is an existing prompt",
            Response = "This is the updated response",
            FileName = "updated.cs"
        };
        var existingResponse = new AIResponse { Id = 1, Prompt = "This is an existing prompt" };

        _mockRepo.Setup(repo => repo.GetByPromptHashAsync(It.IsAny<string>()))
            .ReturnsAsync(existingResponse); // Simula que o registro já existe
        _mockRepo.Setup(repo => repo.SaveAsync(It.IsAny<AIResponse>()))
            .ReturnsAsync((AIResponse res) => res);

        // Act
        var result = await _service.SaveCodeAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Registro atualizado com sucesso", result.Message);
        _mockRepo.Verify(repo => repo.SaveAsync(It.Is<AIResponse>(r => r.Id == existingResponse.Id)), Times.Once);
    }

    [Theory]
    [InlineData("", "some response", "file.cs", "Prompt não informado")]
    [InlineData("some prompt", "short", "file.cs", "Response deve ter pelo menos 10 caracteres")]
    [InlineData("some prompt", "some response", "", "Nome de arquivo não informado")]
    public async Task SaveCodeAsync_WithInvalidData_ShouldReturnFail(string prompt, string response, string fileName, string expectedMessage)
    {
        // Arrange
        var request = new SaveRequest
        {
            Prompt = prompt,
            Response = response,
            FileName = fileName
        };

        // Act
        var result = await _service.SaveCodeAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Null(result.Data);
        Assert.Equal(expectedMessage, result.Message);
    }
    
    [Fact]
    public async Task SearchPagedAsync_WithEmptyQuery_ShouldCallGetAll()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;
        var expectedResult = new PagedResult<AIResponse>();
        _mockRepo.Setup(repo => repo.GetAllPromptsPagedAsync(page, pageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _service.SearchPagedAsync("", page, pageSize);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        _mockRepo.Verify(repo => repo.GetAllPromptsPagedAsync(page, pageSize), Times.Once);
        _mockRepo.Verify(repo => repo.SearchPagedAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task SearchPagedAsync_WithValidQuery_ShouldReturnPagedResult()
    {
        // Arrange
        var query = "test";
        var page = 1;
        var pageSize = 10;
        var expectedResult = new PagedResult<AIResponse>
        {
            Items = new List<AIResponse> { new AIResponse { Prompt = "test prompt" } },
            TotalCount = 1,
            Page = page,
            PageSize = pageSize
        };

        _mockRepo.Setup(repo => repo.SearchPagedAsync(query, page, pageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _service.SearchPagedAsync(query, page, pageSize);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data.Items);
        Assert.Equal(1, result.Data.TotalCount);
    }
    
    [Fact]
    public async Task GetByHashAsync_WithNonExistentHash_ShouldReturnFail()
    {
        // Arrange
        var hash = "non-existent-hash";
        _mockRepo.Setup(repo => repo.GetByPromptHashAsync(hash))
            .ReturnsAsync((AIResponse?)null);

        // Act
        var result = await _service.GetByHashAsync(hash);

        // Assert
        Assert.False(result.Success);
        Assert.Null(result.Data);
        Assert.Equal("Registro não encontrado", result.Message);
    }
}