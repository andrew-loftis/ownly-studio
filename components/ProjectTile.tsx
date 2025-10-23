import Link from "next/link";
import Image from "next/image";
const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function ProjectTile({
  href,
  title,
  outcome,
  thumbnail,
  video,
}: {
  href: string;
  title: string;
  outcome: string;
  thumbnail: string;
  video?: string;
}) {
  return (
    <Link href={href} className="group block focus:outline-none">
      <div className="relative overflow-hidden rounded-2xl glass hover:shadow-2xl transition-shadow">
        <div className="aspect-[16/10] relative">
          {video ? (
            <video
              className="w-full h-full object-cover"
              src={video}
              muted
              playsInline
              loop
              autoPlay
            />
          ) : (
              <Image
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover"
                fill
                placeholder="blur"
                blurDataURL={BLUR}
              />
          )}
          {/* Light sweep */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
              transform: "translateX(-100%)",
              animation: "sweep 0.8s ease-out forwards",
            }}
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-[var(--txt)]">{title}</h3>
          <p className="text-[var(--muted)] text-sm">{outcome}</p>
        </div>
      </div>
      <style jsx>{`
        @keyframes sweep {
          to { transform: translateX(100%); }
        }
      `}</style>
    </Link>
  );
}
