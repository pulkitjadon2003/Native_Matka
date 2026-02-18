import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F14] text-white">
            <h2 className="text-4xl font-bold text-[#F5C542] mb-4">Not Found</h2>
            <p className="text-gray-400 mb-8">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-[#F5C542] text-black font-bold rounded-lg hover:bg-[#D97706] transition-colors">
                Return Home
            </Link>
        </div>
    )
}
