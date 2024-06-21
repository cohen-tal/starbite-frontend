import React, { useEffect, useRef, useState } from "react";
import CategoriesMenuItem from "./menu-items/CategoriesMenuItem";
import CategoriesFilterButton from "../buttons/CategoriesFilterButton";
import SliderNextPrevButton from "../buttons/SliderNextPrevButton";
import { useMotionValueEvent, useScroll } from "framer-motion";

const foodCategories = [
  "Pizza",
  "Hamburger",
  "Ice Cream",
  "Sushi",
  "Pasta",
  "Salad",
  "Tacos",
  "Steak",
  "Sandwiches",
  "Seafood",
  "Barbecue",
  "Curry",
  "Dim Sum",
  "Soup",
  "Burritos",
  "Desserts",
  "Breakfast",
  "Vegan",
  "Indian",
  "Chinese",
];

export default function RestaurantCategoriesMenu() {
  const [state, setState] = useState(false);
  const container = useRef(null);
  const scroll = useScroll({
    container: container,
  });

  useMotionValueEvent(scroll.scrollXProgress, "change", () => {
    if (scroll.scrollXProgress.get() >= 0.5) {
      setState(true);
    }
  });

  return (
    <div className="flex justify-start items-center pl-6 pr-6 md:pl-16 md:pr-16 pt-4 pb-4 gap-4 w-full">
      <div className="relative overflow-hidden w-full">
        {state && <SliderNextPrevButton direction={"prev"} />}
        <div
          ref={container}
          className="min-h-18 max-h-20 overflow-x-auto scrollbar-hidden"
        >
          <div className="grid grid-flow-col auto-cols-[calc(100%/5)] md:auto-cols-[calc(100%/12)] gap-4">
            {foodCategories.map((category, index) => (
              <CategoriesMenuItem
                key={category + index}
                name={category}
                src="https://img.icons8.com/ios/100/pizza.png"
                alt="pizza"
                width="28"
                height="28"
              />
            ))}
          </div>
        </div>
        <SliderNextPrevButton direction={"next"} />
      </div>
      <CategoriesFilterButton />
    </div>
  );
}