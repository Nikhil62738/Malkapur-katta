import Hero from '../components/home/Hero';
import TrendingReels from '../components/home/TrendingReels';
import LatestNews from '../components/home/LatestNews';
import UpcomingEvents from '../components/home/UpcomingEvents';
import ExplorePreview from '../components/home/ExplorePreview';
import BusinessHighlights from '../components/home/BusinessHighlights';
import GalleryPreview from '../components/home/GalleryPreview';
import Newsletter from '../components/home/Newsletter';
import PollsSection from '../components/polls/PollsSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrendingReels />
      <LatestNews />
      <UpcomingEvents />
      <PollsSection />
      <ExplorePreview />
      <BusinessHighlights />
      <GalleryPreview />
      <Newsletter />
    </>
  );
}
