using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {    
    [Table("map_layer", Schema = "geo")]
    public class MapLayer {                
        [Column("map_id")]
        public Guid MapId { get; set; }
        public virtual Map Map { get; set; }
        [Column("layer_id")]
        public Guid LayerId { get; set; }
        public Layer Layer { get; set; }
    }
}