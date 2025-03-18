"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios, {Axios} from "axios"
import {v4} from "uuid"
// @ts-ignore
import pdfToText from "react-pdftotext";

export default function Home() {
  const [loading, setLoading] = useState(0);
  const [ID,setID]=useState<boolean| string>(false)
  const ApiLink="http://localhost"
  const ServerPort="5000"
  useEffect(()=>{
    setID(v4())
  },[])
  const handleFileUpload = async (file: File) => {
    setLoading(1);
    if (file) {
      let result
      if (file.name.endsWith(".pdf")) {
        pdfToText(file)
          .then(async(text: any) => {
            const cleanedText2 = text.replace(/\r\n|\n/g, " ");
            result = cleanedText2.replace(/ {2,}/g, " ");
            console.log(result)

            
          })
          .catch((error: any) =>
            console.error("Failed to extract text from pdf")
          );
      } else {
        const data = new FormData();
        data.set("file", file);
        const resText = await fetch("/api/epubtojson", {
          method: "POST",
          body: data,
        });
        result = await resText.json();
        let ttsRes=await axios.post(ApiLink+":"+ServerPort+"/tts",{text:result.data[3],id:ID})
        if (ttsRes.status==200){
            setLoading(2)
        }
        
      }
      
    }
  };

  return (
    <div className="font-clashDisplay">
      <div className="">
        <div className="flex items-center justify-between px-32 mt-14">
          <Image src={"/images/logo.png"} width={60} height={60} alt="" />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-10 mt-28 ">
          <h1 className="font-medium text-3xl md:text-5xl text-center px-10">
            From Silent Pages to Dynamic Narratives
          </h1>
          <p className="font-light md:text-xl md:w-[800px] text-center px-10 flex-wrap">
            With VoiceBook, instantly transform your ebooks into audiobooks with
            AI technology. <span className="text-[#635EFF]">Upload</span>,{" "}
            <span className="text-[#635EFF]">listen</span>, and{" "}
            <span className="text-[#635EFF]">enjoy</span> your favorite stories
            effortlessly.
          </p>
          <a
            href="#startnow"
            className="bg-[#635EFF] text-white rounded-full px-10 py-2 text-xl"
          >
            Start now !
          </a>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-y-16 md:gap-x-10 mt-32 md:ml-10">
          <div className="flex flex-col justify-center items-center w-fit gap-y-5">
            <Image src={"/images/icon1.png"} width={100} height={100} alt="" />
            <div className="text-center flex flex-col gap-y-3">
              <h1 className="text-[#635EFF] font-medium text-2xl">Step 1:</h1>
              <p className="text-xl">
                Upload your <br /> ebook
              </p>
            </div>
          </div>
          <div className="hidden md:flex">
            <Image src={"/images/arrow.png"} width={200} height={100} alt="" />
          </div>
          <div className="flex flex-col justify-center items-center w-fit gap-y-5">
            <Image src={"/images/icon2.png"} width={100} height={100} alt="" />
            <div className="text-center flex flex-col gap-y-3">
              <h1 className="text-[#635EFF] font-medium text-2xl">Step 2:</h1>
              <p className="text-xl">
                We convert it to
                <br /> an audiobook
              </p>
            </div>
          </div>
          <div className="hidden md:flex">
            <Image src={"/images/arrow.png"} width={200} height={100} alt="" />
          </div>
          <div className="flex flex-col justify-center items-center w-fit gap-y-5">
            <Image src={"/images/icon3.png"} width={100} height={100} alt="" />
            <div className="text-center flex flex-col gap-y-3">
              <h1 className="text-[#635EFF] font-medium text-2xl">Step 3:</h1>
              <p className="text-xl">
                Download or listen <br /> on our site
              </p>
            </div>
          </div>
        </div>
      </div>
      <div id="startnow" className="flex flex-col items-center gap-y-28">
        <h1 className="text-center text-3xl md:text-5xl font-medium mt-32">
          Start now !
        </h1>
        {loading==1 ? (
          <h1 className="text-3xl mb-72 text-[#635EFF]">Loading ...</h1>
        ) : loading==0 ? (
          <label className="bg-[#635EFF] text-white rounded-full px-10 py-2 text-xl mb-72 cursor-pointer">
            Upload your book
            <input
              id="file-input"
              className="hidden"
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        ):<>
            <audio src={`${ApiLink}:${ServerPort}/tts?id=${ID}`} controls/>
            </>}
      </div>
    </div>
  );
}
