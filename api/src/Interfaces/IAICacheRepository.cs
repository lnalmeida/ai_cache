using AICacheAPI.Models;

namespace AICacheAPI.Interfaces;

public interface IAICacheRepository
{
    Task<AIResponse?> GetByPromprHashAsync(string promtHash);
    Task<PagedResult<AIResponse>> SearchPagedAsync(string query, int page, int pageSize);
    Task<PagedResult<AIResponse>> GetAllPromptsPagedAsync(int page, int pageSize);
    Task<AIResponse?> SaveAsync(AIResponse aiResponse);
    Task<int> SaveChangesAsync();
}