using AICacheAPI.Context;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Data.Common;
using Xunit;

namespace AICacheAPI.Tests;

public class AICacheApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private DbConnection _connection = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        builder.ConfigureTestServices(services =>
        {
            // Remove a configuração original do DbContext
            var dbContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AICacheDbContext>));
            if (dbContextDescriptor != null)
            {
                services.Remove(dbContextDescriptor);
            }

            // Adiciona o DbContext usando o banco de dados SQLite em memória
            services.AddDbContext<AICacheDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });
        });
    }

    public async Task InitializeAsync()
    {
        // Garante que o esquema do banco de dados seja criado
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AICacheDbContext>();
        await context.Database.EnsureCreatedAsync();
    }

    public new async Task DisposeAsync()
    {
        await _connection.DisposeAsync();
        await base.DisposeAsync();
    }
}
