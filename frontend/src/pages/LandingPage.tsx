import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  Navigation,
  Wrench,
  ArrowRight,
  Menu,
  X,
  BarChart3,
  CheckCircle2,
  Users,
  Building2,
  MapPin,
  Clock,
  Compass
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"manager" | "driver" | "safety" | "finance">("manager");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const rolesData = {
    manager: {
      title: "Fleet Manager",
      tag: "Fleet Control Center",
      description: "Oversees complete fleet assets, maintenance lifecycles, and schedules. Can retire old assets and control workshop bookings.",
      features: [
        "Create and manage vehicles registry with load capacities",
        "Monitor fleet utilization and maintenance logs",
        "Move vehicles in and out of the maintenance workshop ('In Shop')"
      ],
      metrics: ["Fleet Utilization: 84%", "Vehicles in Workshop: 2", "Active Fleet: 48 Vehicles"],
      color: "bg-indigo-600"
    },
    driver: {
      title: "Dispatcher / Driver",
      tag: "Operational Execution",
      description: "Responsible for logging routes, weights, and completing dispatches. Can trigger trip milestones.",
      features: [
        "Create trip drafts and assign available vehicles and drivers",
        "Dispatch trips with auto-updating status transitions",
        "Record actual fuel consumption and final odometer on completion"
      ],
      metrics: ["Active Trips: 14", "Punctual Delivery: 98.4%", "Pending Trips: 6"],
      color: "bg-emerald-600"
    },
    safety: {
      title: "Safety Officer",
      tag: "Compliance & Safety",
      description: "Maintains driver safety benchmarks, manages license compliance, and restricts unauthorized personnel.",
      features: [
        "Audit license category compatibility",
        "Get instant alerts for drivers with expired licenses",
        "Audit safety scores and manage suspensions to prevent road risks"
      ],
      metrics: ["Avg Safety Score: 94.2", "Expired Licenses Blocked: 3", "Compliant Drivers: 100%"],
      color: "bg-amber-600"
    },
    finance: {
      title: "Financial Analyst",
      tag: "Cost Control & ROI",
      description: "Evaluates exact fuel spends, toll budgets, maintenance logs, and vehicle ROI to optimize margins.",
      features: [
        "Track fuel costs, refuel quantities, and toll expenses",
        "Review automatic cost calculations per vehicle",
        "Analyze exact ROI: (Revenue - Expenses) / Acquisition Cost"
      ],
      metrics: ["Avg Fuel Efficiency: 18.2 km/L", "Total Spend This Month: $12.4k", "Top ROI Asset: Van-05 (+42%)"],
      color: "bg-rose-600"
    }
  };

  const businessRules = [
    {
      title: "License Validity Check",
      desc: "Drivers with expired licenses or Suspended status cannot be assigned to trips.",
      type: "Driver Safety"
    },
    {
      title: "Atomic Dispatch Status",
      desc: "Dispatching a trip automatically moves both the vehicle and driver to 'On Trip' status in a single transaction.",
      type: "Concurrency"
    },
    {
      title: "Cargo Capacity Enforcement",
      desc: "Cargo weight must not exceed the maximum load capacity specified in the vehicle's registry.",
      type: "Safety Limit"
    },
    {
      title: "Workshop Lockout",
      desc: "Moving a vehicle to maintenance logs sets status to 'In Shop' and instantly hides it from dispatch options.",
      type: "Asset Guard"
    },
    {
      title: "Trip Restores Availability",
      desc: "Completing or cancelling a trip instantly restores the vehicle and driver back to 'Available'.",
      type: "Auto Transition"
    },
    {
      title: "No Double Booking",
      desc: "An active driver or vehicle on a trip cannot be selected or scheduled for any other parallel trips.",
      type: "Double Booking Guard"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white scroll-smooth">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-905">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection("hero")}>
              <div className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                TransitOps
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection("features")} className="text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollToSection("roles")} className="text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer">Solutions</button>
              <button onClick={() => scrollToSection("rules")} className="text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer">Business Rules</button>
              <button onClick={() => scrollToSection("demo")} className="text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer">Demo Flow</button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate("/login")} className="text-slate-300 hover:text-white text-sm font-medium transition-colors cursor-pointer">
                Log in
              </button>
              <button onClick={() => navigate("/login")} className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-650/20 transition-all hover:-translate-y-0.5 cursor-pointer">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-900 px-4 pt-2 pb-4 space-y-2">
            <button onClick={() => scrollToSection("features")} className="block w-full text-left px-3 py-2 text-slate-400 hover:text-white text-base font-medium rounded-md hover:bg-slate-900">Features</button>
            <button onClick={() => scrollToSection("roles")} className="block w-full text-left px-3 py-2 text-slate-400 hover:text-white text-base font-medium rounded-md hover:bg-slate-900">Solutions</button>
            <button onClick={() => scrollToSection("rules")} className="block w-full text-left px-3 py-2 text-slate-400 hover:text-white text-base font-medium rounded-md hover:bg-slate-900">Business Rules</button>
            <button onClick={() => scrollToSection("demo")} className="block w-full text-left px-3 py-2 text-slate-400 hover:text-white text-base font-medium rounded-md hover:bg-slate-900">Demo Flow</button>
            <div className="pt-4 border-t border-slate-900 flex flex-col space-y-2">
              <button onClick={() => navigate("/login")} className="w-full py-2 text-center text-slate-300 hover:text-white font-medium">Log in</button>
              <button onClick={() => navigate("/login")} className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-16 md:pb-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>Smart Transit. Seamless Operations.</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-white">
              All-in-One Platform <br />
              for Modern Transit <br />
              <span className="text-indigo-400">Management</span>
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">
              Optimize routes, manage fleets, track performance, and deliver exceptional passenger experiences. All from a single, intelligent platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 group transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-slate-900 text-slate-200 border border-slate-800 font-semibold rounded-lg transition-all cursor-pointer"
              >
                Book a Demo
              </button>
            </div>
            
            {/* Small badged sub-features */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-slate-900 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Data-Driven Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Secure & Scalable</span>
              </div>
            </div>
          </div>
          
          {/* Right Visual 3D Dashboard Mockup Column */}
          <div className="lg:col-span-6">
            <div className="border border-slate-900 bg-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl -z-10" />
              
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-900">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="text-[10px] text-slate-500 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-850">
                  transitops.io/dashboard/map
                </div>
                <div className="w-6" />
              </div>
              
              {/* Mockup Dashboard Content Grid */}
              <div className="grid grid-cols-12 gap-3 h-[320px]">
                
                {/* Mockup Sidebar */}
                <div className="col-span-3 border-r border-slate-900 pr-2 flex flex-col justify-between py-1">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5 px-1">
                      <Truck className="h-4 w-4 text-indigo-500" />
                      <span className="text-[10px] font-bold tracking-tight">TransitOps</span>
                    </div>
                    <div className="space-y-1">
                      {["Overview", "Live Map", "Fleet Registry", "Drivers Logs", "Workshops"].map((item, idx) => (
                        <div
                          key={idx}
                          className={`px-2 py-1 rounded-md text-[9px] font-medium flex items-center space-x-1 cursor-pointer ${
                            idx === 1 ? "bg-indigo-650 text-white" : "text-slate-500 hover:text-slate-350"
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${idx === 1 ? "bg-white" : "bg-transparent"}`} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-900/40 rounded-lg border border-slate-900/60">
                    <span className="text-[8px] text-slate-500 block">Fleet Manager</span>
                    <span className="text-[9px] font-bold text-slate-300 block leading-tight">Pravin Singh</span>
                  </div>
                </div>
                
                {/* Mockup Map Canvas & Stats */}
                <div className="col-span-9 flex flex-col justify-between">
                  {/* Fake map drawing area */}
                  <div className="flex-1 bg-slate-900/20 border border-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                    {/* Simulated Map Grid lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:14px_24px]" />
                    
                    {/* Route line 1 */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 50 Q 80 20, 150 70 T 260 40" fill="none" stroke="#312e81" strokeWidth="2" strokeDasharray="3 3" />
                      <path d="M50 140 Q 120 180, 200 120 T 320 150" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
                    </svg>
                    
                    {/* Nodes */}
                    <div className="absolute top-12 left-16 flex flex-col items-center">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500 drop-shadow-lg" />
                      <span className="text-[7px] text-slate-500 mt-0.5">Terminal A</span>
                    </div>
                    <div className="absolute bottom-16 right-20 flex flex-col items-center">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 drop-shadow-lg" />
                      <span className="text-[7px] text-slate-500 mt-0.5">Terminal B</span>
                    </div>
                    
                    {/* Active Bus Dot Indicator */}
                    <div className="absolute bottom-20 left-48 bg-indigo-500 border border-white p-1 rounded-full animate-bounce shadow-lg shadow-indigo-500/50">
                      <Truck className="h-2 w-2 text-white" />
                    </div>
                    
                    {/* Tiny widget inside map */}
                    <div className="absolute top-2 right-2 bg-slate-950/80 border border-slate-900 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[8px] text-slate-400">12 Active Vehicles</span>
                    </div>
                  </div>
                  
                  {/* Mini Stats row */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-2">
                      <span className="text-[8px] text-slate-500 block uppercase">Active Buses</span>
                      <span className="text-xs font-bold text-slate-200">128</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-2">
                      <span className="text-[8px] text-slate-500 block uppercase">Today's Trips</span>
                      <span className="text-xs font-bold text-slate-200">842</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-2">
                      <span className="text-[8px] text-slate-500 block uppercase">Passengers</span>
                      <span className="text-xs font-bold text-slate-200">24.6K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 bg-slate-950 border-t border-slate-900/60 border-b border-slate-900/60 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs text-slate-500 font-medium">Trusted by forward-thinking companies</span>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {["CityLink", "MoveX", "UrbanRide", "MetroLine", "SwiftTransit"].map((logo, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 opacity-40 hover:opacity-75 transition-opacity cursor-default">
                <Compass className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold tracking-tight text-slate-400">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-slate-950 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Powerful Features <br />
              Built for Efficiency
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Everything you need to run your transit operations smarter, faster, and more efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Real-time Tracking",
                desc: "Track vehicles in real-time and respond instantly to any changes.",
                icon: Truck,
                color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
              },
              {
                title: "Smart Scheduling",
                desc: "AI-powered scheduling that optimizes routes and resources.",
                icon: Navigation,
                color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
              },
              {
                title: "Fleet Management",
                desc: "Maintain, monitor, and manage your entire fleet effortlessly.",
                icon: Wrench,
                color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              },
              {
                title: "Analytics & Reports",
                desc: "Gain actionable insights with powerful analytics and reports.",
                icon: BarChart3,
                color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }
            ].map((feat, i) => (
              <div key={i} className="bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition-all group flex flex-col justify-between h-48">
                <div className={`p-3 rounded-xl w-fit ${feat.color.split(" ")[1]} ${feat.color.split(" ")[0]} border ${feat.color.split(" ")[2]}`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">{feat.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numerical Metrics Stats Bar */}
      <section className="py-12 bg-slate-900/10 border-t border-b border-slate-900 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Vehicles", val: "10K+", icon: Truck },
            { label: "Transit Agencies", val: "500+", icon: Building2 },
            { label: "Passengers Served", val: "50M+", icon: Users },
            { label: "On-time Performance", val: "98%", icon: Clock }
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center space-x-3.5 justify-center">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-850 text-indigo-400">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-white block">{stat.val}</span>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions / Role Viewports Section */}
      <section id="roles" className="py-20 bg-slate-950 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
              Solutions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Solutions for Every Transit Need</h2>
            <p className="text-slate-400 text-sm md:text-base">
              Each user group gets access to specific screens. Select a role below to preview their experience.
            </p>
          </div>

          {/* Clean one line navigation tabs */}
          <div className="flex flex-nowrap justify-start sm:justify-center gap-2 max-w-2xl mx-auto bg-slate-950 p-1.5 rounded-xl border border-slate-900 overflow-x-auto whitespace-nowrap scrollbar-none">
            {(Object.keys(rolesData) as Array<keyof typeof rolesData>).map((roleKey) => (
              <button
                key={roleKey}
                onClick={() => setActiveTab(roleKey)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer shrink-0 ${
                  activeTab === roleKey
                    ? "bg-indigo-650 text-white shadow-lg shadow-indigo-650/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {rolesData[roleKey].title}
              </button>
            ))}
          </div>

          {/* Interactive tab window */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <span className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider rounded-md ${rolesData[activeTab].color} text-white uppercase`}>
                    {rolesData[activeTab].tag}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-100 mt-3">{rolesData[activeTab].title} Interface</h3>
                  <p className="text-slate-400 text-xs md:text-sm mt-3 leading-relaxed">
                    {rolesData[activeTab].description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300">Key Features:</h4>
                  {rolesData[activeTab].features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Mobile Mockup screen */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Active Viewport</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Live
                  </span>
                </div>
                <div className="space-y-3">
                  {rolesData[activeTab].metrics.map((metric, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-900 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-xs text-slate-400">{metric.split(":")[0]}</span>
                      <span className="text-xs font-bold text-indigo-400">{metric.split(":")[1]}</span>
                    </div>
                  ))}
                </div>
                <button className={`w-full py-2.5 rounded-lg text-xs font-semibold ${rolesData[activeTab].color} text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1`}>
                  <span>Access Platform</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Rules Enforcement Section */}
      <section id="rules" className="py-20 bg-slate-950 border-t border-slate-900 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
              Rules
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Built-In Business Validation</h2>
            <p className="text-slate-400 text-sm md:text-base">
              The platform auto-enforces key operational integrity rules, preventing planning errors before they hit the road.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {businessRules.map((rule, idx) => (
              <div key={idx} className="bg-slate-900/20 border border-slate-900/60 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-800 transition-colors">
                <div className="absolute top-0 right-0 bg-indigo-500/5 px-3 py-1 rounded-bl-lg text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                  {rule.type}
                </div>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-slate-200">{rule.title}</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Workflow Demo Walkthrough */}
      <section id="demo" className="py-20 bg-slate-900/10 border-t border-slate-900 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
              Workflow
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Step-by-Step Test Demo</h2>
            <p className="text-slate-400 text-sm md:text-base">
              Follow this test workflow pattern once logged in to verify our platform business rules.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="max-w-2xl mx-auto relative border-l border-slate-800 ml-4 md:ml-12 pl-6 md:pl-10 space-y-8 py-4">
            {[
              { step: "Step 1", title: "Add Fleet Asset", desc: "Register a vehicle 'Van-05' with a maximum capacity of 500 kg. Vehicle status starts as 'Available'." },
              { step: "Step 2", title: "Add Driver Profiling", desc: "Register driver 'Alex' with a valid driving license category and future expiry date." },
              { step: "Step 3", title: "Schedule Route & Dispatch", desc: "Create a trip with Cargo Weight = 450 kg. System validates 450 kg ≤ 500 kg limits and permits dispatch." },
              { step: "Step 4", title: "Automated Status Transitions", desc: "Dispatch triggers. Both Vehicle and Driver statuses atomically switch to 'On Trip' and lock." },
              { step: "Step 5", title: "Complete Trip Milestones", desc: "Complete the trip by logging final odometer readings and fuel consumption." },
              { step: "Step 6", title: "Maintenance & Lockouts", desc: "Create maintenance log (e.g., Oil Change). Vehicle turns to 'In Shop' status and is hidden from dispatch list." }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[37px] md:-left-[53px] top-4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[10px] md:text-xs font-bold text-indigo-400 shadow-md z-10">
                  {idx + 1}
                </div>
                
                {/* Content Card */}
                <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl hover:border-slate-800 transition-colors">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{item.step}</span>
                  <h3 className="text-base font-bold text-slate-200 mt-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TransitOps</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 TransitOps Platform. Built for Odoo Hackathon. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <span className="text-xs text-slate-400 hover:text-white cursor-pointer" onClick={() => scrollToSection("hero")}>Back to top</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
