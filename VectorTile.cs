using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace garm
{
    public class VectorTile
    {
        static Regex _rxValid = new Regex(@"/tile/(?<z>\d{1,2})/(?<x>\d+)/(?<y>\d+)");
        
        private readonly RequestDelegate _next;

        public IConfiguration Configuration { get; }

        public VectorTile(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            Configuration = configuration;
        }

        public async Task Invoke(HttpContext context)
        {            
            var m = _rxValid.Match(context.Request.Path);
            int x = int.Parse(m.Groups["x"].Value);
            int y = int.Parse(m.Groups["y"].Value);
            int z = int.Parse(m.Groups["z"].Value);

            try {
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
                    
                    context.Response.ContentType = "application/octet-stream";
                    await context.Response.Body.WriteAsync(mvt, 0, mvt.Length);
                }
            }
            catch (Exception e) {
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