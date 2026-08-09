-- Contact form submissions
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
-- The public site form submits with the publishable key (anon role) under RLS.
GRANT INSERT ON public.contacts TO anon;
GRANT SELECT, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message" ON public.contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read contacts" ON public.contacts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contacts" ON public.contacts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
