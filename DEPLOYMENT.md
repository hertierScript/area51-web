# Deployment Instructions for Area 51 Web App

## Environment Variables

Make sure the following environment variables are set in your deployment platform (Vercel, Netlify, etc.):

### Required Variables (Web App & Admin Dashboard)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://phyyvuvuobqnolgfmxqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoeXl2dXZ1b2Jxbm9sZ2ZteHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzUyNTUsImV4cCI6MjA4NjMxMTI1NX0.DEp1fU-_9_9qkdBfqQNKPEoO2vVKDVp4qM-c1qPRulk
```

### Required for Admin Dashboard Only

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoeXl2dXZ1b2Jxbm9sZ2ZteHFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczNTI1NSwiZXhwIjoyMDg2MzExMjU1fQ.BPnP0E29SklXeNwiXuSGN6GsDjjICut4ncqh0b7quAs
```

### Optional Variables

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCVa3bDTN02rbw5aIdBntj_Af0YDxu0lmE
DATABASE_URL=postgresql://postgres:#Kigali@Rwanda1@db.phyyvuvuobqnolgfmxqp.supabase.co:5432/postgres
```

## Deployment Steps

### 1. Vercel Deployment

1. Connect your repository to Vercel
2. Set the environment variables in the Vercel dashboard
3. Deploy the project

### 2. Netlify Deployment

1. Connect your repository to Netlify
2. Set the environment variables in the Netlify dashboard
3. Deploy the project

### 3. Manual Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Troubleshooting

### Issue: "No featured dishes available at the moment"

This usually means the API is not fetching data correctly. Check:

1. **Environment Variables**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
2. **Supabase RLS Policies**: Ensure the `categories` and `menu_items` tables have public read access
3. **Database Data**: Ensure there are active categories and available menu items in the database
4. **Console Logs**: Check the browser console for error messages

### Issue: "Invalid API key" Error

If you see this error in the browser console:

```
Error fetching featured items: {details: "Invalid API key", error: "Failed to fetch categories", status: 500}
```

**Solution:**

1. Go to your deployment platform (Vercel, Netlify, etc.)
2. Navigate to the environment variables section
3. Verify that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
4. **Important**: Make sure there are no extra spaces or line breaks in the key
5. The key should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
6. After updating, redeploy the application

**Common Causes:**

- Missing environment variable
- Incorrect API key (typo or wrong key)
- Using the service role key instead of the anon key
- Extra whitespace in the environment variable value

### Verifying the API

You can test the API endpoint directly:

```bash
curl https://your-domain.com/api/menu
```

This should return JSON with `categories` and `menuItems` arrays.

### Checking Supabase Connection

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Verify the URL and anon key match your environment variables
4. Check the RLS policies in the Table Editor

## Database Requirements

Ensure your Supabase database has:

1. At least one active category (`is_active = true`)
2. At least one available menu item (`is_available = true`)
3. Proper RLS policies allowing public read access

## Support

If you continue to experience issues, check the deployment logs for error messages.
