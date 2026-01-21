'use client';
import { withAuthProtection } from "@/shared/HOC/withAuth";


import { HomePage } from "@/views/home";

const Home = () => {
  return <HomePage />;
};

export default withAuthProtection(Home);