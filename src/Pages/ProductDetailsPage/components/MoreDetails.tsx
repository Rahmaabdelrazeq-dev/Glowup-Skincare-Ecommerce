import React from "react";

export default function MoreDetails() {
  const dividerStyle: React.CSSProperties = {
    border: "none",
    borderTop: "2px solid #000",
    width: "100%",
    margin: "5px 0",
  };

  return (
    <div className="py-2">
      <section className="d-flex flex-column">
        <h6 className="fw-semibold">Suited To</h6>
        <h6 className="text-muted">Combination Skin</h6>
      </section>

      <hr style={dividerStyle} />

      <section className="d-flex flex-column">
        <h6 className="fw-semibold">Skin Feel</h6>
        <h6 className="text-muted">Soothed, balanced, refreshed</h6>
      </section>

      <hr style={dividerStyle} />

      <section className="d-flex flex-column">
        <h6 className="fw-semibold">Key Ingredients</h6>
        <h6 className="text-muted pe-5">
          Snail Secretion Filtrate, Betaine, Butylene Glycol, 1,2-Hexanediol,
          Sodium Polyacrylate, Phenoxyethanol, Sodium Hyaluronate, Allantoin,
          Ethyl Hexanediol, Carbomer, Panthenol, Arginine
        </h6>
      </section>
            <hr style={dividerStyle} />

    </div>
  );
}
