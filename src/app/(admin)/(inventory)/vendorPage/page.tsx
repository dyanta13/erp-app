import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VendorPage from "@/components/inventory/MasterVendor/VendorPage";
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function vendorPage() {
  return (
    <div>
     <PageBreadcrumb pageTitle="Master Vendor" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
            <VendorPage/>
        </div>
      </div>
    </div>
  );
}
