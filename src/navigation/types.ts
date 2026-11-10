import type {NavigatorScreenParams} from '@react-navigation/native';
import type {LegalDocId} from '@/legal';

export type OnboardingParamList = {
  Hook: undefined;
  Quitting: undefined;
  Amounts: undefined;
  QuitDate: undefined;
  Savings: undefined;
  Paywall: undefined;
};

export type JournalParamList = {
  CheckIn: undefined;
  Patterns: undefined;
};

export type TabParamList = {
  Home: undefined;
  Journal: NavigatorScreenParams<JournalParamList>;
  Rank: undefined;
  Collection: undefined;
};

export type RootParamList = {
  Onboarding: NavigatorScreenParams<OnboardingParamList>;
  Tabs: NavigatorScreenParams<TabParamList>;
  Slip: undefined;
  Paywall: undefined; // reachable from in-app upsell
  Settings: undefined;
  /** a legal document; reachable during onboarding too */
  Legal: {doc: LegalDocId};
};
