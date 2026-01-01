'use client';

import { Scale, Shovel, Microscope, Hammer } from 'lucide-react';

const ROLES = [
    {
        title: "Professional Services",
        icon: <Scale size={32} />,
        roles: ["Legal Structuring", "Cross-border Accounting", "Compliance Auditing"],
        desc: "Architect the legal wrappers and financial flows that keep the DAO compliant.",
        color: "yellow"
    },
    {
        title: "Field Operators",
        icon: <Shovel size={32} />,
        roles: ["Cooperative Leaders", "Agronomists", "Local Coordinators"],
        desc: "The boots on the ground. You manage the physical assets and verify impact.",
        color: "emerald"
    },
    {
        title: "Research & Academia",
        icon: <Microscope size={32} />,
        roles: ["University Labs", "Tech Transfer Offices", "Impact Scientists"],
        desc: "Validate the science behind our investments and measure the outcomes.",
        color: "purple"
    },
    {
        title: "Builders",
        icon: <Hammer size={32} />,
        roles: ["Project Managers", "Supply Chain Ops", "Civil Engineers"],
        desc: "Execute the construction and logistical phases of infrastructure projects.",
        color: "blue"
    }
];

export default function RolesWanted() {
    return (
        <section className="py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-serif text-white mb-4">Who We Need</h2>
                <div className="h-1 w-20 bg-gray-700 mx-auto mb-6"></div>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    A decentralized protocol needs centralized brilliance. We are actively recruiting partners to fill these critical roles in our execution network.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ROLES.map((role) => (
                    <div key={role.title} className="bg-black hover:bg-white/5 border border-white/10 p-6 rounded-xl transition duration-300 group">
                        <div className={`w-14 h-14 rounded-full bg-${role.color}-900/20 border border-${role.color}-500/30 flex items-center justify-center mb-6 text-${role.color}-400 group-hover:scale-110 transition`}>
                            {role.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">{role.title}</h3>
                        <ul className="space-y-2 mb-6 min-h-[80px]">
                            {role.roles.map(r => (
                                <li key={r} className="text-sm text-gray-300 flex items-center gap-2">
                                    <span className={`w-1 h-1 rounded-full bg-${role.color}-500`} />
                                    {r}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500 leading-relaxed border-t border-white/5 pt-4">
                            {role.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
