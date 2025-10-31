import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store"

import About from "../../components/Aboutcomponent/Aboutcomponent";
import Categories from "../../components/Categories/Categories";
import TextSec from "../../components/TextSection/TextSection";
import Gallery from "../../components/Gallery/Gallery";
import CarouselSection from "../../components/CarouselSection/CarouselSection";
import ProductBlockSection from "../../components/ProductBlockSection/ProductBlockSection";
import SupremeSkinFortification from "../../components/productComponents/SupremeSkinFortification";
import {Helmet} from "react-helmet-async";
import ContactUs from "../../components/ContactUs/ContactUs";
export default function HomePage() {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <>
    <Helmet>
      <meta charSet="utf-8" />
      <title> Home </title>

    </Helmet>
      {token && console.log("User token:", token)}
      <CarouselSection />
      <ProductBlockSection />
      <Categories />
      <About />
      <SupremeSkinFortification />
      <TextSec />
      <Gallery />
      <ContactUs/>
    </>
  );
}
