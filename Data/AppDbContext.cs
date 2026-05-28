using Microsoft.EntityFrameworkCore;
using ContactsCRUD.Models;

namespace ContactsCRUD.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Contact> Contacts => Set<Contact>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.ToTable("Contacts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.MobilePhone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.JobTitle).HasMaxLength(100);
            entity.Property(e => e.BirthDate).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.HasIndex(e => e.MobilePhone).IsUnique();
        });

        // Seed sample data dynamically (only on first database creation)
        var seedContacts = DataSeeder.GenerateContacts(10);
        modelBuilder.Entity<Contact>().HasData(seedContacts);
    }
}