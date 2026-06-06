import fs from "fs";

export default async function extractText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF not found at path: ${filePath}`);
  }

  const { default: pdfParse } = await import("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  return data.text;
}
