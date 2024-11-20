import { CostCalculator } from "@/components/CostCalculator";

const Embed = () => {
  // Remove any padding/margins when in embed mode
  return (
    <div className="embed-container">
      <CostCalculator />
    </div>
  );
};

export default Embed;