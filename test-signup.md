# Vamaship Signup Flow Test Guide

## Overview
This document provides testing instructions for the multi-step signup flow implementation.

## Test Environment
- **URL**: http://localhost:5173
- **Node.js Version**: 14.20.1 (compatible)
- **Framework**: Vue 3 + TypeScript + Vite 4

## Test Steps

### Step 1: Phone Verification
1. Open http://localhost:5173
2. You should see the signup form with progress steps (1/3)
3. **Auto-fill**: Phone number should be pre-filled with "9876543210"
4. Click "Send OTP"
5. OTP input fields should appear
6. **Demo OTP**: Enter "1234" in the OTP fields
7. Click "Verify & Continue"
8. Should proceed to Step 2

### Step 2: User Details
1. **Auto-fill**: Form should be pre-filled with demo data:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Brand Name: "Demo Brand"
   - Password: "password123"
   - Confirm Password: "password123"
2. Click "Continue"
3. Should proceed to Step 3

### Step 3: KYC Verification
1. **Auto-fill**: KYC form should be pre-filled:
   - Aadhaar Number: "123456789012"
   - Business Type: "GST Registered" (selected)
   - GST Number: "22AAAAA0000A1Z5"
   - Branch Name: "Main Branch"
   - Address: "123 Demo Street, Demo City"
   - Pincode: "123456"
2. Click "Send OTP" for Aadhaar verification
3. **Demo Aadhaar OTP**: Enter "123456" in the 6-digit OTP fields
4. Click "Verify"
5. Should show "✅ Aadhaar Verified"
6. Click "Complete Setup"
7. Should redirect to dashboard

### Alternative: Skip KYC
1. Instead of completing KYC, click "Skip for now"
2. Should redirect to dashboard with KYC warning banner

## Dashboard Verification
1. After signup completion, should see dashboard with:
   - Welcome message
   - User data loaded from localStorage
   - Quick action cards
   - Recent activity section

## Demo Credentials
- **Phone OTP**: 1234
- **Aadhaar OTP**: 123456
- **Auto-fill**: All forms are pre-populated for testing

## Expected Behavior
- Smooth transitions between steps
- Form validation with error messages
- Auto-focus on OTP input fields
- Responsive design
- Local storage persistence
- Proper routing to dashboard

## Troubleshooting
- If server doesn't start, check Node.js version (should be 14+)
- If OTP doesn't work, ensure you're using the demo credentials
- If styles don't load, check Font Awesome CDN connection
- If routing fails, check browser console for errors

## Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Performance
- Fast loading with Vite
- Hot module replacement for development
- Optimized bundle for production 