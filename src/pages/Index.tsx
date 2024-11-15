import { CostCalculator } from "@/components/CostCalculator";
import { PopularContent } from "@/components/PopularContent";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { Partners } from "@/components/Partners";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="container py-12 space-y-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Kostenrechner für Fortbildungen
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Berechnen Sie Ihr Einsparpotenzial durch digitale Fortbildungen
          </p>
        </div>
        
        <CostCalculator />
        
        <section>
          <h2 className="text-2xl font-semibold mb-6">Zurzeit beliebt</h2>
          <p className="text-gray-400 text-sm mb-6">Diese Inhalte werden gerade besonders oft geschaut.</p>
          <PopularContent />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Associates</h2>
          <p className="text-gray-400 text-sm mb-6">Angedockt in unserer Bucht</p>
          <Partners />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Die nächsten Online-Veranstaltungen</h2>
          <p className="text-gray-400 text-sm mb-6">Veranstaltungen nach Datum sortiert.</p>
          <UpcomingEvents />
        </section>
      </div>
    </div>
  );
};

export default Index;