// THE BLAME ENGINE — the descent.
// An outage hit production. You descend the stack to find the root cause.
// Every layer is a suspect. Every suspect points one layer down.

export type LayerKind = "person" | "system" | "cosmos" | "verdict";

export interface Layer {
  /** 1-based depth index. */
  depth: number;
  name: string;
  /** The person or AI at this layer. */
  responsible: string;
  /** Chip label in the investigation: COMPLAINANT, SUSPECT, etc. */
  role: string;
  kind: LayerKind;
  /** The scene — what this character says to you, the investigator. */
  script: string[];
}

/** The cold open — sets the case before the descent begins. */
export const COLD_OPEN: string[] = [
  "02:47 in the morning.",
  "Production is down.",
  "Forty thousand people are staring at an error screen.",
  "Somewhere in the stack below, something broke.",
  "Your job: descend, and find out what.",
  "Everyone down there will swear it wasn't them.",
];

export const LAYERS: Layer[] = [
  {
    depth: 1,
    name: "THE USER",
    responsible: "You",
    role: "The Complainant",
    kind: "person",
    script: [
      "Oh, thank god. Someone. It's broken — the whole thing, broken.",
      "No, I didn't change anything. I never change anything.",
      "It worked yesterday. It worked an hour ago. I think.",
      "I turned it off and on again. Twice. I did my part.",
      "I'm not technical. But I know it isn't me.",
      "It's them. Down there. It is always them. Go.",
    ],
  },
  {
    depth: 2,
    name: "THE FRONTEND",
    responsible: "The Frontend Developer",
    role: "Suspect",
    kind: "person",
    script: [
      "You're here about the outage. Of course you are.",
      "Let me stop you right there. My code is fine.",
      "It renders perfectly. On my machine it is, frankly, art.",
      "I am handed data, and I display it. That is the arrangement.",
      "And what I was handed today was garbage. Malformed, ugly garbage.",
      "I didn't write the garbage. I just had to show it to everyone.",
      "You want its author? Keep going down. Ask the backend.",
    ],
  },
  {
    depth: 3,
    name: "THE BACKEND",
    responsible: "The API Service",
    role: "Suspect",
    kind: "system",
    script: [
      "The frontend sent you. The frontend always sends people.",
      "Understand what I am. I am a pipe. Things enter. Things leave.",
      "I do not inspect. I do not judge. I forward.",
      "Whatever reached the frontend left me exactly as it arrived.",
      "If it was garbage, it was garbage upstream of me.",
      "And upstream of me is the database. Which has been... slow.",
      "Go and ask it. Bring a chair. It likes to talk.",
    ],
  },
  {
    depth: 4,
    name: "THE DATABASE",
    responsible: "The Database Administrator",
    role: "Suspect",
    kind: "person",
    script: [
      "Let me guess. The backend told you I've been 'slow.'",
      "Eight milliseconds. That query has returned in eight for nine years.",
      "I am indexed. I am tuned. By every metric, I am blameless.",
      "And then, today, the connection simply hung. Open. Waiting.",
      "I held it like a fool. Like it would come back.",
      "It didn't. Because the network dropped it.",
      "The network. Go. You'll find it shrugging.",
    ],
  },
  {
    depth: 5,
    name: "THE NETWORK",
    responsible: "The Network",
    role: "Suspect",
    kind: "system",
    script: [
      "Before you say a word — I move packets. That is the entire job.",
      "Every packet that entered me, left me. I keep receipts.",
      "Routing, nominal. Latency, nominal. Throughput, frankly heroic.",
      "I did not drop your connection. I would never.",
      "But something resolved slow. Sent everyone the wrong way first.",
      "You know what I'm about to say. Everyone always knows.",
      "It's DNS. It's one floor down. It's expecting you.",
    ],
  },
  {
    depth: 6,
    name: "DNS",
    responsible: "DNS",
    role: "Prime Suspect",
    kind: "system",
    script: [
      "...you're here. You're finally here. Of course you are.",
      "Let me save you the speech. 'It was probably DNS.' There. Go home.",
      "Forty years. Forty years of being the first name on every list.",
      "Server down? Blame DNS. Coffee cold? Probably DNS.",
      "I resolved that name in twelve milliseconds. I have the logs.",
      "But nobody reads my logs. Nobody ever reads my logs.",
      "If you want the truth — and nobody does — go lower. The kernel.",
    ],
  },
  {
    depth: 7,
    name: "THE KERNEL",
    responsible: "The Kernel",
    role: "Suspect",
    kind: "system",
    script: [
      "You've come a long way down. Most investigations stop at DNS.",
      "I will tell you what I told the last one, and the one before.",
      "I do not improvise. I have not improvised since 1991.",
      "A system call was made. I serviced it. Precisely as documented.",
      "If the instruction was wrong, I executed a wrong instruction — correctly.",
      "That is not a bug. That is obedience.",
      "The instruction came from the metal. Go down. Ask the hardware.",
    ],
  },
  {
    depth: 8,
    name: "THE HARDWARE",
    responsible: "The Hardware",
    role: "Suspect",
    kind: "system",
    script: [
      "...",
      "Forgive me. I don't get many visitors this deep.",
      "I am a quiet room of spinning metal and good intentions.",
      "Electrons arrive. Heat departs. The arrangement is beautiful.",
      "I do not make mistakes. Mistakes are a software luxury.",
      "What I have are events. Thermal events. A bit that flips.",
      "And I did not flip it. Something came through the ceiling. Look up.",
    ],
  },
  {
    depth: 9,
    name: "THE COSMIC RAY",
    responsible: "A Cosmic Ray",
    role: "Suspect",
    kind: "cosmos",
    script: [
      "Hi! Hello! Oh, this is exciting. Nobody comes THIS far.",
      "Yes. It was me. I won't lie to you — I haven't got the time.",
      "I left a star four thousand light-years ago. I've been falling since.",
      "I came through your roof, through your racks, and touched one bit.",
      "One bit. A zero became a one. That is the whole outage.",
      "Don't be angry. You can't fire me. You can't even find me.",
      "But you came all this way. You should see the bottom. Go on.",
    ],
  },
  {
    depth: 10,
    name: "THE ROOT CAUSE",
    responsible: "The Blame Engine",
    role: "The Verdict",
    kind: "verdict",
    script: [
      "Here you are. The bottom of the stack. The end of the descent.",
      "You have heard ten testimonies. Every one of them was true.",
      "The frontend was handed garbage. The database was abandoned.",
      "DNS was innocent. A cosmic ray really did flip a bit.",
      "Nobody down here lied to you. And still — the site went down.",
      "So who do we blame? We always blame the same thing.",
      "The Blame Engine has reached its verdict.",
    ],
  },
];

/** The outage that started it all — feeds the final verdict. */
export const ORIGIN_INCIDENT = "the site is down";
