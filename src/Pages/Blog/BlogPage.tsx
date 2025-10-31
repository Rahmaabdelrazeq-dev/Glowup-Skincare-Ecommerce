import React, { useState } from "react";
import { Helmet } from "react-helmet-async";

const MYTHS = [
  {
    myth: "Oily skin shouldn't use moisturizer.",
    truth:
      "Oily skin still needs hydration; skipping moisturizer makes your skin produce even more oil.",
    tip: "Choose lightweight, oil-free gel moisturizers.",
    learnMoreLink:
      "https://www.aad.org/public/everyday-care/skin-care-basics/dry/oily-skin",
  },
  {
    myth: "Natural skincare is always safer.",
    truth:
      "Many natural ingredients can be irritating, and not all synthetics are harmful. Science matters most.",
    tip: "Read labels and patch test—even with plant-based products.",
    learnMoreLink:
      "https://health.clevelandclinic.org/truth-about-natural-skin-care-products/",
  },
  {
    myth: "A tingling sensation means it’s working.",
    truth:
      "Tingling usually means irritation! Gentle formulas can be just as effective.",
    tip: "Listen to your skin: comfort is key.",
    learnMoreLink:
      "https://www.allure.com/story/skin-tingling-sensation-skincare-products",
  },
];

const TIPS = [
  {
    title: "Double Cleanse for Better Skin",
    description:
      "Use an oil-based cleanser first, then a water-based cleanser to deeply cleanse without stripping your skin.",
  },
  {
    title: "Wear Sunscreen Daily",
    description:
      "Protect your skin from UV damage to prevent premature aging and skin cancer.",
  },
  {
    title: "Include Hydrating Toners",
    description:
      "Use toners with hydrating ingredients to balance skin after cleansing.",
  },
];

const BlogPage = () => {
  const [revealed, setRevealed] = useState(null);

  return (
    <>
    <Helmet>
              <meta charSet="utf-8" />
          <title> Blog </title>
    </Helmet>
    <main className="blog-page py-4 py-md-5">
      <div className="container">
        {/* Myth Buster Gallery */}
        <section className="text-center mb-5 pb-2">
          <h1
            className="fw-semibold display-6"
            style={{
              letterSpacing: "0.02em",
              color: "#7c6f63",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Ask & Reveal: Skincare Myth-Busters
          </h1>
          <p style={{ fontSize: "1rem", color: "#806c54", marginTop: "0.8em" }}>
            Tap on a card to reveal the truth behind common skincare myths from
            experts and science.
          </p>
          <div className="myth-grid mt-4">
            {MYTHS.map((item, idx) => (
              <div
                className={`myth-card ${revealed === idx ? "revealed" : ""}`}
                key={idx}
                tabIndex={0}
                role="button"
                aria-pressed={revealed === idx}
                onClick={() => setRevealed(revealed === idx ? null : idx)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  setRevealed(revealed === idx ? null : idx)
                }
              >
                {revealed !== idx ? (
                  <div className="front">
                    <span className="label-myth">MYTH</span>
                    <div className="myth-text">{item.myth}</div>
                    <span className="tap-reveal" style={{ cursor: "pointer" }}>
                      Tap to reveal
                    </span>
                  </div>
                ) : (
                  <div className="back">
                    <span className="label-truth">TRUTH</span>
                    <div className="truth-text">{item.truth}</div>
                    {item.tip && <div className="tip">{item.tip}</div>}
                    {item.learnMoreLink && (
                      <a
                        href={item.learnMoreLink}
                        className="learn-more"
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={-1}
                      >
                        Learn more
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Spacing between sections */}
        <div style={{ height: "3.5rem" }} />

        {/* Skincare Tips & Tricks Section */}
        <section className="tips-section mb-5 px-3 px-md-0">
          <h2
            className="section-title text-center mb-4"
            style={{
              color: "#7c6f63",
              fontFamily: "'Montserrat', serif",
              fontWeight: "600",
              letterSpacing: "0.01em",
              fontSize: "1.5rem",
            }}
          >
            Skincare Tips & Tricks
          </h2>
          <div className="tips-grid">
            {TIPS.slice(0, 3).map(({ title, description }, index) => (
              <div key={index} className="tip-card p-4 rounded-4 shadow-sm">
                <h3
                  className="tip-title mb-2"
                  style={{
                    color: "#6d5e4f",
                    fontWeight: "700",
                    fontSize: "1.25rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  className="tip-description"
                  style={{ color: "#8a7d6e", fontSize: "1rem" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        :root {
          --color-primary: #7c6f63;
          --color-muted: #806c54;
          --color-bg: #f6f4ed;
          --color-card-bg: #fdfbf7;
          --color-tip-title: #6d5e4f;
          --color-tip-description: #8a7d6e;
        }

        .blog-page {
          background: linear-gradient(
            120deg,
            var(--color-bg) 75%,
            #e9e3da 100%
          );
          min-height: 100vh;
        }
        .myth-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2.2rem;
          margin-top: 2rem;
        }
        .myth-card {
          background: var(--color-card-bg);
          border-radius: 1.7rem;
          min-height: 180px;
          box-shadow: 0 2px 16px 0 rgba(120, 110, 95, 0.12);
          padding: 2.1rem 1.3rem 1.6rem;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.21s;
          position: relative;
          outline: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .myth-card:hover,
        .myth-card:focus {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 32px 0 rgba(120, 110, 95, 0.15);
        }
        .label-myth,
        .label-truth {
          font-family: "Montserrat", sans-serif;
          letter-spacing: 0.08em;
          font-weight: 700;
          font-size: 0.92rem;
          margin-bottom: 0.5em;
        }
        .label-myth {
          color: #ba9880;
        }
        .label-truth {
          color: #6db687;
        }
        .myth-text {
          color: var(--color-primary);
          font-size: 1.15rem;
          font-weight: 600;
          min-height: 54px;
          margin-bottom: 0.6em;
        }
        .truth-text {
          color: #4b5b56;
          font-size: 1.08rem;
          font-weight: 500;
          margin-bottom: 0.64em;
        }
        .tap-reveal {
          color: #b89b7d;
          font-size: 0.95rem;
          margin-top: 1.2em;
          display: block;
        }
        .tip {
          font-size: 0.98rem;
          color: #977b5b;
          background: #f7eee5;
          border-radius: 0.9rem;
          padding: 0.66em 0.97em;
          margin-bottom: 0.5em;
          display: inline-block;
        }
        .learn-more {
          color: #6c675f;
          text-decoration: underline;
          font-size: 0.95rem;
          margin-top: 0.2em;
          display: block;
        }
        .tips-section {
          max-width: 1100px;
          margin-left: auto;
          margin-right: auto;
        }
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
        }
        .tip-card {
          background: white;
          border-radius: 1.8rem;
          box-shadow: 0 3px 12px rgba(156, 141, 127, 0.16);
          padding: 2rem;
          transition: box-shadow 0.3s ease;
          cursor: default;
        }
        .tip-card:hover {
          box-shadow: 0 10px 36px rgba(156, 141, 127, 0.27);
        }
        .tip-title {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }
        .tip-description {
          font-weight: 400;
          color: var(--color-tip-description);
          font-size: 1rem;
        }
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--color-primary);
        }
        @media (max-width: 650px) {
          .myth-grid {
            gap: 1.2rem;
          }
          .myth-card {
            padding: 1.3rem 0.7rem;
          }
          .tips-grid {
            gap: 1.5rem;
          }
        }
      `}</style>
    </main>
    </>
  );
};

export default BlogPage;
