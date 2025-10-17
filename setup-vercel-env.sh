#!/bin/bash

# Setup Vercel Environment Variables
# This script sets up all required environment variables for the Fastbreak app

echo "🚀 Setting up Vercel environment variables..."

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://eyoigxxdcbvncxfihxqd.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://eyoigxxdcbvncxfihxqd.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://eyoigxxdcbvncxfihxqd.supabase.co"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b2lneHhkY2J2bmN4ZmloeHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODEzMTQsImV4cCI6MjA3NjI1NzMxNH0.RkQJESLNDOSjbwlksI8P-odntPEf-i9O46p2F1f10-4"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b2lneHhkY2J2bmN4ZmloeHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODEzMTQsImV4cCI6MjA3NjI1NzMxNH0.RkQJESLNDOSjbwlksI8P-odntPEf-i9O46p2F1f10-4"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b2lneHhkY2J2bmN4ZmloeHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODEzMTQsImV4cCI6MjA3NjI1NzMxNH0.RkQJESLNDOSjbwlksI8P-odntPEf-i9O46p2F1f10-4"

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
