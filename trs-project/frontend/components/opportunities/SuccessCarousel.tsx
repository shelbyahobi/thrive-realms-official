'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Users, TrendingUp } from 'lucide-react';

const STORIES = [
    {
        id: 1,
        title: "Kenya Solar Micro-Grid",
        location: "Nakuru, Kenya",
        impact: "450 Households",
        roi: "12% APY Paid",
        image: "from-emerald-900", // using gradient classes instead of checking for real images
        desc: "Expanded capacity by 50kW, enabling 3 local schools to operate evening classes."
    },
    {
        id: 2,
        title: "Vietnam Textile Co-op",
        location: "Da Nang, Vietnam",
        impact: "30 Jobs Created",
        roi: "8% Revenue Share",
        image: "from-blue-900",
        desc: "Purchased automated loom machinery, increasing production speed by 300%."
    },
    {
        id: 3,
        title: "Brazil Agro-Forestry",
        location: "Bahia, Brazil",
        impact: "15 Hectares Restored",
        roi: "Carbon Credit Yield",
        image: "from-amber-900",
        desc: "Replanted native cacao amidst rubber trees, diversifying income for 20 families."
    }
];

export default function SuccessCarousel() {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((curr) => (curr + 1) % STORIES.length);
    const prev = () => setCurrent((curr) => (curr - 1 + STORIES.length) % STORIES.length);

    // Auto-scroll
    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, []);

    const story = STORIES[current];

    return (
        <div className="glass-card border border-white/10 overflow-hidden relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${story.image} to-black opacity-60 transition-colors duration-1000`}></div>

            <div className="relative p-8 z-10 flex flex-col md:flex-row gap-8 items-center">

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white border border-white/10 uppercase tracking-wider">
                            Verified Win
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                            <MapPin size={12} /> {story.location}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{story.title}</h3>
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed max-w-xl">
                        "{story.desc}"
                    </p>

                    <div className="flex gap-4">
                        <div className="bg-black/30 p-3 rounded border border-white/5">
                            <div className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                                <Users size={12} /> Impact
                            </div>
                            <div className="text-emerald-400 font-mono font-bold">{story.impact}</div>
                        </div>
                        <div className="bg-black/30 p-3 rounded border border-white/5">
                            <div className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                                <TrendingUp size={12} /> Return
                            </div>
                            <div className="text-amber-400 font-mono font-bold">{story.roi}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                    <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {STORIES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
}
