
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ItemPage from "@/components/inventory/MasterItem/ItemPage";
import { Metadata } from "next";
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata: Metadata = {
  title: "Erp System",
  description:
    "",
};

export default function itemPage() {
  return (
    <div>
     <PageBreadcrumb pageTitle="Item Record" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
            <ItemPage/>
        </div>
      </div>
    </div>
  );
}
