import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

import "./BounceCards.css";

export default function BounceCards({
  className = "",
  cards = [],
  images = [],
  fallbackImage = "",
  containerWidth = "100%",
  containerHeight = 300,
  animationDelay = 0.35,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.7)",
  transformStyles = [],
  enableHover = true,
  imageAltPrefix = "showcase",
}) {
  const containerRef = useRef(null);

  const resolvedWidth =
    typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth;
  const resolvedHeight =
    typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight;

  const normalizedCards = useMemo(() => {
    if (cards.length) {
      return cards
        .filter(Boolean)
        .slice(0, 5)
        .map((card, index) => ({
          id: card.id ?? `${card.title ?? "card"}-${index}`,
          title: card.title ?? "",
          subtitle: card.subtitle ?? "",
          description: card.description ?? "",
          badge: card.badge ?? "",
          href: card.href ?? "",
          cta: card.cta ?? "Open",
          imageUrl: card.imageUrl ?? "",
        }));
    }

    if (!images.length && fallbackImage) {
      return [
        {
          id: "fallback-card",
          title: "",
          subtitle: "",
          description: "",
          badge: "",
          href: "",
          cta: "Open",
          imageUrl: fallbackImage,
        },
      ];
    }

    return images
      .map((src, index) => ({
        id: `image-card-${index}`,
        title: `${imageAltPrefix} ${index + 1}`,
        subtitle: "",
        description: "",
        badge: "",
        href: "",
        cta: "Open",
        imageUrl: src || fallbackImage,
      }))
      .filter((card) => Boolean(card.imageUrl));
  }, [cards, images, fallbackImage, imageAltPrefix]);

  const fallbackTransforms = useMemo(() => {
    const count = normalizedCards.length;
    if (count === 0) {
      return [];
    }

    if (count === 1) {
      return ["rotate(0deg) translate(0px)"];
    }

    const center = (count - 1) / 2;
    const maxOffset = 170;

    return normalizedCards.map((_, index) => {
      const relative = index - center;
      const spread = center === 0 ? 0 : relative / center;
      const offset = Math.round(spread * maxOffset);
      const rotation = Math.round(spread * 8);
      return `rotate(${rotation}deg) translate(${offset}px)`;
    });
  }, [normalizedCards]);

  const baseTransforms = useMemo(() => {
    return normalizedCards.map(
      (_, index) => transformStyles[index] || fallbackTransforms[index] || "none"
    );
  }, [normalizedCards, transformStyles, fallbackTransforms]);

  useEffect(() => {
    if (!containerRef.current || normalizedCards.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".kp-bounce-card",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
          duration: 0.7,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [normalizedCards.length, animationStagger, easeType, animationDelay]);

  const getNoRotationTransform = (transformStr) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
    }

    if (transformStr === "none") {
      return "rotate(0deg)";
    }

    return `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);

    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    }

    if (baseTransform === "none") {
      return `translate(${offsetX}px)`;
    }

    return `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx) => {
    if (!enableHover || !containerRef.current) {
      return;
    }

    const q = gsap.utils.selector(containerRef);

    normalizedCards.forEach((_, index) => {
      const target = q(`.kp-bounce-card-${index}`);
      gsap.killTweensOf(target);

      const baseTransform = baseTransforms[index] || "none";

      if (index === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto",
        });
        return;
      }

      const offsetX = index < hoveredIdx ? -150 : 150;
      const pushedTransform = getPushedTransform(baseTransform, offsetX);
      const distance = Math.abs(hoveredIdx - index);

      gsap.to(target, {
        transform: pushedTransform,
        duration: 0.4,
        ease: "back.out(1.4)",
        delay: distance * 0.04,
        overwrite: "auto",
      });
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) {
      return;
    }

    const q = gsap.utils.selector(containerRef);

    normalizedCards.forEach((_, index) => {
      const target = q(`.kp-bounce-card-${index}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: baseTransforms[index] || "none",
        duration: 0.38,
        ease: "back.out(1.4)",
        overwrite: "auto",
      });
    });
  };

  return (
    <div
      className={`kp-bounceCardsContainer ${className}`}
      ref={containerRef}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
      }}
    >
      {normalizedCards.map((card, index) => (
        <div
          key={`${card.id}-${index}`}
          className={`kp-bounce-card kp-bounce-card-${index}`}
          onMouseEnter={() => pushSiblings(index)}
          onMouseLeave={resetSiblings}
          style={{
            transform: baseTransforms[index] || "none",
            zIndex: index + 1,
          }}
        >
          {card.href ? (
            <a
              className="kp-bounce-card-link"
              href={card.href}
              rel={card.href.startsWith("http") ? "noreferrer" : undefined}
              target={card.href.startsWith("http") ? "_blank" : undefined}
            >
              {card.imageUrl ? (
                <div className="kp-bounce-cover">
                  <img
                    alt={`${card.title || imageAltPrefix}-${index + 1}`}
                    className="kp-bounce-image"
                    loading="lazy"
                    onError={(event) => {
                      if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                        event.currentTarget.src = fallbackImage;
                      } else {
                        event.currentTarget.style.display = "none";
                      }
                    }}
                    src={card.imageUrl}
                  />
                </div>
              ) : null}
              <div className={`kp-bounce-content ${card.imageUrl ? "" : "kp-bounce-content--full"}`}>
                {card.badge ? <p className="kp-bounce-badge">{card.badge}</p> : null}
                <p className="kp-bounce-title">{card.title || `${imageAltPrefix} ${index + 1}`}</p>
                {card.subtitle ? <p className="kp-bounce-subtitle">{card.subtitle}</p> : null}
                {card.description ? <p className="kp-bounce-description">{card.description}</p> : null}
                <span className="kp-bounce-cta">{card.cta || "Open"}</span>
              </div>
            </a>
          ) : (
            <div className="kp-bounce-card-link">
              {card.imageUrl ? (
                <div className="kp-bounce-cover">
                  <img
                    alt={`${card.title || imageAltPrefix}-${index + 1}`}
                    className="kp-bounce-image"
                    loading="lazy"
                    onError={(event) => {
                      if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                        event.currentTarget.src = fallbackImage;
                      } else {
                        event.currentTarget.style.display = "none";
                      }
                    }}
                    src={card.imageUrl}
                  />
                </div>
              ) : null}
              <div className={`kp-bounce-content ${card.imageUrl ? "" : "kp-bounce-content--full"}`}>
                {card.badge ? <p className="kp-bounce-badge">{card.badge}</p> : null}
                <p className="kp-bounce-title">{card.title || `${imageAltPrefix} ${index + 1}`}</p>
                {card.subtitle ? <p className="kp-bounce-subtitle">{card.subtitle}</p> : null}
                {card.description ? <p className="kp-bounce-description">{card.description}</p> : null}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
