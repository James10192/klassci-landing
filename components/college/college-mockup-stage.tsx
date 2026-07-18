import type { ReactNode } from "react";

export function CollegeMockupStage() {
  return (
    <div className="relative min-h-[32rem] sm:min-h-[38rem] [perspective:1300px]">
      <div className="college-orbit absolute inset-0 [transform-style:preserve-3d]">
        <div className="absolute left-0 top-8 w-[88%] [transform:translateZ(70px)_rotateY(-7deg)]">
          <LaptopFrame>
            <img
              src="/img/college/current-dashboard.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </LaptopFrame>
        </div>

        <div className="absolute bottom-4 right-3 w-[28%] min-w-[9.5rem] [transform:translateZ(190px)_rotateY(11deg)]">
          <PhoneFrame>
            <img
              src="/img/college/current-mobile-dashboard.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </PhoneFrame>
        </div>
      </div>

      <style jsx>{`
        .college-orbit {
          animation: collegeOrbit 13s ease-in-out infinite;
        }

        @keyframes collegeOrbit {
          0%, 100% {
            transform: rotateX(7deg) rotateY(-8deg);
          }
          50% {
            transform: rotateX(10deg) rotateY(5deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .college-orbit {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function LaptopFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-[#111827] p-2 shadow-[0_34px_90px_rgba(4,83,203,0.22)]">
      <div className="flex h-5 items-center gap-1.5 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="aspect-[16/9] overflow-hidden rounded bg-white">{children}</div>
      <div className="mx-auto mt-2 h-2 w-1/3 rounded-full bg-white/20" />
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-black/20 bg-[#111827] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
      <div className="mx-auto mb-1 h-1.5 w-14 rounded-full bg-white/20" />
      <div className="aspect-[390/844] overflow-hidden rounded-[1.45rem] bg-white">{children}</div>
    </div>
  );
}
