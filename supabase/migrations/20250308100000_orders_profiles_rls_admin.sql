-- Allow admins to read all orders (for /admin/orders page using session client)
CREATE POLICY "Admins can read all orders"
  ON public.orders
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to read all profiles (for displaying student names/emails in admin)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
