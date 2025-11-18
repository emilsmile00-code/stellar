# 🎯 Affiliate Tracking & Fraud Detection System

## Overview
Comprehensive conversion tracking, payment verification, and fraud detection system for your affiliate platform.

## 🚀 Setup Instructions

### 1. Database Setup (Already Done ✅)
The following tables have been created:
- `conversions` - Tracks all user conversions
- `payout_requests` - User payout requests
- `network_postbacks` - Postback data from networks
- `fraud_rules` - Fraud detection rules
- `user_traffic_logs` - User activity logs
- `user_balances` - User balance tracking
- `admin_users` - Admin access control

### 2. Include Tracking Script
Add this to your `index.html` BEFORE the closing `</body>` tag:

```html
<script src="js/tracking.js"></script>
```

### 3. Update Your Offer Click Functions

**Replace your existing click handlers with:**

```javascript
// For OGAds offers
onclick="trackAndOpenOGAdsOffer('${offer.id}', '${offer.link}', ${JSON.stringify(offer)})"

// For CPAlead offers
onclick="trackAndOpenCPAleadOffer('${offer.id}', '${offer.link}', ${JSON.stringify(offer)})"

// For affiliate offers (TopOfferzz, etc.)
onclick="trackAndOpenAffiliateOffer('${offer.title}', '${offer.url}', ${JSON.stringify(offer)})"
```

### 4. Network Postback URLs

Configure these postback URLs in each network:

**OGAds:**
```
https://fxlopyzgygnwpxgfabsw.supabase.co/functions/v1/network-postback?network=ogads&offer_id={offer_id}&transaction_id={transaction_id}&amount={payout}&status={status}&aff_sub={aff_sub}&aff_click_id={aff_click_id}
```

**CPAlead:**
```
https://fxlopyzgygnwpxgfabsw.supabase.co/functions/v1/network-postback?network=cpalead&offer_id={offer_id}&transaction_id={transaction_id}&amount={payout}&subid={subid}
```

**TopOfferzz:**
```
https://fxlopyzgygnwpxgfabsw.supabase.co/functions/v1/network-postback?network=topofferzz&offer_id={o}&transaction_id={transaction_id}&amount={amount}&aff_click_id={aff_click_id}&sub_aff_id={sub_aff_id}
```

## 🔍 How It Works

### 1. User Clicks Offer
- System generates unique `click_id` and `sub_id`
- Records click in `conversions` table
- Logs traffic data (IP, device, fingerprint)
- Injects tracking IDs into affiliate URL

### 2. User Completes Offer
- Network sends postback to your endpoint
- System matches postback to conversion record
- Marks conversion as `network_paid = true`
- Moves amount from pending to available balance

### 3. Fraud Detection
Automatic checks:
- **IP Duplicate**: Max 5 conversions per IP in 24h
- **Velocity Check**: Max 10 conversions per hour
- **Device Fingerprint**: Max 3 conversions per device in 24h
- **User Agent**: Blocks bots and crawlers
- **Geographic Mismatch**: Flags location inconsistencies

### 4. User Requests Payout
- System checks available balance
- Creates payout request (status: pending)
- Admin reviews in admin panel

### 5. Admin Reviews Payout
- Views fraud check results
- Sees which conversions were paid by network
- Identifies suspicious activity
- Approves or rejects payout

## 👨‍💼 Admin Panel

Access: `https://yourdomain.com/admin.html`

### Creating Admin Users
Run this SQL in your Lovable Cloud dashboard:

```sql
INSERT INTO admin_users (user_id, role, permissions)
VALUES (
    'USER_UUID_HERE',
    'admin',
    '["view_payouts", "approve_payouts", "view_conversions"]'::jsonb
);
```

Get user UUID from the `auth.users` table after they sign up.

## 📊 Key Features

### ✅ Conversion Tracking
- Click tracking with unique IDs
- Network payment confirmation
- Transaction matching
- Status management (pending/completed/reversed)

### ✅ Fraud Prevention
- Real-time fraud scoring
- Multiple detection rules
- Automatic flagging
- Manual review support

### ✅ Payment Verification
- Track which conversions networks paid for
- Only pay users for verified conversions
- Pending vs available balance system
- Automatic balance updates on postback

### ✅ Admin Tools
- Payout review dashboard
- Fraud analysis per user
- Conversion history
- Traffic pattern analysis

## 🔐 Security Notes

1. **Admin Access**: Only users in `admin_users` table can review payouts
2. **User Data**: RLS policies prevent users from seeing others' data
3. **Postback Endpoint**: Public but logs all attempts
4. **Balance Updates**: Only via edge functions with validation

## 📱 User Flow Example

1. User logs in → Sees offers
2. Clicks offer → Tracking script activates
3. Completes offer → Network sends postback
4. Balance updated → User sees "Pending" → "Available"
5. Requests payout → Admin reviews → Approved/Rejected
6. If approved → User receives payment

## 🛠️ Testing

1. **Create test admin**: Add your user to `admin_users` table
2. **Test conversion**: Click an offer while logged in
3. **Simulate postback**: Call postback URL manually with test data
4. **Review payout**: Access admin panel and test approval flow

## 📈 Monitoring

Check these regularly:
- Unmatched postbacks in `network_postbacks` where `processed = false`
- High fraud scores in `conversions`
- Pending payouts in `payout_requests`
- Balance discrepancies

## 🆘 Support

If conversions aren't tracking:
1. Check browser console for errors
2. Verify user is logged in
3. Confirm tracking.js is loaded
4. Check network tab for API calls

If postbacks aren't matching:
1. Verify transaction IDs match
2. Check postback URL format
3. Review `network_postbacks` table for processing notes

---

**System Status**: ✅ Fully Operational
**Last Updated**: Today
