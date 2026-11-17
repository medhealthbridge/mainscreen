import { Hero } from "@/components/Hero";
import { ProjectField } from "@/components/ProjectField";
import { NeedProvider } from "@/components/NeedContext";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Needs } from "@/components/Needs";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { About } from "@/components/About";
import { Faq } from "@/components/Faq";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <NeedProvider>
      <Hero />
      <ProjectField />
      <FeaturedWork />
      <Needs />
      <Services />
      <Process />
      <About />
      <Faq />
      <Contact />
    </NeedProvider>
  );
}
