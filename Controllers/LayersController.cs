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
    public class LayersController : ControllerBase
    {        
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LayersController> _logger;

        public LayersController(ApplicationDbContext context, ILogger<LayersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Layer>>> Get()
        {
            return await _context.Layers.ToListAsync();
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Layer))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Layer>> GetLayer(Guid id)
        {
            var layer = await _context.Layers.FindAsync(id);

            if (layer == null)
            {
                return NotFound();
            }

            return layer;
        }

        [HttpPost]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Layer>> CreateLayer(Layer layer)
        {            
            _context.Layers.Add(layer);
            await _context.SaveChangesAsync();
            return CreatedAtAction("CreateLayer", new { id = layer.Id }, layer);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Layer))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Layer>> DeleteLayer(Guid id)
        {
            var layer = await _context.Layers.FindAsync(id);
            if (layer == null)
            {
                return NotFound();
            }

            _context.Layers.Remove(layer);
            await _context.SaveChangesAsync();

            return layer;
        }
    }
}
