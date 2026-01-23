using System.Runtime.InteropServices.ComTypes;
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

    public async Task<AIResponse?> GetByPromptHashAsync(string promptHash)
    {
        return await _dbContext.AIResponses.FirstOrDefaultAsync(x => x.PromptHash == promptHash);
    }

    public async Task<PagedResult<AIResponse>> GetAllPromptsPagedAsync(int page, int pageSize)
    {
        var query = _dbContext.AIResponses.AsNoTracking();
        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<AIResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<AIResponse>> SearchPagedAsync(string query, int page, int pageSize)
    {
        var term = $"%{query.ToLower()}%";
        var queryable = _dbContext.AIResponses
            .AsNoTracking()
            .Where(x => EF.Functions.Like(x.Prompt.ToLower(), term) ||
                        EF.Functions.Like(x.Response.ToLower(), term) || // <-- CORREÇÃO AQUI
                        EF.Functions.Like(x.Tags.ToLower(), term) ||
                        EF.Functions.Like(x.TechStack.ToLower(), term) ||
                        EF.Functions.Like(x.FileName.ToLower(), term));

        var totalCount = await queryable.CountAsync();
        var items = await queryable
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<AIResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<AIResponse?> SaveAsync(AIResponse aiResponse)
    {
        var existing = await GetByPromptHashAsync(aiResponse.PromptHash);

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