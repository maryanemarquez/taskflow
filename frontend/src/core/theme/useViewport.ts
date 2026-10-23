import { useWindowDimensions } from 'react-native';
import { theme } from './theme';

export function useViewport() {
  const { width } = useWindowDimensions();
  return { width, isMobile: width <= theme.breakpoints.mobile };
}
