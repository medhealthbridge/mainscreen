import { Hero } from "@/components/Hero";
import { ProjectField } from "@/components/ProjectField";
import { NeedProvider } from "@/components/NeedContext";

export default function Home() {
  return (
    <>
      <Hero />
      <NeedProvider><ProjectField /></NeedProvider><div style={{ height: "60vh" }} id="featured" />
    </>
  );
}
