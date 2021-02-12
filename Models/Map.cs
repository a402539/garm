using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {    
    [Table("Map", Schema = "geo")]
    public class Map {
        [Key]
        public Guid Id { get; set; }
        DateTime Created { get; set; }
        public string Name { get; set; }
        public virtual ICollection<Layer> Layers { get; set; }
    }
}