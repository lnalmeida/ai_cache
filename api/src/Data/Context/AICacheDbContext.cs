using AICacheAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AICacheAPI.Context;

public class AICacheDbContext : DbContext
{
    public DbSet<AIResponse> AIResponses { get; set; }

    public AICacheDbContext(DbContextOptions<AICacheDbContext> options) 
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AIResponse>()
            .HasKey(x => x.Id);
            
        modelBuilder.Entity<AIResponse>()
            .HasIndex(x => x.PromptHash)
            .IsUnique();
            
        modelBuilder.Entity<AIResponse>()
            .HasIndex(x => x.Tags);
            
        modelBuilder.Entity<AIResponse>()
            .HasIndex(x => x.TechStack);
    }
}