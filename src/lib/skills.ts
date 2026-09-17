/**
 * Canonical casing for common tech/skill names, keyed by their lowercased
 * form. Used to normalize both AI-generated and user-typed skill tags so
 * they render consistently (e.g. "typescript" -> "TypeScript") regardless
 * of how they were originally typed or generated.
 */
const CANONICAL_SKILLS: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  ts: "TypeScript",
  html: "HTML",
  html5: "HTML5",
  css: "CSS",
  css3: "CSS3",
  sass: "Sass",
  scss: "Sass",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  bootstrap: "Bootstrap",
  react: "React",
  reactjs: "React",
  "react.js": "React",
  "react native": "React Native",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  vue: "Vue",
  vuejs: "Vue",
  "vue.js": "Vue",
  angular: "Angular",
  svelte: "Svelte",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express",
  expressjs: "Express",
  python: "Python",
  django: "Django",
  flask: "Flask",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  swiftui: "SwiftUI",
  "c++": "C++",
  cpp: "C++",
  "c#": "C#",
  csharp: "C#",
  php: "PHP",
  laravel: "Laravel",
  ruby: "Ruby",
  rails: "Rails",
  "ruby on rails": "Ruby on Rails",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  sql: "SQL",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  redis: "Redis",
  graphql: "GraphQL",
  api: "API",
  rest: "REST",
  "rest api": "REST API",
  grpc: "gRPC",
  oauth: "OAuth",
  jwt: "JWT",
  json: "JSON",
  yaml: "YAML",
  xml: "XML",
  ui: "UI",
  ux: "UX",
  "ui/ux": "UI/UX",
  ai: "AI",
  ml: "ML",
  git: "Git",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",
  vercel: "Vercel",
  netlify: "Netlify",
  supabase: "Supabase",
  firebase: "Firebase",
  figma: "Figma",
  webpack: "Webpack",
  vite: "Vite",
  babel: "Babel",
  eslint: "ESLint",
  jest: "Jest",
  vitest: "Vitest",
  cypress: "Cypress",
  redux: "Redux",
  zustand: "Zustand",
  npm: "npm",
  yarn: "Yarn",
  pnpm: "pnpm",
  "ci/cd": "CI/CD",
  cicd: "CI/CD",
  ios: "iOS",
  android: "Android",
};

/** Capitalizes a plain lowercase word; leaves anything with existing mixed
 * case untouched (the author likely cased it on purpose, e.g. "iOS"). */
function titleCaseFallback(word: string): string {
  if (!word || word !== word.toLowerCase()) return word;
  return word[0].toUpperCase() + word.slice(1);
}

/**
 * Normalizes raw skill/technology tags to consistent, proper casing (e.g.
 * "typescript" -> "TypeScript", "css" -> "CSS") regardless of how the AI
 * or the user typed them. Known tech terms are mapped via a canonical
 * lookup; anything unrecognized gets a light title-case fallback. Also
 * trims whitespace, drops empties, and de-duplicates case-insensitively.
 *
 * This is the single source of truth for skill casing - call it wherever
 * skills are written (AI generation, manual logs, draft edits) rather than
 * only formatting at display time.
 */
export function normalizeSkills(rawSkills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of rawSkills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    const canonical =
      CANONICAL_SKILLS[lower] ?? trimmed.split(" ").map(titleCaseFallback).join(" ");

    const dedupeKey = canonical.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(canonical);
  }

  return result;
}
