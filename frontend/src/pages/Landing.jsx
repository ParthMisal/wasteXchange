import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Sparkles,
  Handshake,
  Truck,
  ArrowRight,
  Recycle,
  Hammer,
  FlaskConical,
  Shirt,
  TreePine,
  Cpu,
  Menu,
  X,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

/* ─── Data ─── */
const steps = [
  { icon: Search,    title: 'List / Search',  description: 'Post surplus assets or browse verified industrial listings.' },
  { icon: Sparkles,  title: 'AI Match',        description: 'Smart matching pairs waste generators with ideal buyers.' },
  { icon: Handshake, title: 'Connect',          description: 'Negotiate directly with vetted counterparties.' },
  { icon: Truck,     title: 'Track',            description: 'Follow the exchange from pickup to fulfilment.' },
]

const categories = [
  { icon: Recycle,      name: 'Plastic',   color: 'from-blue-500/20 to-blue-600/10'    },
  { icon: Hammer,       name: 'Metal',     color: 'from-slate-500/20 to-slate-600/10'  },
  { icon: FlaskConical, name: 'Chemical',  color: 'from-violet-500/20 to-violet-600/10'},
  { icon: Shirt,        name: 'Textile',   color: 'from-pink-500/20 to-pink-600/10'    },
  { icon: TreePine,     name: 'Wood',      color: 'from-green-500/20 to-green-600/10'  },
  { icon: Cpu,          name: 'E-waste',   color: 'from-amber-500/20 to-amber-600/10'  },
]

const statsData = [
  { value: 12400, suffix: '',   label: 'tonnes diverted',   prefix: ''  },
  { value: 3.2,   suffix: 'Cr', label: 'value exchanged',   prefix: '₹' },
  { value: 8900,  suffix: '',   label: 'tonnes CO₂ saved',  prefix: ''  },
]

const caseStudies = [
  { material: 'Industrial Metal Scrap', tonnes: '320', saved: '₹44L', description: 'A fabrication plant sold 320 tonnes of mixed scrap to a foundry, unlocking ₹44L in recovered value.' },
  { material: 'Surplus Packaging Film', tonnes: '145', saved: '₹12L', description: 'A consumer goods maker diverted post-production film from landfill, cutting disposal costs and lead times.' },
]

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const isDecimal = target % 1 !== 0
          const totalSteps = 60
          const interval = duration / totalSteps
          let step = 0
          const timer = setInterval(() => {
            step++
            const progress = step / totalSteps
            const eased = 1 - Math.pow(1 - progress, 3)
            const val = target * eased
            setCount(isDecimal ? Math.round(val * 10) / 10 : Math.round(val))
            if (step >= totalSteps) clearInterval(timer)
          }, interval)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return [count, ref]
}

function StatCard({ value, suffix, label, prefix, delay }) {
  const [count, ref] = useCountUp(value)
  return (
    <div
      ref={ref}
      className="glass-card flex flex-col items-center text-center slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-heading text-4xl font-extrabold text-accent">
        {prefix}{count}{suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-primary-100/80">{label}</p>
    </div>
  )
}

/* ─── Component ─── */
export default function Landing() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface text-ink-muted">

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="font-heading text-xl font-bold text-primary">
            waste<span className="text-accent">Xchange</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-ink-muted transition-colors hover:text-ink">How it works</a>
            <Link to="/marketplace" className="text-sm font-medium text-ink-muted transition-colors hover:text-ink">Marketplace</Link>
            <Link to="/login"       className="text-sm font-medium text-ink-muted transition-colors hover:text-ink">Login</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/signup" className="hidden md:block">
              <Button size="sm">Get Started</Button>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-ink-muted hover:bg-stone-100 md:hidden"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {mobileNavOpen && (
          <div className="border-t border-stone-100 bg-white px-6 pb-4 md:hidden">
            <div className="flex flex-col gap-3 pt-3">
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} className="py-2 text-sm font-medium text-ink-muted">How it works</a>
              <Link to="/marketplace" onClick={() => setMobileNavOpen(false)} className="py-2 text-sm font-medium text-ink-muted">Marketplace</Link>
              <Link to="/login"       onClick={() => setMobileNavOpen(false)} className="py-2 text-sm font-medium text-ink-muted">Login</Link>
              <Link to="/signup"      onClick={() => setMobileNavOpen(false)}>
                <Button className="w-full" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="pointer-events-none absolute inset-0 bg-hero-radial" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="slide-up inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Surplus Exchange
          </div>

          <h1 className="slide-up delay-100 mt-6 font-heading text-5xl font-extrabold leading-tight text-white md:text-6xl">
            Turn Industrial Surplus<br />
            <span className="gradient-text">Into Real Value</span>
          </h1>

          <p className="slide-up delay-200 mx-auto mt-6 max-w-xl text-lg text-primary-100/70">
            Eco-Sync connects waste generators with qualified buyers — cutting procurement
            costs and keeping valuable material out of landfill.
          </p>

          <div className="slide-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="btn-glow w-full sm:w-auto">I&apos;m a Seller</Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" size="lg" className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto">
                I&apos;m a Buyer
              </Button>
            </Link>
          </div>
        </div>

        {/* Glass stat strip */}
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-3">
          {statsData.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 120} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-stone-200 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent">Simple process</p>
          <h2 className="mt-3 text-center font-heading text-3xl font-bold text-ink">How it works</h2>

          <div className="mt-14 flex flex-col items-stretch gap-6 md:flex-row md:items-start">
            {steps.map((step, i) => (
              <React.Fragment key={step.title}>
                <Card className="flex-1 text-center shadow-card slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary shadow-sm">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
                </Card>
                {i < steps.length - 1 && (
                  <div className="flex items-center justify-center md:pt-7">
                    <ArrowRight className="h-5 w-5 shrink-0 rotate-90 text-ink-faint md:rotate-0" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent">What we trade</p>
          <h2 className="mt-3 text-center font-heading text-3xl font-bold text-ink">Browse by material</h2>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to="/marketplace"
                className={`group slide-up flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br ${cat.color} border border-stone-200 p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-card`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <cat.icon className="h-8 w-8 text-primary transition-transform duration-200 group-hover:scale-110" />
                <p className="font-heading text-sm font-semibold text-ink">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section className="border-t border-stone-200 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent">Proof points</p>
          <h2 className="mt-3 text-center font-heading text-3xl font-bold text-ink">Impact in action</h2>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {caseStudies.map((story, i) => (
              <Card key={story.material} className="slide-up shadow-card" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-ink">{story.material}</h3>
                  <ArrowRight className="h-5 w-5 text-ink-faint" />
                </div>
                <div className="mt-5 flex gap-8">
                  <div className="text-sm text-ink-muted">
                    <span className="block font-heading text-3xl font-extrabold text-primary">{story.tonnes}</span>
                    tonnes diverted
                  </div>
                  <div className="text-sm text-ink-muted">
                    <span className="block font-heading text-3xl font-extrabold text-accent">{story.saved}</span>
                    cost saved
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink-muted">{story.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-hero-gradient py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-white">Ready to start?</h2>
          <p className="mt-4 text-primary-100/70">Join thousands of businesses already exchanging surplus on Eco-Sync.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup"><Button size="lg" className="btn-glow w-full sm:w-auto">Create Free Account</Button></Link>
            <Link to="/login"><Button variant="ghost" size="lg" className="w-full border border-white/20 text-white hover:bg-white/10 sm:w-auto">Sign In</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-bold text-white">waste<span className="text-accent">Xchange</span></p>
            <p className="mt-3 max-w-xs text-sm text-primary-100/70">
              Turning industrial surplus into sustainable value for every supply chain.
            </p>
          </div>
          <div>
            <p className="font-heading font-semibold text-white">Links</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="text-primary-100/70 transition-colors hover:text-white" href="#how-it-works">How it works</a></li>
              <li><Link className="text-primary-100/70 transition-colors hover:text-white" to="/marketplace">Marketplace</Link></li>
              <li><Link className="text-primary-100/70 transition-colors hover:text-white" to="/login">Login</Link></li>
              <li><Link className="text-primary-100/70 transition-colors hover:text-white" to="/signup">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-heading font-semibold text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="text-primary-100/70 transition-colors hover:text-white" href="mailto:sales@eco-sync.com">sales@eco-sync.com</a></li>
              <li><a className="text-primary-100/70 transition-colors hover:text-white" href="mailto:support@eco-sync.com">support@eco-sync.com</a></li>
              <li className="text-primary-100/60">Mumbai, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-primary-100/50">
            © {new Date().getFullYear()} wasteXchange / Eco-Sync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}