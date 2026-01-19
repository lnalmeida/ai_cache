using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AICacheAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AIResponses_Prompt",
                table: "AIResponses",
                column: "Prompt");

            migrationBuilder.CreateIndex(
                name: "IX_AIResponses_Tags_CreatedAt",
                table: "AIResponses",
                columns: new[] { "Tags", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AIResponses_Prompt",
                table: "AIResponses");

            migrationBuilder.DropIndex(
                name: "IX_AIResponses_Tags_CreatedAt",
                table: "AIResponses");
        }
    }
}
