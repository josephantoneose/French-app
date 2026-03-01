# Database Setup Guide (Cloud Sync)

To enable syncing content between your laptop and mobile, you need a free database.
We will use **Supabase** (it is free, fast, and easy).

## 1. Create a Project
1.  Go to [supabase.com](https://supabase.com) and click **"Start your project"**.
2.  Sign in with GitHub.
3.  Click **"New Project"**.
4.  Choose a name (e.g., `french-app`) and a region close to you.
5.  Set a password and click **"Create new project"**.
6.  Wait ~30 seconds for it to setup.

## 2. Get your Keys
1.  Once the project dashboard loads, go to **Settings** (Gear icon) -> **API**.
2.  Find the `Project URL` and copy it.
3.  Find the `Project API keys` -> `anon` / `public` key and copy it.

## 3. Create the Database Table
1.  Go to the **SQL Editor** (icon on the left).
2.  Paste this SQL code and run it (click "Run"):

```sql
create table app_data (
  id bigint primary key,
  categories jsonb
);

-- Allow anyone to read/write (since we have no login)
alter table app_data enable row level security;

create policy "Enable access for all users"
on app_data
for all
using (true)
with check (true);

-- Create the initial row
insert into app_data (id, categories)
values (1, null);
```

## 4. Connect your App

### For Local Development:
Create a file named `.env` in your project root and paste this:
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
(Restart your development server `npm run dev` to apply).

### For GitHub Pages (Production):
1.  The app needs these keys built-in.
2.  Create a file named `.env.production` in your project root.
3.  Paste the same keys there.
4.  Run `npm run deploy`.
