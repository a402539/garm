using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using garm.Models;

namespace garm.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BoxController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BoxController> _logger;

        public BoxController(ApplicationDbContext context, ILogger<BoxController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<List<LayerTiles>>> GetTiles (Box box)
        {
            var list = await _context.Set<Tile>()
                .FromSqlInterpolated($"SELECT layer_id, x, y, z FROM geo.get_box_tiles({box.Layers},{box.XMin},{box.YMin},{box.XMax},{box.YMax})")
                .ToListAsync();

            var q = from t in list
                    group t by t.LayerId into g
                    select new LayerTiles { LayerId = g.Key, Tiles = g.AsEnumerable() };

            return q.ToList();
        }
    }
}
