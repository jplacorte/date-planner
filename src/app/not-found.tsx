import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 text-center">
      <div className="max-w-sm space-y-4">
        <h1 className="font-serif text-2xl text-neutral-100">
          Nothing planned here
        </h1>
        <p className="text-sm text-neutral-500">
          This page does not exist. Head back to your date list.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-medium text-sm"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
