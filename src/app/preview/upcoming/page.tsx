import UpcomingPage from "../../upcoming/page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft Upcoming Preview | The Gathering Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DraftUpcomingPreviewPage() {
  return UpcomingPage({ searchParams: Promise.resolve({ preview: "draft" }) });
}
