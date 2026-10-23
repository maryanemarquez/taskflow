import { StyleSheet, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useRegistration } from '../model/useRegistration';
import { AuthLayout } from './AuthLayout';
import { ErrorNotice } from './ErrorNotice';
import { PrimaryButton } from './PrimaryButton';
import { RegistrationFields } from './RegistrationFields';

export function RegistrationScreen() {
  const registration = useRegistration();
  return (
    <AuthLayout title={MESSAGES.registration.title} subtitle={MESSAGES.registration.subtitle}>
      <View style={styles.form}>
        <RegistrationFields registration={registration} />
        {registration.errorMessage ? <ErrorNotice message={registration.errorMessage} /> : null}
        <PrimaryButton
          disabled={registration.isSubmitting}
          label={MESSAGES.registration.submit}
          loading={registration.isSubmitting}
          onPress={registration.submit}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.large },
});
