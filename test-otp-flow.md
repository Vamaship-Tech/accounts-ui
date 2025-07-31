# OTP Flow Testing Guide

## Backend Status ✅
- Laravel backend is running on `http://localhost:8001`
- Public OTP endpoints are working:
  - `POST /api/v1/send-verification/mobile/public`
  - `POST /api/v1/verify/mobile/public`
  - `POST /api/v1/send-verification/aadhaar/public`
  - `POST /api/v1/verify/aadhaar/public`
- Mock SMS service is active and logging OTPs to Laravel logs

## Frontend Status ✅
- Vue.js frontend is running on `http://localhost:3002`
- API service is configured to use public endpoints
- Authentication headers are not sent for public endpoints
- Aadhaar verification shows success indicator (✅) after completion

## Testing Steps

### 1. Test Backend API Directly

#### Mobile OTP Testing:
```bash
# Send OTP
curl -X POST http://localhost:8001/api/v1/send-verification/mobile/public \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Check Laravel logs for OTP
docker exec accounts-fpm tail -f /usr/share/nginx/html/storage/logs/laravel.log

# Verify OTP (replace XXXXXX with actual OTP from logs)
curl -X POST http://localhost:8001/api/v1/verify/mobile/public \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "XXXXXX"}'
```

#### Aadhaar OTP Testing:
```bash
# Send Aadhaar OTP
curl -X POST http://localhost:8001/api/v1/send-verification/aadhaar/public \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_number": "111111111111"}'

# Check Laravel logs for Aadhaar OTP
docker exec accounts-fpm tail -f /usr/share/nginx/html/storage/logs/laravel.log

# Verify Aadhaar OTP (replace XXXXXX with actual OTP from logs)
curl -X POST http://localhost:8001/api/v1/verify/aadhaar/public \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_number": "111111111111", "otp": "XXXXXX"}'
```

### 2. Test Frontend Integration
1. Open `http://localhost:3002` in browser
2. **Step 1 - Mobile Verification:**
   - Enter phone number: `9876543210`
   - Click "Send OTP"
   - Check browser console for success message
   - Check Laravel logs for actual OTP
   - Enter the OTP from logs in the frontend
   - Verify the OTP verification works and proceed to Step 2
3. **Step 2 - User Details:**
   - Fill in user details and proceed to Step 3
4. **Step 3 - KYC Verification:**
   - Click on "Aadhaar Verification" section
   - Enter Aadhaar number: `111111111111`
   - Click "Send Aadhaar OTP"
   - Check Laravel logs for actual Aadhaar OTP
   - Enter the Aadhaar OTP from logs
   - Verify Aadhaar verification works
   - **✅ Success Indicator**: You should see a green checkmark next to "Aadhaar Verification" and a success message

## Expected Results
- **Mobile OTP:**
  - Backend should return: `{"message": "SMS Verification sent", "user_id": X, "phone": "9876543210"}`
  - Laravel logs should show: `MOCK SMS: OTP XXXXXX sent to 9876543210`
- **Aadhaar OTP:**
  - Backend should return: `{"message": "Aadhaar OTP sent successfully", "aadhaar_number": "111111111111"}`
  - Laravel logs should show: `MOCK AADHAAR OTP: OTP XXXXXX sent for Aadhaar 111111111111`
  - After verification: `{"result": 1, "message": "Aadhaar verified successfully"}`
- Frontend should show success messages and allow OTP entry
- OTP verification should work for both mobile and Aadhaar
- **Aadhaar verification should show a green checkmark (✅) after successful verification**

## Troubleshooting
- If getting 401 errors, check that the frontend is using public endpoints
- If OTP verification fails, ensure you're using the exact OTP from Laravel logs
- Check browser console for any JavaScript errors
- Verify both backend (port 8001) and frontend (port 3002) are running
- For Aadhaar verification, ensure the Aadhaar number is exactly 12 digits
- After Aadhaar verification, you should see a green checkmark indicator - this means the verification is complete locally and won't try to call authenticated endpoints 