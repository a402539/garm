using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System;
using System.IO;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Data;

namespace garm
{
    public class VectorTile
    {
        private readonly ILogger _logger;
        static Regex _rxValid = new Regex(@"/tile/(?<layer>[a-z0-9\-]+)/(?<z>\d{1,2})/(?<x>\d+)/(?<y>\d+)");
        private readonly RequestDelegate _next;

        public IConfiguration Configuration { get; }

        public VectorTile(RequestDelegate next, IConfiguration configuration, ILogger<VectorTile> logger)
        {
            _next = next;
            Configuration = configuration;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {            
            var m = _rxValid.Match(context.Request.Path);
            string layerId = m.Groups["layer"].Value;
            int z = int.Parse(m.Groups["z"].Value);
            int x = int.Parse(m.Groups["x"].Value);
            int y = int.Parse(m.Groups["y"].Value);            

            var path = Path.Combine("tiles", layerId, z.ToString(), x.ToString());
            Directory.CreateDirectory(path);

            var file = Path.ChangeExtension(Path.Combine(path, y.ToString()), ".pbf");            
            
            try {
                if (File.Exists(file)) {
                    byte[] mvt = await File.ReadAllBytesAsync(file);
                    context.Response.ContentType = "application/octet-stream";
                    await context.Response.Body.WriteAsync(mvt, 0, mvt.Length);
                }
                else {                                        
                    byte[] mvt = await GetMVT(new Guid(layerId), z, x, y);
                    context.Response.ContentType = "application/octet-stream";
                    if (mvt != null) {
                        await File.WriteAllBytesAsync(file, mvt);
                        await context.Response.Body.WriteAsync(mvt, 0, mvt.Length);                        
                    }
                    else {
                        await context.Response.Body.WriteAsync(new byte[] {}, 0, 0);
                    } 
                }                         
            }
            catch (Exception e) {
                _logger.LogError(e.ToString());
                await _next.Invoke(context);
            }                                
        }

        async Task<byte[]> GetMVT (Guid layerId, int z, int x, int y) {
            await using var conn = new NpgsqlConnection(Configuration.GetConnectionString("Default"));
            await conn.OpenAsync();
            
            await using (var cmd = new NpgsqlCommand("SELECT geo.get_mvt(@layerid, @z, @x, @y)", conn))
            {
                cmd.Parameters.AddWithValue("layerid", layerId);
                cmd.Parameters.AddWithValue("z", z);
                cmd.Parameters.AddWithValue("x", x);
                cmd.Parameters.AddWithValue("y", y);                

                return await cmd.ExecuteScalarAsync() as byte[];                
            }
        }

        public static bool IsValid(string path) {
            return _rxValid.IsMatch(path);
        }
    }
    

    public static class VectorTileExtensions
    {
        public static IApplicationBuilder UseVectorTile(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<VectorTile>();
        }
    }
}