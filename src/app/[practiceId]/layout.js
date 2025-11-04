// app/[customerCode]/layout.js
import { SiteSettingsProvider } from "../context/SiteSettingsContext";
import { DynamicMetaUpdater } from "../components/DynamicMetaUpdater";

export default function CustomerLayout({ children, params }) {
  return (
    <SiteSettingsProvider customerCode={params.customerCode}>
      <DynamicMetaUpdater />
      {children}
    </SiteSettingsProvider>
  );
}