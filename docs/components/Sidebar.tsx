import Link from "next/link";
import { flatMap, compact } from "lodash";
import { useRouter } from "next/router";

export async function fetchSidebarContent(fs) {
  var fromMarkdown = require("mdast-util-from-markdown");
  const util = require("util");
  const path = require("path");
  const readFile = util.promisify(fs.readFile);
  const { flatMap } = require("lodash");

  var doc = await readFile(path.resolve(process.cwd(), "../README.md"), "utf8");

  let data = [];
  let lastHeading = null;
  for (let line of doc.split("\n")) {
    if (line.startsWith("#")) {
      const depth = (line.match(/#/g) || []).length;
      const title = line.replace(/#*\s*/, "");
      const heading = {
        title,
        slug: require("slugify")(title).replace(":", "").toLowerCase(),
        children: [],
        depth,
      };
      if (depth === 1) {
        lastHeading = heading;
        data.push(heading);
      } else {
        lastHeading.children.push(heading);
      }
    }
  }

  return compact(data).slice(1);
}

const ArticleLink = ({ to, children }) => {
  const router = useRouter();

  return (
    <Link href={to}>
      <a
        className={`Link ${router.pathname === to ? "Link--active" : ""}`}
        href={to}
      >
        {children}

        <style jsx>{`
          .Link {
            color: #333;
            font-size: 1.1em;
            padding: 12px 16px;
            background-color: transparent;
            display: block;
            margin-top: auto;
            margin-bottom: auto;
          }

          .Link:visited {
            color: #222;
          }

          .Link.Link--active {
            background-color: rgba(40, 35, 109, 0.7);
            color: #fff;
            font-weight: 500;
          }

          .Link:hover {
            background-color: rgba(40, 35, 109, 0.8);
            color: #fff;
          }
        `}</style>
      </a>
    </Link>
  );
};

const Section = ({ children, hasChildren, title, url }) => {
  const router = useRouter();

  return (
    <div className="Section">
      {title && (
        <div className="Header">
          {title && (
            <h4>
              <Link href={url}>
                <a
                  className={`Link ${
                    router.pathname === url ? "Link--active" : ""
                  }`}
                  href={url}
                >
                  {title}
                </a>
              </Link>
            </h4>
          )}
        </div>
      )}
      {!!hasChildren && <div className="List">{children}</div>}
      <style jsx>{`
        h4 {
          padding: 0;
          margin: 0;
        }

        .Header {
          margin: 1.5em 16px;
        }

        .List {
          display: grid;
          grid-template-columns: auto;
          grid-template-rows: 48px;
        }
      `}</style>
    </div>
  );
};

export const Sidebar = ({ headings }) => (
  <div className="Sidebar">
    <div className="Header">
      <Link href="https://github.com/jarred-sumner/atbuild">
        <a href="https://github.com/jarred-sumner/atbuild">Atbuild</a>
      </Link>
    </div>
    <Section hasChildren>
      <ArticleLink to="https://github.com/jarred-sumner/atbuild">
        Github
      </ArticleLink>
      <ArticleLink to="/playground">Playground</ArticleLink>
      <ArticleLink to="/docs">Introduction</ArticleLink>
    </Section>

    {headings.map((heading) => (
      <Section
        hasChildren={heading.children?.length}
        title={heading.title}
        key={heading.slug}
        url={`/docs#${heading.slug}`}
      >
        {heading.children &&
          heading.children.length &&
          flatMap(heading.children, (child) => (
            <ArticleLink key={child.slug} to={`/docs#${child.slug}`}>
              {child.title}
            </ArticleLink>
          ))}
      </Section>
    ))}

    <style jsx>{`
      .Sidebar {
        max-width: 300px;
        background-color: var(--page-sidebar);
        height: 100%;
        min-height: 100%;
        border-right: 1px solid rgba(40, 35, 109, 0.1);
        overflow: auto;
        max-height: 100vh;
        padding-bottom: 16px;
      }

      .Header {
        font-size: 24px;
        padding: 0 16px;
        margin-top: 1em;
      }
    `}</style>
  </div>
);
