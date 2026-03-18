-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'sales' CHECK (role IN ('admin', 'sales')),
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
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  remarks TEXT,
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
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  source TEXT DEFAULT 'education_website',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW Level SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 6. Create RLS Policies for LEADS (Finance)
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;
CREATE POLICY "Admins can manage all leads" 
ON public.leads FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Sales users view assigned leads" ON public.leads;
CREATE POLICY "Sales users view assigned leads" 
ON public.leads FOR SELECT 
USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "Sales users update assigned leads" ON public.leads;
CREATE POLICY "Sales users update assigned leads" 
ON public.leads FOR UPDATE 
USING (assigned_to = auth.uid());

-- Allow public inserts for website forms
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.leads;
CREATE POLICY "Enable insert for anonymous users" ON public.leads FOR INSERT WITH CHECK (true);

-- 7. Create RLS Policies for ENROLLMENTS (Education)
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.enrollments;
CREATE POLICY "Admins can manage all enrollments" 
ON public.enrollments FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow public inserts for website forms
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.enrollments;
CREATE POLICY "Enable insert for anonymous users" ON public.enrollments FOR INSERT WITH CHECK (true);

-- 8. Trigger to create profile on signup
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

-- 9. Trigger to update updated_at
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
