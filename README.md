# Vamaship Accounts UI Migration

A Vue 3 + TypeScript implementation of the Vamaship signup flow with multi-step authentication and KYC verification.

## Features

### Multi-Step Signup Flow
1. **Phone Verification**: Enter phone number and verify with OTP
2. **User Details**: Complete profile information (name, email, password)
3. **KYC Verification**: Business verification with Aadhaar and GST/PAN details

### Key Components
- **SignUp.vue**: Main signup component with 3-step flow
- **Dashboard.vue**: Post-signup dashboard with welcome message
- **VamashipLogo.vue**: Brand logo component

### Demo Features
- Auto-fill demo data for testing
- Mock OTP verification (use "1234" for phone OTP, "123456" for Aadhaar OTP)
- Local storage for user data persistence
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

## Usage

### Testing the Signup Flow
1. **Step 1**: Enter phone number (demo: 9876543210) and verify with OTP (1234)
2. **Step 2**: Fill in user details (auto-filled for demo)
3. **Step 3**: Complete KYC verification (optional - can be skipped)

### Demo Credentials
- **Phone OTP**: 1234
- **Aadhaar OTP**: 123456
- **Auto-fill**: Data is automatically populated for testing

## Project Structure

```
src/
├── SignUp.vue          # Main signup component
├── Dashboard.vue       # Post-signup dashboard
├── SignIn.vue          # Sign in component
├── ForgotPassword.vue  # Password recovery
├── components/
│   └── VamashipLogo.vue
├── router.ts           # Vue Router configuration
└── main.ts            # Application entry point
```

## Technologies Used

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vue Router** for navigation
- **Tailwind CSS** for styling
- **Font Awesome** for icons
- **Vite** for build tooling

## Customization

### Styling
The application uses Tailwind CSS with custom purple theme colors matching the Vamaship brand.

### Form Validation
All forms include client-side validation with error messages and visual feedback.

### API Integration
The current implementation uses mock data. Replace the mock functions with actual API calls for production use.

## License

This project is part of the Vamaship accounts UI migration.
