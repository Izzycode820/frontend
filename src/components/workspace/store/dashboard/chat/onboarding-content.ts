/**
 * Onboarding Content Mapping
 * 
 * Maps backend Step IDs to translation keys and metadata.
 * Uses the Smart Ladder architecture: PENDING or COMPLETED states.
 */

export interface OnboardingStepContent {
  id: string;
  pending: {
    titleKey: string;
    descriptionKey: string;
    actionKey: string;
    aiPrompt?: string;
  };
  completed: {
    titleKey: string;
    descriptionKey: string;
    actionKey: string;
  };
}

export const ONBOARDING_CONTENT: Record<string, OnboardingStepContent> = {
  PRODUCT_CREATION: {
    id: 'PRODUCT_CREATION',
    pending: {
      titleKey: 'Workman.onboarding.PRODUCT_CREATION.pending.title',
      descriptionKey: 'Workman.onboarding.PRODUCT_CREATION.pending.description',
      actionKey: 'Workman.onboarding.PRODUCT_CREATION.pending.action',
      aiPrompt: 'I want to add a new product. Can you help me write the description and set the price?',
    },
    completed: {
      titleKey: 'Workman.onboarding.PRODUCT_CREATION.completed.title',
      descriptionKey: 'Workman.onboarding.PRODUCT_CREATION.completed.description',
      actionKey: 'Workman.onboarding.PRODUCT_CREATION.completed.action',
    }
  },
  SHIPPING_SETUP: {
    id: 'SHIPPING_SETUP',
    pending: {
      titleKey: 'Workman.onboarding.SHIPPING_SETUP.pending.title',
      descriptionKey: 'Workman.onboarding.SHIPPING_SETUP.pending.description',
      actionKey: 'Workman.onboarding.SHIPPING_SETUP.pending.action',
      aiPrompt: 'Help me configure shipping for Douala and Yaoundé.',
    },
    completed: {
      titleKey: 'Workman.onboarding.SHIPPING_SETUP.completed.title',
      descriptionKey: 'Workman.onboarding.SHIPPING_SETUP.completed.description',
      actionKey: 'Workman.onboarding.SHIPPING_SETUP.completed.action',
    }
  },
  THEME_SELECTION: {
    id: 'THEME_SELECTION',
    pending: {
      titleKey: 'Workman.onboarding.THEME_SELECTION.pending.title',
      descriptionKey: 'Workman.onboarding.THEME_SELECTION.pending.description',
      actionKey: 'Workman.onboarding.THEME_SELECTION.pending.action',
      aiPrompt: 'I want to change my store theme. What do you recommend?',
    },
    completed: {
      titleKey: 'Workman.onboarding.THEME_SELECTION.completed.title',
      descriptionKey: 'Workman.onboarding.THEME_SELECTION.completed.description',
      actionKey: 'Workman.onboarding.THEME_SELECTION.completed.action',
    }
  },
  SUBSCRIPTION: {
    id: 'SUBSCRIPTION',
    pending: {
      titleKey: 'Workman.onboarding.SUBSCRIPTION.pending.title',
      descriptionKey: 'Workman.onboarding.SUBSCRIPTION.pending.description',
      actionKey: 'Workman.onboarding.SUBSCRIPTION.pending.action',
      aiPrompt: 'Workman, what are the benefits of upgrading to the Pro plan?',
    },
    completed: {
      titleKey: 'Workman.onboarding.SUBSCRIPTION.completed.title',
      descriptionKey: 'Workman.onboarding.SUBSCRIPTION.completed.description',
      actionKey: 'Workman.onboarding.SUBSCRIPTION.completed.action',
    }
  }
};
