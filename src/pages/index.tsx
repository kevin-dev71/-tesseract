import Image from 'next/image';
import { Inter } from 'next/font/google';
import Tesseract, { createWorker } from 'tesseract.js';
import { useEffect, useRef, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const workerRef = useRef<Tesseract.Worker | null>();
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('idle');
  const [ocrResult, setOcrResult] = useState('');
  const [imageData, setImageData] = useState('');

  useEffect(() => {
    workerRef.current = createWorker({
      logger: (message) => {
        if ('progress' in message) {
          setProgress(message.progress);
          setProgressLabel(message.progress == 1 ? 'Done' : message.status);
        }
      },
    });

    return () => {
      workerRef.current?.terminate?.();
      workerRef.current = null;
    };
  }, []);

  const handleExtract = async (e: any) => {
    e.preventDefault();
    setProgress(0);
    setProgressLabel('starting');

    const worker = await workerRef.current;
    await worker?.loadLanguage('eng');
    await worker?.initialize('eng');
    const response = await worker?.recognize(imageData);
    setOcrResult(response?.data?.text);
    console.log(response.data);
  };

  // OnChange function
  const handleOnChange = (changeEvent: any) => {
    const reader = new FileReader();

    reader.onload = (onLoadEvent) => {
      setImageData(onLoadEvent.target.result);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form
        action="post"
        onChange={handleOnChange}
        onSubmit={handleExtract}
        className="mt-5 grid gap-5 md:grid-cols-5"
      >
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <div className="w-full h-72 col-span-5 md:col-span-2 flex">
            {imageData ? (
              <img
                src={imageData}
                alt="uploaded image"
                className="object-contain h-full w-full"
              />
            ) : (
              <span className="self-center flex flex-col space-y-3 p-5">
                <p className="italic">
                  Click on the blue button below to add an image
                </p>
              </span>
            )}
          </div>
          <div></div>
        </div>

        <div className="w-full col-span-2 md:order-last relative">
          <input
            type="file"
            name="file"
            className="absolute z-10 w-32 h-12 opacity-0"
          />
          <label
            htmlFor="file"
            className="bg-blue-500 text-white rounded-lg shadow-md p-3 block relative w-32 h-12 text-center"
          >
            Select image
          </label>
        </div>
        <div className="w-max col-span-3 justify-self-end md:justify-self-start md:order-last">
          <button
            type="submit"
            className="bg-green-500 text-white rounded-lg shadow-md p-3"
          >
            <span>Detect text</span>
          </button>
        </div>

        {/* Box: to display the extracted text */}
        <div className="w-full max-h-72 overflow-hidden col-span-5 md:col-span-3 border-2 border-green-500 font-semibold text-gray-500 rounded-lg">
          <div className="overflow-y-scroll break-words w-full h-full p-5">
            {ocrResult}
          </div>
        </div>
      </form>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
    </main>
  );
}
