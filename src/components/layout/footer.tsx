import { Code } from "lucide-react";

function Footer() {
    return (
        <footer className="py-8 sm:py-10 md:py-12 border-t border-gray-800 bg-[#1e1e1e] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center md:justify-start">
                            <Code className="mr-2 text-emerald-400" /> CodeX
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm sm:text-base">© 2025 CodeX. All rights reserved.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row items-center justify-center md:justify-end gap-6 sm:gap-8 md:gap-10">
                        <a href="https://www.producthunt.com/posts/codex-editor?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-codex-editor" target="_blank">
                            <img
                                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=940232&theme=light&t=1741681488370"
                                alt="CodeX-Editor - A web code editor with AI & multi-language support | Product Hunt"
                                style={{ width: '250px', height: '54px' }}
                                width="250"
                                height="54"
                            />
                        </a>
                        <div className="flex gap-6 sm:gap-8 md:gap-10">
                            <a href="/" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm sm:text-base">Home</a>
                            <a href="/editor" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm sm:text-base">Editor</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;