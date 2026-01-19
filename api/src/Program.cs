using System.Threading.RateLimiting;
using AICacheAPI.Context;
using AICacheAPI.Data.Repositories;
using AICacheAPI.Interfaces;
using AICacheAPI.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi();

builder.Services.AddScoped<IAICacheRepository, AICacheRepository>();
builder.Services.AddScoped<IAICacheService, AICacheService>();

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        // Usa o endereço de IP do cliente como chave para o limite de taxa.
        // Isso garante que cada usuário tenha seu próprio limite.
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: clientIp,
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5
            });
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.Headers.Append("Retry-After", "60");
        await context.HttpContext.Response.WriteAsync("❌ Rate limit excedido. Tente novamente em 1 minuto.", token);
    };
});

builder.Services.AddDbContext<AICacheDbContext>(options =>
{
     options.UseSqlite(builder.Configuration.GetConnectionString("AICache"));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseRateLimiter();
app.UseHttpsRedirection();
app.UseCors();
app.UseRouting();
app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AICacheDbContext>();
    db.Database.EnsureCreated();
}

app.Run();

// Necessário para tornar a classe Program visível para o projeto de testes E2E
public partial class Program { }
