import Image from "next/image";

import styles from "./Hero.module.css";
import { Frameworks, Socials } from "./components";

const Hero = () => {
  return (
    <section className="relative w-full h-screen">
      <section className={`${styles.Hero} sm:px-10 px-4 absolute top-[120px]`}>
        <div className="absolute flex flex-col items-start sm:left-10 left-4">
          <div className="sm:w-80 w-40 h-1 bg-gradient-to-r from-primary to-transparent" />
          <div className="w-1 sm:h-80 h-40 bg-gradient-to-b from-primary to-transparent" />
        </div>
        <section className="m-5 sm:m-10 text-neutral-content flex flex-col gap-2">
          <h1 className="font-black lg:text-7xl sm:text-6xl text-3xl">
            👋🏼 Hi, I&rsquo;m <span className="text-primary">Liam Reid</span>
          </h1>
          <p className="font-medium lg:text-3xl sm:text-2xl text-lg">
            I&rsquo;m a senior full stack developer with over a decade of
            professional experience.
          </p>
          <Frameworks />
        </section>
        <div className="bg-secondary/25 rounded-full overflow-auto relative justify-center hidden md:flex w-fit h-fit mt-7">
          <Image
            src="/profile.png"
            width={300}
            height={500}
            alt="Profile picture for Liam Reid"
            className="object-contain"
          />
          <span className="absolute bottom-10">
            <Socials />
          </span>
        </div>
      </section>
    </section>
  );
};

export default Hero;
