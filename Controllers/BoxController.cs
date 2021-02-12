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
        public async Task<ActionResult<IEnumerable<Tile>>> GetTiles(Box box)
        {  
            return await _context.Set<Tile>()
                .FromSqlInterpolated($"EXECUTE geo.get_box2d_tiles({box.XMin},{box.YMin},{box.XMax},{box.YMax})")
                .ToListAsync();
        }    
    }
}
