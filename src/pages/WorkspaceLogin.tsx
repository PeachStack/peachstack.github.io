import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkspaceLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
}
