// This page handles all /handler/* routes for Neon Stack Auth
import { StackHandler } from '@stackframe/stack';
import { stackServerApp } from '@/lib/stack';

export default function HandlerPage(props: any) {
  return <StackHandler app={stackServerApp} routeProps={props} fullPage />;
}
