using AICacheAPI.Context;
using AICacheAPI.Data.Repositories;
using AICacheAPI.Interfaces;
using AICacheAPI.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi();

builder.Services.AddScoped<IAICacheRepository, AICacheRepository>();
builder.Services.AddScoped<IAICacheService, AICacheService>();

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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

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
