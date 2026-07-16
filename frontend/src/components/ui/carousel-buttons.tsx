"use client";

import { useCallback, useEffect, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";

type UseCarouselButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const useCarouselButtons = (
  emblaApi: EmblaCarouselType | undefined,
): UseCarouselButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const updateButtonStates = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtonStates(emblaApi);

    emblaApi
      .on("select", updateButtonStates)
      .on("reInit", updateButtonStates)
      .on("init", updateButtonStates);

    return () => {
      emblaApi
        .off("select", updateButtonStates)
        .off("reInit", updateButtonStates)
        .off("init", updateButtonStates);
    };
  }, [emblaApi, updateButtonStates]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};
