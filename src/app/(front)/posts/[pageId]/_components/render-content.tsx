"use client";

export default function RenderContent({ md }: { md: string }) {
    // swap for `react-markdown` later if you like
    return (
        <pre className="whitespace-pre-wrap leading-relaxed text-gray-300">
            {md}
        </pre>
    );
}
