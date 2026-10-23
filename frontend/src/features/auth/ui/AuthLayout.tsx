import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const viewport = useViewport();
  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.background}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>{MESSAGES.brandMark}</Text>
        </View>
        <Text style={styles.brand}>{MESSAGES.brand}</Text>
      </View>
      <View style={[styles.content, viewport.isMobile && styles.mobileContent]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: theme.colors.surface, flex: 1 },
  page: { flexGrow: 1, paddingBottom: theme.spacing.hero },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.xlarge,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.medium,
    height: theme.layout.brandMarkSize,
    justifyContent: 'center',
    width: theme.layout.brandMarkSize,
  },
  brandLetter: { color: theme.colors.surface, fontFamily: theme.typography.bold },
  brand: {
    color: theme.colors.text,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.brand,
  },
  content: {
    alignSelf: 'center',
    gap: theme.spacing.xlarge,
    marginVertical: 'auto',
    maxWidth: theme.layout.authContentWidth,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.hero,
    width: '100%',
  },
  mobileContent: { paddingVertical: theme.spacing.section },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.heading,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.body * theme.layout.subtitleLineHeight,
  },
});
