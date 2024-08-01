"use client";
import RestaurantCard from "../components/cards/RestaurantCard";
import { useSession } from "next-auth/react";
import RestaurantCategoriesMenu from "../components/menus/RestaurantCategoriesMenu";
import { useEffect, useRef, useState } from "react";
import fetchAPI from "@/utils/fetchUtil";
import { RestaurantCardType } from "../../../d";
import { PiTimerBold } from "react-icons/pi";
import FilterByRatingButtonGroup from "../components/buttons/FilterByRatingButtonGroup";
import SortReviewsButton from "../components/buttons/SortReviewsButton";
import FilterMenu from "../components/menus/FilterMenu";
import FilterMenuSection from "../components/menus/menu-sections/FilterMenuSection";
import FilterByDistanceButtonGroup from "../components/buttons/FilterByDistanceButtonGroup";
import { Skeleton } from "@mui/material";
import RestaurantCardSkeleton from "../components/loading/RestaurantCardSkeleton";
import Lottie from "react-lottie";
import thinkingAnimation from "../../../public/lottie/thinking-animation.json";

function SkeletonCard(): JSX.Element {
  return (
    <Skeleton>
      <RestaurantCard
        id="asdsad"
        address="adress"
        categories={new Array(4).fill("pasta")}
        images={["/logo.png"]}
        name="name"
        rating={5}
      />
    </Skeleton>
  );
}

export default function RestaurantsPage() {
  const [restaurantCards, setRestaurantCards] = useState<
    RestaurantCardType[] | null
  >([]);
  const [isFilterOpened, setIsFilterOpened] = useState(false);
  const [selected, setSelected] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const fetchedRestaurants = useRef<RestaurantCardType[] | null>(null);
  const session = useSession();

  useEffect(() => {
    fetchAPI<RestaurantCardType[]>("/restaurants").then((cards) => {
      setRestaurantCards([...cards]);
      fetchedRestaurants.current = cards;
    });
  }, []);

  function handleClick(value: string) {
    setSelected(value);
  }

  function handleCategoryClick(category: string) {
    const sortedByCategory = fetchedRestaurants.current?.filter((restaurant) =>
      restaurant.categories.includes(category)
    );
    setRestaurantCards(() => {
      return sortedByCategory && sortedByCategory.length > 0
        ? sortedByCategory
        : null;
    });
  }

  async function fetchRestaurantsInRadius(radius: number) {
    navigator.geolocation.getCurrentPosition(async (userPosition) => {
      const { latitude, longitude } = userPosition.coords;
      const filteredRestaurants = await fetchAPI<RestaurantCardType[]>(
        `/restaurants?loc=${longitude}&loc=${latitude}&radius=${radius}`
      );
      setRestaurantCards(filteredRestaurants ?? []);
    });
  }

  return (
    <div className="flex flex-col place-items-center p-2 gap-2 w-full">
      <RestaurantCategoriesMenu
        onCategoryClick={handleCategoryClick}
        onFilterButtonClick={() => {
          document.body.style.overflow = "hidden";
          setIsFilterOpened(true);
        }}
      />
      {restaurantCards ? (
        <div className="grid grid-flow-row place-items-center pl-2 pr-2 gap-8 md:grid-cols-3 md:pl-16 md:pr-16 w-full">
          {restaurantCards.length > 0 ? (
            restaurantCards.map((card) => (
              <RestaurantCard key={card.id} {...card} />
            ))
          ) : (
            <RestaurantCardSkeleton />
          )}
        </div>
      ) : (
        <Lottie
          options={{
            animationData: thinkingAnimation,
            autoplay: true,
            loop: true,
          }}
        />
      )}
      <FilterMenu
        open={isFilterOpened}
        onClickExit={() => {
          document.body.style.overflow = "auto";
          setIsFilterOpened(false);
        }}
      >
        <FilterMenuSection sectionTitle="Sort by">
          <div className="grid grid-cols-2 gap-3">
            <SortReviewsButton
              text="Newest First"
              selected={selected === "new"}
              onClick={(e) => {
                handleClick("new");
              }}
            >
              <PiTimerBold />
            </SortReviewsButton>
            <SortReviewsButton
              text="Oldest First"
              selected={selected === "old"}
              onClick={(e) => {
                handleClick("old");
              }}
            >
              <PiTimerBold />
            </SortReviewsButton>
          </div>
        </FilterMenuSection>
        <FilterMenuSection sectionTitle="Filter by rating">
          <FilterByRatingButtonGroup
            selected={ratingFilter}
            onClick={(value) => {
              setRatingFilter(value);
            }}
          />
        </FilterMenuSection>
        <FilterMenuSection sectionTitle="Filter by distance">
          <FilterByDistanceButtonGroup
            onButtonClick={fetchRestaurantsInRadius}
          />
        </FilterMenuSection>
      </FilterMenu>
    </div>
  );
}
