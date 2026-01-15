namespace AICacheAPI.Models;

public class AIResponse
{
    public int Id { get; set; }
    public string PromptHash { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}