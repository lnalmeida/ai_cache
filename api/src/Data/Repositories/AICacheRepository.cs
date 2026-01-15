using AICacheAPI.Context;
using AICacheAPI.Interfaces;
using AICacheAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AICacheAPI.Data.Repositories;

public class AICacheRepository : IAICacheRepository
{
    private readonly AICacheDbContext _dbContext;
    
    public AICacheRepository(AICacheDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AIResponse?> GetByPromprHashAsync(string promtHash)
    {
        return await _dbContext.AIResponses.FirstOrDefaultAsync(x => x.PromptHash == promtHash) ?? null;
    }

    public async Task<IEnumerable<AIResponse?>?> SearchAsync(string query)
    {
        var term = $"%{query.ToLower()}%";
        var results = await _dbContext.AIResponses
            .Where(x => EF.Functions.Like(x.Prompt.ToLower(), term) ||
                         EF.Functions.Like(x.Tags.ToLower(), term) ||
                         EF.Functions.Like(x.TechStack.ToLower(), term) ||
                         EF.Functions.Like(x.FileName.ToLower(), term))
            
            .OrderByDescending(x => x.CreatedAt)
            .Take(20)
            .ToListAsync();
        return results;
    }

    public async Task<AIResponse?> SaveAsync(AIResponse aiResponse)
    {
        var existing = await GetByPromprHashAsync(aiResponse.PromptHash);

        if (existing != null)
        {
            existing.Response = aiResponse.Response;
            existing.Tags = aiResponse.Tags;
            existing.TechStack = aiResponse.TechStack;
            existing.FileName = aiResponse.FileName;
            
            _dbContext.AIResponses.Update(existing);
            return existing;
        }
        
        _dbContext.AIResponses.Add(aiResponse);
        return aiResponse;
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _dbContext.SaveChangesAsync();
    }
}