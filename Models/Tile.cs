using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {    
    [NotMapped]
    public class Tile {        
        [Column("x")]
        public int X { get; set; }
        [Column("y")]
        public int Y { get; set; }
        [Column("z")]
        public int Z { get; set; }        
    }
}