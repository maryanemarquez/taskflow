import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '../../../core/theme/theme';

export interface AuthFieldDefinition {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

interface AuthFieldProps {
  field: AuthFieldDefinition;
}

export function AuthField({ field }: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput
        accessibilityLabel={field.label}
        autoCapitalize={field.autoCapitalize ?? 'none'}
        autoCorrect={false}
        keyboardType={field.keyboardType}
        onChangeText={field.onChangeText}
        placeholder={field.label}
        secureTextEntry={field.secureTextEntry}
        style={styles.input}
        value={field.value}
      />
      {field.error ? <Text accessibilityRole="alert" style={styles.error}>{field.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.spacing.small },
  label: {
    color: theme.colors.text,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.label,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.small,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.body,
    height: theme.layout.fieldHeight,
    paddingHorizontal: theme.spacing.large,
  },
  error: {
    color: theme.colors.destructive,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
});
