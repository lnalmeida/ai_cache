using AICacheAPI.Interfaces;
using AICacheAPI.Models;

namespace AICacheAPI.Services;

public class AICacheService : IAICacheService
{
    private readonly IAICacheRepository _repository;
    private readonly  ILogger<AICacheService> _logger;
    
    public AICacheService(IAICacheRepository repository, ILogger<AICacheService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceResult<AIResponse>> SaveCodeAsync(SaveRequest request)
    {
        try
        {
            _logger.LogInformation("Salvando código: {Filename}", request.FileName);

            if (string.IsNullOrWhiteSpace(request.Response) || request.Response.Length < 10)
            {
                return new ServiceResult<AIResponse>
                {
                    Success = false,
                    Message = "Response deve ter pelo menos 10 caracteres"
                };
            }

            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return new ServiceResult<AIResponse>
                {
                    Success = false,
                    Message = "Prompt não informado"
                };
            }
            
            if (string.IsNullOrWhiteSpace(request.FileName))
            {
                return new ServiceResult<AIResponse>
                {
                    Success = false,
                    Message = "Nome de arquivo não informado"
                };
            }

            var promptHash = GenerateHash(request.Prompt);
            
            var existing = await _repository.GetByPromprHashAsync(promptHash);
            var aiResponse = new AIResponse
            {
                PromptHash = promptHash,
                Prompt = request.Prompt[..Math.Min(request.Prompt.Length, 500)],
                Response =  request.Response[..Math.Min(request.Response.Length, 500)],
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
                _logger.LogInformation("Novo código salvo: {Filename}", aiResponse.FileName);
                aiResponse = await _repository.SaveAsync(aiResponse);
            }

            await _repository.SaveChangesAsync();

            return new ServiceResult<AIResponse>
            {
                Success = true,
                Data = aiResponse,
                Message = existing != null ? "Código atualizado com sucesso" : "Código salvo com sucesso"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro salvando código");
            return new ServiceResult<AIResponse>
            {
                Success = false,
                Error = "Erro interno do servidor"
            };
        }
    }
    

    public async Task<ServiceResult<IEnumerable<AIResponse>>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new ServiceResult<IEnumerable<AIResponse>>
            {
                Success = false,
                Message = "Query não informada"
            };
        }
        
        var results = await _repository.SearchAsync(query) ?? Enumerable.Empty<AIResponse>();
        return new ServiceResult<IEnumerable<AIResponse>>
        {
            Success = true,
            Data = results
        };
    }

    public async Task<ServiceResult<AIResponse>> GetByHashAsync(string hash)
    {
        var result = await _repository.GetByPromprHashAsync(hash);
        return result != null
            ? new ServiceResult<AIResponse> { Success = true, Data = result }
            : new ServiceResult<AIResponse> { Success = false, Message = "Código não encontrado" };
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