import { Link } from "react-router-dom";

const SKILL_TAGS = [
  ["React", "sun"],
  ["Node.js", ""],
  ["MongoDB", "pink"],
  ["Python", ""],
  ["Figma", ""],
  ["تصميم", "ar"],
  ["Tailwind", "sun"],
  ["Docker", ""],
  ["English / C1", "pink"],
  ["عربي / أم", "ar"],
  ["Git", ""],
  ["+ 14 more", "sun"],
];
const MATCH_CARDS = [
  {
    t: "Junior Frontend Engineer",
    co: "Instabug · Heliopolis",
    pct: "94%",
    dark: false,
    style: { top: 0, left: 8 },
    rot: -3,
  },
  {
    t: "Product Design Intern",
    co: "Swvl · Remote",
    pct: "89%",
    dark: false,
    style: { top: 50, right: 8 },
    rot: 2,
  },
  {
    t: "Software Engineer · L1",
    co: "Paymob · New Cairo",
    pct: "87%",
    dark: true,
    style: { top: 100, left: 24 },
    rot: -1,
  },
];
const LOG_LINES = [
  { c: "#7fc97f", t: "▶ profile.extract_skills()" },
  {
    c: "#E5A93A",
    t: "  ↳ 18 skills extracted · ",
    extra: "+3 strong",
    ec: "#EE5688",
  },
  { c: "#7fc97f", t: "▶ jobs.recommended(top=5)" },
  { c: "#E5A93A", t: "  ↳ matched 5 of 412 listings" },
  { c: "#7fc97f", t: "▶ application.send(job_id=#0241)" },
  { c: "#ffffff", t: "  ✓ delivered to Instabug · seen 2m ago" },
  { c: "#7fc97f", t: "▶ recruiter.reply()" },
  { c: "#EE5688", t: '  ↳ "let\'s chat thursday"', cursor: true },
];
const STATS = [
  { n: "412", ar: "٤١٢", label: "Open roles · this week", arLabel: "وظيفة" },
  { n: "38", color: "#EE5688", label: "Verified Egyptian companies" },
  { n: "127", color: "#E5A93A", label: "Placements this semester" },
  { n: "94", pct: true, color: "#E96A3A", label: "Of applicants get a reply" },
];

export default function ManifestoHow() {
  return (
    <>
      {/* ══════════ MANIFESTO ══════════ */}
      <section
        id="manifesto"
        className="max-w-[1360px] mx-auto px-10 py-[120px]"
      >
        <div className="flex items-baseline justify-between mb-12 gap-6 flex-wrap">
          <div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">
              / 01 — Manifesto ·{" "}
              <span className="font-['Cairo'] font-bold" dir="rtl">
                البيان
              </span>
            </span>
            <h2 className="font-['Space_Grotesk'] font-bold text-[64px] tracking-[-0.03em] leading-none text-[#161310] m-0 max-w-[14ch]">
              The career platform Egypt didn't have. So we built it.
            </h2>
          </div>
          <span
            dir="rtl"
            className="font-['Cairo'] font-black text-[48px] text-[#2F4A2E] leading-none self-end"
          >
            لمّا مفيش، نعمل.
          </span>
        </div>

        <div className="bg-[#2F4A2E] text-[#F1EAD9] rounded-[48px] py-20 px-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-[360px] h-[360px] rounded-full bg-[#E5A93A] opacity-15 pointer-events-none" />
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.16em] opacity-70">
            From the founders
          </span>
          <h2
            className="font-['Space_Grotesk'] font-bold leading-none tracking-[-0.035em] text-[#F1EAD9] mt-4 mb-0"
            style={{ fontSize: "clamp(56px,6vw,96px)" }}
          >
            We were tired of <em className="not-italic font-medium">posting</em>{" "}
            CVs
            <br />
            into <span className="text-[#E5A93A]">silence.</span> So we made
            <br />
            something that <span className="text-[#EE5688]">answers</span> back.
          </h2>
          <div
            dir="rtl"
            className="font-['Cairo'] font-black text-[72px] leading-[1.1] mt-6"
          >
            شغل لينا، <span className="text-[#E5A93A]">من غير واسطة.</span>
          </div>

          <div className="grid grid-cols-[1.4fr_1fr] gap-12 items-end mt-16">
            <div>
              <p className="text-[19px] leading-[1.55] max-w-[48ch] mb-4 opacity-90">
                GIU Nexus was built in a dorm room in New Cairo by ten students
                who were sick of refreshing job boards designed for someone
                else's economy, in someone else's language, asking for five
                years of experience to fetch coffee.
              </p>
              <p className="text-[19px] leading-[1.55] max-w-[48ch] opacity-90">
                We made a platform that reads your skills instead of your
                network. That matches you to recruiters who actually want to
                hire from your campus. That puts Arabic on the page not as
                decoration — but because that's how we talk.
              </p>
              <div className="flex items-center gap-3.5 mt-6">
                <div className="w-12 h-12 rounded-full bg-[#E5A93A] flex items-center justify-center font-['Cairo'] font-black text-[#161310] text-lg flex-shrink-0">
                  م
                </div>
                <div>
                  <strong className="block font-semibold text-sm">
                    Mostafa Abuelabbas
                  </strong>
                  <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.05em] opacity-70">
                    Team Lead · GIU CS '26
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#F1EAD9] text-[#161310] rounded-[32px] p-7">
              <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.12em] text-[#3B342B]">
                // the count so far
              </span>
              <div className="font-['Space_Grotesk'] font-bold text-[84px] leading-[0.9] tracking-[-0.03em] mt-1.5">
                2,400+
                <span
                  dir="rtl"
                  className="font-['Cairo'] font-black text-[64px] text-[#2F4A2E] block mt-1.5"
                >
                  طالب
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#16131015]">
                <span className="text-sm text-[#3B342B]">
                  students on the platform · semester 1
                </span>
                <span className="w-9 h-9 rounded-full bg-[#161310] text-[#F1EAD9] flex items-center justify-center">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="max-w-[1360px] mx-auto px-10 pb-[120px] scroll-mt-[120px]">
        <div className="flex items-baseline justify-between mb-12 gap-6 flex-wrap">
          <div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">
              / 02 — How it works ·{" "}
              <span className="font-['Cairo'] font-bold" dir="rtl">
                إزّاي بتشتغل
              </span>
            </span>
            <h2 className="font-['Space_Grotesk'] font-bold text-[64px] tracking-[-0.03em] leading-none text-[#161310] m-0">
              Three steps. No cover letters required.
            </h2>
          </div>
          <span
            dir="rtl"
            className="font-['Cairo'] font-black text-[48px] text-[#2F4A2E] leading-none self-end"
          >
            ٣ خطوات. خلاص.
          </span>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Step 1 — ochre */}
          <article className="bg-[#E5A93A] rounded-[36px] p-8 min-h-[420px] flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <span className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.14em] opacity-70">
                Step 01
              </span>
              <h3 className="font-['Space_Grotesk'] font-bold text-[38px] leading-none tracking-[-0.02em] mt-3.5 mb-0">
                Drop your CV.
                <br />
                We do the reading.
              </h3>
              <div
                dir="rtl"
                className="font-['Cairo'] font-black text-[28px] mt-2.5 opacity-85"
              >
                حطّ سيرتك. إحنا نقرأها.
              </div>
              <p className="text-[15px] leading-[1.5] mt-4 max-w-[34ch] opacity-85">
                Our model extracts your real skills — frameworks, languages,
                side projects — and turns them into a profile recruiters can
                search.
              </p>
            </div>
            <div className="mt-6 h-[170px]">
              <div className="bg-[#161310] rounded-[24px] p-3.5 h-full flex flex-wrap gap-2 content-start overflow-hidden">
                {SKILL_TAGS.map(([tag, v], i) => (
                  <span
                    key={i}
                    className={`font-['JetBrains_Mono'] text-xs px-2.5 py-1.5 rounded-full ${v === "sun" ? "bg-[#E96A3A] text-white" : v === "pink" ? "bg-[#EE5688] text-white" : v === "ar" ? 'bg-white text-[#161310] font-["Cairo"] font-bold' : "bg-white/10 text-white"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Step 2 — pink */}
          <article className="bg-[#EE5688] text-white rounded-[36px] p-8 min-h-[420px] flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <span className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.14em] opacity-70">
                Step 02
              </span>
              <h3 className="font-['Space_Grotesk'] font-bold text-[38px] leading-none tracking-[-0.02em] mt-3.5 mb-0">
                We match you to roles, not the other way around.
              </h3>
              <div
                dir="rtl"
                className="font-['Cairo'] font-black text-[28px] mt-2.5 opacity-85"
              >
                إحنا نلاقيلك الشغل، مش العكس.
              </div>
              <p className="text-[15px] leading-[1.5] mt-4 max-w-[34ch] opacity-85">
                Every morning, fresh listings ranked by how well your profile
                actually fits.
              </p>
            </div>
            <div className="mt-6 h-[170px] relative">
              {MATCH_CARDS.map((c, i) => (
                <div
                  key={i}
                  className="absolute w-[78%] rounded-[18px] p-3.5 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.33)]"
                  style={{
                    ...c.style,
                    transform: `rotate(${c.rot}deg)`,
                    background: c.dark ? "#161310" : "white",
                    color: c.dark ? "white" : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2F4A2E] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-['Space_Grotesk'] font-semibold text-[14px] leading-tight truncate"
                        style={{ color: c.dark ? "white" : "#161310" }}
                      >
                        {c.t}
                      </div>
                      <div
                        className="font-['JetBrains_Mono'] text-[11px] mt-0.5 truncate"
                        style={{
                          color: c.dark ? "rgba(255,255,255,0.5)" : "#3B342B",
                        }}
                      >
                        {c.co}
                      </div>
                    </div>
                    <span
                      className="font-['JetBrains_Mono'] text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: c.dark ? "#E96A3A" : "#E5A93A",
                        color: c.dark ? "white" : "#161310",
                      }}
                    >
                      {c.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Step 3 — dark */}
          <article className="bg-[#161310] text-[#F1EAD9] rounded-[36px] p-8 min-h-[420px] flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <span className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.14em] opacity-70">
                Step 03
              </span>
              <h3 className="font-['Space_Grotesk'] font-bold text-[38px] leading-none tracking-[-0.02em] mt-3.5 mb-0">
                One‑click apply. Real human reads it.
              </h3>
              <div
                dir="rtl"
                className="font-['Cairo'] font-black text-[28px] mt-2.5 opacity-85"
              >
                دوسة واحدة. ولد آدمي بيقرأ.
              </div>
              <p className="text-[15px] leading-[1.5] mt-4 max-w-[34ch] opacity-85">
                Every employer on Nexus is approved and committed to responding.
                No ghost listings.
              </p>
            </div>
            <div className="mt-6 h-[170px]">
              <div className="bg-[#0e0c0a] rounded-[20px] p-4 h-full font-['JetBrains_Mono'] text-[11px] leading-[1.7] overflow-hidden border border-white/10 text-[#bca78d]">
                {LOG_LINES.map((l, i) => (
                  <span key={i} className="block">
                    <span style={{ color: l.c }}>{l.t}</span>
                    {l.extra && <span style={{ color: l.ec }}>{l.extra}</span>}
                    {l.cursor && (
                      <span className="inline-block w-1.5 h-3 bg-white align-middle animate-cursor-blink" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* Stats */}
        <div className="bg-[#161310] text-[#F1EAD9] rounded-[48px] p-14 grid grid-cols-4 gap-6 items-end mt-10">
          {STATS.map((s, i) => (
            <div key={i}>
              <div
                className="font-['Space_Grotesk'] font-bold text-[96px] leading-[0.9] tracking-[-0.04em]"
                style={{ color: s.color || "#F1EAD9" }}
              >
                {s.n}
                {s.pct && <span className="text-[48px]">%</span>}
                {s.ar && (
                  <span
                    dir="rtl"
                    className="font-['Cairo'] font-black text-[64px] text-[#E5A93A] inline-block ml-1.5 -translate-y-3"
                  >
                    {s.ar}
                  </span>
                )}
              </div>
              <span className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.12em] text-white/60 mt-3.5 block">
                {s.label}
                {s.arLabel && (
                  <span
                    dir="rtl"
                    className="font-['Cairo'] font-bold text-white normal-case tracking-normal ml-2 text-sm"
                  >
                    {s.arLabel}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
