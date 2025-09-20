import { HoverBorderGradient } from "./ui/hover-border-gradient";

export default function HoverGradientDemo() {
  return (
    <>
      <div className="items-center justify-center rounded-lg bg-black flex">
        <HoverBorderGradient
          containerClassName="rounded-full"
          className="bg-black text-white"
        >
          <span>
            Universidade NeonPro <span className="text-gray-400">—</span> Evolua
            com estilo
          </span>
        </HoverBorderGradient>
      </div>
    </>
  );
}
