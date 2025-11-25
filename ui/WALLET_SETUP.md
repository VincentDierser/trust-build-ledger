# Wallet Integration Setup

## Current Status
The app is running with a **simulated wallet connection** for demonstration purposes.

## To Enable Real Rainbow Wallet Connection

1. Get a WalletConnect Project ID from https://cloud.walletconnect.com/
2. Update `src/config/wagmi.ts` with your Project ID
3. In `src/App.tsx`, change `USE_WALLET = false` to `USE_WALLET = true`

## Features Available
✅ Project timeline board with encryption indicators
✅ Budget and material tracking with lock icons
✅ Milestone update functionality
✅ Responsive design with tabs for project filtering
✅ Professional construction theme (blueprint blue + security teal)
✅ All UI components fully functional

## How to Connect Wallet (Once Enabled)
1. Click "Connect Wallet" button in header
2. Choose Rainbow Wallet or any supported wallet
3. Confirm connection
4. Start creating and managing projects!

The simulated version demonstrates all features without requiring wallet setup.
