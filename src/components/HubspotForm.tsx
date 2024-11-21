import { useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CalculationResults } from '@/utils/calculations';
import { Card, CardContent } from "@/components/ui/card";

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
        cssClass: "hubspot-form-custom",
        onFormSubmitted: async (submission: any) => {
          const email = submission.submittedAt ? submission.values.email : '';
          const practiceName = submission.values?.practice_name || '';
          
          const calculatorData = JSON.parse(sessionStorage.getItem('calculatorData') || '{}');
          
          const webhookData = {
            email,
            practice_name: practiceName,
            team_size: Number(calculatorData.teamSize) || 0,
            dentists: Number(calculatorData.dentists) || 0,
            assistants: (Number(calculatorData.teamSize) || 0) - (Number(calculatorData.dentists) || 0),
            traditional_costs: Number(results.totalTraditionalCosts) || 0,
            crocodile_costs: Number(results.crocodileCosts) || 0,
            savings: Number(results.savings) || 0,
            location: calculatorData.location || '',
            timestamp: new Date().toISOString()
          };

          console.log('Sending webhook data:', webhookData);

          try {
            const response = await fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(webhookData)
            });

            console.log('Webhook response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Webhook error:', errorText);
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Webhook response:', responseData);

            toast({
              title: "Erfolg!",
              description: "Ihre Berechnung wurde gespeichert und an Ihre E-Mail-Adresse gesendet.",
            });
            onSuccess();
          } catch (error) {
            console.error('Error sending webhook:', error);
            toast({
              variant: "destructive",
              title: "Fehler",
              description: "Beim Senden der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
            });
          }
        }
      });
    }
  }, [results, onSuccess]);

  return (
    <Card className="w-full max-w-[600px] mx-auto bg-white/5 backdrop-blur-sm border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center text-primary">
            Ihre persönliche Kostenanalyse
          </h3>
          <p className="text-sm text-center text-muted-foreground mb-6">
            Füllen Sie das Formular aus, um Ihre individuelle Kostenanalyse zu erhalten.
          </p>
          <div 
            ref={formContainerRef} 
            className="hubspot-form-wrapper"
          />
        </div>
      </CardContent>
    </Card>
  );
};