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
    public class BoxTiles
    {
        static Regex _rxValid = new Regex(@"/box/(?<xmin>\d+\.\d+),(?<ymin>\d+\.\d+),(?<xmax>\d+\.\d+),(?<ymax>\d+\.\d+)");
        
        private readonly RequestDelegate _next;

        public IConfiguration Configuration { get; }

        public BoxTiles(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            Configuration = configuration;
        }

        public async Task Invoke(HttpContext context)
        {            
            var m = _rxValid.Match(context.Request.Path);
            int xmin = float.Parse(m.Groups["xmin"].Value);
            int ymin = float.Parse(m.Groups["ymin"].Value);
            int xmax = float.Parse(m.Groups["xmax"].Value);
            int ymax = float.Parse(m.Groups["ymax"].Value);

            try {
                await using var conn = new NpgsqlConnection(Configuration.GetConnectionString("Default"));
                await conn.OpenAsync();
                
                await using (var cmd = new NpgsqlCommand("SELECT cat.get_box2d_tiles(@xmin, @ymin, @xmax, @ymax)", conn))
                {
                    cmd.Parameters.AddWithValue("xmin", xmin);
                    cmd.Parameters.AddWithValue("ymin", ymin);
                    cmd.Parameters.AddWithValue("xmax", xmax);
                    cmd.Parameters.AddWithValue("ymax", ymax);
                    await cmd.ExecuteNonQueryAsync();
                    byte[] mvt = p.Value as byte[];
                    
                    context.Response.ContentType = "application/json";
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

    public static class BoxTilesExtensions
    {
        public static IApplicationBuilder UseBoxTiles(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<BoxTiles>();
        }
    }
}