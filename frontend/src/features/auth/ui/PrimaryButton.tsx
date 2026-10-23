import { Pressable, StyleSheet, Text } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';

interface PrimaryButtonProps {
  label: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}

export function PrimaryButton({ label, loading, disabled, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{loading ? MESSAGES.registration.loading : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.small,
    justifyContent: 'center',
    minHeight: theme.layout.buttonHeight,
    paddingHorizontal: theme.spacing.large,
  },
  pressed: { opacity: theme.states.pressedOpacity },
  disabled: { opacity: theme.states.disabledOpacity },
  label: {
    color: theme.colors.surface,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.body,
  },
});
