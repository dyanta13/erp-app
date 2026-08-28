import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UnitPage from "@/components/inventory/MasterUnit/UnitPage";
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function unitPage() {
  return (
    <div>
     <PageBreadcrumb pageTitle="Master Unit" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
            <UnitPage/>
        </div>
      </div>
    </div>
  );
}
