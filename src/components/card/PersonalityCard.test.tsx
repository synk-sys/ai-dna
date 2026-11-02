import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CARD_SIZE, PersonalityCard } from "./PersonalityCard";
import { ARCHETYPE_IDS, ARCHETYPES } from "@/lib/quiz/archetypes";
import { EVENT } from "@/lib/config/event";

describe("PersonalityCard", () => {
  it.each(ARCHETYPE_IDS)("renders every required element for %s", (id) => {
    const a = ARCHETYPES[id];
    render(<PersonalityCard archetypeId={id} nickname="Ada" description="A custom line." still />);
    expect(screen.getByText(EVENT.name)).toBeInTheDocument();
    expect(screen.getByText("AI DNA")).toBeInTheDocument();
    expect(screen.getByText("Ada's AI DNA")).toBeInTheDocument();
    expect(screen.getByText(a.name)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `${a.name} illustration` })).toBeInTheDocument();
    expect(screen.getByText("A custom line.")).toBeInTheDocument();
    expect(screen.getByText(a.superpower)).toBeInTheDocument();
    expect(screen.getByText(a.weakness)).toBeInTheDocument();
    expect(screen.getByText(/Discover Your AI DNA/)).toBeInTheDocument();
  });

  it("works without a nickname", () => {
    render(<PersonalityCard archetypeId="builder" description="x" still />);
    expect(screen.getByText("My AI DNA")).toBeInTheDocument();
  });

  it("uses fixed design sizes for both layouts", () => {
    const { container, rerender } = render(<PersonalityCard archetypeId="creator" description="x" still />);
    const el = () => container.firstElementChild as HTMLElement;
    expect(el().style.width).toBe(`${CARD_SIZE.portrait.width}px`);
    expect(el().style.height).toBe(`${CARD_SIZE.portrait.height}px`);
    rerender(<PersonalityCard archetypeId="creator" description="x" layout="square" still />);
    expect(el().dataset.cardLayout).toBe("square");
    expect(el().style.height).toBe(`${CARD_SIZE.square.height}px`);
  });

  it("renders nicknames as text, never markup", () => {
    render(<PersonalityCard archetypeId="explorer" nickname="<b>hi</b>" description="x" still />);
    expect(screen.getByText("<b>hi</b>'s AI DNA")).toBeInTheDocument();
  });
});
