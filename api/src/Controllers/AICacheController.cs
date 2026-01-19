using AICacheAPI.Interfaces;
using AICacheAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;

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

    [HttpGet("all")]
    public async Task<ActionResult<PagedResult<AIResponse>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _service.GetAllPromptsPagedAsync(page, pageSize);
        return Ok(result);
    }

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
        // Decodifica manualmente o hash, pois parâmetros catch-all não são decodificados por padrão.
        var decodedHash = WebUtility.UrlDecode(hash);
        var result = await _service.GetByHashAsync(decodedHash);
        return Ok(result);
    }
}