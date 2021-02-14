using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {

    [Table("layers", Schema = "geo")]
    public class Layer {
        [Key]
        [Column("layer_id")]
        public Guid Id { get; set; }
        [Column("created_at")]
        DateTime Created { get; set; }
        [Column("layer_name")]
        public string Name { get; set; }
        [Column("visible")]
        public bool Visible { get; set; }        
        public ICollection<Map> Maps { get; set; }
        public List<MapLayer> MapLayers { get; set; }
    }
    
}