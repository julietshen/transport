import { Alert, AlertIcon } from '@chakra-ui/react';

interface ErrorAlertProps {
  error: string;
}

/**
 * Error alert component for displaying error messages
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  return (
    <Alert status="error" variant="solid" borderRadius="md">
      <AlertIcon />
      {error}
    </Alert>
  );
}; 