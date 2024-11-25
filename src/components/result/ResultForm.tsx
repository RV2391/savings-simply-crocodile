import { useState, useEffect } from "react";
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
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/50 via-primary to-primary/50">
        <div className="bg-card p-8 rounded-xl">
          <div id="hubspotForm" className="hubspot-form-wrapper" />
        </div>
      </div>
    </motion.div>
  );
};