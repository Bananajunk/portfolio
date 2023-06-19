import Hero from "~/components/Hero";
import Work from "~/components/Work";

export default function Home() {
  return (
    <main className="bg-base-100 flex flex-col">
      <Hero />
      <Work />
    </main>
  );
}
