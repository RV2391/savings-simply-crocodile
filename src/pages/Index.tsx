import { CostCalculator } from "@/components/CostCalculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100">
      <div className="container py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-sage-800 sm:text-5xl">
            Kostenrechner für Fortbildungen
          </h1>
          <p className="mt-4 text-lg text-sage-600">
            Berechnen Sie Ihr Einsparpotenzial durch digitale Fortbildungen
          </p>
        </div>
        <CostCalculator />
      </div>
    </div>
  );
};

export default Index;