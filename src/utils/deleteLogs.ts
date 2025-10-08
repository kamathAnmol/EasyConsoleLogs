import fs from "fs";
function deleteLogs(file: any) {
  try {
    const fileContent = fs.readFileSync(file, "utf8");

    const pattern = /console\.log\(\s*"👾.*",\s*.*\s*\);?\n?/g;
    // /console\.log\(\s*"👾.*",\s*.*,\s*\);\n?/g,
    const updatedContent = fileContent.replaceAll(pattern, "");

    fs.writeFileSync(file, updatedContent, "utf8");
  } catch (error) {
    console.error(error);
  }
}

export default deleteLogs;
