import { redirect } from 'next/navigation';

export default function GetStartedRedirect() {
  redirect('/auth?view=get-started');
}
