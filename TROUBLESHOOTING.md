# Troubleshooting Guide

## Database Connection Issues

### EHOSTUNREACH IPv6 Error

**Error Message:**
```
connect EHOSTUNREACH 2600:1f16:1cd0:3308:3b8e:2f65:7cdd:275b:5432
```

**Problem:** The database is trying to connect via IPv6, but the IPv6 address is not reachable from your deployment environment.

**Solution:**

1. **Use Supabase Connection Pooler (Recommended)**

   In your Supabase Dashboard:
   - Go to **Project Settings** → **Database** → **Connection string**
   - Select **Connection pooling** mode
   - Use **Session mode** for better compatibility
   - Copy the connection string with pooler (uses port 6543 by default)

   Example:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

2. **Use Direct Connection with IPv4**

   If using direct connection, ensure you're using an IPv4 address or hostname that resolves to IPv4:
   - Check your DATABASE_URL in Vercel environment variables
   - Make sure it uses a hostname that resolves to IPv4

3. **Add Connection Parameters**

   Add these parameters to your DATABASE_URL:
   ```
   ?sslmode=require&connect_timeout=10
   ```

   Full example:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
   ```

4. **Vercel-Specific Fix**

   In your Vercel project settings:
   - Go to **Settings** → **Environment Variables**
   - Update your DATABASE_URL
   - Redeploy your application

### Testing Database Connection

To test if your database connection works:

```bash
# Install PostgreSQL client
npm install -g pg

# Test connection (replace with your DATABASE_URL)
psql "postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres"
```

### Common Issues

1. **Wrong Port:**
   - Direct connection: Port `5432`
   - Connection pooler: Port `6543` (or `5432` for transaction mode)

2. **Missing SSL Mode:**
   - Always add `?sslmode=require` for Supabase connections

3. **Firewall Issues:**
   - Ensure your deployment platform can reach Supabase (most platforms support this by default)

4. **Connection Timeout:**
   - Increase timeout if your connection is slow
   - Add `connect_timeout=15` to connection string

## Import Events Not Working

If you can't import events from the Discover page:

1. **Check Database Connection** (see above)
2. **Check Environment Variables:**
   - Ensure DATABASE_URL is set in your deployment
   - Verify Supabase credentials are correct
3. **Check Logs:**
   - View deployment logs in Vercel
   - Look for specific error messages
4. **Check Authentication:**
   - Make sure you're logged in
   - Refresh your session if needed

## Getting Help

If you continue to experience issues:
1. Check the error logs in your deployment platform
2. Verify all environment variables are set correctly
3. Test the connection locally first
4. Check Supabase status page: https://status.supabase.com/
