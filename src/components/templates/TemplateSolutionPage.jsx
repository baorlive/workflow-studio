import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { WorkflowCard } from '../workspace/WorkflowCard';
import {
    Megaphone,
    TrendingUp,
    HeadphonesIcon,
    LayoutTemplate,
    Sparkles,
    Mail,
    BarChart3,
    MessageSquare,
    Users,
    FileText,
    Zap,
    Target,
    ShoppingCart,
    Phone,
    Star,
    Globe,
    RefreshCw,
    ChevronDown,
    ArrowRight,
    Bot,
} from 'lucide-react';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    {
        id: 'marketing',
        label: 'Marketing',
        icon: Megaphone,
        headline: 'Marketing Workflows',
        subtext:
            'Automate your entire marketing funnel — from campaign drafting to multi-channel publishing — with ready-to-deploy ready-to-run templates.',
        gradient: 'from-violet-400 to-purple-600',
        badge: 'Marketing',
        templates: [
            {
                id: 'm1',
                title: 'Campaign Brief Generator',
                benefit: 'Turn a one-line idea into a full creative brief in under 60 seconds.',
                icon: Sparkles,
                gradient: 'from-violet-400 to-purple-600',
                nodeIcons: ['zap', 'bot', 'fileText'],
            },
            {
                id: 'm2',
                title: 'Multi-Channel Email Drip',
                benefit: 'Orchestrate personalised drip sequences across email, SMS, and push notifications.',
                icon: Mail,
                gradient: 'from-fuchsia-400 to-violet-600',
                nodeIcons: ['zap', 'mail', 'messageSquare'],
            },
            {
                id: 'm3',
                title: 'SEO Content Pipeline',
                benefit: 'Research keywords, draft posts, and publish to CMS with one automated flow.',
                icon: Globe,
                gradient: 'from-indigo-400 to-blue-600',
                nodeIcons: ['globe', 'bot', 'database'],
            },
            {
                id: 'm4',
                title: 'Social Media Scheduler',
                benefit: 'Generate captions, resize images, and queue posts to all your social channels.',
                icon: LayoutTemplate,
                gradient: 'from-pink-400 to-rose-600',
                nodeIcons: ['zap', 'bot', 'megaphone'],
            },
            {
                id: 'm5',
                title: 'Ad Copy A/B Tester',
                benefit: 'Produce variant ad copy, run head-to-head tests, and surface winners automatically.',
                icon: Target,
                gradient: 'from-amber-400 to-orange-500',
                nodeIcons: ['bot', 'target', 'barChart3'],
            },
            {
                id: 'm6',
                title: 'Campaign Analytics Report',
                benefit: 'Pull metrics from every platform and generate a unified executive summary daily.',
                icon: BarChart3,
                gradient: 'from-cyan-400 to-teal-600',
                nodeIcons: ['database', 'bot', 'barChart3'],
            },
        ],
    },
    {
        id: 'sales',
        label: 'Sales',
        icon: TrendingUp,
        headline: 'Sales Workflows',
        subtext:
            'Accelerate your pipeline from prospecting to close. Each template integrates with your CRM so leads never fall through the cracks.',
        gradient: 'from-emerald-400 to-teal-600',
        badge: 'Sales',
        templates: [
            {
                id: 's1',
                title: 'Lead Enrichment & Scoring',
                benefit: 'Auto-enrich every inbound lead with company data and assign a predictive score.',
                icon: Users,
                gradient: 'from-emerald-400 to-teal-600',
                nodeIcons: ['zap', 'search', 'users'],
            },
            {
                id: 's2',
                title: 'Personalised Outreach Sequence',
                benefit: 'Generate hyper-personalised emails for each prospect using their LinkedIn and web data.',
                icon: FileText,
                gradient: 'from-green-400 to-emerald-600',
                nodeIcons: ['globe', 'bot', 'mail'],
            },
            {
                id: 's3',
                title: 'CRM Auto-Update',
                benefit: 'Sync meeting notes, email threads, and call transcripts into your CRM in real time.',
                icon: RefreshCw,
                gradient: 'from-teal-400 to-cyan-600',
                nodeIcons: ['refreshCw', 'database', 'zap'],
            },
            {
                id: 's4',
                title: 'Deal Risk Detector',
                benefit: 'Surface at-risk opportunities using engagement signals and flag them for your reps.',
                icon: Zap,
                gradient: 'from-sky-400 to-blue-600',
                nodeIcons: ['zap', 'bot', 'target'],
            },
            {
                id: 's5',
                title: 'Proposal Generator',
                benefit: 'Produce branded, data-driven proposals in minutes from a single deal brief.',
                icon: ShoppingCart,
                gradient: 'from-violet-400 to-indigo-600',
                nodeIcons: ['fileText', 'bot', 'shoppingCart'],
            },
            {
                id: 's6',
                title: 'Weekly Pipeline Digest',
                benefit: 'Summarise deal velocity, next steps, and forecast changes for every team member.',
                icon: BarChart3,
                gradient: 'from-fuchsia-400 to-pink-600',
                nodeIcons: ['database', 'bot', 'trendingUp'],
            },
        ],
    },
    {
        id: 'customer-support',
        label: 'Customer Support',
        icon: HeadphonesIcon,
        headline: 'Customer Support Workflows',
        subtext:
            'Resolve faster, escalate smarter, and delight customers at every touchpoint with workflow systems built for modern support teams.',
        gradient: 'from-blue-400 to-indigo-600',
        badge: 'Support',
        templates: [
            {
                id: 'cs1',
                title: 'Ticket Triage',
                benefit: 'Classify, prioritise, and route every incoming ticket to the right agent instantly.',
                icon: Star,
                gradient: 'from-blue-400 to-indigo-600',
                nodeIcons: ['mail', 'bot', 'users'],
            },
            {
                id: 'cs2',
                title: 'Smart FAQ Responder',
                benefit: 'Deflect up to 60% of routine queries with an automation bot trained on your knowledge base.',
                icon: Bot,
                gradient: 'from-sky-400 to-blue-600',
                nodeIcons: ['messageSquare', 'bot', 'database'],
            },
            {
                id: 'cs3',
                title: 'Customer Sentiment Monitor',
                benefit: 'Continuously analyse CSAT scores and flag deteriorating accounts for proactive outreach.',
                icon: Star,
                gradient: 'from-amber-400 to-yellow-500',
                nodeIcons: ['database', 'bot', 'star'],
            },
            {
                id: 'cs4',
                title: 'Escalation Workflow',
                benefit: 'Detect frustrated customers early and escalate to senior agents before churn happens.',
                icon: Phone,
                gradient: 'from-rose-400 to-red-600',
                nodeIcons: ['zap', 'phone', 'users'],
            },
            {
                id: 'cs5',
                title: 'Post-Resolution Follow-Up',
                benefit: 'Automatically send follow-up messages and CSAT surveys 24 hours after ticket closure.',
                icon: MessageSquare,
                gradient: 'from-violet-400 to-purple-600',
                nodeIcons: ['zap', 'bot', 'messageSquare'],
            },
            {
                id: 'cs6',
                title: 'Support Analytics Dashboard',
                benefit: 'Aggregate ticket volumes, handle times, and agent performance into one live report.',
                icon: BarChart3,
                gradient: 'from-cyan-400 to-teal-600',
                nodeIcons: ['database', 'bot', 'barChart3'],
            },
        ],
    },
];

// ─── TEMPLATE CARD ────────────────────────────────────────────────────────────

function TemplateCard({ template, badge, onClick }) {
    const IconComponent = template.icon;

    const handleKeyDown = (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && onClick) {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200 cursor-pointer relative"
            role="button"
            tabIndex={0}
            aria-label={`Use template ${template.title}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            <div className={`relative bg-gradient-to-br ${template.gradient} aspect-video flex items-center justify-center rounded-lg overflow-hidden`}>
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                    }}
                />
                <span className="absolute top-3 right-3 text-sm font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    {badge}
                </span>
                <div className="relative z-10 bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
            </div>

            <div className="flex flex-col flex-1 mt-5">
                {/* Node Icons - Representation of template content */}
                <div className="flex items-center gap-1.5 mb-3">
                    {template.nodeIcons?.slice(0, 3).map((iconName, i) => (
                        <div key={i} className="p-1.5 bg-gray-50 rounded-lg text-gray-400 border border-gray-100">
                            <Icon name={iconName} size={14} />
                        </div>
                    ))}
                    {template.nodeIcons?.length > 3 && (
                        <div className="text-[10px] font-bold text-gray-400 ml-1">
                            +{template.nodeIcons.length - 3}
                        </div>
                    )}
                </div>

                <h4 className="text-base font-semibold text-gray-900 leading-snug">{template.title}</h4>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed flex-1">{template.benefit}</p>

                <div className="mt-4 flex items-center gap-1 text-primary-600 text-sm font-medium group-hover:gap-2 transition-all duration-150">
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    );
}

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────

function CategorySection({
    category,
    workflows = [],
    folders = [],
    onEditWorkflow,
    onShareWorkflow,
    onDuplicateWorkflow,
    onDeleteWorkflow,
    onMoveWorkflow,
}) {
    const IconComponent = category.icon;

    const handleEdit = (workflow) => {
        if (!onEditWorkflow) return;
        try {
            onEditWorkflow(workflow);
        } catch (error) {
            console.error('Failed to open workflow editor from templates', error);
        }
    };

    return (
        <section id={category.id} className="mb-16 scroll-mt-28">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} shadow-sm`}>
                        <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{category.headline}</h2>
                </div>
                <p className="text-base text-gray-500 max-w-2xl leading-relaxed">{category.subtext}</p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.templates.map((template) => {
                    const workflow = {
                        id: `temp-${template.id}`,
                        name: template.title,
                        status: 'Draft',
                        type: 'Template',
                        icons: template.nodeIcons || ['bot'],
                        date: 'Just now',
                    };
                    const handleClick = () => handleEdit(workflow);

                    return (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            badge={category.badge}
                            onClick={handleClick}
                        />
                    );
                })}
            </div>

            <div className="mt-6">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
                    <span>Load More</span>
                </button>
            </div>
        </section>
    );
}

// ─── ANCHOR MENU (HORIZONTAL) ────────────────────────────────────────────────

function AnchorMenu({ activeSection, onSectionChange }) {
    const [isSticky, setIsSticky] = React.useState(false);
    const navRef = React.useRef(null);

    React.useEffect(() => {
        const handleScroll = () => {
            if (!navRef.current) return;
            const scrollParent = navRef.current.closest('.overflow-y-auto') || window;
            const navRect = navRef.current.getBoundingClientRect();
            let parentTop = 0;

            if (scrollParent !== window) {
                parentTop = scrollParent.getBoundingClientRect().top;
            }

            // Allow sub-pixel buffer. If nav's top is at or above the parent's top, it's sticky.
            if (navRect.top <= parentTop + 2) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        const scrollParent = navRef.current?.closest('.overflow-y-auto') || window;
        scrollParent.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => scrollParent.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        onSectionChange(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div
            ref={navRef}
            aria-label="Template categories navigation"
            className={`sticky top-0 z-20 py-2 mt-3 transition-colors duration-200 w-full ${isSticky
                ? 'bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm'
                : 'bg-transparent border-b border-transparent shadow-none'
                }`}
        >
            <div className="max-w-6xl mx-auto px-8">
                <nav className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeSection === cat.id;
                        const IconComponent = cat.icon;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => scrollTo(cat.id)}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-base font-semibold transition-colors ${isActive
                                    ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                aria-current={isActive ? 'location' : undefined}
                                type="button"
                            >
                                <IconComponent
                                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-gray-900' : ''}`}
                                />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

// ─── PAGE HERO ────────────────────────────────────────────────────────────────

function PageHero() {
    return (
        <div className="mb-12">
            {/* Eyebrow badge */}
            <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full">
                    <LayoutTemplate className="w-3 h-3" />
                    Built-Ready Templates
                </span>
            </div>

            {/* Display heading */}
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                Template Solutions
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                Start faster with production-ready workflow templates. Each template is pre-built,
                fully customisable, and deploys in one click.
            </p>
        </div>
    );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────

export default function TemplateSolutionPage({
    workflows = [],
    folders = [],
    onEditWorkflow,
    onShareWorkflow,
    onDuplicateWorkflow,
    onDeleteWorkflow,
    onMoveWorkflow,
}) {
    const [activeSection, setActiveSection] = useState(CATEGORIES[0].id);

    useEffect(() => {
        const observers = [];

        CATEGORIES.forEach((cat) => {
            const el = document.getElementById(cat.id);
            if (!el) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(cat.id);
                },
                { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, []);

    const getWorkflowsForCategory = (categoryId) => {
        if (!workflows || workflows.length === 0) return [];
        if (categoryId === 'marketing') return workflows.slice(0, 6);
        if (categoryId === 'sales') return workflows.slice(6, 10);
        if (categoryId === 'customer-support') return workflows.slice(10, 14);
        return [];
    };

    return (
        <div className="w-full pb-16" id="main-content">
            <div className="px-8 pt-8 pb-0 max-w-6xl mx-auto w-full">
                <PageHero />
            </div>

            <AnchorMenu activeSection={activeSection} onSectionChange={setActiveSection} />

            <div className="px-8 pt-8 pb-0 max-w-6xl mx-auto w-full mt-10">
                {CATEGORIES.map((cat) => (
                    <CategorySection
                        key={cat.id}
                        category={cat}
                        workflows={getWorkflowsForCategory(cat.id)}
                        folders={folders}
                        onEditWorkflow={onEditWorkflow}
                        onShareWorkflow={onShareWorkflow}
                        onDuplicateWorkflow={onDuplicateWorkflow}
                        onDeleteWorkflow={onDeleteWorkflow}
                        onMoveWorkflow={onMoveWorkflow}
                    />
                ))}
            </div>
        </div>
    );
}
