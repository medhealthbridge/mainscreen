import { Hero } from "@/components/Hero";
import { WorkStage } from "@/components/WorkStage";
import { Projects } from "@/components/Projects";
import { WhatIBuild } from "@/components/WhatIBuild";
import { Process } from "@/components/Process";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { NeedProvider } from "@/components/NeedContext";
import { DataLine } from "@/components/DataLine";

export default function Home() {
  return (
    <NeedProvider>
      <DataLine />
      <Hero />
      <WorkStage />
      <Projects />
      <WhatIBuild />
      <Process />
      <About />
      <Contact />
    </NeedProvider>
  );
}
