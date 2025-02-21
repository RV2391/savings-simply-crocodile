import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactDashboard } from "./impact/ImpactDashboard";
import { TeamTable } from "./team/TeamTable";
import { TeamDetails } from "./team/TeamDetails";

export const TeamView = () => {
  const mockMetrics = {
    savings: {
      last30Days: 2500,
      total: 15000
    },
    watchTime: {
      last30Days: 1200, // 20 hours
      total: 12000 // 200 hours
    },
    completedCourses: {
      last30Days: 15,
      total: 120
    }
  };

  return (
    <Tabs defaultValue="impact" className="w-full">
      <TabsList>
        <TabsTrigger value="impact">Impact Dashboard</TabsTrigger>
        <TabsTrigger value="team">Team Übersicht</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      <TabsContent value="impact">
        <ImpactDashboard metrics={mockMetrics} />
      </TabsContent>

      <TabsContent value="team">
        <TeamTable />
      </TabsContent>

      <TabsContent value="details">
        <TeamDetails />
      </TabsContent>
    </Tabs>
  );
};
