using AICacheAPI.Interfaces;
using AICacheAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace AICacheAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AICacheController : ControllerBase
{
    private readonly IAICacheService _service;

    public AICacheController(IAICacheService service)
    {
        _service = service;
    }

    /// <summary>
    /// Busca todos os registros de forma paginada.
    /// </summary>
    /// <param name="page">Número da página (padrão: 1).</param>
    /// <param name="pageSize">Tamanho da página (padrão: 20).</param>
    [HttpGet("all")]
    public async Task<ActionResult<PagedResult<AIResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _service.GetAllPromptsPagedAsync(page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Realiza uma busca paginada nos registros. Se a query for vazia, retorna todos os registros.
    /// </summary>
    /// <param name="query">Termo de busca (opcional).</param>
    /// <param name="page">Número da página (padrão: 1).</param>
    /// <param name="pageSize">Tamanho da página (padrão: 20).</param>
    [HttpGet("search")]
    public async Task<ActionResult<PagedResult<AIResponse>>> Search([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _service.SearchPagedAsync(query, page, pageSize);
        return Ok(result);
    }
    
    [HttpPost("save")]
    public async Task<ActionResult> Save(SaveRequest request)
    {
        var result = await _service.SaveCodeAsync(request);
        return Ok(result);
    }

    [HttpGet("hash/{*hash}")]
    public async Task<ActionResult<AIResponse>> GetByHash(string hash)
    {
        var result = await _service.GetByHashAsync(hash);
        return Ok(result);
    }
}