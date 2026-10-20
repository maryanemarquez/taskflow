import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';

interface ErrorNoticeProps {
  message: string;
}

export function ErrorNotice({ message }: ErrorNoticeProps) {
  return (
    <View accessibilityRole="alert" style={styles.notice}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: theme.colors.destructiveSoft,
    borderColor: theme.colors.destructiveBorder,
    borderRadius: theme.radii.small,
    borderWidth: 1,
    padding: theme.spacing.medium,
  },
  message: {
    color: theme.colors.destructive,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
});
