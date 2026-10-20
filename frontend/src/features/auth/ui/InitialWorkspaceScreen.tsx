import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useSessionStore } from '../model/sessionStore';

export function InitialWorkspaceScreen() {
  const currentUser = useSessionStore((state) => state.currentUser);
  const greeting = currentUser
    ? MESSAGES.initialWorkspace.greeting(currentUser.usuario.nome)
    : MESSAGES.initialWorkspace.unavailable;
  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.greeting}>{greeting}</Text>
      {currentUser?.workspace ? (
        <Text style={styles.workspace}>{currentUser.workspace.nome}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.page,
  },
  greeting: {
    color: theme.colors.text,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.pageHeading,
    marginBottom: theme.spacing.medium,
  },
  workspace: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.body,
  },
});
