import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

function buildExtendedItems(items = [], cloneCount = 0) {
  if (!items.length) return [];

  if (items.length === 1) {
    return Array.from({ length: 5 }, (_, index) => ({
      ...items[0],
      _carouselKey: `single-${index}`,
    }));
  }

  const count = Math.min(cloneCount, items.length);
  const head = items.slice(-count).map((item, index) => ({
    ...item,
    _carouselKey: `head-${index}-${item.id}`,
  }));
  const body = items.map((item) => ({
    ...item,
    _carouselKey: `body-${item.id}`,
  }));
  const tail = items.slice(0, count).map((item, index) => ({
    ...item,
    _carouselKey: `tail-${index}-${item.id}`,
  }));

  return [...head, ...body, ...tail];
}

export function stripCarouselMeta(item = {}) {
  const { _carouselKey, ...source } = item;
  return source;
}

export function useInfiniteScrollCarousel(items = [], options = {}) {
  const { autoplayInterval = 5000, autoplayPaused = false } = options;

  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const strideRef = useRef(0);
  const cloneCountRef = useRef(0);
  const isAdjustingRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const isPausedRef = useRef(false);
  const pauseTimerRef = useRef(null);
  const dragStateRef = useRef({ active: false, moved: false });

  const cloneCount = useMemo(() => {
    if (items.length <= 1) return 1;
    return Math.min(3, items.length);
  }, [items.length]);

  const extendedItems = useMemo(
    () => buildExtendedItems(items, cloneCount),
    [items, cloneCount]
  );

  const measureAndReset = useCallback(() => {
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;

    if (!scrollEl || !trackEl || !items.length) return;

    const firstCard = trackEl.querySelector(".dashboard-news-card-wrap");
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(trackEl).gap || "18") || 18;
    const stride = cardWidth + gap;

    strideRef.current = stride;
    cloneCountRef.current = items.length === 1 ? 2 : cloneCount;

    isAdjustingRef.current = true;
    scrollEl.scrollLeft = cloneCountRef.current * stride;
    isAdjustingRef.current = false;
  }, [items.length, cloneCount]);

  useLayoutEffect(() => {
    measureAndReset();

    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!trackEl) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      measureAndReset();
    });

    resizeObserver.observe(trackEl);

    if (scrollEl) {
      resizeObserver.observe(scrollEl);
    }

    return () => resizeObserver.disconnect();
  }, [measureAndReset, extendedItems]);

  const normalizeScrollPosition = useCallback(() => {
    const scrollEl = scrollRef.current;
    const stride = strideRef.current;
    const clones = cloneCountRef.current;

    if (!scrollEl || !stride || !items.length || isAdjustingRef.current) {
      return;
    }

    const realWidth = items.length * stride;
    const startOffset = clones * stride;
    const { scrollLeft } = scrollEl;

    if (scrollLeft <= startOffset - stride * 0.5) {
      isAdjustingRef.current = true;
      scrollEl.scrollLeft = scrollLeft + realWidth;
      isAdjustingRef.current = false;
      return;
    }

    if (scrollLeft >= startOffset + realWidth - stride * 0.5) {
      isAdjustingRef.current = true;
      scrollEl.scrollLeft = scrollLeft - realWidth;
      isAdjustingRef.current = false;
    }
  }, [items.length]);

  const pauseAutoplay = useCallback((duration = autoplayInterval * 2) => {
    isPausedRef.current = true;

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
      pauseTimerRef.current = null;
    }, duration);
  }, [autoplayInterval]);

  const finishAutoScroll = useCallback(() => {
    isAutoScrollingRef.current = false;
    normalizeScrollPosition();
  }, [normalizeScrollPosition]);

  const advanceCarousel = useCallback(() => {
    const scrollEl = scrollRef.current;
    const stride = strideRef.current;

    if (
      !scrollEl ||
      !stride ||
      !items.length ||
      isPausedRef.current ||
      autoplayPaused ||
      dragStateRef.current.active ||
      isAutoScrollingRef.current
    ) {
      return;
    }

    isAutoScrollingRef.current = true;
    scrollEl.classList.add("is-auto-playing");

    scrollEl.scrollTo({
      left: scrollEl.scrollLeft + stride,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      if (!isAutoScrollingRef.current) return;
      scrollEl.classList.remove("is-auto-playing");
      finishAutoScroll();
    }, 700);
  }, [autoplayPaused, finishAutoScroll, items.length]);

  const handleScroll = useCallback(() => {
    if (isAdjustingRef.current) return;

    if (!isAutoScrollingRef.current) {
      normalizeScrollPosition();
    }
  }, [normalizeScrollPosition]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return undefined;

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      pauseAutoplay();
      scrollEl.scrollLeft += event.deltaY;
      normalizeScrollPosition();
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });

    const onScrollEnd = () => {
      if (!isAutoScrollingRef.current) return;
      scrollEl.classList.remove("is-auto-playing");
      finishAutoScroll();
    };

    scrollEl.addEventListener("scrollend", onScrollEnd);

    const onMouseEnter = () => {
      isPausedRef.current = true;
    };

    const onMouseLeave = () => {
      if (!dragStateRef.current.active) {
        isPausedRef.current = false;
      }
    };

    scrollEl.addEventListener("mouseenter", onMouseEnter);
    scrollEl.addEventListener("mouseleave", onMouseLeave);

    return () => {
      scrollEl.removeEventListener("wheel", onWheel);
      scrollEl.removeEventListener("scrollend", onScrollEnd);
      scrollEl.removeEventListener("mouseenter", onMouseEnter);
      scrollEl.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [
    normalizeScrollPosition,
    extendedItems,
    pauseAutoplay,
    finishAutoScroll,
  ]);

  useEffect(() => {
    if (!items.length || autoplayInterval <= 0) return undefined;

    const timerId = window.setInterval(advanceCarousel, autoplayInterval);

    return () => window.clearInterval(timerId);
  }, [advanceCarousel, autoplayInterval, items.length]);

  useEffect(() => {
    if (autoplayPaused) {
      isPausedRef.current = true;
      return undefined;
    }

    isPausedRef.current = false;
    return undefined;
  }, [autoplayPaused]);

  useEffect(
    () => () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    },
    []
  );

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0) return;

    const target = event.target;
    if (target.closest("button, a, input, textarea, select, label")) {
      return;
    }

    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    dragStateRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: scrollEl.scrollLeft,
    };

    pauseAutoplay();
    isAutoScrollingRef.current = false;

    scrollEl.setPointerCapture(event.pointerId);
    scrollEl.classList.add("is-dragging");
  }, [pauseAutoplay]);

  const handlePointerMove = useCallback((event) => {
    const scrollEl = scrollRef.current;
    const dragState = dragStateRef.current;

    if (!scrollEl || !dragState.active) return;

    const deltaX = event.clientX - dragState.startX;
    if (Math.abs(deltaX) > 4) {
      dragState.moved = true;
    }

    scrollEl.scrollLeft = dragState.startScrollLeft - deltaX;
  }, []);

  const handlePointerUp = useCallback(
    (event) => {
      const scrollEl = scrollRef.current;
      const dragState = dragStateRef.current;

      if (!scrollEl || !dragState.active) return;

      dragState.active = false;
      scrollEl.releasePointerCapture(event.pointerId);
      scrollEl.classList.remove("is-dragging");
      pauseAutoplay();
      normalizeScrollPosition();
    },
    [normalizeScrollPosition, pauseAutoplay]
  );

  const wasDragged = useCallback(() => dragStateRef.current.moved, []);

  return {
    scrollRef,
    trackRef,
    extendedItems,
    handleScroll,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    wasDragged,
  };
}
