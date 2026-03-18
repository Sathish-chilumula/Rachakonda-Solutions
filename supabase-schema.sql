-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'sales' CHECK (role IN ('admin', 'manager', 'sales')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create LEADS table (Finance)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  loan_type TEXT,
  amount NUMERIC,
  income NUMERIC,
  employment_type TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'converted', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('hot', 'medium', 'cold')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  remarks TEXT,
  internal_notes TEXT,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create ENROLLMENTS table (Education)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('training', 'crash course', 'tutorial', 'Computer Training')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'enrolled', 'rejected')),
  source TEXT DEFAULT 'education_website',
  remarks TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create AUDIT_LOGS table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'lead', 'enrollment', 'profile'
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for PROFILES
DROP POLICY IF EXISTS "Enable public select for profiles" ON public.profiles;
CREATE POLICY "Enable public select for profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 7. Create RLS Policies for LEADS (Finance)
DROP POLICY IF EXISTS "Full access for admins" ON public.leads;
CREATE POLICY "Full access for admins" 
ON public.leads FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

DROP POLICY IF EXISTS "Department access for managers" ON public.leads;
CREATE POLICY "Department access for managers" 
ON public.leads FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager' );

DROP POLICY IF EXISTS "Allow authenticated users to view all leads" ON public.leads;
CREATE POLICY "Allow authenticated users to view all leads" 
ON public.leads FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Sales users update assigned leads" ON public.leads;
CREATE POLICY "Sales users update assigned leads" 
ON public.leads FOR UPDATE 
USING (assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.leads;
CREATE POLICY "Enable insert for anonymous users" ON public.leads FOR INSERT WITH CHECK (true);

-- 8. Create RLS Policies for ENROLLMENTS (Education)
DROP POLICY IF EXISTS "Full access for admins" ON public.enrollments;
CREATE POLICY "Full access for admins" 
ON public.enrollments FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.enrollments;
CREATE POLICY "Enable insert for anonymous users" ON public.enrollments FOR INSERT WITH CHECK (true);

-- 9. Create RLS Policies for AUDIT_LOGS
DROP POLICY IF EXISTS "Admins view all logs" ON public.audit_logs;
CREATE POLICY "Admins view all logs" ON public.audit_logs FOR SELECT USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 10. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'sales');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
