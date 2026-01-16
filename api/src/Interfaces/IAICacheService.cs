using AICacheAPI.Models;

namespace AICacheAPI.Interfaces;

public interface IAICacheService
{
    Task<ServiceResult<PagedResult<AIResponse>>> SearchPagedAsync(string? query, int page, int pageSize);
    Task<ServiceResult<PagedResult<AIResponse>>> GetAllPromptsPagedAsync(int page, int pageSize);
    Task<ServiceResult<AIResponse>> SaveCodeAsync(SaveRequest request);
    Task<ServiceResult<AIResponse>> GetByHashAsync(string hash);
}

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Error { get; set; } = string.Empty;

    public static ServiceResult<T> Ok(T data, string message = "") => new()
    {
        Success = true,
        Data = data,
        Message = message
    };
    
    public static ServiceResult<T> Fail(string message, string error = "") => new()
    {
        Success = false,
        Message = message,
        Error = error
    };
}