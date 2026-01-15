using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AICacheAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AIResponses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PromptHash = table.Column<string>(type: "TEXT", nullable: false),
                    Prompt = table.Column<string>(type: "TEXT", nullable: false),
                    Response = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    TechStack = table.Column<string>(type: "TEXT", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIResponses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AIResponses_PromptHash",
                table: "AIResponses",
                column: "PromptHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AIResponses_Tags",
                table: "AIResponses",
                column: "Tags");

            migrationBuilder.CreateIndex(
                name: "IX_AIResponses_TechStack",
                table: "AIResponses",
                column: "TechStack");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIResponses");
        }
    }
}
