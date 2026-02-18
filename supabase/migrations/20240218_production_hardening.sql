-- MediMap Production Hardening & RLS Policies
-- Date: 2024-02-18

-- 1. Enable RLS on all core tables
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- 2. Nodes & Edges (Public Read Access)
CREATE POLICY "Public Read Nodes" ON public.nodes FOR SELECT USING (true);
CREATE POLICY "Public Read Edges" ON public.edges FOR SELECT USING (true);
CREATE POLICY "Public Read Hospitals" ON public.hospitals FOR SELECT USING (true);

-- 3. Department Metrics (Auth Read, Admin Write)
CREATE POLICY "Authenticated Read Metrics" 
ON public.department_metrics FOR SELECT 
TO authenticated 
USING (true);

-- Create a profiles table if it doesn't exist to handle roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Service Role Update Metrics" 
ON public.department_metrics FOR ALL 
TO service_role 
USING (true);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_metrics_node_id ON public.department_metrics(node_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_target ON public.edges(source_id, target_id);
CREATE INDEX IF NOT EXISTS idx_nodes_hospital_id ON public.nodes(hospital_id);

-- 5. Realtime Publication
-- Ensure department_metrics is in the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.department_metrics;
