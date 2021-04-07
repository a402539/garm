using System;
using System.Collections.Generic;
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
        public DbSet<Tile> Tiles { get; set; }        

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<Map>()
                .HasMany(p => p.Layers)
                .WithMany(p => p.Maps)
                .UsingEntity<MapLayer>(
                    j => j
                        .HasOne(pt => pt.Layer)
                        .WithMany(t => t.MapLayers)
                        .HasForeignKey(pt => pt.LayerId),
                    j => j
                        .HasOne(pt => pt.Map)
                        .WithMany(p => p.MapLayers)
                        .HasForeignKey(pt => pt.MapId),
                    j =>
                    {                        
                        j.HasKey(t => new { t.MapId, t.LayerId });
                    });
                
            modelBuilder.Entity<Tile>()
                .HasKey(p => new { p.Z, p.X, p.Y });
           
        }
    }
}