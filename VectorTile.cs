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
        static Regex _rxValid = new Regex(@"/tile/(?<z>\d{1,2})/(?<x>\d+)/(?<y>\d+)");        
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
            int x = int.Parse(m.Groups["x"].Value);
            int y = int.Parse(m.Groups["y"].Value);
            int z = int.Parse(m.Groups["z"].Value);

            var path = Path.Combine("tiles", z.ToString(), x.ToString());
            Directory.CreateDirectory(path);

            var file = Path.ChangeExtension(Path.Combine(path, y.ToString()), ".pbf");            
            
            try {

                if (File.Exists(file)) {
                    byte[] mvt = await File.ReadAllBytesAsync(file);
                    context.Response.ContentType = "application/octet-stream";
                    await context.Response.Body.WriteAsync(mvt, 0, mvt.Length);
                }
                else {
                    await using var conn = new NpgsqlConnection(Configuration.GetConnectionString("Default"));
                    await conn.OpenAsync();
                    
                    await using (var cmd = new NpgsqlCommand("SELECT cat.mvt_ls8_tile(@x, @y, @z)", conn))
                    {
                        cmd.Parameters.AddWithValue("x", x);
                        cmd.Parameters.AddWithValue("y", y);
                        cmd.Parameters.AddWithValue("z", z);
                        var p = new NpgsqlParameter("mvt", DbType.Binary) { Direction = ParameterDirection.Output };
                        cmd.Parameters.Add(p);

                        await cmd.ExecuteNonQueryAsync();
                        byte[] mvt = p.Value as byte[];

                        await File.WriteAllBytesAsync(file, mvt);
                        
                        context.Response.ContentType = "application/octet-stream";
                        await context.Response.Body.WriteAsync(mvt, 0, mvt.Length);
                    }
                }                         
            }
            catch (Exception e) {
                _logger.LogError(e.ToString());
                await _next.Invoke(context);
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