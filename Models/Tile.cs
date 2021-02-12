using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {
    [NotMapped]
    public class Tile {
        public int X { get; set; }
        public int Y { get; set; }
        public int Z { get; set; }
    }
}