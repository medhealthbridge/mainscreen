import { Hero } from "@/components/Hero";
import { WorkStage } from "@/components/WorkStage";
import { Intro } from "@/components/Intro";
import { Capabilities } from "@/components/Capabilities";
import { Needs } from "@/components/Needs";
import { Projects } from "@/components/Projects";
import { Process } from "@/components/Process";
import { About } from "@/components/About";
import { Faq } from "@/components/Faq";
import { Contact } from "@/components/Contact";
import { NeedProvider } from "@/components/NeedContext";
import { DataLine } from "@/components/DataLine";

export default function Home() {
  return (
    <NeedProvider>
      <DataLine />
      <Hero />
      <WorkStage />
      <Intro />
      <Capabilities />
      <Needs />
      <Projects />
      <Process />
      <About />
      <Faq />
      <Contact />
    </NeedProvider>
  );
}
