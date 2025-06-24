# Script to find all document links in the repository
$results = @{}

# Get all files in the repository
$files = Get-ChildItem -Path . -Recurse -File

foreach ($file in $files) {
    # Skip binary files and certain directories
    if ($file.Extension -match '\.(ps1|git|md|json)$' -or $file.FullName -match 'node_modules|\.git') {
        continue
    }

    # Read file content
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }

    # Find all document links
    $matches = [regex]::Matches($content, '/documents[^"]*"')
    
    if ($matches.Count -gt 0) {
        $documentLinks = @()
        foreach ($match in $matches) {
            # Extract the document path from the href attribute
            # $docPath = $match.Value -replace 'href="|"', ''
            $documentLinks += $match.Value
        }
        
        # Add to results if we found any links
        if ($documentLinks.Count -gt 0) {
            # Get relative path and remove .html extension
            $relativePath = $file.FullName.Substring($PWD.Path.Length + 1)
            $relativePath = [System.IO.Path]::GetFileNameWithoutExtension($relativePath)
            $results[$relativePath] = $documentLinks
        }
    }
}

# Convert to JSON and save to file
$jsonOutput = $results | ConvertTo-Json -Depth 10
$jsonOutput | Out-File -FilePath "document_links.json" -Encoding UTF8

Write-Host "Search complete. Results saved to document_links.json"
