import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { writeFile } from "fs/promises";

export async function POST(req: any) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return NextResponse.json({ message: "Failed" });
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return NextResponse.json({ data: "test" });
  // @ts-ignore
  const path = join("/", "tmp", file.name);
  await writeFile(path, buffer);

  // @ts-ignore
  const pdfParser = new PDFParser(this, 1);

  pdfParser.on("pdfParser_dataError", (errData) =>
    // @ts-ignore
    console.error(errData.parserError)
  );

  let cleanedText3;

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    // @ts-ignore
    const data = pdfParser.getRawTextContent();
    const cleanText = data.replace(/-{2,}Page\s\(\d+\)\sBreak-{2,}|ptg/g, "");
    const cleanedText2 = cleanText.replace(/\r\n|\n/g, " ");
    cleanedText3 = cleanedText2.replace(/ {2,}/g, " ");
  });

  await pdfParser.loadPDF(path);
}
