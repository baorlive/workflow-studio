import React, { useMemo } from 'react';
import { Modal } from './Modal';
import Icon from './Icon';
import { Button } from './Button';

const plans = [
  {
    id: 'free',
    name: 'Basic',
    price: '$0',
    subtext: 'Forever Free',
    executions: 900,
    messages: 300,
    features: [
      '3 active workflows',
      '1 workspace • 1 member',
      'Built‑in nodes & templates',
      '7‑day run logs',
      'Community support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Professional',
    price: '$89',
    subtext: 'per month',
    executions: 30000,
    messages: 10000,
    features: [
      '25 active workflows',
      '3 workspaces • up to 5 members',
      'Schedulers, webhooks, custom nodes',
      'Basic RBAC • 7‑day logs',
      'Email support',
    ],
    cta: 'Choose Professional',
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Business',
    price: '$189',
    subtext: 'per month',
    executions: 75000,
    messages: 25000,
    features: [
      '75 active workflows',
      '5 workspaces • up to 15 members',
      'Priority scheduling • 3× concurrency',
      'RBAC, secrets manager, usage analytics',
      '30‑day logs • 99.5% SLA',
    ],
    cta: 'Choose Business',
    highlighted: true,
  },
  {
    id: 'sme',
    name: 'Enterprise',
    price: 'Custom',
    subtext: 'Let’s talk',
    executions: 135000,
    messages: 45000,
    features: [
      'Unlimited workflows & members',
      'SSO/SAML • SCIM • Audit trails',
      'VPC / on‑prem • Dedicated runners',
      'Advanced observability • 365‑day logs',
      '99.95% SLA • CSM',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const overages = [
  { label: 'Execution overage', value: '$2.50 / 1,000' },
  { label: 'Message overage', value: '$1.00 / 1,000' },
];

export default function PricingModal({ isOpen, onClose }) {
  const formattedPlans = useMemo(() => plans, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pricing" size="7xl">
      <div className="space-y-8">
        <header className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900">Build, Run, and Scale Workflows</h2>
          <p className="text-gray-600 mt-2">Simple, transparent plans with usage limits that grow as you do.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formattedPlans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border ${
                p.highlighted ? 'border-primary-300 shadow-lg shadow-primary-100/40' : 'border-gray-200'
              } bg-white`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 right-4 px-3 py-1 text-sm font-semibold rounded-full bg-primary-600 text-white shadow">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">{p.price}</span>
                    <span className="text-sm text-gray-500">{p.subtext}</span>
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Executions / month</span>
                    <span className="font-semibold">{p.executions.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                    <span>Messages / month</span>
                    <span className="font-semibold">{p.messages.toLocaleString()}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-sm">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Icon name="check" size={16} className="text-green-600 mt-0.5" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Button
                    variant={p.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => {
                      if (p.id === 'free' || p.id === 'starter' || p.id === 'growth') {
                        onClose();
                      } else {
                        window.open('mailto:team@example.com?subject=Enterprise%20Pricing', '_blank');
                      }
                    }}
                  >
                    {p.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Overages & Add‑ons</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overages.map((o) => (
              <div key={o.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{o.label}</span>
                <span className="font-medium text-gray-900">{o.value}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">Annual billing saves 15%. Committed‑use discounts available.</p>
        </div>

        <div className="text-center">
          <button
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
