using AICacheAPI.Models;

namespace AICacheAPI.Interfaces;

public interface IAICacheRepository
{
    Task<AIResponse?> GetByPromprHashAsync(string promtHash);
    Task<IEnumerable<AIResponse?>?> SearchAsync(string query);
    Task<AIResponse?> SaveAsync(AIResponse aiResponse);
    Task<int> SaveChangesAsync();
}