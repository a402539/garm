using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {
    [NotMapped]        
    public class LayerTiles {        
        public Guid LayerId { get; set; }
        public IEnumerable<Tile> Tiles { get; set; }
    }
}