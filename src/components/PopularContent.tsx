import { Card } from "@/components/ui/card";

const popularItems = [
  {
    id: 1,
    title: "Präparation von Keramik-Veneers",
    author: "PD Dr. M. Oliver Ahlers",
    company: "Komet",
    image: "/placeholder.svg",
    gradient: "from-blue-500/20 to-transparent",
  },
  {
    id: 2,
    title: "Abrechnung von endodontischen Leistungen",
    company: "BFS health finance",
    image: "/placeholder.svg",
    gradient: "from-blue-400/20 to-transparent",
  },
  // Add more items as needed
];

export const PopularContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {popularItems.map((item) => (
        <Card
          key={item.id}
          className={`relative overflow-hidden bg-gradient-to-br ${item.gradient} hover:scale-105 transition-transform duration-300 cursor-pointer border-none`}
        >
          <div className="p-6 h-[200px] flex flex-col justify-between">
            {item.company && (
              <div className="text-sm text-gray-400 mb-2">{item.company}</div>
            )}
            <div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              {item.author && (
                <p className="text-sm text-gray-400">{item.author}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};