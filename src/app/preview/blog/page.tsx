import BlogPage from "../../blog/page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft Blog Preview | The Gathering Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DraftBlogPreviewPage() {
  return BlogPage({ searchParams: Promise.resolve({ preview: "draft" }) });
}
