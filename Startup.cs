using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;


namespace garm
{
    public class Startup
    {
        private readonly static string DataDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Data");
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;            
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {      
            services.AddDbContext<ApplicationDbContext>(options => {
                options
                // .UseLazyLoadingProxies()
                .UseNpgsql(Configuration.GetConnectionString("Default"));
            });
            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "garm", Version = "v1" });
            });     
        }
        
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {                
                app.UseDeveloperExceptionPage();                                  
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "garm v1"));
            }

            using (var scope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();                

                db.Database.EnsureCreated();
                // db.Database.ExecuteSqlRaw(GetSql("all.sql"));
                // db.Database.ExecuteSqlRaw(GetSql("postgis-vt-util.sql"));
            }

            // app.MapWhen(
            //     context => VectorTile.IsValid(context.Request.Path.ToString()),
            //     appBranch => {
            //         appBranch.UseVectorTile();
            //     }
            // );            

            app.UseHttpsRedirection();
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });         
        }
        private static string GetSql(string file) => File.ReadAllText(Path.Combine(DataDirectory, file));        
    }
}
