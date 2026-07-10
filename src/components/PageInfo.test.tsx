import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageInfo } from "./PageInfo";

describe("PageInfo", () => {
  it("links to the source repo", () => {
    render(<PageInfo />);
    const link = screen.getByRole("link", { name: /view the source on github/i });
    expect(link).toHaveAttribute("href", "https://github.com/ctkrug/syntax-sprint");
  });

  it("carries the portfolio cross-promotion link", () => {
    render(<PageInfo />);
    const link = screen.getByRole("link", { name: /more by charlie krug/i });
    expect(link).toHaveAttribute("href", "https://apps.charliekrug.com");
  });

  it("renders the FAQ entries as a definition list", () => {
    render(<PageInfo />);
    expect(screen.getByText(/where do the code snippets come from/i)).toBeInTheDocument();
    expect(screen.getByText(/how does syntax-aware scoring work/i)).toBeInTheDocument();
    expect(screen.getByText(/is it free/i)).toBeInTheDocument();
  });
});
