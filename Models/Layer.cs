using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace garm.Models {
    [Table("Layer", Schema = "geo")]
    public class Layer {
        [Key]
        public Guid Id { get; set; }
        DateTime Created { get; set; }
        public string Name { get; set; }
        public bool Visible { get; set; }
        public virtual ICollection<Map> Maps { get; set; }
    }
}