namespace AICacheAPI.Models;

public class SaveRequest
{
    public string Prompt { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}