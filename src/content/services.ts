/**
 * SERVICES, PROBLEMS, PROCESS & FAQ — edit freely.
 * Only list services you actually offer. FAQ answers describe defaults;
 * review them so they match how you work.
 */
import type { Need } from "./projects";

/** Options for the "What's slowing your business down?" selector. */
export const needOptions: { id: Need; label: string; service: string; starter: string }[] = [
  {
    id: "website",
    label: "My website needs work.",
    service: "Website",
    starter: "My website isn't doing its job. Right now the main problem is…",
  },
  {
    id: "manual",
    label: "My process is too manual.",
    service: "Business system",
    starter: "Too much of our work is manual. The part that takes the most time is…",
  },
  {
    id: "system",
    label: "I need a new system.",
    service: "Business system",
    starter: "I have an idea for a system. It would help us…",
  },
  {
    id: "unsure",
    label: "I'm not sure yet.",
    service: "Not sure",
    starter: "I'm not sure what I need yet. Here's what's frustrating at the moment…",
  },
];

/** Recognisable problems, each connected to a solution and related work. */
export const problems: {
  problem: string;
  solution: string;
  needs: Need[];
  service: "Websites" | "Business systems";
  /** Optional project slug to link to as related work. */
  project?: string;
}[] = [
  {
    problem: "Customers can't quickly understand what you offer.",
    solution:
      "A website structured around your customers' questions — what you do, who it's for, what it costs to start, and how to take the next step.",
    needs: ["website", "unsure"],
    service: "Websites",
    project: "halden-physio",
  },
  {
    problem: "Bookings and inquiries get buried in messages.",
    solution:
      "A clear inquiry or booking journey that collects the right details once and lands in one organised list — not five inboxes.",
    needs: ["website", "manual", "unsure"],
    service: "Websites",
    project: "halden-physio",
  },
  {
    problem: "Your team keeps entering the same information.",
    solution:
      "A system where each job, client or order is entered once and flows through every step — scheduling, updates, invoicing.",
    needs: ["manual", "system", "unsure"],
    service: "Business systems",
    project: "fieldbook",
  },
  {
    problem: "Important records live across several spreadsheets.",
    solution:
      "One reliable home for your records, with the views each person needs — and clear status instead of guesswork.",
    needs: ["manual", "system", "unsure"],
    service: "Business systems",
    project: "ledgerroom",
  },
  {
    problem: "You have an idea for a system but need help shaping it.",
    solution:
      "We map how the work happens today, decide what matters most, and turn it into clickable screens before anything is built.",
    needs: ["system", "unsure"],
    service: "Business systems",
    project: "fieldbook",
  },
];

export const services = [
  {
    id: "websites",
    index: "A",
    title: "Websites",
    lead: "Websites that help people understand your business and take the next step.",
    benefits: [
      "Visitors understand what you offer in seconds.",
      "Every page leads to a clear action — call, book, or inquire.",
      "Easy to update, fast to load, comfortable on a phone.",
    ],
    examples: [
      "Business websites",
      "Service pages",
      "Portfolios",
      "Landing pages",
      "Inquiry & booking journeys",
    ],
  },
  {
    id: "systems",
    index: "B",
    title: "Business systems",
    lead: "Custom systems that organise information and simplify repeated work.",
    benefits: [
      "Information is entered once and found instantly.",
      "Everyone sees the status of the work without asking.",
      "Repetitive steps — reminders, updates, documents — happen on their own.",
    ],
    examples: [
      "Dashboards",
      "Internal tools",
      "Booking systems",
      "Client portals",
      "Records management",
      "Workflow automation",
    ],
  },
] as const;

export const process = [
  {
    step: "01",
    title: "Understand",
    body: "We talk through how the work happens today, what's frustrating, and what a good result looks like.",
    you: "A conversation or two, plus examples of your current tools, documents or site.",
    output: "A short written brief: the problem, the scope, and what we'll build first.",
  },
  {
    step: "02",
    title: "Design",
    body: "I shape the structure and design the key screens or pages, then turn them into a clickable prototype.",
    you: "Review the prototype and give feedback — the earlier the better.",
    output: "Approved designs and a prototype you can click through.",
  },
  {
    step: "03",
    title: "Build",
    body: "I build it properly and share working versions as I go, so nothing at the end is a surprise.",
    you: "Test working versions with real content and real tasks.",
    output: "A working site or system, tested on phones, tablets and desktops.",
  },
  {
    step: "04",
    title: "Launch & handoff",
    body: "We launch together, move any existing data, and I make sure your team knows how to use and update it.",
    you: "Final sign-off, and a short walkthrough with whoever will use it.",
    output: "A live product, access to every account, and written notes on how it works.",
  },
];

export const faq = [
  {
    q: "How do you decide what's in scope?",
    a: "We start from the problem, not a feature list. After our first conversations I write a short brief describing what we'll build first and what can wait. You approve it before any design or build work starts.",
  },
  {
    q: "Can you work with the tools we already use?",
    a: "Usually, yes. Many projects connect to existing tools — scheduling, accounting, email, spreadsheets — rather than replacing them. I'll tell you early if something can't be connected sensibly.",
  },
  {
    q: "Who owns the finished work?",
    a: "Ownership is agreed in writing before the project starts. My default is that you own the finished site or system, its content and its data, and that accounts are set up in your name.",
  },
  {
    q: "Will it work on phones?",
    a: "Yes. Everything I build is designed and tested for phones, tablets and desktops. For many businesses the phone experience matters most, so it's considered from the first sketch.",
  },
  {
    q: "What happens after launch?",
    a: "You get written notes on how everything works. If you'd like help with updates, improvements or new features after launch, we can agree ongoing support that fits how often you'll need it.",
  },
  {
    q: "I'm not sure what I need. Can we still talk?",
    a: "Yes — that's a good place to start. Describe what's frustrating or slow, and I'll suggest whether a website, a system, or something simpler would help most.",
  },
];
