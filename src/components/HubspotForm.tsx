import { useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CalculationResults } from '@/utils/calculations';

interface HubspotFormProps {
  results: CalculationResults;
  onSuccess: () => void;
}

declare global {
  interface Window {
    hbspt: any;
  }
}

export const HubspotForm = ({ results, onSuccess }: HubspotFormProps) => {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (formContainerRef.current && window.hbspt) {
      window.hbspt.forms.create({
        portalId: "24951213",
        formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
        target: formContainerRef.current,
        region: "eu1",
        css: "",
        cssClass: "bg-[#2a2a2a] rounded-lg max-w-sm mx-auto w-full",
        onFormSubmitted: async (form: any) => {
          const email = form.getEmail();
          const practiceName = form.getField('practice_name')?.getValue();
          
          // Get calculation data from sessionStorage
          const calculatorData = JSON.parse(sessionStorage.getItem('calculatorData') || '{}');
          
          // Prepare data for webhook
          const webhookData = {
            email,
            practice_name: practiceName,
            team_size: calculatorData.teamSize,
            dentists: calculatorData.dentists,
            assistants: calculatorData.teamSize - calculatorData.dentists,
            traditional_costs: results.totalTraditionalCosts,
            crocodile_costs: results.crocodileCosts,
            savings: results.savings,
            location: calculatorData.location || ''
          };

          try {
            const response = await fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(webhookData)
            });

            if (response.ok) {
              toast({
                title: "Erfolg!",
                description: "Ihre Berechnung wurde gespeichert und an Ihre E-Mail-Adresse gesendet.",
              });
              onSuccess();
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Fehler",
              description: "Beim Senden der Daten ist ein Fehler aufgetreten.",
            });
          }
        }
      });
    }
  }, [results, onSuccess]);

  return <div ref={formContainerRef} className="mt-4" />;
};