import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import type { RegistrationField } from '../model/registrationValidation';
import type { useRegistration } from '../model/useRegistration';
import { AuthField, type AuthFieldDefinition } from './AuthField';

interface RegistrationFieldsProps {
  registration: ReturnType<typeof useRegistration>;
}

interface RegistrationFieldConfig extends AuthFieldDefinition {
  key: RegistrationField;
}

export function RegistrationFields({ registration }: RegistrationFieldsProps) {
  const fields: RegistrationFieldConfig[] = [
    {
      key: 'nome',
      label: MESSAGES.registration.name,
      value: registration.form.nome,
      error: registration.errors.nome,
      autoCapitalize: 'words',
      onChangeText: (value) => registration.updateField('nome', value),
    },
    {
      key: 'email',
      label: MESSAGES.registration.email,
      value: registration.form.email,
      error: registration.errors.email,
      keyboardType: 'email-address',
      onChangeText: (value) => registration.updateField('email', value),
    },
    {
      key: 'senha',
      label: MESSAGES.registration.password,
      value: registration.form.senha,
      error: registration.errors.senha,
      secureTextEntry: true,
      onChangeText: (value) => registration.updateField('senha', value),
    },
  ];
  return (
    <View style={styles.fields}>
      {fields.map((field) => <AuthField field={field} key={field.key} />)}
      <Text style={styles.hint}>{MESSAGES.registration.passwordHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fields: { gap: theme.spacing.large },
  hint: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
});
