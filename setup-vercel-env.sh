#!/bin/bash

# Setup Vercel Environment Variables
# This script sets up all required environment variables for the Fastbreak app

echo "🚀 Setting up Vercel environment variables..."

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://eyoigxxdcbvncxfihxqd.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://eyoigxxdcbvncxfihxqd.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://eyoigxxdcbvncxfihxqd.supabase.co"

vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production <<< "sb_publishable_UiT3-MIR2V9X_2XQbgO8Fw_VhkJtQi6"
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY preview <<< "sb_publishable_UiT3-MIR2V9X_2XQbgO8Fw_VhkJtQi6"
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY development <<< "sb_publishable_UiT3-MIR2V9X_2XQbgO8Fw_VhkJtQi6"

echo ""
echo "⚠️  IMPORTANT: You need to manually add the DATABASE_URL"
echo "Run this command with your actual DATABASE_URL:"
echo ""
echo "vercel env add DATABASE_URL production"
echo ""
echo "Then paste your DATABASE_URL when prompted"
echo "(Use the connection pooler URL from Supabase for best results)"
echo ""
echo "✅ Supabase public keys added successfully!"
echo "🔄 Redeploy your app after adding DATABASE_URL: vercel --prod"
