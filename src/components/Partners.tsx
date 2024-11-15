import { Card } from "@/components/ui/card";

const partners = [
  {
    id: 1,
    name: "CAMLOG Vertriebs GmbH",
    logo: "/placeholder.svg",
  },
  {
    id: 2,
    name: "OPTI ACADEMY",
    logo: "/placeholder.svg",
  },
  // Add more partners as needed
];

export const Partners = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
      {partners.map((partner) => (
        <Card
          key={partner.id}
          className="p-4 flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer bg-[#2A2F3C] border-none"
        >
          <img
            src={partner.logo}
            alt={partner.name}
            className="w-16 h-16 object-contain"
          />
        </Card>
      ))}
    </div>
  );
};