# Domain Management UI Flow - Shopify Pattern

**Purpose**: Complete UI flow documentation for domain management in settings, following Shopify's UX patterns with shadcn/ui components.

**Location**: Settings → Domains section

---

## 📋 Flow Overview

### **Flow 1: First Time on Domains Page (Initial State)**
### **Flow 2: Change Free Subdomain**
### **Flow 3: Buy New Custom Domain**
### **Flow 4: Connect Existing Domain**
### **Flow 5: Verify Connected Domain**
### **Flow 6: Renew Expiring Domain**

---

## 🎯 Flow 1: First Time on Domains Page (Initial State)

### **User Action**: Navigate to Settings → Domains

### **What User Sees**:

**Page Layout**: Use `Card` component with sections

```
┌─────────────────────────────────────────────────────────────┐
│ Domains                                                      │
│─────────────────────────────────────────────────────────────│
│                                                              │
│ SUBDOMAIN                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ mystore.huzilerz.com                     [Change]       │ │
│ │ Your free subdomain                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ CUSTOM DOMAINS                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌐 No custom domains yet                                │ │
│ │                                                          │ │
│ │ Add a custom domain to strengthen your brand.           │ │
│ │                                                          │ │
│ │ [+ Add domain]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **UI Components**:
- **Page Container**: `<Card>` (main container)
- **Section Headers**: `<h3>` with Tailwind styling
- **Subdomain Display**: `<Card>` with `<Badge>` for "Free" label
- **Empty State**: `<div>` with icon and description
- **Buttons**:
  - Change subdomain: `<Button variant="outline" size="sm">`
  - Add domain: `<Button variant="default">`

### **GraphQL Operations on Page Load**:

```typescript
// Query 1: Get workspace infrastructure (subdomain info)
const { data: infrastructure } = useWorkspaceInfrastructureQuery({
  variables: { workspaceId }
});
// Returns: { subdomain, previewUrl, status }

// Query 2: Get all custom domains
const { data: domains } = useWorkspaceDomainsQuery({
  variables: { workspaceId }
});
// Returns: [] (empty initially)
```

### **Data Display**:
- Show `infrastructure.subdomain` + ".huzilerz.com"
- If `domains.length === 0`, show empty state
- If `domains.length > 0`, show domain list (see Flow 5)

---

## 🔄 Flow 2: Change Free Subdomain

### **User Action**: Click "Change" button on subdomain card

### **What Happens**:

**Step 1: Open Modal**

```
┌──────────────────────────────────────────────────┐
│ Change subdomain                            [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Current: mystore.huzilerz.com                   │
│                                                  │
│ New subdomain                                    │
│ ┌────────────────────────┐                      │
│ │ mystore                │ .huzilerz.com        │
│ └────────────────────────┘                      │
│ ℹ️  Available                                    │
│                                                  │
│ SUGGESTIONS (if current name taken):            │
│ • mystore-cm                                     │
│ • mystore237                                     │
│ • mystore-cameroon                               │
│                                                  │
│         [Cancel]  [Change subdomain]            │
└──────────────────────────────────────────────────┘
```

**Step 2: User Types New Subdomain**

### **UI Components**:
- **Modal**: `<Dialog>` from shadcn/ui
- **Input**: `<Input>` with suffix ".huzilerz.com"
- **Validation Indicator**: `<Alert>` (green for available, red for taken)
- **Suggestions**: `<Button variant="ghost">` clickable list
- **Actions**: `<DialogFooter>` with `<Button>` components

### **GraphQL Operations**:

```typescript
// Real-time validation (debounced on input change)
const { data: isValid } = useValidateSubdomainQuery({
  variables: { subdomain: inputValue }
});
// Returns: boolean (true = available, false = taken)

// Get suggestions if unavailable
const { data: suggestions } = useSubdomainSuggestionsQuery({
  variables: { baseName: inputValue, limit: 5 }
});
// Returns: [{ subdomain, available, fullDomain }, ...]

// On "Change subdomain" button click
const [changeSubdomain, { loading }] = useChangeSubdomainMutation();

await changeSubdomain({
  variables: {
    workspaceId,
    subdomain: newSubdomain
  }
});
// Returns: { success, newSubdomain, liveUrl, previewUrl, message, error }
```

### **Success State**:
- Close modal
- Show success toast: "Subdomain changed to {newSubdomain}.huzilerz.com"
- Update UI with new subdomain (refetch `workspaceInfrastructure`)

### **Error State**:
- Show error in modal: `<Alert variant="destructive">`
- Keep modal open for retry

---

## 🛒 Flow 3: Buy New Custom Domain

### **User Action**: Click "+ Add domain" button

### **What Happens**:

**Step 1: Show Domain Options Modal**

```
┌──────────────────────────────────────────────────┐
│ Add domain                                  [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Choose an option:                                │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🛒 Buy new domain                            │ │
│ │ Purchase a domain through Huzilerz           │ │
│ │                              [Select] ──────→│ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🔗 Connect existing domain                   │ │
│ │ Use a domain you already own                 │ │
│ │                              [Select] ──────→│ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│                                [Cancel]          │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Modal**: `<Dialog>`
- **Option Cards**: `<Card>` with hover effect, clickable
- **Icons**: Lucide icons (ShoppingCart, Link)

### **User Selects "Buy new domain"**

**Step 2: Search for Domain**

```
┌──────────────────────────────────────────────────┐
│ Buy domain                                  [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Enter the domain you want to buy                │
│ ┌────────────────────────────────────┐          │
│ │ mystore.com                [Search]│          │
│ └────────────────────────────────────┘          │
│                                                  │
│ [Loading spinner while searching...]            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### **GraphQL Operation**:

```typescript
const [searchDomain, { loading, data }] = useSearchDomainMutation();

await searchDomain({
  variables: { domain: "mystore.com" }
});
// Returns: {
//   success,
//   availability: { domain, available, priceFcfa, premium },
//   suggestions: [{ domain, priceFcfa }, ...]
// }
```

**Step 3a: Domain Available**

```
┌──────────────────────────────────────────────────┐
│ Buy domain                                  [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ ✅ mystore.com is available!                    │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ mystore.com                                  │ │
│ │ 15,000 FCFA/year                             │ │
│ │                                              │ │
│ │                              [Buy domain]    │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│                            [← Back]              │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Availability Card**: `<Card>` with green border
- **Price**: `<p>` with large font
- **Buy Button**: `<Button variant="default">`

**Step 3b: Domain Unavailable - Show Suggestions**

```
┌──────────────────────────────────────────────────┐
│ Buy domain                                  [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ ❌ mystore.com is not available                 │
│                                                  │
│ Try these alternatives:                          │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ mystore.shop          12,000 FCFA    [Buy]  │ │
│ ├──────────────────────────────────────────────┤ │
│ │ mystore.africa        18,000 FCFA    [Buy]  │ │
│ ├──────────────────────────────────────────────┤ │
│ │ mystore.cm            25,000 FCFA    [Buy]  │ │
│ ├──────────────────────────────────────────────┤ │
│ │ mystores.com          15,000 FCFA    [Buy]  │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│                            [← Back]              │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Unavailable Alert**: `<Alert variant="destructive">`
- **Suggestion List**: `<Card>` with `<Button>` per row
- **Each Row**: Domain name, price, buy button

**Step 4: User Clicks "Buy domain"**

```
┌──────────────────────────────────────────────────┐
│ Complete purchase                           [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Domain: mystore.com                              │
│ Price: 15,000 FCFA/year                          │
│                                                  │
│ Registration period                              │
│ ┌──────────────────────────────────────────────┐ │
│ │ ● 1 year     15,000 FCFA                     │ │
│ │ ○ 2 years    30,000 FCFA (Save 5%)           │ │
│ │ ○ 5 years    71,250 FCFA (Save 5%)           │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Payment method                                   │
│ [MTN Mobile Money] [Orange Money] [Flutterwave] │
│                                                  │
│                  [Cancel]  [Continue to payment] │
└──────────────────────────────────────────────────┘
```

### **GraphQL Operation**:

```typescript
const [purchaseDomain, { loading }] = usePurchaseDomainMutation();

const result = await purchaseDomain({
  variables: {
    workspaceId,
    domain: "mystore.com",
    registrationPeriodYears: 1
  }
});
// Returns: {
//   success,
//   purchase: { id, domainName, priceFcfa, paymentStatus },
//   paymentInstructions,
//   message
// }
```

**Step 5: Payment Instructions**

```
┌──────────────────────────────────────────────────┐
│ Payment instructions                        [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Complete payment via MTN Mobile Money            │
│                                                  │
│ 1. Dial *126# on your MTN phone                  │
│ 2. Select option 1 (Transfer Money)              │
│ 3. Enter amount: 15,000                          │
│ 4. Enter merchant code: 123456                   │
│ 5. Confirm payment                               │
│                                                  │
│ ⏳ Waiting for payment...                        │
│                                                  │
│ Reference: #DOM-ABC123                           │
│                                                  │
│                                    [I've paid]   │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Instructions**: `<ol>` numbered list
- **Loading State**: `<Spinner>` with "Waiting for payment..."
- **Reference**: `<code>` tag for transaction reference

### **Background Polling**:

```typescript
// Poll purchase status every 5 seconds
const { data: purchaseStatus } = useDomainPurchaseStatusQuery({
  variables: { purchaseId: result.purchase.id },
  pollInterval: 5000 // 5 seconds
});

// When paymentStatus changes from "pending" to "completed"
if (purchaseStatus.isCompleted) {
  // Show success
  // Close modal
  // Refetch workspaceDomains
}
```

**Step 6: Success State**

```
┌──────────────────────────────────────────────────┐
│ ✅ Domain purchased successfully!               │
│──────────────────────────────────────────────────│
│                                                  │
│ mystore.com has been added to your workspace.   │
│                                                  │
│ DNS records have been automatically configured.  │
│ Your domain will be active within 24-48 hours.   │
│                                                  │
│                                       [Done]     │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Success Alert**: `<Alert>` with checkmark icon
- **Message**: Clear success message
- **Button**: `<Button>` to close

---

## 🔗 Flow 4: Connect Existing Domain

### **User Action**: Select "Connect existing domain" from add domain modal

**Step 1: Enter Domain**

```
┌──────────────────────────────────────────────────┐
│ Connect domain                              [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Enter your domain                                │
│ ┌────────────────────────────────────┐          │
│ │ mystore.com                        │          │
│ └────────────────────────────────────┘          │
│                                                  │
│ ℹ️  You must own this domain and have access    │
│    to its DNS settings.                          │
│                                                  │
│                        [Cancel]  [Next]          │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Modal**: `<Dialog>`
- **Input**: `<Input>` for domain
- **Info Alert**: `<Alert variant="default">` with info icon

### **GraphQL Operation**:

```typescript
const [connectDomain, { loading }] = useConnectCustomDomainMutation();

const result = await connectDomain({
  variables: {
    workspaceId,
    domain: "mystore.com"
  }
});
// Returns: {
//   success,
//   domain: { id, domain, status, dnsRecords, verificationToken },
//   dnsRecords: { cname: {...}, txt: {...} },
//   verificationInstructions,
//   message
// }
```

**Step 2: DNS Configuration Instructions (Shopify 2-Step Flow)**

```
┌───────────────────────────────────────────────────────────┐
│ Configure DNS                                        [X]  │
│───────────────────────────────────────────────────────────│
│                                                           │
│ Step 1: Add these DNS records at your domain provider    │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ A Record                                            │  │
│ │ Host: @                                             │  │
│ │ Points to: 54.123.45.67                  [Copy]    │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ CNAME Record                                        │  │
│ │ Host: www                                           │  │
│ │ Points to: mystore.huzilerz.com          [Copy]    │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ TXT Record (for verification)                       │  │
│ │ Host: _huzilerz-verify                              │  │
│ │ Value: abc123def456789...                [Copy]    │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ℹ️  DNS changes can take up to 48 hours to propagate.    │
│                                                           │
│ ⏳ Checking DNS configuration every 12 seconds...        │
│                                                           │
│              [Check now]  [I'll verify later]            │
└───────────────────────────────────────────────────────────┘
```

### **UI Components**:
- **DNS Record Cards**: `<Card>` per record type
- **Copy Buttons**: `<Button variant="ghost" size="icon">` with copy icon
- **Status Indicator**: `<Spinner>` for auto-checking
- **Actions**:
  - Manual check: `<Button variant="outline">`
  - Skip for later: `<Button variant="ghost">`

### **Auto-Verification (Background Polling)**:

```typescript
// Poll every 12 seconds (Shopify pattern)
const { data: domainStatus } = useCustomDomainQuery({
  variables: { id: result.domain.id },
  pollInterval: 12000, // 12 seconds
});

// When status changes from "pending" to "verified"
useEffect(() => {
  if (domainStatus?.status === 'verified') {
    // Stop polling
    // Show success message
  }
}, [domainStatus?.status]);
```

**Step 3a: Manual Verification (User Clicks "Check now")**

### **GraphQL Operation**:

```typescript
const [verifyDomain, { loading }] = useVerifyCustomDomainMutation();

const result = await verifyDomain({
  variables: { domainId: domain.id }
});
// Returns: {
//   success,
//   verified,
//   domain: { status, verified, verifiedAt },
//   message
// }
```

**Step 3b: Verification Success**

```
┌──────────────────────────────────────────────────┐
│ ✅ Domain verified!                             │
│──────────────────────────────────────────────────│
│                                                  │
│ mystore.com is now connected to your workspace. │
│                                                  │
│ 🔒 SSL certificate will be provisioned within   │
│    1 hour.                                       │
│                                                  │
│                                       [Done]     │
└──────────────────────────────────────────────────┘
```

**Step 3c: Verification Failed**

```
┌──────────────────────────────────────────────────┐
│ ⚠️  DNS not configured yet                      │
│──────────────────────────────────────────────────│
│                                                  │
│ We couldn't verify your domain yet.             │
│                                                  │
│ Please check:                                    │
│ • DNS records are correctly configured          │
│ • Changes have propagated (up to 48 hours)      │
│                                                  │
│ Status: Pending verification                     │
│                                                  │
│            [Check again]  [Close]                │
└──────────────────────────────────────────────────┘
```

### **UI Components**:
- **Warning Alert**: `<Alert variant="warning">`
- **Checklist**: `<ul>` with bullets
- **Status Badge**: `<Badge variant="secondary">`

---

## 🔄 Flow 5: Domains List (After Domains Added)

### **What User Sees**:

```
┌─────────────────────────────────────────────────────────────┐
│ Domains                                                      │
│─────────────────────────────────────────────────────────────│
│                                                              │
│ SUBDOMAIN                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ mystore.huzilerz.com                     [Change]       │ │
│ │ Your free subdomain                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ CUSTOM DOMAINS                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ mystore.com                              🟢 Active      │ │
│ │ SSL: ✅  Expires: Jan 15, 2026                          │ │
│ │ Purchased • Renew in 345 days                           │ │
│ │                                           [Renew now]   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ shop.example.com                         🟡 Pending     │ │
│ │ Waiting for DNS verification                            │ │
│ │ Connected • [View DNS instructions]                     │ │
│ │                                           [Verify now]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Add domain]                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **UI Components**:
- **Domain Cards**: `<Card>` per domain
- **Status Badges**:
  - Active: `<Badge variant="success">` (green)
  - Pending: `<Badge variant="warning">` (yellow)
  - Failed: `<Badge variant="destructive">` (red)
- **Icons**: SSL checkmark, expiry calendar
- **Actions**: `<Button variant="outline" size="sm">`

### **Domain Card Details**:

Each domain card shows:
- **Domain name** (bold, large)
- **Status indicator** (colored dot + text)
- **SSL status** (✅ or pending)
- **Expiry date** (if purchased)
- **Source** ("Purchased" or "Connected")
- **Action button** (Renew, Verify, etc.)

---

## 🔔 Flow 6: Renew Expiring Domain

### **Trigger**: Domain expires in ≤ 30 days

### **What User Sees**:

Domain card shows warning:

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  mystore.com                          🟡 Expiring    │
│ SSL: ✅  Expires: Dec 28, 2024 (in 15 days)             │
│ Purchased • Action required                             │
│                                           [Renew now]   │
└─────────────────────────────────────────────────────────┘
```

### **UI Components**:
- **Warning Badge**: `<Badge variant="warning">`
- **Alert Border**: Orange/yellow border on card
- **Renew Button**: `<Button variant="default">` (prominent)

### **User Clicks "Renew now"**

**Step 1: Renewal Modal**

```
┌──────────────────────────────────────────────────┐
│ Renew domain                                [X]  │
│──────────────────────────────────────────────────│
│                                                  │
│ Domain: mystore.com                              │
│ Current expiry: Dec 28, 2024                     │
│                                                  │
│ Renewal period                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ ● 1 year     15,000 FCFA                     │ │
│ │ ○ 2 years    30,000 FCFA                     │ │
│ │ ○ 5 years    75,000 FCFA                     │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ New expiry: Dec 28, 2025                         │
│                                                  │
│                  [Cancel]  [Continue to payment] │
└──────────────────────────────────────────────────┘
```

### **GraphQL Operation**:

```typescript
const [renewDomain, { loading }] = useRenewDomainMutation();

const result = await renewDomain({
  variables: {
    domainId: domain.id,
    renewalPeriodYears: 1
  }
});
// Returns: {
//   success,
//   renewal: { id, domainName, renewalPriceFcfa, renewalStatus },
//   paymentInstructions,
//   message
// }
```

**Step 2-4: Same as purchase flow**
- Payment instructions
- Poll renewal status
- Success message

---

## 📊 Data Flow Summary

### **On Page Load**:
```typescript
// 1. Get subdomain info
useWorkspaceInfrastructureQuery({ workspaceId })

// 2. Get all domains
useWorkspaceDomainsQuery({ workspaceId })
```

### **During Domain Verification (Polling)**:
```typescript
// Poll every 12 seconds
useCustomDomainQuery({ id, pollInterval: 12000 })
```

### **During Purchase (Polling)**:
```typescript
// Poll every 5 seconds
useDomainPurchaseStatusQuery({ purchaseId, pollInterval: 5000 })
```

### **During Renewal (Polling)**:
```typescript
// Poll every 5 seconds
useDomainRenewalStatusQuery({ renewalId, pollInterval: 5000 })
```

---

## 🎨 Shadcn/UI Component Mapping

| **UI Element** | **Shadcn Component** |
|----------------|---------------------|
| Page container | `<Card>` |
| Section headers | `<h3>` + Tailwind |
| Subdomain display | `<Card>` + `<Badge>` |
| Empty state | `<div>` with icon |
| Buttons | `<Button>` (variants: default, outline, ghost) |
| Modals/Dialogs | `<Dialog>` + `<DialogContent>` |
| Text inputs | `<Input>` |
| Form labels | `<Label>` |
| Radio groups | `<RadioGroup>` + `<RadioGroupItem>` |
| Status badges | `<Badge>` (variants: success, warning, destructive) |
| Alerts/Messages | `<Alert>` (variants: default, destructive, warning) |
| Loading states | `<Spinner>` (custom or from lucide-react) |
| Copy buttons | `<Button>` + clipboard API |
| Toast notifications | `<Toast>` / `<Sonner>` |
| Tables/Lists | `<Card>` with dividers |

---

## 🔄 State Management Notes

### **Local State** (per component):
- Modal open/close
- Form input values
- Loading states

### **Server State** (via React Query):
- Workspace infrastructure
- Domain list
- Purchase/renewal status
- Domain verification status

### **Polling Strategy**:
- Domain verification: 12 seconds (Shopify pattern)
- Payment status: 5 seconds (faster for better UX)
- Stop polling when status changes to final state

---

## 🚀 Implementation Order

1. **Phase 1**: Basic domain list + subdomain change
   - `workspaceInfrastructure` query
   - `workspaceDomains` query
   - `changeSubdomain` mutation
   - `subdomainSuggestions` query

2. **Phase 2**: Connect existing domain
   - `connectCustomDomain` mutation
   - `customDomain` query (for polling)
   - `verifyCustomDomain` mutation
   - DNS instructions UI

3. **Phase 3**: Buy new domain
   - `searchDomain` mutation
   - `purchaseDomain` mutation
   - `domainPurchaseStatus` query (for polling)
   - Payment flow UI

4. **Phase 4**: Domain renewal
   - `renewDomain` mutation
   - `domainRenewalStatus` query (for polling)
   - Expiry warnings UI

---

**Built for**: Cameroon market with mobile money payments
**Pattern**: Shopify-style domain management UX
**Tech Stack**: React + shadcn/ui + React Query + GraphQL Code Generator
