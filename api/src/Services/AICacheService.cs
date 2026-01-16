using AICacheAPI.Interfaces;
using AICacheAPI.Models;

namespace AICacheAPI.Services;

public class AICacheService : IAICacheService
{
    private readonly IAICacheRepository _repository;
    private readonly ILogger<AICacheService> _logger;

    public AICacheService(IAICacheRepository repository, ILogger<AICacheService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceResult<PagedResult<AIResponse>>> GetAllPromptsPagedAsync(int page, int pageSize)
    {
        var results = await _repository.GetAllPromptsPagedAsync(page, pageSize);
        return ServiceResult<PagedResult<AIResponse>>.Ok(results);
    }

    public async Task<ServiceResult<PagedResult<AIResponse>>> SearchPagedAsync(string? query, int page, int pageSize)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return await GetAllPromptsPagedAsync(page, pageSize);
        }

        var results = await _repository.SearchPagedAsync(query, page, pageSize);
        return ServiceResult<PagedResult<AIResponse>>.Ok(results);
    }

    public async Task<ServiceResult<AIResponse>> SaveCodeAsync(SaveRequest request)
    {
        try
        {
            _logger.LogInformation("Salvando registro: {Filename}", request.FileName);

            if (string.IsNullOrWhiteSpace(request.Response) || request.Response.Length < 10)
            {
                return ServiceResult<AIResponse>.Fail("Response deve ter pelo menos 10 caracteres");
            }

            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return ServiceResult<AIResponse>.Fail("Prompt não informado");
            }

            if (string.IsNullOrWhiteSpace(request.FileName))
            {
                return ServiceResult<AIResponse>.Fail("Nome de arquivo não informado");
            }

            var promptHash = GenerateHash(request.Prompt);

            var existing = await _repository.GetByPromprHashAsync(promptHash);
            var aiResponse = new AIResponse
            {
                PromptHash = promptHash,
                Prompt = request.Prompt[..Math.Min(request.Prompt.Length, 500)],
                Response = request.Response[..Math.Min(request.Response.Length, 500)],
                Tags = CleanTags(request.Tags ?? ""),
                TechStack = CleanTags(request.TechStack ?? ""),
                FileName = request.FileName
            };

            if (existing != null)
            {
                _logger.LogInformation("Cache HIT: {Id}", existing.Id);
                aiResponse.Id = existing.Id;
                aiResponse = await _repository.SaveAsync(aiResponse);
            }
            else
            {
                _logger.LogInformation("Novo registro salvo: {Filename}", aiResponse.FileName);
                aiResponse = await _repository.SaveAsync(aiResponse);
            }

            await _repository.SaveChangesAsync();

            return ServiceResult<AIResponse>.Ok(aiResponse, existing != null ? "Registro atualizado com sucesso" : "Registro salvo com sucesso");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro salvando registro");
            return ServiceResult<AIResponse>.Fail("Erro interno do servidor", ex.Message);
        }
    }

    public async Task<ServiceResult<AIResponse>> GetByHashAsync(string hash)
    {
        var result = await _repository.GetByPromprHashAsync(hash);
        return result != null
            ? ServiceResult<AIResponse>.Ok(result)
            : ServiceResult<AIResponse>.Fail("Registro não encontrado");
    }

    #region Private Methods
    private static string GenerateHash(string requestPrompt)
    {
        var promptBytes = System.Text.Encoding.UTF8.GetBytes(requestPrompt);
        var hashBytes = System.Security.Cryptography.SHA256.HashData(promptBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    private static string CleanTags(string requestTags)
    {
        return string.Join(",", requestTags.Split(",", StringSplitOptions.RemoveEmptyEntries)
            .Select(t => t.Trim())
            .Where(t => !string.IsNullOrWhiteSpace(t)));
    }
    #endregion
}