import EventsPage from "../../events/page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft Events Preview | The Gathering Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DraftEventsPreviewPage() {
  return EventsPage({ searchParams: Promise.resolve({ preview: "draft" }) });
}
