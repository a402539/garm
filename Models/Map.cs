using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {    
    [Table("maps", Schema = "geo")]
    public class Map {
        [Key]
        [Column("map_id")]
        public Guid Id { get; set; }
        [Column("created_at")]
        DateTime Created { get; set; }
        [Column("map_name")]
        public string Name { get; set; }
        public ICollection<Layer> Layers { get; set; }
        public List<MapLayer> MapLayers { get; set; }
    }
}