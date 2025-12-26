export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/40 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white font-bold mb-4">Thrive Realms Governance Protocol</h4>
                        <p className="text-gray-500 text-sm max-w-sm">
                            A decentralized sovereign capital allocation protocol designed to fund productive real-world initiatives through transparent, on-chain governance.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Ecosystem</h5>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="/governance" className="hover:text-purple-400 transition-colors">Governance Hub</a></li>
                            <li><a href="/work" className="hover:text-purple-400 transition-colors">Work Hub</a></li>
                            <li><a href="/whitepaper" className="hover:text-purple-400 transition-colors">Whitepaper</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h5>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Use</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Risk Disclosure</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center md:text-left">
                    <p className="text-xs text-gray-600 leading-relaxed max-w-4xl mx-auto md:mx-0">
                        Thrive Realms Governance Protocol is a decentralized governance system. Participation involves risk. No guarantees of profit are made. All decisions are governed by smart contracts and community voting. This interface is open-source software provided "as-is" for interacting with the blockchain protocol.
                    </p>
                    <p className="text-gray-700 text-xs mt-4">
                        &copy; 2025 Thrive Realms Protocol. Decentralized & Sovereign.
                    </p>
                </div>
            </div>
        </footer>
    )
}
