import argparse
import sys
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from dotenv import load_dotenv

from src.module_a.service import MaintenanceService

load_dotenv()
console = Console()

def main():
    parser = argparse.ArgumentParser(description="Intelligent Maintenance Agent (Module A)")
    parser.add_argument("--query", type=str, help="The maintenance complaint text")
    args = parser.parse_args()

    complaint = args.query
    if not complaint:
        console.print("[bold cyan]Welcome to the Intelligent Maintenance Agent[/bold cyan]")
        complaint = Prompt.ask("Please describe the maintenance issue")

    if not complaint.strip():
        console.print("[bold red]Error: No complaint provided.[/bold red]")
        sys.exit(1)

    service = MaintenanceService()
    
    with console.status("[bold yellow]Analyzing complaint and saving to database...", spinner="dots"):
        result = service.process_and_store_complaint(complaint)

    log = result["log"]
    record_id = result["id"]

    if log.issue_category == "Unknown":
        status_color = "yellow"
    else:
        status_color = "green"

    console.print(f"\\n[bold {status_color}]✓ Successfully Processed Complaint[/bold {status_color}]")
    
    details = f"""[bold]Category:[/bold] {log.issue_category}
[bold]Priority:[/bold] {log.priority}
[bold]Original:[/bold] {log.original_complaint}
[bold]Database ID:[/bold] {record_id}"""

    console.print(Panel(details, title="Maintenance Log Detail", expand=False, border_style="cyan"))

if __name__ == "__main__":
    main()
