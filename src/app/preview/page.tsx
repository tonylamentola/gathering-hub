import HomePage from "../page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft Preview | The Gathering Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DraftPreviewPage() {
  return HomePage({ searchParams: Promise.resolve({ preview: "draft" }) });
}
