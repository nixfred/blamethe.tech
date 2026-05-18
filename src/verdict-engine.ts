// THE BLAME ENGINE — verdict generator.
// Combinatorial generator + curated premium verdicts. 100% client-side.

export interface Verdict {
  caseId: string;
  severity: string;
  incident: string;
  rootCause: string;
  finding: string;
  blame: string;
  recommendation: string;
  confidence: number;
}

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const SEVERITIES = [
  "SEV-1",
  "SEV-2",
  "SEV-2",
  "SEV-3",
  "SEV-3",
  "SEV-0 · EXISTENTIAL",
  "SEV-∞",
] as const;

// Curated premium verdicts. Each is a complete, hand-tuned root cause.
const PREMIUM_ROOT_CAUSES = [
  "DNS. The incident is always, eventually, DNS.",
  "an autonomous agent that followed the runbook literally",
  "a feature flag switched on for a demo in 2019 and never switched off",
  "a certificate that expired at 03:00 on a Saturday, as certificates do",
  "a load balancer health check that reported “healthy” out of politeness",
  "a retry loop with no upper bound and a great deal of enthusiasm",
  "a YAML file in which exactly one space mattered",
  "a cron job that no living employee remembers writing",
  "a cache that was never invalidated, because invalidating it was hard",
  "a third-party API returning 200 OK with the word “error” in the body",
  "a script named final_v2_REAL_usethis.sh",
  "a race condition that exists only in production and only when observed",
  "an autoscaler that scaled confidently in the wrong direction",
  "a model that hallucinated a config value and committed to it",
  "a database migration described, in the PR, as “quick”",
] as const;

const GENERIC_ROOT_CAUSES = [
  "an unbounded memory leak measured in calendar days",
  "a Kubernetes pod meditating peacefully in CrashLoopBackOff",
  "a regex that worked beautifully until the one input it didn’t",
  "an off-by-one error hiding in plain sight",
  "a timezone. It is genuinely never the timezone, except this once",
  "a webhook firing twice, then a third time, for emphasis",
  "a connection pool exhausted by a single very dedicated user",
  "a queue that was “temporarily” disabled in March",
  "a hardcoded localhost that made it to production with a clean conscience",
  "a silent dependency upgrade with strong opinions",
  "a log rotation policy that rotated the disk straight to 100%",
  "a graceful shutdown that was neither graceful nor a shutdown",
  "a microservice that depended on a microservice that depended on it",
  "a backup that was running flawlessly to /dev/null",
  "a leap-second the codebase chose not to acknowledge",
] as const;

const FINDINGS = [
  "The system behaved exactly as written. That was the problem.",
  "Logs were available. The logs were not, in any meaningful sense, helpful.",
  "It worked perfectly in staging. Staging has been informed.",
  "The runbook was followed to the letter. The letter was wrong.",
  "No alert fired, because the alert was also down.",
  "The on-call engineer was paged. The on-call engineer was at a wedding.",
  "Monitoring confirmed the outage approximately eleven minutes after the users did.",
  "The fix was a one-line change. Locating the one line took six hours.",
  "Everything was green on the dashboard. The dashboard was lying.",
  "A rollback was attempted. The rollback also required the thing that was down.",
  "The error was reproducible, which was the only encouraging part of the night.",
  "Someone said “it’s probably nothing.” It was, in fact, something.",
  "The incident channel reached 400 messages before anyone reached the cause.",
  "The change was reviewed and approved. Reviewing and reading are different activities.",
] as const;

const HUMAN_ACTIONS = [
  "A senior engineer pushed to main at 16:58 on a Friday and has since “gone for the weekend.”",
  "The change was approved by everyone and read by no one.",
  "Someone described the deploy as “quick.” This word has been added to the incident review.",
  "An intern was granted production access and a reassuring smile.",
  "The phrase “it’s just a config change” appears four times in the chat history.",
  "Two engineers fixed the same bug in opposite directions simultaneously.",
] as const;

const BLAME_TARGETS = [
  "THE TECH",
  "THE TECH",
  "THE TECH (it was DNS)",
  "THE TECH (see also: DNS)",
  "THE TECH — specifically, all of it",
  "THE TECH (the human one this time, but still the tech)",
] as const;

const RECOMMENDATIONS = [
  "Restart it. Do not, under any circumstances, investigate further.",
  "Add more logging. Read none of it.",
  "Schedule a blameless postmortem. Assign blame during it.",
  "Update the runbook. Take comfort in knowing nobody will read it.",
  "Provision a larger server. The problem is not the server. Provision it anyway.",
  "Mark as “working as intended” and close the ticket with confidence.",
  "Wrap it in a try/catch and walk slowly toward the exit.",
  "Add a dashboard. The outage will continue, but it will be observable.",
  "Declare victory. Re-declare it if necessary.",
  "Write a thorough incident report. File it where reports go to rest.",
] as const;

const FALLBACK_INCIDENTS = [
  "the site is down",
  "users cannot log in",
  "the deploy broke production",
  "everything is on fire",
  "it works on my machine",
  "the database is not responding",
  "latency is, and I quote, “insane”",
] as const;

function caseId(): string {
  const n = Math.floor(1000 + Math.random() * 8999);
  return `BT-${n}`;
}

export function generateVerdict(rawIncident: string): Verdict {
  const incident =
    rawIncident.trim().length > 0
      ? rawIncident.trim()
      : pick(FALLBACK_INCIDENTS);

  // 55% premium root cause, 45% generic pool.
  const rootCause =
    Math.random() < 0.55
      ? pick(PREMIUM_ROOT_CAUSES)
      : pick(GENERIC_ROOT_CAUSES);

  // 35% of the time, the finding is a human-action zinger.
  const finding =
    Math.random() < 0.35 ? pick(HUMAN_ACTIONS) : pick(FINDINGS);

  return {
    caseId: caseId(),
    severity: pick(SEVERITIES),
    incident,
    rootCause,
    finding,
    blame: pick(BLAME_TARGETS),
    recommendation: pick(RECOMMENDATIONS),
    confidence: Math.floor(94 + Math.random() * 6), // 94-99%, suspiciously high
  };
}

export function verdictAsText(v: Verdict): string {
  return [
    `THE BLAME ENGINE — CASE ${v.caseId} [${v.severity}]`,
    `INCIDENT: ${v.incident}`,
    `ROOT CAUSE: ${v.rootCause}`,
    `FINDING: ${v.finding}`,
    `BLAME ASSIGNED TO: ${v.blame}`,
    `RECOMMENDED ACTION: ${v.recommendation}`,
    `CONFIDENCE: ${v.confidence}%`,
    `— blamethe.tech`,
  ].join("\n");
}
