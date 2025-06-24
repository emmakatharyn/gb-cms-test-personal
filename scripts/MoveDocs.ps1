# Read the JSON file
$jsonContent = Get-Content -Path "document_links.json" -Raw | ConvertFrom-Json

# Base paths
$sourceBasePath = "documents"
$targetBasePath = "content"

# Create the target base directory if it doesn't exist
if (-not (Test-Path $targetBasePath)) {
    New-Item -ItemType Directory -Path $targetBasePath | Out-Null
}

# Process each page and its documents
foreach ($page in $jsonContent.PSObject.Properties) {
    $pageName = $page.Name
    $documents = $page.Value

    # Create the page directory if it doesn't exist
    $pageDir = Join-Path $targetBasePath $pageName
    if (-not (Test-Path $pageDir)) {
        New-Item -ItemType Directory -Path $pageDir | Out-Null
    }

    # Copy each document
    foreach ($doc in $documents) {
        $sourcePath = Join-Path '..' $sourceBasePath $doc.TrimStart('/')
        $targetPath = Join-Path '..' $pageDir (Split-Path $doc -Leaf)

        # Check if source file exists
        if (Test-Path $sourcePath) {
            # Create target directory if it doesn't exist
            $targetDir = Split-Path $targetPath -Parent
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }

            # Copy the file
            Copy-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "Copied: $sourcePath -> $targetPath"
        } else {
            Write-Host "Warning: Source file not found: $sourcePath"
        }
    }
}

Write-Host "File organization complete!"
