import React from 'react';
import { PartnerPreferencesEditor } from '@/components/preferences/partner-preferences-editor';

export const metadata = {
  title: 'Partner Preferences | Let’s CHAT .Com',
  description: 'Manage and customize your partner matchmaking criteria and preferences.',
};

export default function PreferencesPage() {
  return <PartnerPreferencesEditor />;
}
