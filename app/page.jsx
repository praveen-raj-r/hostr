import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative z-10 px-6">
        {/* LEFT */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight mb-6">
            Discover & <br />
            create{" "}
            <span className="bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              amazing events
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-10 font-light">
            From local meetups to large-scale experiences — Hostr helps you
            create, explore, and manage events effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/explore">
              <Button size="xl" className="rounded-full px-8">
                Get started
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative lg:ml-auto mx-auto pb-10">
          <Image
            src="/hero.png"
            alt="People attending a tech meetup"
            width={400}
            height={400}
            priority
            className="select-none"
          />
        </div>
      </div>
    </section>
  );
}
