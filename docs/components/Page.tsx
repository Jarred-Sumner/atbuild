import { Sidebar } from "./Sidebar";
import * as React from "react";

export const Page = ({ children, sidebar, dark = false, noScroll }) => {
  React.useLayoutEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  React.useLayoutEffect(() => {
    if (noScroll) {
      document.documentElement.classList.add("noScroll");
    } else {
      document.documentElement.classList.remove("noScroll");
    }
  }, [noScroll]);

  return (
    <div className="Page">
      <Sidebar headings={sidebar}></Sidebar>

      <main className="Content">{children}</main>

      <style jsx>{`
        .Page {
          display: grid;
          height: 100%;
          min-height: 100vh;
          width: 100%;
          grid-template-columns: 250px auto;
        }

        .Content {
        }
      `}</style>

      <style global jsx>{`
        :root {
          --page-background-dark: rgba(40, 35, 109, 0.9);
          --page-background-light: rgba(40, 35, 109, 0.1);
          --page-foreground-light: #101010;
          --page-foreground-dark: #fdfdfd;

          --page-foreground-light-medium: #333;
          --page-foreground-dark-medium: #ccc;
          --page-sidebar-dark: rgba(51, 44, 141, 0.384);
          --page-sidebar-light: rgba(40, 35, 109, 0.05);
          --page-background-light-active: rgba(40, 35, 109, 0.2);
          --page-background-dark-active: rgba(40, 35, 109, 0.7);
        }

        html {
          --page-foreground: var(--page-foreground-light);
          --page-background: var(--page-background-light);
          --page-foreground-medium: var(--page-foreground-light-medium);
          --page-foreground-active: var(--page-foreground-light-active);
          --page-sidebar: var(--page-sidebar-light);
        }

        html.dark {
          --page-foreground: var(--page-foreground-dark);
          --page-background: var(--page-background-dark);
          --page-foreground-medium: var(--page-foreground-dark-medium);
          --page-foreground-active: var(--page-foreground-dark-active);
          --page-sidebar: var(--page-sidebar-dark);
        }

        html,
        body {
          overflow: hidden;
        }

        :root {
          background-color: var(--page-background);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol";
        }
      `}</style>
    </div>
  );
};
