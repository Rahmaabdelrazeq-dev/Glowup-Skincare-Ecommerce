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
  const [revealed, setRevealed] = useState<number | null>(null);

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
            <p
              style={{ fontSize: "1rem", color: "#806c54", marginTop: "0.8em" }}
            >
              Tap on a card to reveal the truth behind common skincare myths
              from experts and science.
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
                      <span
                        className="tap-reveal"
                        style={{ cursor: "pointer" }}
                      >
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

          <div style={{ height: "3.5rem" }} />

          {/* Skincare Tips */}
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

        {/* Scoped CSS */}
        <style jsx>{`
          ...  << نفس الـ CSS بدون أي تغيير >>
        `}</style>
      </main>
    </>
  );
};

export default BlogPage;
