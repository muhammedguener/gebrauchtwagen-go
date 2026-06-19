param()
Write-Host "Run Go prototype (PowerShell)"
if (Get-Command go -ErrorAction SilentlyContinue) {
  Push-Location proto-go
  go run .
  Pop-Location
} else {
  Write-Host "Go not found — running with Docker"
  docker run --rm -v "${PWD}\proto-go:/app" -w /app golang:1.20 bash -c "go run ."
}
