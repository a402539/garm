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
    public class MapsController : ControllerBase
    {        
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MapsController> _logger;

        public MapsController(ApplicationDbContext context, ILogger<MapsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Map>>> Get()
        {
            return await _context.Maps.ToListAsync();
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Map))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Map>> GetMap(Guid id)
        {
            var map = await _context.Maps.FindAsync(id);

            if (map == null)
            {
                return NotFound();
            }

            return map;
        }

        [HttpPost]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Map>> CreateMap(Map map)
        {            
            _context.Maps.Add(map);
            await _context.SaveChangesAsync();
            return CreatedAtAction("CreateMap", new { id = map.Id }, map);
        }

        [HttpPut("{id}")]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Map>> SaveMap(Guid id, Map map)
        {                                    
            if (id != map.Id)
            {
                return BadRequest();
            }

            _context.Entry(map).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction("SavedMap", new { id = map.Id }, map);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MapExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }            
        }

        private bool MapExists(Guid id)
        {
            return _context.Maps.Any(e => e.Id == id);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Map))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Map>> DeleteLayer(Guid id)
        {
            var map = await _context.Maps.FindAsync(id);
            if (map == null)
            {
                return NotFound();
            }

            _context.Maps.Remove(map);
            await _context.SaveChangesAsync();

            return map;
        }
    }
}
