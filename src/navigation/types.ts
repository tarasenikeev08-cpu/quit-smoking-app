import type {NavigatorScreenParams} from '@react-navigation/native';

export type OnboardingParamList = {
  Hook: undefined;
  Habit: undefined;
  QuitDate: undefined;
  Maths: undefined;
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
};
