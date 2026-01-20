import { RequireAuth } from '@/shared/lib/auth';


import { HomePage } from "@/views/home";

export default function Home() {
  return  <RequireAuth roles={[
    'CLIENT','LAWYER'
  ]}><HomePage /></RequireAuth>;
}