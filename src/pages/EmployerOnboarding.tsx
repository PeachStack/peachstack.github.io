import { useEffect } from 'react';

const EMPLOYER_FORM_URL = 'https://docs.google.com/forms/d/1uz55KEIkH3XwnVJxvdQgMMByidmsQRB9dRkVWLJb8p0/viewform';

export default function EmployerOnboarding() {
  useEffect(() => {
    window.location.replace(EMPLOYER_FORM_URL);
  }, []);

  return null;
}
