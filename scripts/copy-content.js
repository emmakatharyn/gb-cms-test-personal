const fs = require("fs");
const path = require("path");

// Page name mappings for better folder names
const pageNameMappings = {
  AdministrativeLetters: "Administrative_Letters",
  COBRA: "COBRA",
  Disability: "Disability",
  EmployeeAssistancePlan: "Employee_Assistance_Plan",
  EnrollmentFillable: "Enrollment_Fillable",
  EnrollmentInformation: "Enrollment_Information",
  FGPOpenFPN: "Federal_Notices",
  FSA: "FSA",
  HRresources: "HR_Resources",
  POPwaivers: "POP_Waivers",
  PremiumRatesSAE: "Premium_Rates_State_Employees",
  PremiumsDue: "Premiums_Due",
  Preview: "Preview",
  SEPA: "SEPA",
  TermLife: "Term_Life",
  "domestic-partnership": "Domestic_Partnership",
  "employee-new-hire-lpb": "Employee_New_Hire_LPB",
  "employee-new-hire-sonm": "Employee_New_Hire_SONM",
  "employee-portal-lpb": "Employee_Portal_LPB",
  "employee-portal-share": "Employee_Portal_Share",
  "employee-portal-sonm": "Employee_Portal_SONM",
  "employee-portal": "Employee_Portal",
  employerResources: "Employer_Resources",
  employerResourcesSub1: "Employer_Resources_Sub1",
  index: "Index",
  rmdPremiumRates: "RMD_Premium_Rates",
  volben: "Voluntary_Benefits",
};

function sanitizeFileName(text) {
  // Replace spaces with underscores and remove special characters
  return text.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
}

function getFileCreationDate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const date = new Date(stats.birthtime);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  } catch (error) {
    console.warn(`Could not get creation date for ${filePath}:`, error.message);
    return new Date().toISOString().split("T")[0]; // Use current date as fallback
  }
}

function copyDocuments(sourceDir, targetDir) {
  try {
    // Read the link map
    const linkMapPath = path.join(sourceDir, "content-map", "link-map.json");
    const linkMap = JSON.parse(fs.readFileSync(linkMapPath, "utf8"));

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let totalCopied = 0;
    let totalSkipped = 0;

    // Process each page
    for (const [pageKey, documents] of Object.entries(linkMap.pages)) {
      const pageFolderName = pageNameMappings[pageKey] || pageKey;
      const pageFolderPath = path.join(targetDir, pageFolderName);

      // Create page folder if it doesn't exist
      if (!fs.existsSync(pageFolderPath)) {
        fs.mkdirSync(pageFolderPath, { recursive: true });
      }

      console.log(`Processing page: ${pageFolderName}`);

      // Process each document in the page
      for (const doc of documents) {
        const sourcePath = path.join(sourceDir, doc.url.replace(/^\//, ""));
        const sanitizedText = sanitizeFileName(doc.text);
        const creationDate = getFileCreationDate(sourcePath);
        const extension = path.extname(doc.url);
        const newFileName = `${sanitizedText}_${creationDate}${extension}`;
        const targetPath = path.join(pageFolderPath, newFileName);

        try {
          // Check if source file exists
          if (fs.existsSync(sourcePath)) {
            // Copy the file
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✓ Copied: ${newFileName}`);
            totalCopied++;
          } else {
            console.log(
              `  ✗ Skipped: ${doc.text} (file not found: ${sourcePath})`
            );
            totalSkipped++;
          }
        } catch (error) {
          console.log(`  ✗ Error copying ${doc.text}:`, error.message);
          totalSkipped++;
        }
      }
    }

    console.log(`\nSummary:`);
    console.log(`  Total files copied: ${totalCopied}`);
    console.log(`  Total files skipped: ${totalSkipped}`);
  } catch (error) {
    console.error("Error processing documents:", error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log(
    "Usage: node copy-content.js <source-directory> <target-directory>"
  );
  console.log(
    "Example: node copy-content.js /path/to/source /path/to/new-content"
  );
  process.exit(1);
}

const [sourceDir, targetDir] = args;

// Validate source directory
if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory does not exist: ${sourceDir}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(sourceDir, "content-map", "link-map.json"))) {
  console.error(
    `link-map.json not found in: ${path.join(sourceDir, "content-map")}`
  );
  process.exit(1);
}

console.log(`Copying documents from: ${sourceDir}`);
console.log(`To: ${targetDir}\n`);

copyDocuments(sourceDir, targetDir);
