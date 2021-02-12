using Microsoft.EntityFrameworkCore;
using garm.Models;

namespace garm
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Map> Maps { get; set; }
        public DbSet<Layer> Layers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder
                .Entity<Map>()
                .HasMany(p => p.Layers)
                .WithMany(p => p.Maps)
                .UsingEntity(j => j.ToTable("MapLayers"));
        }                
    }
}