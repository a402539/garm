using Microsoft.EntityFrameworkCore;
using garm.Models;
using System.IO;

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
        public DbSet<Tile> Tiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<Map>()
                .HasMany(p => p.Layers)
                .WithMany(p => p.Maps)
                .UsingEntity(j => j.ToTable("MapLayers"));


            modelBuilder.Entity<Tile>()
                .HasKey(p => new { p.LayerId, p.X, p.Y, p.Z });
                       
            // modelBuilder.Entity<Tile>()                
            //     .HasOne(p => p.Layer)
            //     .WithMany(p => p.Tiles);

        } 
        static void CreateProcedures(ApplicationDbContext context) {
            var sql = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "data", "schema.sql"));
            context.Database.ExecuteSqlRaw(sql);
        }               
    }
}