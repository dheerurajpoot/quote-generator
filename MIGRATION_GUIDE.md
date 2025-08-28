# Model Consolidation Migration Guide

## Overview

This document outlines the consolidation of the `PendingPayment` and `Subscription` models into a single unified `Subscription` model, along with enhanced transaction tracking.

## Changes Made

### 1. Unified Subscription Model (`src/models/subscription.model.ts`)

-   **Consolidated Fields**: Combined all fields from both `PendingPayment` and `Subscription` models
-   **Enhanced Status**: Added `rejected` status for better payment flow management
-   **Payment Tracking**: Includes UPI-specific fields (`upiId`, `transactionId`)
-   **Admin Verification**: Added admin verification fields (`adminNotes`, `verifiedBy`, `verifiedAt`)
-   **Improved Indexing**: Better database performance with optimized indexes

#### Key Fields:

```typescript
interface ISubscription {
	// Core subscription fields
	userId: ObjectId;
	planId: string;
	planName: string;
	tier: "free" | "premium";
	status: "pending" | "active" | "canceled" | "expired" | "rejected";

	// Payment fields
	transactionId?: string;
	upiId?: string;
	paymentMethod: string;
	amount: number;
	billingCycle: "monthly" | "annually";

	// Admin verification
	adminNotes?: string;
	verifiedBy?: ObjectId;
	verifiedAt?: Date;

	// Subscription details
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	planDuration: string;
	autoRenew: boolean;
}
```

### 2. Enhanced Transaction Model (`src/models/transaction.model.ts`)

-   **UPI Support**: Added UPI-specific fields (`upiId`, `transactionId`)
-   **Billing Cycle**: Added billing cycle tracking
-   **Admin Fields**: Added admin verification fields for better audit trail
-   **Improved Indexing**: Better query performance

#### Key Fields:

```typescript
interface ITransaction {
	userId: ObjectId;
	subscriptionId: ObjectId;
	amount: number;
	currency: string;
	status: "pending" | "success" | "failed" | "cancelled" | "rejected";
	paymentMethod: "UPI" | "cashfree" | "other";

	// UPI fields
	upiId?: string;
	transactionId?: string;

	// Enhanced details
	billingCycle: "monthly" | "annually";
	adminNotes?: string;
	verifiedBy?: ObjectId;
	verifiedAt?: Date;
}
```

### 3. Updated API Routes

#### Verify Payment Route (`/api/admin/verify-payment`)

-   **Unified Model**: Now uses single `Subscription` model for all operations
-   **Transaction Creation**: Automatically creates transaction records
-   **Better Flow**: Simplified approval/rejection process
-   **Data Consistency**: Ensures subscription and transaction data stay in sync

#### UPI Payment Route (`/api/subscriptions/upi-payment`)

-   **Direct Subscription Creation**: Creates pending subscriptions directly
-   **Transaction Tracking**: Creates transaction records for audit trail
-   **Simplified Flow**: No more separate pending payment model

#### Main Subscriptions Route (`/api/subscriptions`)

-   **Unified Queries**: All subscription queries now use single model
-   **Consistent Data**: Same data structure across all endpoints

## Migration Benefits

### 1. **Data Consistency**

-   Single source of truth for subscription data
-   Eliminates data synchronization issues between models
-   Consistent status tracking across the system

### 2. **Simplified Codebase**

-   Reduced model complexity
-   Easier to maintain and debug
-   Fewer database queries needed

### 3. **Better Transaction Tracking**

-   Every payment action creates a transaction record
-   Complete audit trail for all financial operations
-   Better reporting and analytics capabilities

### 4. **Improved Performance**

-   Optimized database indexes
-   Reduced join operations
-   Better query performance

## Usage Examples

### Creating a Pending Subscription (UPI Payment)

```typescript
const pendingSubscription = new Subscription({
	userId: user._id,
	planId: "premium_monthly",
	planName: "Premium Monthly",
	tier: "premium",
	status: "pending",
	amount: 999,
	billingCycle: "monthly",
	planDuration: "monthly",
	transactionId: "TXN123456",
	upiId: "user@upi",
	paymentMethod: "UPI",
	currentPeriodStart: new Date(),
	currentPeriodEnd: new Date(),
	autoRenew: true,
});

await pendingSubscription.save();
```

### Approving a Payment (Admin)

```typescript
// Update subscription status
pendingSubscription.status = "active";
pendingSubscription.verifiedBy = adminId;
pendingSubscription.verifiedAt = new Date();
pendingSubscription.currentPeriodStart = new Date();
pendingSubscription.currentPeriodEnd = calculateEndDate(billingCycle);

// Create transaction record
const transaction = new Transaction({
	userId: pendingSubscription.userId,
	subscriptionId: pendingSubscription._id,
	amount: pendingSubscription.amount,
	status: "success",
	paymentMethod: "UPI",
	// ... other fields
});

await Promise.all([pendingSubscription.save(), transaction.save()]);
```

### Querying Subscriptions

```typescript
// Get all pending payments for admin
const pendingPayments = await Subscription.find({ status: "pending" });

// Get user's active subscription
const activeSubscription = await Subscription.findOne({
	userId: user._id,
	status: "active",
});

// Get user's subscription history
const userSubscriptions = await Subscription.find({
	userId: user._id,
}).sort({ createdAt: -1 });
```

## Database Migration

### 1. **Backup Current Data**

```bash
# Export current data
mongodump --db your_database --collection pendingpayments
mongodump --db your_database --collection subscriptions
```

### 2. **Update Application Code**

-   Deploy the new unified models
-   Update all API routes to use new models
-   Test thoroughly in staging environment

### 3. **Data Migration Script** (Optional)

If you need to migrate existing data, create a migration script:

```typescript
// Migration script example
async function migrateData() {
	const pendingPayments = await PendingPayment.find({});

	for (const payment of pendingPayments) {
		const subscription = new Subscription({
			userId: payment.userId,
			planId: payment.planId,
			planName: payment.planName,
			tier: payment.planId === "free" ? "free" : "premium",
			status: payment.status === "verified" ? "active" : payment.status,
			amount: payment.amount,
			billingCycle: payment.billingCycle,
			planDuration: payment.billingCycle,
			transactionId: payment.transactionId,
			upiId: payment.upiId,
			paymentMethod: "UPI",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(),
			autoRenew: true,
			adminNotes: payment.adminNotes,
			verifiedBy: payment.verifiedBy,
			verifiedAt: payment.verifiedAt,
		});

		await subscription.save();
	}
}
```

## Testing Checklist

-   [ ] UPI payment submission creates pending subscription
-   [ ] Admin can approve/reject payments
-   [ ] Transaction records are created properly
-   [ ] Subscription status updates correctly
-   [ ] Existing functionality remains intact
-   [ ] Admin dashboard shows correct data
-   [ ] User subscription queries work properly

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting to previous model versions
2. Restoring from database backup
3. Updating API routes to use old models

## Support

For questions or issues with the migration:

1. Check the console logs for detailed error messages
2. Verify database connections and indexes
3. Test individual API endpoints
4. Review the transaction logs for data consistency
