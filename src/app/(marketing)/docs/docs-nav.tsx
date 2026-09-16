"use client";

interface DocSection {
  id: string;
  title: string;
}

export function DocsMobileNav({ sections }: { sections: DocSection[] }) {
  return (
    <label className="flex flex-col gap-1 text-sm md:hidden">
      <span className="text-muted">Jump to section</span>
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) window.location.hash = e.target.value;
        }}
        className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-foreground"
      >
        <option value="" disabled>
          Choose a section
        </option>
        {sections.map((section) => (
          <option key={section.id} value={section.id}>
            {section.title}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DocsSidebar({ sections }: { sections: DocSection[] }) {
  return (
    <nav className="sticky top-8 hidden flex-col gap-1 text-sm md:flex">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="rounded-md px-2 py-1.5 text-muted transition hover:bg-elevated hover:text-foreground"
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
