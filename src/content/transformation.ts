/**
 * THE TRANSFORMATION — the step-by-step demo shown inside one featured project.
 * It explains what the system does: scattered requests → organised jobs →
 * usable job view → completed task. Attach it to a project via `projectSlug`.
 * All names and details are fictional sample data.
 */

export const transformation = {
  projectSlug: "fieldbook",
  steps: [
    {
      label: "Scattered",
      title: "Scattered messages.",
      body: "Texts, emails, voicemails and sticky notes. Someone retypes each one into a spreadsheet — or it slips through.",
    },
    {
      label: "Structured",
      title: "Each one becomes a structured job.",
      body: "Every message turns into a job with the same fields — customer, address, time, crew — in one shared pipeline.",
    },
    {
      label: "Scheduled",
      title: "Scheduled into the workflow.",
      body: "The job is assigned a crew and a time. The crew's phone shows the address, gate code and a checklist — no calls back to the office.",
    },
    {
      label: "Completed",
      title: "Completed — and nothing typed twice.",
      body: "Marking the job done drafts the invoice and tells the customer automatically.",
    },
  ],
  columns: ["New", "Scheduled", "In progress", "Done"],
  /** column index per item in the organised board; the first item is the one we follow. */
  items: [
    { source: "Text message", raw: "“Boiler keeps losing pressure — any chance Thursday morning? Gate code 4471.”", id: "J-2318", title: "Boiler service", place: "14 Larch Close", when: "Thu 09:30", crew: "A", col: 2 },
    { source: "Email", raw: "“Could you quote for flushing the radiators at the studio? There are six.”", id: "J-2325", title: "Radiator flush × 6", place: "St. Clare Studio", when: "Fri 08:00", crew: "C", col: 1 },
    { source: "Voicemail · 0:42", raw: "“…kitchen tap’s been dripping all week, I’m on Harbour Road…”", id: "J-2320", title: "Leaking kitchen tap", place: "88 Harbour Rd", when: "Thu 12:00", crew: "B", col: 1 },
    { source: "Web form", raw: "New thermostat installation · 2 Beacon Terrace · any afternoon", id: "J-2324", title: "Thermostat install", place: "2 Beacon Terrace", when: "Thu 14:30", crew: "A", col: 1 },
    { source: "Sticky note", raw: "Hollis bathroom — pipework, 3 days?? call back", id: "J-2319", title: "Bathroom pipework", place: "Hollis family", when: "Day 2 of 3", crew: "C", col: 2 },
    { source: "Spreadsheet row 48", raw: "drain | Westgate | ??? | not assigned", id: "J-2326", title: "Blocked outside drain", place: "Westgate", when: "Needs a slot", crew: "", col: 0 },
  ],
  detail: {
    customer: "Anna Whitfield",
    note: "Side gate code 4471",
    checklist: ["Isolate supply, check gauge", "Inspect flue and seals", "Clean condensate trap", "Re-pressurise to 1.2 bar", "Photo of service label"],
    toast: "Invoice drafted · Customer notified",
  },
};
