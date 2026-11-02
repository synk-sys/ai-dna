/** Fixed aurora and starfield behind attendee pages. */
export function Backdrop({ tint }: { tint?: string }) {
  return (
    <>
      <div className="aurora" aria-hidden="true" />
      <div className="starfield" aria-hidden="true" />
      {tint ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
          style={{ background: `radial-gradient(60% 45% at 50% 30%, ${tint}33, transparent 70%)` }}
        />
      ) : null}
    </>
  );
}
