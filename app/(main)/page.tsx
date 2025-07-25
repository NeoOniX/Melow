import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-center pb-16">
        <Image
          src="/imgs/icons/144x144.png"
          alt="Melow Logo"
          width={128}
          height={128}
        />
        <h1 className="text-3xl font-bold text-stone-800 dark:text-white mt-4">
          Welcome to Melow
        </h1>
        <p className="text-lg text-gray-300">
          Your personal, self-hosted music library.
        </p>
      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/imgs/icons/2560x2560.png"
          alt=""
          className="w-full h-full object-cover scale-110 blur-3xl opacity-30"
          fill
          sizes="100vw"
        />
      </div>
    </>
  );
}
