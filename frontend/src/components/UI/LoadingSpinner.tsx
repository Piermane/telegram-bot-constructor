import React from 'react';
import { Spinner, SpinnerProps } from '@chakra-ui/react';

interface LoadingSpinnerProps extends SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', ...props }) => {
  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="brand.500"
      size={size}
      {...props}
    />
  );
};

export default LoadingSpinner;
