# GB Utils - Content Map Generator

A utility for generating JSON maps of document content organized by pages with manual section headers.

## Features

- **Automatic Content Mapping**: Scans a content folder and generates a structured JSON file
- **Page-based Organization**: Each subfolder becomes a page with a flat list of files
- **Manual Section Headers**: Add "#Header" entries to organize content into sections
- **Order Preservation**: Maintains your manual ordering and section headers when regenerating
- **Smart Updates**: Only adds new files at the end and removes missing files
- **Multiple File Types**: Supports PDF, DOC, DOCX, TXT, MD, HTML, and HTM files

## Usage

Generate a content map from a specific folder:

```bash
# Using npm script
npm run generate-map <content-folder-path>

# Or directly with node
node scripts/generate-map.js <content-folder-path>
```

### Examples

```bash
# Generate map from a content folder in the parent directory
npm run generate-map ../my-content-folder

# Generate map with absolute path
npm run generate-map "C:/Users/username/Documents/content"
```

## Output Structure

The script generates a JSON file at `content-map/content-structure.json` with the following structure:

```json
{
  "page-name": [
    "#Introduction",
    "document1.pdf",
    "document2.docx",
    "#Main Content",
    "subfolder/document3.pdf",
    "document4.txt"
  ],
  "another-page": [
    "#Getting Started",
    "file1.pdf",
    "#Advanced Topics",
    "file2.txt",
    "file3.pdf"
  ]
}
```

### Structure Explanation

- **Pages**: Each subfolder in your content directory becomes a page
- **Flat File Lists**: Each page contains a simple array of file paths
- **Section Headers**: Add "#Header" entries manually to organize content
- **Order Preservation**: Your manual ordering is maintained when the script runs again

## File Organization

Your content folder should be organized like this:

```
content/
├── page1/
│   ├── document1.pdf
│   ├── document2.docx
│   └── subfolder/
│       └── document3.pdf
├── page2/
│   ├── file1.pdf
│   └── file2.txt
└── page3/
    └── presentation.pptx
```

This will generate a JSON structure with three pages: `page1`, `page2`, and `page3`, each containing a flat list of file paths.

## Manual Organization

After the initial generation, you can manually edit the JSON file to:

1. **Add section headers**: Insert `"#Header Name"` entries
2. **Reorder files**: Move file paths around as needed
3. **Organize content**: Group related files under section headers

Example manual organization:
```json
{
  "employee-docs": [
    "#Onboarding",
    "new-employee-guide.pdf",
    "benefits-overview.pdf",
    "#Policies",
    "employee-handbook.pdf",
    "code-of-conduct.pdf",
    "#Forms",
    "time-off-request.pdf",
    "expense-report.pdf"
  ]
}
```

## Smart Updates

When you run the script again after making changes to your content folder:

- **New files** are automatically added to the end of each page's list
- **Missing files** are automatically removed from the list
- **Your manual ordering** and section headers are preserved
- **Existing files** keep their current positions

## Supported File Types

The script automatically detects and includes files with these extensions:
- `.pdf` - PDF documents
- `.doc` - Microsoft Word documents (legacy)
- `.docx` - Microsoft Word documents
- `.txt` - Text files
- `.md` - Markdown files
- `.html` - HTML files
- `.htm` - HTML files (legacy)

## Integration

The generated JSON file can be used in your HTML pages to create dynamic document links. The structure makes it easy to:

1. Generate navigation menus
2. Create document galleries with sections
3. Build search functionality
4. Organize content by topic

## Configuration

You can modify the script to:
- Add more file extensions in the `SUPPORTED_EXTENSIONS` array
- Change the output file location
- Customize the section header detection (currently `#` prefix)

## Dependencies

- `fs-extra`: Enhanced file system operations
- `path`: Node.js path utilities 