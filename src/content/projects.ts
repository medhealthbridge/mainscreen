/**
 * PROJECTS — the single source for every project on the site.
 *
 * The home page (project field, index, featured sections) and the case-study
 * pages (/work/<slug>/) are all generated from this list. To add a project,
 * copy one entry, change the text, and point the image paths at your files in
 * /public/work/<slug>/. Order here = order on the site. The first three
 * entries are shown as large featured presentations.
 *
 * IMPORTANT — the three entries below are CONCEPT PLACEHOLDERS built with
 * fictional sample data so the site is complete before real work is added.
 * Replace them with your projects, and set `status` and `sampleData` honestly.
 */

export type Status = "Live" | "In development" | "Concept";
export type Need = "website" | "manual" | "system" | "unsure";
export type Offering = "Website" | "Business system";

export interface ProjectImage {
  /** Path under /public, e.g. "/work/fieldbook/board.webp" */
  src: string;
  /** Lightweight version used by the moving image trail (≈640px wide). */
  thumb: string;
  alt: string;
  width: number;
  height: number;
  /** Used to size and place the image well. */
  kind: "desktop" | "mobile" | "page";
}

export interface Project {
  slug: string;
  name: string;
  offering: Offering;
  /** Short category shown in the index, e.g. "Job management system". */
  category: string;
  /** Who it's for — the business or user it serves. */
  serves: string;
  status: Status;
  /** true = fictional sample data. Shows a clear notice on the site. */
  sampleData: boolean;
  year: string;
  /** One-sentence summary for the index and link previews. */
  summary: string;
  problem: string;
  built: string;
  role: string[];
  /** Only set when a working demo exists. Leave undefined to hide the link. */
  demoUrl?: string;
  /** Which "What's slowing you down?" answers this project is relevant to. */
  needs: Need[];
  images: ProjectImage[];
  caseStudy: {
    context: string;
    constraints: string[];
    decisions: { title: string; body: string }[];
    solution: string[];
    /** "Outcome" only with real evidence. Otherwise "Intended benefit". */
    outcomeLabel: "Outcome" | "Intended benefit";
    outcome: string[];
  };
}

const img = (
  slug: string,
  file: string,
  alt: string,
  kind: ProjectImage["kind"],
): ProjectImage => {
  const size =
    kind === "mobile"
      ? { width: 780, height: 1688 }
      : kind === "page"
        ? { width: 1600, height: 3400 }
        : { width: 1600, height: 1000 };
  return {
    src: `/work/${slug}/${file}.webp`,
    thumb: `/work/${slug}/thumb/${file}.webp`,
    alt,
    kind,
    ...size,
  };
};

export const projects: Project[] = [
  {
    slug: "fieldbook",
    name: "Fieldbook",
    offering: "Business system",
    category: "Job & crew management system",
    serves: "A home-services company with an office team and field crews",
    status: "Concept",
    sampleData: true,
    year: "2026",
    summary:
      "One place for every job — from the first phone call to the paid invoice.",
    problem:
      "Jobs arrive by phone, text, email and web form. The office re-types each one into a spreadsheet and a whiteboard, crews call in for addresses, and invoices go out days after the work is done.",
    built:
      "A single job pipeline: requests become structured jobs, jobs are scheduled to crews, crews work from a phone checklist, and marking a job done drafts the invoice and tells the customer.",
    role: ["Workflow mapping", "Product & interface design", "Front-end & back-end build"],
    needs: ["manual", "system", "unsure"],
    images: [
      img("fieldbook", "board", "Fieldbook job board with columns for new, scheduled, in-progress and completed jobs", "desktop"),
      img("fieldbook", "job", "Fieldbook job detail showing customer, address, schedule, checklist and invoice status", "desktop"),
      img("fieldbook", "crew", "Fieldbook crew view on a phone listing today's jobs in route order", "mobile"),
      img("fieldbook", "schedule", "Fieldbook weekly schedule with jobs assigned to three crews", "desktop"),
    ],
    caseStudy: {
      context:
        "A concept for a service business of around a dozen people: two people in the office, the rest on the road. The work is good; the admin around it is the bottleneck.",
      constraints: [
        "Crews use their own phones, often with poor signal — the field view has to be fast and forgiving.",
        "The office already uses an accounting tool; the system should hand invoices to it, not replace it.",
        "Nobody has time for training. Every screen has to be obvious on first use.",
      ],
      decisions: [
        {
          title: "One record per job, from request to invoice",
          body: "Instead of separate tools for intake, scheduling and billing, every job is a single record that moves through four plain stages. Nobody re-types anything.",
        },
        {
          title: "Turn messages into jobs, not the other way round",
          body: "Office staff paste or forward a request and confirm a short structured form. The original message is kept on the job, so context is never lost.",
        },
        {
          title: "The crew view does one thing",
          body: "Today's jobs, in route order, with the address, the checklist and a single 'Done' button. Everything else stays in the office.",
        },
      ],
      solution: [
        "A shared job board for the office with the whole week at a glance.",
        "A drag-to-assign schedule for crews and vans.",
        "A mobile crew view with checklists, notes and photos.",
        "Completion that drafts the invoice and sends the customer a confirmation.",
      ],
      outcomeLabel: "Intended benefit",
      outcome: [
        "Designed to remove double entry between messages, spreadsheet and whiteboard.",
        "Designed to shorten the gap between finishing a job and sending the invoice.",
        "Designed so the office can answer 'where are we with this job?' in seconds.",
      ],
    },
  },
  {
    slug: "halden-physio",
    name: "Halden Physio",
    offering: "Website",
    category: "Clinic website & booking journey",
    serves: "An independent physiotherapy clinic and its new patients",
    status: "Concept",
    sampleData: true,
    year: "2026",
    summary:
      "A clinic website that helps people find the right treatment and book it in three steps.",
    problem:
      "Treatments were listed in clinical terms, so visitors couldn't tell which one fit their problem. Booking meant phoning during opening hours — and most people browse in the evening.",
    built:
      "Plain-language service pages organised around what hurts, clear practitioner profiles, and a three-step booking journey connected to the clinic's existing scheduling tool.",
    role: ["Content structure", "Visual & interaction design", "Front-end development"],
    needs: ["website", "unsure"],
    images: [
      img("halden-physio", "home", "Halden Physio homepage with a clear headline, treatment finder and booking button", "page"),
      img("halden-physio", "booking", "Halden Physio booking step for choosing an appointment time", "desktop"),
      img("halden-physio", "mobile", "Halden Physio homepage on a phone", "mobile"),
      img("halden-physio", "services", "Halden Physio treatments page organised by area of the body", "desktop"),
    ],
    caseStudy: {
      context:
        "A concept for a two-practitioner clinic that relies on word of mouth and wants its website to do more of the explaining and booking.",
      constraints: [
        "The clinic already uses an online scheduling tool — booking must connect to it, not replace it.",
        "Medical claims need care: the copy explains, it doesn't promise results.",
        "Most visitors arrive on a phone, often in discomfort. Every step must be quick to read.",
      ],
      decisions: [
        {
          title: "Organise by problem, not by treatment name",
          body: "Visitors choose 'back & neck' or 'sports injury' first. Treatment names appear after, with a one-line explanation in everyday words.",
        },
        {
          title: "Booking is reachable from everywhere",
          body: "A persistent 'Book an appointment' action and a three-step flow: what you need, when, your details. No account required.",
        },
        {
          title: "Calm, confident visual tone",
          body: "Warm neutrals, generous type and real-world photography direction — reassuring rather than clinical.",
        },
      ],
      solution: [
        "Homepage with a treatment finder and clear next step.",
        "Service pages written in plain language with what to expect.",
        "Practitioner profiles that build trust before the first visit.",
        "Three-step booking journey linked to the existing scheduling tool.",
      ],
      outcomeLabel: "Intended benefit",
      outcome: [
        "Designed so visitors can match their problem to a treatment without calling.",
        "Designed to let people book outside opening hours.",
        "Designed to reduce repetitive 'which appointment do I need?' calls.",
      ],
    },
  },
  {
    slug: "ledgerroom",
    name: "Ledgerroom",
    offering: "Business system",
    category: "Client portal & records",
    serves: "A small bookkeeping practice and its business clients",
    status: "Concept",
    sampleData: true,
    year: "2026",
    summary:
      "A client portal that replaces month-end email chains with one clear list of what's needed.",
    problem:
      "Month-end runs on email: chasing receipts, 'did you get my statement?', files saved in five places. Nobody can see at a glance which clients are ready and which are blocking.",
    built:
      "A portal where each client sees exactly what's outstanding and uploads documents against specific requests, plus a practice-side checklist showing month-end status across every client.",
    role: ["Service design", "Interface design", "Full-stack development"],
    needs: ["manual", "system", "unsure"],
    images: [
      img("ledgerroom", "overview", "Ledgerroom practice overview showing month-end progress for each client", "desktop"),
      img("ledgerroom", "requests", "Ledgerroom document requests list with due dates and statuses", "desktop"),
      img("ledgerroom", "upload", "Ledgerroom client upload screen on a phone", "mobile"),
      img("ledgerroom", "checklist", "Ledgerroom month-end checklist for a single client", "desktop"),
    ],
    caseStudy: {
      context:
        "A concept for a three-person bookkeeping practice with around forty small-business clients, most of whom are not comfortable with complex software.",
      constraints: [
        "Clients upload from their phones, often photos of paper receipts.",
        "Financial documents need careful access control and an audit trail.",
        "The practice keeps its existing accounting software — the portal sits alongside it.",
      ],
      decisions: [
        {
          title: "Requests, not folders",
          body: "Clients never browse a file tree. They see a short list: 'March bank statement', 'Receipts for the van'. Each upload answers one request.",
        },
        {
          title: "Status the whole practice can read",
          body: "Every client has one month-end status — waiting on client, in review, or done — so the team knows where to spend the day.",
        },
        {
          title: "Reminders that are polite and specific",
          body: "Automatic nudges list exactly what's missing, replacing hand-written chaser emails.",
        },
      ],
      solution: [
        "Client portal with outstanding requests and secure uploads.",
        "Phone-first upload flow for receipts and statements.",
        "Practice overview of month-end status across all clients.",
        "Per-client checklist with history of every document received.",
      ],
      outcomeLabel: "Intended benefit",
      outcome: [
        "Designed to replace scattered email threads with one list per client.",
        "Designed to make month-end status visible without asking around.",
        "Designed to cut the time spent writing chaser emails.",
      ],
    },
  },
];

export const statusNote: Record<Status, string> = {
  Live: "Launched and in use.",
  "In development": "Currently being built. Screens show the work in progress.",
  Concept: "Concept project with fictional sample data — not a client engagement.",
};

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
