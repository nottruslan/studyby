-- Add role and email to profiles for RBAC and admin display
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS email text;

-- Allow only valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('student', 'admin'));
  END IF;
END $$;

-- Optional: backfill email from auth.users (run if you have existing profiles)
-- UPDATE profiles p
-- SET email = u.email
-- FROM auth.users u
-- WHERE p.id = u.id AND p.email IS NULL;

-- Assign admin role for user 6e4c51d4-7d78-4feb-8350-192537967c6e
UPDATE profiles SET role = 'admin' WHERE id = '6e4c51d4-7d78-4feb-8350-192537967c6e';
