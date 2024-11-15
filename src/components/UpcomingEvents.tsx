import { Card } from "@/components/ui/card";

const events = [
  {
    id: 1,
    title: "Aktualisierung der Fachkunde im Strahlenschutz nach §48StrlSchV",
    date: "Mi 27. Nov",
    time: "13:00 - 17:00",
    organizer: "DVT Müller & Crocodile",
    presenter: "Dr. Oliver Müller",
  },
  // Add more events as needed
];

export const UpcomingEvents = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="relative overflow-hidden bg-gradient-to-br from-red-500/20 to-transparent hover:scale-105 transition-transform duration-300 cursor-pointer border-none"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-500 text-white px-2 py-1 text-sm rounded">LIVE</span>
              <span className="text-sm text-gray-400">{event.organizer}</span>
            </div>
            <h3 className="font-semibold mb-4">{event.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{event.date}</span>
              <span>{event.time}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};