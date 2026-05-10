export function SoloAmbientShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Warm orange — top right */}
      <div
        data-ambient="1"
        className="absolute -top-48 -right-36 w-[500px] h-[340px] rounded-full blur-[90px]"
        style={{
          background: "radial-gradient(ellipse, rgba(201,74,30,0.10) 0%, transparent 70%)",
          animation: "solo-float-1 13s ease-in-out infinite",
        }}
      />
      {/* Wine — bottom left */}
      <div
        data-ambient="2"
        className="absolute -bottom-40 -left-28 w-[380px] h-[280px] rounded-full blur-[80px]"
        style={{
          background: "radial-gradient(ellipse, rgba(122,37,64,0.10) 0%, transparent 70%)",
          animation: "solo-float-2 17s ease-in-out infinite",
          animationDelay: "-6s",
        }}
      />
      {/* Amber — centre right */}
      <div
        data-ambient="3"
        className="absolute top-1/3 -right-20 w-[240px] h-[240px] rounded-full blur-[70px]"
        style={{
          background: "radial-gradient(ellipse, rgba(255,179,122,0.07) 0%, transparent 70%)",
          animation: "solo-float-3 19s ease-in-out infinite",
          animationDelay: "-9s",
        }}
      />
      {/* Off-white — top left */}
      <div
        data-ambient="4"
        className="absolute -top-24 -left-24 w-[300px] h-[220px] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(ellipse, rgba(248,250,252,0.04) 0%, transparent 70%)",
          animation: "solo-float-1 22s ease-in-out infinite",
          animationDelay: "-4s",
        }}
      />
    </div>
  );
}
