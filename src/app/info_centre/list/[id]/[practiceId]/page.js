import InfoCentreListPage from '../../../../../app/pages/InfoCentreListPage';
import Navbar from '../../../../../app/pages/Navbar';
import FooterPage from '../../../../../app/pages/FooterPage';
import { SiteSettingsProvider } from '../../../../../app/context/SiteSettingsContext';

export const dynamic = 'force-dynamic';

export default async function InfoCentreListRoute({ params }) {
  // Extract both id (category) and practiceId from params
  const { id, practiceId } = await Promise.resolve(params);
  
  return (
    <SiteSettingsProvider initialPracticeId={practiceId}>
      <div className="flex flex-col min-h-screen">
        <Navbar practiceId={practiceId} />
        <main className="flex-grow">
          <InfoCentreListPage category={id} practiceId={practiceId} />
        </main>
        <FooterPage />
      </div>
    </SiteSettingsProvider>
  );
}
