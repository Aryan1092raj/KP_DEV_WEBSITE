import VariableProximity from "./VariableProximity";
import { useProximityContainer } from "../../context/ProximityContext";

export default function VariableText({
  className = "",
  label,
  radius = 100,
  falloff = "gaussian",
  fromFontVariationSettings = "'wght' 400, 'opsz' 9",
  toFontVariationSettings = "'wght' 1000, 'opsz' 40",
  ...restProps
}) {
  const containerRef = useProximityContainer();

  if (!label) {
    return null;
  }

  return (
    <VariableProximity
      className={className}
      containerRef={containerRef}
      falloff={falloff}
      fromFontVariationSettings={fromFontVariationSettings}
      label={label}
      radius={radius}
      toFontVariationSettings={toFontVariationSettings}
      {...restProps}
    />
  );
}
