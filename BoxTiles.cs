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
using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace garm
{
    public class BoxTiles
    {
        static Regex _rxValid = new Regex(@"/box/(?<xmin>\-?\d+\.\d+),(?<ymin>\-?\d+\.\d+),(?<xmax>\-?\d+\.\d+),(?<ymax>\-?\d+\.\d+)");
        static IFormatProvider culture = CultureInfo.InvariantCulture;
        
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
            double xmin = double.Parse(m.Groups["xmin"].Value, culture);
            double ymin = double.Parse(m.Groups["ymin"].Value, culture);
            double xmax = double.Parse(m.Groups["xmax"].Value, culture);
            double ymax = double.Parse(m.Groups["ymax"].Value, culture);

            try {
                await using var conn = new NpgsqlConnection(Configuration.GetConnectionString("Default"));
                await conn.OpenAsync();

                await using (var cmd = new NpgsqlCommand("SELECT * FROM dbo.get_box2d_tiles(@xmin, @ymin, @xmax, @ymax)", conn))
                {
                    cmd.Parameters.AddWithValue("xmin", xmin);
                    cmd.Parameters.AddWithValue("ymin", ymin);
                    cmd.Parameters.AddWithValue("xmax", xmax);
                    cmd.Parameters.AddWithValue("ymax", ymax);

                    var json = new JArray();
                    await using (var reader = await cmd.ExecuteReaderAsync())                    
                    while (await reader.ReadAsync()) {
                        json.Add(new JObject(
                            new JProperty("x", reader.GetInt32(0)),
                            new JProperty("y", reader.GetInt32(1)),
                            new JProperty("z", reader.GetInt32(2))
                        ));
                    }
                    context.Response.ContentType = "application/json";                    
                    await context.Response.WriteAsync(json.ToString(), Encoding.UTF8);                    
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