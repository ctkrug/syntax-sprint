const REPO_URL = "https://github.com/ctkrug/syntax-sprint";
const PORTFOLIO_URL = "https://apps.charliekrug.com";

interface FaqEntry {
  question: string;
  answer: string;
}

const FAQ: FaqEntry[] = [
  {
    question: "Where do the code snippets come from?",
    answer:
      "Each run pulls a real source file from one of today's most-starred, recently-created GitHub repositories (the closest public proxy to the trending page). If GitHub is unreachable or rate-limited, a small set of hand-written snippets keeps the game playable offline.",
  },
  {
    question: "How does syntax-aware scoring work?",
    answer:
      "Before you type, the snippet is tokenized into brackets, indentation, strings, comments, and words. A wrong character inside a bracket or an indent counts as a structural mistake and flashes red on its line the instant you type it; every other slip is a plain typo. Your run summary keeps the two totals separate.",
  },
  {
    question: "Which languages does it support?",
    answer:
      "The scorer is structural, not grammar-specific, so TypeScript, Python, Go, Rust, Java, and most C-family languages all score correctly. The stat rail shows the language of the snippet you're currently typing.",
  },
  {
    question: "Does it work on a phone?",
    answer:
      "Yes. Tap the code card to bring up your keyboard, and the layout stacks the stats below the snippet on narrow screens. Touch targets are sized for thumbs.",
  },
  {
    question: "Is it free, and do I need an account?",
    answer:
      "It runs entirely in your browser with no login and no tracking, and it's open source under the MIT license. Read the code or fork it on GitHub.",
  },
];

/**
 * Below-the-fold about + FAQ + footer for the servable app: gives the page
 * real, useful copy under the game, a prominent link to the source, and the
 * portfolio cross-promotion. Styled with the same Swiss-grid tokens as the
 * app so page and product read as one brand.
 */
export function PageInfo() {
  return (
    <>
      <section className="page-info" aria-labelledby="about-heading">
        <div className="page-info-inner">
          <h2 id="about-heading" className="info-heading">
            What is Syntax Sprint?
          </h2>
          <p className="info-lead">
            Syntax Sprint is a typing game for developers. Instead of prose or a fixed
            word list, it drops you into a real source file from one of today's trending
            GitHub repositories and scores you the way code actually breaks: a mismatched
            bracket or a botched indent is a structural mistake, tracked apart from an
            ordinary typo. The content is never stale, because it's whatever the community
            is starring right now.
          </p>

          <h3 className="info-subheading">Questions</h3>
          <dl className="faq">
            {FAQ.map((entry) => (
              <div key={entry.question} className="faq-item">
                <dt className="faq-q">{entry.question}</dt>
                <dd className="faq-a">{entry.answer}</dd>
              </div>
            ))}
          </dl>

          <a className="info-cta" href={REPO_URL} target="_blank" rel="noreferrer">
            View the source on GitHub
          </a>
        </div>
      </section>

      <footer className="page-footer">
        <span>Syntax Sprint · MIT licensed</span>
        <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
          More by Charlie Krug → apps.charliekrug.com
        </a>
      </footer>
    </>
  );
}
