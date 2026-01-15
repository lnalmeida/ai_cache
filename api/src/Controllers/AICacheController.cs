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
    
    [HttpPost("save")]
    public async Task<ActionResult> Save(SaveRequest request)
    {
        return Ok(await _service.SaveCodeAsync(request));
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<AIResponse>>> Search(string query)
    {
        return Ok(await _service.SearchAsync(query));
    }

    [HttpGet("hash/{hash}")]
    public async Task<ActionResult<AIResponse>> GetByHash(string hash)
    {
        return Ok(await _service.GetByHashAsync(hash));
    }

}