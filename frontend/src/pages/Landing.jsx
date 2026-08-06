import React from 'react'
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
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

const steps = [
  {
    icon: Search,
    title: 'List / Search',
    description: 'Post surplus assets or browse verified industrial listings.',
  },
  {
    icon: Sparkles,
    title: 'AI Match',
    description: 'Smart matching pairs waste generators with ideal buyers.',
  },
  {
    icon: Handshake,
    title: 'Connect',
    description: 'Negotiate directly with vetted counterparties.',
  },
  {
    icon: Truck,
    title: 'Track',
    description: 'Follow the exchange from pickup to fulfilment.',
  },
]

const categories = [
  { icon: Recycle, name: 'Plastic' },
  { icon: Hammer, name: 'Metal' },
  { icon: FlaskConical, name: 'Chemical' },
  { icon: Shirt, name: 'Textile' },
  { icon: TreePine, name: 'Wood' },
  { icon: Cpu, name: 'E-waste' },
]

const caseStudies = [
  {
    material: 'Industrial Metal Scrap',
    tonnes: '320',
    saved: '₹44L',
    description:
      'A fabrication plant sold 320 tonnes of mixed scrap to a foundry, unlocking ₹44L in recovered value.',
  },
  {
    material: 'Surplus Packaging Film',
    tonnes: '145',
    saved: '₹12L',
    description:
      'A consumer goods maker diverted post-production film from landfill, cutting disposal costs and lead times.',
  },
]

const navLinks = ['How it works', 'Marketplace', 'Login']

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface text-ink-muted">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="font-heading text-xl font-bold text-primary">
            Eco-Sync
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link}
                to={link === 'Login' ? '/login' : '#'}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {link}
              </Link>
            ))}
          </div>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-heading text-5xl font-bold text-ink">
          Turn Industrial Surplus Into Value
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
          Eco-Sync connects waste generators with buyers, cutting procurement
          costs and keeping valuable material out of landfill.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button>I&apos;m a Seller</Button>
          <Button variant="secondary">I&apos;m a Buyer</Button>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="text-center">
            <p className="font-heading text-4xl font-bold text-accent">12,400</p>
            <p className="mt-2 text-sm text-ink-muted">tonnes diverted</p>
          </Card>
          <Card className="text-center">
            <p className="font-heading text-4xl font-bold text-accent">₹3.2Cr</p>
            <p className="mt-2 text-sm text-ink-muted">value exchanged</p>
          </Card>
          <Card className="text-center">
            <p className="font-heading text-4xl font-bold text-accent">8,900</p>
            <p className="mt-2 text-sm text-ink-muted">tonnes CO2 saved</p>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-stone-200 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">
            How it works
          </h2>
          <div className="mt-12 grid grid-cols-1 items-center gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <React.Fragment key={step.title}>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
                </Card>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden h-5 w-5 text-ink-faint lg:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="text-center font-heading text-3xl font-bold text-ink">
          Browse by material
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <Card
              key={cat.name}
              className="group cursor-pointer text-center transition-colors hover:border-primary"
            >
              <cat.icon className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 font-heading font-semibold text-ink">{cat.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Case studies */}
      <section className="border-t border-stone-200 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">
            Impact in action
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {caseStudies.map((story) => (
              <Card key={story.material}>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-ink">
                    {story.material}
                  </h3>
                  <ArrowRight className="h-5 w-5 text-ink-faint" />
                </div>
                <div className="mt-4 flex gap-8">
                  <p className="text-sm text-ink-muted">
                    <span className="block font-heading text-2xl font-bold text-primary">
                      {story.tonnes}
                    </span>
                    tonnes diverted
                  </p>
                  <p className="text-sm text-ink-muted">
                    <span className="block font-heading text-2xl font-bold text-accent">
                      {story.saved}
                    </span>
                    cost saved
                  </p>
                </div>
                <p className="mt-4 text-sm text-ink-muted">{story.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-bold text-white">Eco-Sync</p>
            <p className="mt-3 max-w-xs text-sm text-primary-100/80">
              Turning industrial surplus into sustainable value for every
              supply chain.
            </p>
          </div>
          <div>
            <p className="font-heading font-semibold text-white">Links</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="hover:text-white" href="#">How it works</a></li>
              <li><a className="hover:text-white" href="#">Marketplace</a></li>
              <li><a className="hover:text-white" href="#">Login</a></li>
            </ul>
          </div>
          <div>
            <p className="font-heading font-semibold text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="hover:text-white" href="#">sales@eco-sync.com</a></li>
              <li><a className="hover:text-white" href="#">support@eco-sync.com</a></li>
              <li className="text-primary-100/80">Mumbai, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-primary-100/70">
            © {new Date().getFullYear()} Eco-Sync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}