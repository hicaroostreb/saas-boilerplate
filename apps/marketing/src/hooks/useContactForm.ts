'use client';

import { sendContactEmail } from '@lib/forms/contact.service';
import type { ContactFormData } from '@lib/forms/validation';
import { useState } from 'react';

export const useContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContactForm = async (data: ContactFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await sendContactEmail(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitContactForm,
    isLoading,
    error,
  };
};
