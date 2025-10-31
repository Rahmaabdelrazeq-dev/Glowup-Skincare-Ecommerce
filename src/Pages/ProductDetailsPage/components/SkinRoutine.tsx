import React from "react";
import "./productdetailstyle.css";
import shavingIcon from "../../../assets/images/icons8-shaving-50.png";
import skincareIcon from "../../../assets/images/icons8-skincare-64.png";
import creamIcon from "../../../assets/images/icons8-cream-bottle-64.png";
import { motion } from "framer-motion"; 

export default function SkinRoutine() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const plusVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 },
    },
  };

  return (
    <section
      style={{
        width: "100%",
        backgroundColor: "#E8E8DD",
        textAlign: "center",
        padding: "80px 0",
        overflow: "hidden",
      }}
    >
      <motion.h6
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        style={{ fontSize: "14px", color: "#4c4a4aff" }}
      >
        Skin Routine
      </motion.h6>

      <motion.h4
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        style={{ fontWeight: "400", paddingBottom: "20px" }}
      >
        Gentle Care For Delicate Skin
      </motion.h4>

      <motion.div
        className="routine-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="routine-card text-center" variants={cardVariants}>
          <div className="routine-number">01</div>
          <motion.img
            src={shavingIcon}
            alt="Cleansing"
            className="routine-icon"
            whileHover={{ scale: 1.1, rotate: 5 }}
          />
          <h6>Cleansing</h6>
        </motion.div>

        <motion.span className="plus" variants={plusVariants}>
          +
        </motion.span>

        <motion.div className="routine-card text-center" variants={cardVariants}>
          <div className="routine-number">02</div>
          <motion.img
            src={skincareIcon}
            alt="Toner"
            className="routine-icon"
            whileHover={{ scale: 1.1, rotate: -5 }}
          />
          <h6>Tone</h6>
        </motion.div>

        <motion.span className="plus" variants={plusVariants}>
          +
        </motion.span>

        <motion.div className="routine-card text-center" variants={cardVariants}>
          <div className="routine-number">03</div>
          <motion.img
            src={creamIcon}
            alt="Cream"
            className="routine-icon"
            whileHover={{ scale: 1.1 }}
          />
          <h6>Cream</h6>
        </motion.div>
      </motion.div>
    </section>
  );
}
