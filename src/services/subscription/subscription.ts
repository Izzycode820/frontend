/**
 * Subscription Service - Core subscription management
 * Aligned with backend subscription_views.py endpoints
 */

import BaseService from '../base/BaseService'
import type {
  SubscriptionCreateRequest,
  SubscriptionCreateResponse,
  SubscriptionUpgradeRequest,
  SubscriptionUpgradeResponse,
  SubscriptionStatusResponse,
  SubscriptionHistoryResponse,
  RenewSubscriptionRequest,
  RenewSubscriptionResponse,
  ScheduleDowngradeRequest,
  ScheduleDowngradeResponse,
  ReactivateSubscriptionRequest,
  ReactivateSubscriptionResponse,
  CancelSubscriptionResponse,
} from '../../types/subscription'

// ============================================================================
// Subscription Service
// ============================================================================

export class SubscriptionService extends BaseService {
  constructor() {
    super('subscriptions')
  }

  /**
   * Create new subscription
   * Backend: POST /api/subscriptions/create/
   */
  async createSubscription(request: SubscriptionCreateRequest): Promise<SubscriptionCreateResponse> {
    this.validateRequired(request as unknown as Record<string, unknown>, ['plan_tier'])

    return this.post<SubscriptionCreateResponse>('/create/', request)
  }

  /**
   * Upgrade existing subscription
   * Backend: POST /api/subscriptions/upgrade/
   */
  async upgradeSubscription(request: SubscriptionUpgradeRequest): Promise<SubscriptionUpgradeResponse> {
    this.validateRequired(request as unknown as Record<string, unknown>, ['new_plan_tier'])

    return this.post<SubscriptionUpgradeResponse>('/upgrade/', request)
  }

  /**
   * Get current subscription status
   * Backend: GET /api/subscriptions/status/
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    return this.get<SubscriptionStatusResponse>('/status/')
  }

  /**
   * Get subscription and trial history
   * Backend: GET /api/subscriptions/history/
   */
  async getSubscriptionHistory(): Promise<SubscriptionHistoryResponse> {
    return this.get<SubscriptionHistoryResponse>('/history/')
  }

  /**
   * Renew subscription manually
   * Backend: POST /api/subscriptions/renew/
   */
  async renewSubscription(request: RenewSubscriptionRequest): Promise<RenewSubscriptionResponse> {
    this.validateRequired(request as unknown as Record<string, unknown>, ['payment_method_id'])

    return this.post<RenewSubscriptionResponse>('/renew/', request)
  }

  /**
   * Schedule downgrade for next billing cycle
   * Backend: POST /api/subscriptions/schedule-downgrade/
   */
  async scheduleDowngrade(request: ScheduleDowngradeRequest): Promise<ScheduleDowngradeResponse> {
    this.validateRequired(request as unknown as Record<string, unknown>, ['new_plan_tier'])

    return this.post<ScheduleDowngradeResponse>('/schedule-downgrade/', request)
  }

  /**
   * Reactivate suspended subscription
   * Backend: POST /api/subscriptions/reactivate/
   */
  async reactivateSubscription(request: ReactivateSubscriptionRequest): Promise<ReactivateSubscriptionResponse> {
    this.validateRequired(request as unknown as Record<string, unknown>, ['payment_method_id'])

    return this.post<ReactivateSubscriptionResponse>('/reactivate/', request)
  }

  /**
   * Cancel/void incomplete subscription (Stripe pattern)
   * Only works for pending_payment, failed, or expired subscriptions
   * Backend: POST /api/subscriptions/cancel/{subscription_id}/
   */
  async cancelSubscription(subscriptionId: string): Promise<CancelSubscriptionResponse> {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required')
    }

    return this.post<CancelSubscriptionResponse>(`/cancel/${subscriptionId}/`)
  }
}

// ============================================================================
// Export Service Instance
// ============================================================================

const subscriptionService = new SubscriptionService()
export default subscriptionService