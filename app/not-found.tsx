import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center sm:px-8">
      <h1 className="font-display text-3xl text-forest-deep">Entry not found</h1>
      <p className="mt-3 font-body text-sm text-moss">
        That specimen is not in the demo archive.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-forest px-5 py-2.5 font-body text-sm text-parchment hover:bg-forest-deep"
      >
        Return to catalog
      </Link>
    </div>
  );
}
