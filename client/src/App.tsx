import { Routes, Route, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900">
      <Activity className="h-12 w-12 text-indigo-600" />
      <h1 className="text-3xl font-bold">Market Intel</h1>
      <p className="text-slate-600">Client skeleton is up and running.</p>
      <Link to="/about" className="text-indigo-600 underline">
        About
      </Link>
    </div>
  );
}

function About() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900">
      <h1 className="text-2xl font-semibold">About</h1>
      <Link to="/" className="text-indigo-600 underline">
        Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
