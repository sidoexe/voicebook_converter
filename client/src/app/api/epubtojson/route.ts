import { NextResponse } from "next/server";
import { EpubParser } from "@ridi/epub-parser";
import { join } from "path";
import { writeFile } from "fs/promises";

function stripHTMLTags(inputText: string) {
  if (typeof inputText !== "string") {
    console.error("Input is not a string");
    return "";
  }
  const strippedText = inputText.replace(/<[^>]+>/g, "");

  const cleanedText = strippedText.replace(/\r|\t|-/g, "");
  const text1 = cleanedText.replace(/\n{2,}/g, "\n");
  const cleanedText2 = text1.replace(/\n/g, " ");
  const cleanedText3 = cleanedText2.replace(/&[^\s]*?;/g, "");
  const cleanedText4 = cleanedText3.replace(/ {2,}/g, " ");

  return cleanedText4;
}

export async function POST(req: any) {
  const data = await req.formData();
  const file = data.get("file");
  if (!file) {
    return NextResponse.json({ message: "Failed" });
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const path = join("/", "tmp", file.name);
  await writeFile(path, buffer);

  const parser = new EpubParser(path);
  const book = await parser.parse();
  // @ts-ignore
  const results = await parser.readItems(book.spines);
  const cleanedData = results.map((result: any) => {
    return stripHTMLTags(result);
  });
  // console.log(cleanedData);
  return NextResponse.json({ data: cleanedData });
}
