# Conversion & Routing Strategy (Deep Linking with Workspace Constraints)

**Current Status**: Early Stage Implementation
**Constraint**: Users must manually create a workspace after signup before accessing any features.

## The Challenge: The "Workspace Gap"
In a typical SaaS, we links like `/signup?next=/billing`. However, since your users must perform an intermediate step (**Create Workspace**) which generates a dynamic ID (e.g., `/workspace/[new-id]/...`), we cannot know the final URL at the time of the click on the landing page.

## Proposed Strategy: "Intent Persistence"

Instead of trying to link to a final destination, we link to an **Intent**. We carry this intent through the entire onboarding flow until the workspace is ready.

### 1. Landing Page (The Trigger)
We append an `intent` query parameter to all CTA buttons.

| Section | Button | URL Structure | Meaning |
| :--- | :--- | :--- | :--- |
| **Hero** | Start Empire | `/signup?intent=general` | Just get me in. |
| **Pricing** | View Plans | `/signup?intent=billing` | I want to pay. |
| **Customization** | Start Customizing | `/signup?intent=themes` | I want to edit looks. |
| **Inventory** | Manage Inventory | `/signup?intent=products` | I want to add items. |
| **Domains** | Find Domain | `/signup?intent=settings` | I want to setup domain. |

### 2. The Relay (Signup & Onboarding)
When the user lands on `/signup`:
1.  **Capture**: Check for `?intent=...` in the URL.
2.  **Store**: Save this value in `localStorage` (e.g., `onboarding_intent = 'themes'`) or a cookie.
    *   *Why LocalStorage?* It persists even if the URL gets cleaned up during the OAuth/Email verification dance.

### 3. The Resolution (After Workspace Creation)
When the user successfully submits the "Create Workspace" form and the backend returns the new `workspaceId`:

```javascript
// Pseudo-code in your WorkspaceCreationForm.tsx

const onWorkspaceCreated = (workspaceId) => {
    // 1. Retrieve the parked intent
    const intent = localStorage.getItem('onboarding_intent');
    
    // 2. Resolve the destination
    let path = `/w/${workspaceId}/dashboard`; // Default
    
    switch(intent) {
        case 'themes': path = `/w/${workspaceId}/website/themes`; break;
        case 'billing': path = `/w/${workspaceId}/settings/billing`; break;
        case 'products': path = `/w/${workspaceId}/products`; break;
        // ... etc
    }
    
    // 3. Clear and Go
    localStorage.removeItem('onboarding_intent');
    router.push(path);
}
```

## Summary for Implementation
For now, on the **Landing Page**, our only job is to **add the tags**. We don't need the backend logic yet, but adding the tags now ensures the marketing side is ready for when the engineering side implements the router logic.

**Action Plan:**
1.  Update `Hero.tsx`, `PricingGallery.tsx`, etc., to include `?intent=...` in their `<Link>` tags.
2.  Future: Implement the `localStorage` logic in the Signup/Workspace forms.
