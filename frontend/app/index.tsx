import { Redirect } from 'expo-router';
import { useSessionStore } from '../src/features/auth/model/sessionStore';

export default function IndexRoute() {
  const hasSession = useSessionStore((state) => Boolean(state.tokens));
  return <Redirect href={hasSession ? '/dashboard' : '/cadastro'} />;
}
