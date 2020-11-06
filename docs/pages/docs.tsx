import { Page } from "../components/Page";
import ReadMe from "../components/docs.mdx";

export async function getStaticProps() {
  const { fetchSidebarContent } = require("../components/Sidebar");
  const sidebar = await fetchSidebarContent(require("fs"));
  return {
    props: { sidebar },
  };
}

export const DocsPage = ({ sidebar }) => {
  return (
    <Page sidebar={sidebar} dark={false}>
      <div className="Wrapper">
        <div className="Content">
          <ReadMe />
        </div>
      </div>
      <style jsx>{`
        .Wrapper {
          display: flex;
          width: 100%;
          height: auto;
          max-height: 100vh;
          padding-left: 16px;
          padding-right: 16px;
          overflow-y: auto;
        }

        .Content {
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }
      `}</style>
    </Page>
  );
};

export default DocsPage;
