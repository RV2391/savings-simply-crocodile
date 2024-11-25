import { motion } from "framer-motion";
import { useHubspotForm } from "@/hooks/useHubspotForm";

interface ResultFormProps {
  onSubmit: (email: string, practiceName: string) => Promise<void>;
}

export const ResultForm = ({ onSubmit }: ResultFormProps) => {
  const formId = "d2d5df99-4e1f-4f27-9df3-6ca4e8f99d10";
  const portalId = "39711435";
  const target = "#hubspotForm";

  const { isLoaded, error } = useHubspotForm({
    portalId,
    formId,
    target,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <div className="bg-[#2a2a2a] rounded-2xl p-8">
        <div id="hubspotForm" className="hubspot-form-wrapper" />
      </div>
    </motion.div>
  );
};